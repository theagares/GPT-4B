import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { relationshipAPI } from '../../utils/api'
import { isAuthenticated } from '../../utils/auth'
import { cardDesigns, defaultCardDesign } from './constants'
import RelationshipSummaryModal from './RelationshipSummaryModal'
import './RelationshipGraph.css'

function RelationshipGraph({ showFavoritesOnly = true }) {
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const zoomRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLink, setSelectedLink] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [maxIntimacyScore, setMaxIntimacyScore] = useState(1)

  // 그래프 데이터 로드
  useEffect(() => {
    const fetchGraphData = async () => {
      if (!isAuthenticated()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await relationshipAPI.getGraphData()
        
        if (response.data.success) {
          setGraphData(response.data.data)
          setMaxIntimacyScore(response.data.data.maxIntimacyScore || 1)
        } else {
          setError('그래프 데이터를 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('그래프 데이터 로드 오류:', err)
        setError(err.response?.data?.message || '그래프 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchGraphData()
  }, [])

  // 친밀도 점수 정규화 (최대값 기준으로 퍼센트 계산)
  const normalizeIntimacyScore = (score, maxScore) => {
    if (!maxScore || maxScore === 0) return 0
    return Math.min(100, Math.round((score / maxScore) * 100))
  }

  // 그래프 렌더링
  useEffect(() => {
    if (!graphData || !svgRef.current || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // 기존 요소 제거

    const width = svgRef.current.clientWidth || 800
    const height = svgRef.current.clientHeight || 600

    // 필터링: 관심 있는 사람만 또는 모든 사람
    let filteredNodes = graphData.nodes.filter(n => {
      if (n.type === 'user') return true
      if (showFavoritesOnly) {
        // MySQL의 BOOLEAN은 0/1로 반환될 수 있으므로 둘 다 체크
        return n.isFavorite === true || n.isFavorite === 1
      }
      return true
    })

    // 필터링된 노드에 해당하는 링크만 필터링
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
    let filteredLinks = graphData.links.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : l.source.id
      const targetId = typeof l.target === 'string' ? l.target : l.target.id
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)
    })

    // 필터링된 링크의 실제 최대/최소값을 기준으로 정규화
    // 이렇게 하면 현재 화면에 표시되는 노드들 간의 상대적 거리가 정확히 반영됨
    const intimacyScores = filteredLinks.map(l => l.intimacyScore || 0).filter(s => s > 0)
    const actualMaxScore = intimacyScores.length > 0 
      ? Math.max(...intimacyScores) 
      : (maxIntimacyScore || 1)
    const actualMinScore = intimacyScores.length > 0 
      ? Math.min(...intimacyScores) 
      : 0
    const scoreRange = actualMaxScore - actualMinScore

    // 노드와 링크 데이터 (원본 데이터 보존)
    const nodes = filteredNodes.map(d => ({ ...d }))
    
    // 링크를 친밀도 순으로 정렬 (높은 순서대로) - 각도 분산을 위해
    const sortedLinks = [...filteredLinks].sort((a, b) => (b.intimacyScore || 0) - (a.intimacyScore || 0))
    
    const links = sortedLinks.map((d, index) => {
      const score = d.intimacyScore || 0
      // 친밀도 점수를 0~1로 정규화 (필터링된 링크의 실제 최대/최소값 기준)
      // score가 높을수록 normalized가 1에 가까워짐 (친밀도 높음)
      // 예: score=89, min=50, max=100 → normalized = (89-50)/(100-50) = 0.78
      // 예: score=65, min=50, max=100 → normalized = (65-50)/(100-50) = 0.30
      // 89가 65보다 높으므로 normalized도 더 높음 (0.78 > 0.30)
      // 거리는 normalized가 높을수록 가까워야 함
      let normalized = 0.5
      if (scoreRange > 0) {
        // 정규화: (score - min) / range
        // 높은 score일수록 normalized가 1에 가까워짐
        normalized = (score - actualMinScore) / scoreRange
        // 정규화 값이 0~1 범위를 벗어나지 않도록 보장
        normalized = Math.max(0, Math.min(1, normalized))
      } else if (score > 0) {
        // 모든 점수가 같고 0이 아니면 최고 친밀도로 처리
        normalized = 1.0
      } else {
        // 점수가 0이면 최저 친밀도
        normalized = 0.0
      }
      
      // 디버깅: 정규화 값 확인
      const targetId = typeof d.target === 'string' ? d.target : d.target.id
      const targetNode = filteredNodes.find(n => n.id === targetId)
      const nodeName = targetNode?.label || targetNode?.name || 'unknown'
      if (score > 0) {
        console.log(`[Normalize] ${nodeName}: Score=${score}, Min=${actualMinScore}, Max=${actualMaxScore}, Normalized=${normalized.toFixed(3)}`)
      }
      
      return {
        ...d,
        originalTarget: d.target,
        normalizedScore: normalized,
        intimacyScore: score,
        sortIndex: index // 정렬 순서 저장 (각도 분산용)
      }
    })

    // 사용자 노드 중앙 고정 (나중에 force simulation에서도 고정)
    const userNode = nodes.find(n => n.type === 'user')
    if (userNode) {
      userNode.fx = width / 2
      userNode.fy = height / 2
    }

    // SVG gradient 정의
    const defs = svg.append('defs')
    Object.keys(cardDesigns).forEach(designKey => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${designKey}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
      
      // gradient 색상 파싱 (두 개의 색상 추출)
      const gradientStr = cardDesigns[designKey]
      const colorMatches = gradientStr.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g)
      const colors = Array.from(colorMatches)
      
      if (colors.length >= 2) {
        // 첫 번째 색상 (0%)
        const [r1, g1, b1] = [colors[0][1], colors[0][2], colors[0][3]]
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', `rgb(${r1}, ${g1}, ${b1})`)
        
        // 두 번째 색상 (100%)
        const [r2, g2, b2] = [colors[1][1], colors[1][2], colors[1][3]]
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', `rgb(${r2}, ${g2}, ${b2})`)
      } else if (colors.length === 1) {
        // 색상이 하나만 있으면 단색 사용
        const [r, g, b] = [colors[0][1], colors[0][2], colors[0][3]]
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', `rgb(${r}, ${g}, ${b})`)
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', `rgb(${r}, ${g}, ${b})`)
      }
    })

    // Zoom & Pan을 위한 g 컨테이너 생성
    const g = svg.append('g').attr('class', 'graph-zoom-container')
    
    // Zoom & Pan 설정
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3]) // 최소 30%, 최대 300%
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)
    zoomRef.current = zoom

    // 친밀도 순으로 각도 분산 (겹침 방지)
    // 사용자 노드를 중심으로 원형 배치
    if (userNode && links.length > 0) {
      const totalLinks = links.length
      links.forEach((link, index) => {
        // 각 링크에 초기 각도 할당 (0도부터 시작하여 균등 분산)
        const angle = (index / totalLinks) * 2 * Math.PI
        link.initialAngle = angle
        
        // 명함 노드에 초기 위치 설정 (각도 기반)
        const targetId = typeof link.target === 'string' ? link.target : link.target.id
        const targetNode = nodes.find(n => n.id === targetId)
        if (targetNode && targetNode.type === 'card') {
          const normalized = link.normalizedScore || 0.5
          // 친밀도에 따른 거리: 최소 100px, 최대 300px
          // 60%면 약 180px 정도로 충분히 멀리 배치
          const radius = 100 + (1 - normalized) * 200 // 100px ~ 300px
          targetNode.initialAngle = angle
          targetNode.initialRadius = radius
          // 초기 위치 설정 (나중에 force로 조정됨)
          if (targetNode.x === undefined || targetNode.y === undefined) {
            targetNode.x = width / 2 + Math.cos(angle) * radius
            targetNode.y = height / 2 + Math.sin(angle) * radius
          }
        }
      })
    }

    // Force simulation 생성
    // 친밀도가 높을수록 가까이, 친밀도가 같으면 거리도 같게
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          // 정규화된 점수 (0~1): 1에 가까울수록 친밀도 높음
          // 친밀도가 높을수록 거리 가까움 (선형 비례)
          // normalized가 1이면 100px (가까움), 0이면 300px (멀음)
          const normalized = d.normalizedScore || 0.5
          const originalScore = d.intimacyScore || 0
          // 친밀도와 거리를 선형적으로 비례시킴
          // 높은 normalized 값 = 높은 친밀도 = 가까운 거리
          // normalized가 1 (최고 친밀도) → distance = 100px (가까움)
          // normalized가 0.7 (70%) → distance = 100 + (1-0.7)*200 = 160px
          // normalized가 0.6 (60%) → distance = 100 + (1-0.6)*200 = 180px
          // normalized가 0 (최저 친밀도) → distance = 300px (멀음)
          const distance = 100 + (1 - normalized) * 200 // 100px ~ 300px (선형 비례)
          
          // 디버깅: 친밀도와 거리 확인
          if (originalScore > 0) {
            console.log(`[Link Distance] Score: ${originalScore}, Normalized: ${normalized.toFixed(2)}, Distance: ${distance.toFixed(0)}px`)
          }
          
          return distance
        })
        .strength(1.5) // 링크 강도를 더 높게 설정하여 거리 정확히 유지
      )
      // charge force 제거 또는 매우 약하게 설정 (link distance가 우선되도록)
      // link distance가 친밀도에 따른 거리를 정확히 제어하므로 charge는 최소화
      .force('charge', d3.forceManyBody()
        .strength(d => {
          if (d.type === 'user') return 0 // 사용자 노드는 반발력 없음
          // 매우 약한 반발력만 적용 (노드 간 최소 거리 유지용)
          return -20 // 모든 노드에 동일한 약한 반발력
        })
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => {
          if (d.type === 'user') {
            return 30 // 사용자 노드 반지름 + 여유 공간
          }
          // 명함 노드: 대각선 길이의 절반 + 여유 공간
          return Math.sqrt(70 * 70 + 35 * 35) / 2 + 20 // 약 45px + 20px = 65px
        })
        .strength(1.0) // 충돌 방지 강도 최대
      )
      // 각도 기반 배치 force (겹침 방지) - radial positioning
      // link distance가 거리를 제어하므로 radial은 각도만 유지하도록 약하게 설정
      .force('radial', d3.forceRadial()
        .strength((d) => {
          if (d.type === 'user') return 0
          // 각도만 유지하도록 매우 약한 힘 (거리는 link distance가 제어)
          if (d.initialAngle !== undefined && d.initialRadius !== undefined) {
            return 0.05 // 각도 유지만 (거리는 link distance가 제어)
          }
          return 0
        })
        .radius((d) => {
          if (d.type === 'user') return 0
          if (d.initialRadius !== undefined) {
            return d.initialRadius
          }
          const link = links.find(l => {
            const targetId = typeof l.target === 'string' ? l.target : l.target.id
            return targetId === d.id
          })
          if (link) {
            const normalized = link.normalizedScore || 0.5
            // link distance와 동일한 거리 계산 (100px ~ 300px)
            return 100 + (1 - normalized) * 200
          }
          return 200
        })
        .x(width / 2)
        .y(height / 2)
      )
      .alphaDecay(0.2) // 매우 빠르게 수렴하도록
      .velocityDecay(0.8) // 속도 매우 빠르게 감쇠
      .on('end', () => {
        // 시뮬레이션이 안정화되면 모든 명함 노드 완전히 고정
        nodes.forEach(n => {
          if (n.type === 'card') {
            n.fx = n.x
            n.fy = n.y
            n.vx = 0
            n.vy = 0
          }
        })
        // 시뮬레이션 완전히 중지 및 비활성화
        simulation.alphaTarget(0)
        simulation.stop()
        // 모든 force 제거하여 더 이상 움직이지 않도록
        simulation.force('link', null)
        simulation.force('charge', null)
        simulation.force('radial', null)
        simulation.force('collision', null)
        simulation.force('center', null)
      })

    simulationRef.current = simulation

    // 링크 그리기 (g 컨테이너 안에) - 곡선으로 그려서 겹침 방지
    const link = g.append('g')
      .attr('class', 'graph-links')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'graph-link')
      .attr('fill', 'none')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        const targetId = d.originalTarget || (typeof d.target === 'string' ? d.target : d.target.id)
        setSelectedLink({ target: targetId })
        setShowModal(true)
      })
      .on('mouseenter', function() {
        d3.select(this)
          .attr('stroke', '#584cdc')
          .attr('stroke-width', 2.5)
          .attr('stroke-opacity', 0.7)
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('stroke', '#d1d5db')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.4)
      })

    // 노드 그리기 (g 컨테이너 안에)
    const node = g.append('g')
      .attr('class', 'graph-nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', d => `graph-node graph-node-${d.type}`)
      .style('cursor', d => d.type === 'user' ? 'default' : 'pointer')
      .call(drag(simulation))

    // 사용자 노드 (동그라미)
    const userNodes = node.filter(d => d.type === 'user')
    userNodes.append('circle')
      .attr('r', 25)
      .attr('fill', '#584cdc')
      .attr('stroke', '#4736d3')
      .attr('stroke-width', 2)
    
    // 사용자 노드에 radius 속성 설정 (collision force용)
    if (userNode) {
      userNode.radius = 30 // collision force에서 사용할 반지름
    }

    userNodes.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', "'Inter', 'Noto Sans KR', sans-serif")
      .text('나')

    // 명함 노드 (네모 박스) - gradient 사용
    const cardNodes = node.filter(d => d.type === 'card')
    
    // 명함 노드에 radius 속성 설정 (collision force용 - 대각선 길이의 절반)
    cardNodes.each(d => {
      d.radius = Math.sqrt(70 * 70 + 35 * 35) / 2 // 약 39px
    })
    
    cardNodes.append('rect')
      .attr('width', 70)
      .attr('height', 35)
      .attr('rx', 6)
      .attr('x', -35)
      .attr('y', -17.5)
      .attr('fill', d => {
        const design = d.design || 'design-1'
        return `url(#gradient-${design})`
      })
      .attr('stroke', 'rgba(255, 255, 255, 0.3)')
      .attr('stroke-width', 1)

    cardNodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('font-family', "'Inter', 'Noto Sans KR', sans-serif")
      .text(d => d.label || '')

    // 명함 노드 클릭 이벤트 - 명함 세부정보로 이동 (진동 방지)
    let clickStartTime = 0
    let clickStartPos = { x: 0, y: 0 }
    const hoveredNodes = new Set() // hover된 노드 추적
    
    cardNodes
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        // hover 시 노드 위치 즉시 고정하여 진동 방지
        hoveredNodes.add(d.id)
        // 현재 위치를 즉시 고정하고 시뮬레이션에서 제외
        d.fx = d.x
        d.fy = d.y
        // 속도도 0으로 설정하여 움직임 완전히 차단
        d.vx = 0
        d.vy = 0
        // 시뮬레이션이 실행 중이면 즉시 중지
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0)
        }
        event.stopPropagation()
      })
      .on('mouseleave', function(event, d) {
        // hover 해제 시에도 위치 고정 유지 (노드가 움직이지 않도록)
        hoveredNodes.delete(d.id)
        d.fx = d.x
        d.fy = d.y
        d.vx = 0
        d.vy = 0
        event.stopPropagation()
      })
      .on('mousedown', function(event, d) {
        // 클릭 시작 시 즉시 고정하여 움직임 방지
        d.fx = d.x
        d.fy = d.y
        clickStartTime = Date.now()
        clickStartPos = { x: event.clientX, y: event.clientY }
        event.stopPropagation()
      })
      .on('click', function(event, d) {
        event.stopPropagation()
        // 클릭 시 노드 위치 즉시 고정
        d.fx = d.x
        d.fy = d.y
        
        // 드래그와 클릭 구분: 시간과 이동 거리 체크
        const clickDuration = Date.now() - clickStartTime
        const dx = Math.abs(event.clientX - clickStartPos.x)
        const dy = Math.abs(event.clientY - clickStartPos.y)
        const moveDistance = Math.sqrt(dx * dx + dy * dy)
        
        // 짧은 시간(300ms 이내)이고 작은 이동(10px 이내)이면 클릭으로 처리
        if (clickDuration < 300 && moveDistance < 10) {
          const cardId = d.cardId || d.id.replace('card-', '')
          navigate(`/cards/${cardId}`, { 
            state: { fromRelationshipGraph: true } 
          })
        }
      })

    // 드래그 함수 (zoom transform 고려, 명함 노드만 드래그 가능)
    // 단, 노드가 고정된 후에는 드래그 비활성화
    function drag(simulation) {
      function dragstarted(event, d) {
        if (d.type === 'user' || nodesFixed) {
          event.sourceEvent.stopPropagation()
          return
        }
        if (!event.active) simulation.alphaTarget(0.3).restart()
        // 드래그 시작 시 즉시 고정
        d.fx = d.x
        d.fy = d.y
        event.sourceEvent.stopPropagation() // zoom과 충돌 방지
      }

      function dragged(event, d) {
        if (d.type === 'user' || nodesFixed) return
        // zoom transform 고려하여 실제 좌표 계산
        const transform = d3.zoomTransform(svg.node())
        if (transform) {
          // 마우스 좌표를 zoom transform의 역변환으로 계산
          const invX = (event.x - transform.x) / transform.k
          const invY = (event.y - transform.y) / transform.k
          // 드래그 중에도 계속 고정
          d.fx = invX
          d.fy = invY
        } else {
          d.fx = event.x
          d.fy = event.y
        }
      }

      function dragended(event, d) {
        if (d.type === 'user' || nodesFixed) return
        if (!event.active) {
          simulation.alphaTarget(0)
        }
        // 드래그 종료 후에도 노드 위치 고정 유지
        d.fx = d.x
        d.fy = d.y
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }

    // 시뮬레이션 안정화 후 노드 고정 여부 추적
    let nodesFixed = false
    let tickCount = 0
    
    // 시뮬레이션 업데이트
    simulation.on('tick', () => {
      tickCount++
      
      // 사용자 노드는 항상 중앙 고정
      if (userNode) {
        userNode.fx = width / 2
        userNode.fy = height / 2
        userNode.vx = 0
        userNode.vy = 0
      }
      
      // 시뮬레이션이 빠르게 안정화되면 모든 명함 노드 즉시 고정 및 시뮬레이션 중지
      if (!nodesFixed && (simulation.alpha() < 0.2 || tickCount > 25)) {
        // 모든 명함 노드 완전히 고정 (어떤 일이 있어도 움직이지 않도록)
        nodes.forEach(n => {
          if (n.type === 'card') {
            // 현재 위치를 완전히 고정
            n.fx = n.x
            n.fy = n.y
            n.vx = 0
            n.vy = 0
          }
        })
        nodesFixed = true
        
        // 시뮬레이션 즉시 중지
        simulation.alphaTarget(0)
        simulation.stop()
        
        // 모든 force 즉시 제거
        simulation.force('link', null)
        simulation.force('charge', null)
        simulation.force('radial', null)
        simulation.force('collision', null)
        simulation.force('center', null)
        
        // 드래그 완전히 비활성화 (노드가 고정된 후에는 드래그 불가)
        node.on('.drag', null)
        // 명함 노드에 pointer-events를 유지하되 드래그는 불가능하게
        node.filter(d => d.type === 'card')
          .style('pointer-events', 'auto')
          .on('.drag', null)
      }
      
      // 노드가 고정된 후에는 완전히 움직이지 않도록 강제
      if (nodesFixed) {
        nodes.forEach(n => {
          if (n.type === 'card') {
            // 위치를 계속 고정 (어떤 force도 영향을 주지 않도록)
            n.fx = n.x
            n.fy = n.y
            n.vx = 0
            n.vy = 0
          }
        })
        
        // 사용자 노드와 명함 노드 간 최소 거리 보장 (겹침 방지)
        if (userNode) {
          nodes.forEach(n => {
            if (n.type === 'card') {
              const dx = n.x - userNode.x
              const dy = n.y - userNode.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const minDistance = (userNode.radius || 30) + (n.radius || 40) + 10 // 최소 거리
              
              if (distance < minDistance && distance > 0) {
                // 너무 가까우면 밀어내기
                const angle = Math.atan2(dy, dx)
                const targetX = userNode.x + Math.cos(angle) * minDistance
                const targetY = userNode.y + Math.sin(angle) * minDistance
                n.fx = targetX
                n.fy = targetY
                n.x = targetX
                n.y = targetY
              }
            }
          })
        }
      }
      
      // hover된 노드도 완전히 고정
      nodes.forEach(n => {
        if (hoveredNodes.has(n.id) && n.type === 'card') {
          n.fx = n.x
          n.fy = n.y
          n.vx = 0
          n.vy = 0
        }
      })
      
      // 링크를 곡선(path)으로 그리기 (겹침 방지)
      link.attr('d', d => {
        const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : d.source.id))
        const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id))
        
        if (!source || !target) return 'M 0 0'
        
        const sx = source.x
        const sy = source.y
        const tx = target.x
        const ty = target.y
        
        // 곡선 제어점 계산 (각도에 따라 곡선 방향 조정)
        const dx = tx - sx
        const dy = ty - sy
        const angle = Math.atan2(dy, dx)
        
        // 곡선의 곡률 (각도에 따라 조정하여 겹침 방지)
        // sortIndex를 사용하여 각 링크마다 다른 곡률 적용
        const curveOffset = 15 + (d.sortIndex || 0) * 3 // 각 링크마다 다른 곡률
        const midX = (sx + tx) / 2 + Math.cos(angle + Math.PI / 2) * curveOffset
        const midY = (sy + ty) / 2 + Math.sin(angle + Math.PI / 2) * curveOffset
        
        // 2차 베지어 곡선
        return `M ${sx} ${sy} Q ${midX} ${midY} ${tx} ${ty}`
      })

      node.attr('transform', d => {
        // 명함 노드가 고정된 후에는 위치가 절대 변하지 않도록
        if (nodesFixed && d.type === 'card') {
          // 고정된 위치를 강제로 유지
          d.x = d.fx || d.x
          d.y = d.fy || d.y
        }
        return `translate(${d.x},${d.y})`
      })
    })

    // 정리 함수
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [graphData, loading, showFavoritesOnly])

  if (loading) {
    return (
      <div className="graph-loading">
        <p>그래프를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="graph-error">
        <p>{error}</p>
      </div>
    )
  }

  if (!graphData || graphData.nodes.length <= 1) {
    return (
      <div className="graph-empty">
        <p>표시할 관계가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="relationship-graph-svg-container">
      <svg
        ref={svgRef}
        className="relationship-graph-svg"
        width="100%"
        height="100%"
      />
      {showModal && selectedLink && (
        <RelationshipSummaryModal
          contactId={selectedLink.target.replace('card-', '')}
          maxIntimacyScore={maxIntimacyScore}
          onClose={() => {
            setShowModal(false)
            setSelectedLink(null)
          }}
        />
      )}
    </div>
  )
}

export default RelationshipGraph
