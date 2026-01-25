import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { useGraphAnalysis } from '../contexts/GraphAnalysisContext'
import './RelationGraphPage.css'

const CACHE_KEY = 'relation_graph_cache'

function RelationGraphPage() {
  const navigate = useNavigate()
  const graphRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [stats, setStats] = useState(null)
  const [usedFeatures, setUsedFeatures] = useState([])
  const [relationshipTypes, setRelationshipTypes] = useState({})
  const [qualityFeedback, setQualityFeedback] = useState(null)
  const [scoreList, setScoreList] = useState([])
  const [selectedRelation, setSelectedRelation] = useState(null)
  const [showPanel, setShowPanel] = useState(false)
  const simulationRef = useRef(null)
  const animationFrameRef = useRef(null)

  // 설정 팝업 관련 state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [analyzeCount, setAnalyzeCount] = useState(20)
  const [displayCount, setDisplayCount] = useState(10)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 휴면 클러스터 팝업 관련 state
  const [showDormantPopup, setShowDormantPopup] = useState(false)
  const [dormantCards, setDormantCards] = useState([])
  const [clusterGroups, setClusterGroups] = useState({})

  // Context에서 분석 상태 가져오기
  const {
    isAnalyzing,
    cachedData,
    hasCache,
    totalCardCount,
    // SSE 진행률 상태
    progress,
    progressMessage,
    currentStep,
    totalSteps,
    analyzedCount,
    totalAnalyzeCount,
    // 액션
    startAnalysis,
    cancelAnalysis,
    closeCompletePopup
  } = useGraphAnalysis()

  // 최대 분석 개수 (명함 개수 또는 기본 50개)
  const maxAnalyzeCount = Math.max(5, totalCardCount || 50)

  // 페이지 진입 시 캐시 확인 및 팝업 표시
  useEffect(() => {
    if (cachedData) {
      // 캐시가 있으면 바로 로드
      loadFromCache()
    } else if (!isAnalyzing) {
      // 캐시도 없고 분석 중도 아니면 설정 팝업 표시
      setShowSettingsModal(true)
    }
  }, [cachedData])

  // 캐시에서 데이터 로드
  const loadFromCache = () => {
    try {
      if (cachedData && cachedData.data) {
        applyData(cachedData.data, cachedData.displayCount || 10)
        setAnalyzeCount(cachedData.analyzeCount || 20)
        setDisplayCount(cachedData.displayCount || 10)
      }
    } catch (error) {
      console.error('캐시 로드 오류:', error)
      setShowSettingsModal(true)
    }
  }

  // 데이터 적용
  const applyData = (data, topK) => {
    setStats(data.summary)
    setUsedFeatures(data.usedFeatures || [])
    setRelationshipTypes(data.summary?.typeDistribution || {})
    setQualityFeedback({
      summary: data.summary,
      loop: data.feedbackLoop,
      quality: data.quality
    })

    const nonUserNodes = data.graph.nodes.filter(n => n.type !== 'user')
    const userNode = data.graph.nodes.find(n => n.type === 'user')

    // 클러스터별 그룹화
    const groups = {}
    nonUserNodes.forEach(node => {
      const type = node.relationshipType || '기타'
      if (!groups[type]) groups[type] = []
      groups[type].push(node)
    })
    setClusterGroups(groups)

    // 휴면 카드 목록 저장
    const dormant = nonUserNodes.filter(n => n.relationshipType === '휴면')
    setDormantCards(dormant)

    const topKNodes = [...nonUserNodes]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK)

    const filteredNodes = userNode ? [userNode, ...topKNodes] : topKNodes
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredEdges = data.graph.edges.filter(e =>
      filteredNodeIds.has(e.target) || filteredNodeIds.has(e.target?.id)
    )

    const filteredGraph = {
      nodes: filteredNodes,
      edges: filteredEdges,
      metadata: data.graph.metadata
    }

    setScoreList(nonUserNodes.sort((a, b) => (b.score || 0) - (a.score || 0)))
    setGraphData(filteredGraph)
  }

  // 설정 확인 후 분석 시작 (Context 사용)
  const handleStartAnalysis = () => {
    setShowSettingsModal(false)
    startAnalysis(analyzeCount, displayCount)
  }

  // Context에서 캐시 데이터가 업데이트되면 적용
  useEffect(() => {
    if (cachedData && cachedData.data && !graphData) {
      applyData(cachedData.data, cachedData.displayCount || displayCount)
    }
  }, [cachedData])

  // 새로고침 (캐시 무시)
  const handleRefresh = () => {
    setShowSettingsModal(true)
  }

  // 캐시 사용
  const handleUseCache = () => {
    setShowSettingsModal(false)
    loadFromCache()
  }

  useEffect(() => {
    if (graphData && graphRef.current) {
      renderGraph()
    }
  }, [graphData])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [])

  const renderGraph = () => {
    const container = graphRef.current
    if (!container || !graphData) return

    // Clear previous
    d3.select(container).selectAll('svg').remove()

    const width = container.clientWidth
    const height = container.clientHeight

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const defs = svg.append('defs')

    // 🎨 2020s 트렌디 컬러 팔레트 (네온 + 파스텔 믹스)
    const gradeColors = {
      'A': { main: '#10B981', glow: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' },
      'B': { main: '#8B5CF6', glow: '#A78BFA', bg: 'rgba(139, 92, 246, 0.15)' },
      'C': { main: '#F59E0B', glow: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      'D': { main: '#EC4899', glow: '#F472B6', bg: 'rgba(236, 72, 153, 0.15)' },
      'F': { main: '#EF4444', glow: '#F87171', bg: 'rgba(239, 68, 68, 0.15)' },
      'user': { main: '#6366F1', glow: '#818CF8', bg: 'rgba(99, 102, 241, 0.2)' }
    }

    // 그라데이션 정의 (글래스모피즘 스타일)
    Object.entries(gradeColors).forEach(([grade, colors]) => {
      // 메인 그라데이션
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${grade}`)
        .attr('cx', '30%')
        .attr('cy', '30%')

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.glow)
        .attr('stop-opacity', 1)

      gradient.append('stop')
        .attr('offset', '70%')
        .attr('stop-color', colors.main)
        .attr('stop-opacity', 0.9)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.main)
        .attr('stop-opacity', 0.7)

      // 글로우 그라데이션
      const glowGradient = defs.append('radialGradient')
        .attr('id', `glow-gradient-${grade}`)

      glowGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.glow)
        .attr('stop-opacity', 0.6)

      glowGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.glow)
        .attr('stop-opacity', 0)
    })

    // 네온 글로우 필터
    const glowFilter = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%')

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur')

    glowFilter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over')

    // 부드러운 그림자 필터
    const shadowFilter = defs.append('filter')
      .attr('id', 'soft-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    shadowFilter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '3')
      .attr('flood-color', 'rgba(0,0,0,0.15)')

    // Zoom
    const g = svg.append('g')
    svg.call(d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => g.attr('transform', event.transform))
    )

    // 링크 (직선)
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.edges)
      .join('line')
      .attr('class', 'graph-link')
      .attr('stroke', d => {
        // 친밀도에 따른 색상 (그라데이션: 빨강 → 노랑 → 초록)
        const targetNode = graphData.nodes.find(n => n.id === d.target || n.id === d.target?.id)
        const score = targetNode?.score || 50
        if (score >= 80) return '#10b981'      // 초록 (매우 친밀)
        if (score >= 65) return '#22c55e'      // 연초록
        if (score >= 50) return '#eab308'      // 노랑 (보통)
        if (score >= 35) return '#f97316'      // 주황
        return '#ef4444'                        // 빨강 (낮음)
      })
      .attr('stroke-width', d => {
        // 친밀도에 따른 두께 (높을수록 두꺼움)
        const targetNode = graphData.nodes.find(n => n.id === d.target || n.id === d.target?.id)
        const score = targetNode?.score || 50
        return 0.8 + (score / 100) * 2  // 0.8 ~ 2.8
      })
      .attr('stroke-opacity', d => {
        const targetNode = graphData.nodes.find(n => n.id === d.target || n.id === d.target?.id)
        const score = targetNode?.score || 50
        return 0.3 + (score / 100) * 0.5  // 0.3 ~ 0.8
      })
      .on('click', (event, d) => {
        event.stopPropagation()
        handleEdgeClick(d)
      })

    // 링크 그라데이션
    const linkGradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')

    linkGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366F1')
      .attr('stop-opacity', 0.6)

    linkGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8B5CF6')
      .attr('stop-opacity', 0.3)

    // 노드 그룹
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .attr('class', 'graph-node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    // 노드 크기 계산 함수 (작게 조정)
    const getNodeSize = (d) => {
      if (d.type === 'user') return 14
      return d.size ? Math.max(8, d.size * 0.5) : 10
    }

    // 외부 글로우 링
    node.append('circle')
      .attr('class', 'node-glow')
      .attr('r', d => getNodeSize(d) + 4)
      .attr('fill', d => {
        const grade = d.type === 'user' ? 'user' : (d.grade?.level || 'C')
        return `url(#glow-gradient-${grade})`
      })
      .attr('opacity', 0.4)

    // 메인 원 (글래스모피즘)
    node.append('circle')
      .attr('class', 'node-main')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => {
        const grade = d.type === 'user' ? 'user' : (d.grade?.level || 'C')
        return `url(#gradient-${grade})`
      })
      .attr('stroke', 'rgba(255,255,255,0.7)')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#soft-shadow)')

    // 하이라이트 (3D 효과)
    node.append('ellipse')
      .attr('class', 'node-highlight')
      .attr('rx', d => getNodeSize(d) * 0.45)
      .attr('ry', d => getNodeSize(d) * 0.2)
      .attr('cx', d => -getNodeSize(d) * 0.12)
      .attr('cy', d => -getNodeSize(d) * 0.3)
      .attr('fill', 'rgba(255,255,255,0.35)')

    // 라벨 배경
    node.filter(d => d.type !== 'user').append('rect')
      .attr('class', 'label-bg')
      .attr('x', d => -((d.label?.length || 0) * 3 + 6))
      .attr('y', d => getNodeSize(d) + 4)
      .attr('width', d => (d.label?.length || 0) * 6 + 12)
      .attr('height', 14)
      .attr('rx', 7)
      .attr('fill', 'rgba(255,255,255,0.95)')
      .attr('stroke', 'rgba(0,0,0,0.08)')

    // 라벨
    node.append('text')
      .text(d => d.label)
      .attr('dy', d => getNodeSize(d) + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '8px')
      .attr('font-weight', '600')
      .attr('font-family', "'Inter', sans-serif")

    node.on('click', (event, d) => {
      if (d.type === 'user') return
      const edge = graphData.edges.find(e => e.target === d.id || e.target?.id === d.id)
      if (edge) handleEdgeClick(edge)
    })

    // 각 노드에 고유한 진동 파라미터 할당 (미세하게)
    graphData.nodes.forEach((d, i) => {
      d.floatPhase = Math.random() * Math.PI * 2
      d.floatSpeed = 0.3 + Math.random() * 0.3
      d.floatAmplitude = 1 + Math.random() * 1.5
    })

    let tickCount = 0

    // 점수에 따른 거리 계산 (친밀할수록 가까이)
    const getDistance = (edge) => {
      const targetNode = graphData.nodes.find(n => n.id === edge.target || n.id === edge.target?.id)
      const score = targetNode?.score || 50
      const minDist = 50   // 점수 100일 때 (가장 친밀)
      const maxDist = 150  // 점수 0일 때 (가장 덜 친밀)
      return maxDist - (score / 100) * (maxDist - minDist)
    }

    // 🎯 관계 유형별 각도 할당 (라디안) - 6개 유형
    const typeAngles = {
      '핵심': 0,                        // 오른쪽 (0°) - 가장 중요한 관계
      '협력': Math.PI / 3,              // 오른쪽 위 (60°)
      '네트워킹': Math.PI * 2 / 3,      // 왼쪽 위 (120°)
      '신규': Math.PI,                  // 왼쪽 (180°)
      '개인': Math.PI * 4 / 3,          // 왼쪽 아래 (240°)
      '휴면': Math.PI * 5 / 3,          // 오른쪽 아래 (300°)
    }

    // 노드에 타겟 각도 할당
    graphData.nodes.forEach(d => {
      if (d.type === 'user') {
        d.targetAngle = null
      } else {
        d.targetAngle = typeAngles[d.relationshipType] ?? Math.PI // 기본값: 왼쪽
      }
    })

    // 🔄 관계 유형별 클러스터링 force (부드러운 방향 유도)
    const forceCluster = (alpha) => {
      const centerX = width / 2
      const centerY = height / 2
      const clusterStrength = 0.03 * alpha // 부드럽게

      graphData.nodes.forEach(d => {
        if (d.type === 'user' || d.targetAngle === null || d.wasDragged) return

        // 현재 위치에서 중심까지의 거리
        const dx = d.x - centerX
        const dy = d.y - centerY
        const currentDist = Math.sqrt(dx * dx + dy * dy) || 1

        // 타겟 방향의 단위 벡터
        const targetX = Math.cos(d.targetAngle)
        const targetY = Math.sin(d.targetAngle)

        // 현재 방향의 단위 벡터
        const currentX = dx / currentDist
        const currentY = dy / currentDist

        // 타겟 방향으로 부드럽게 회전
        d.vx += (targetX - currentX) * clusterStrength * currentDist * 0.1
        d.vy += (targetY - currentY) * clusterStrength * currentDist * 0.1
      })
    }

    simulationRef.current = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.edges)
        .id(d => d.id)
        .distance(d => getDistance(d))  // 친밀도에 따른 거리
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-60))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d) + 8))
      .force('cluster', forceCluster)  // 관계 유형별 클러스터링
      .alphaDecay(0.03)  // 빠르게 안정화
      .alphaMin(0.01)    // 빠르게 멈춤
      .velocityDecay(0.4)  // 더 빠른 감속
      .on('tick', () => {
        tickCount++

        // 직선 링크 업데이트
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        node.attr('transform', d => `translate(${d.x},${d.y})`)
      })
      .on('end', () => {
        // 시뮬레이션이 끝나면 기준 위치 저장 (고정하지 않음)
        graphData.nodes.forEach(d => {
          d.baseX = d.x
          d.baseY = d.y
        })

        // 🎈 Floating 애니메이션 시작
        startFloatingAnimation(node, link, graphData)
      })

    // 🎈 Floating 애니메이션 함수
    function startFloatingAnimation(nodeSelection, linkSelection, data) {
      let startTime = Date.now()

      function animate() {
        const elapsed = (Date.now() - startTime) / 1000  // 초 단위

        data.nodes.forEach(d => {
          if (d.isDragging || d.type === 'user') return  // 드래그 중이거나 유저 노드는 제외

          // 기준 위치가 없으면 현재 위치를 기준으로
          if (d.baseX === undefined) d.baseX = d.x
          if (d.baseY === undefined) d.baseY = d.y

          // 부드러운 사인파 움직임
          const phase = d.floatPhase || 0
          const speed = d.floatSpeed || 0.4
          const amplitude = d.floatAmplitude || 2

          // X, Y 각각 다른 주기로 움직임 (더 자연스럽게)
          const offsetX = Math.sin(elapsed * speed + phase) * amplitude
          const offsetY = Math.cos(elapsed * speed * 0.7 + phase * 1.3) * amplitude * 0.8

          d.x = d.baseX + offsetX
          d.y = d.baseY + offsetY
        })

        // 노드 위치 업데이트
        nodeSelection.attr('transform', d => `translate(${d.x},${d.y})`)

        // 링크 위치 업데이트
        linkSelection
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animate()
    }

    function dragstarted(event, d) {
      // Floating 애니메이션 일시 중지
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart()
      d.isDragging = true
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0)
      d.isDragging = false
      d.wasDragged = true  // 드래그된 적 있음 표시 → 클러스터링에서 제외
      // 드래그 종료 후 새 기준 위치 설정
      d.baseX = event.x
      d.baseY = event.y
      d.fx = null
      d.fy = null

      // Floating 애니메이션 재시작
      startFloatingAnimation(node, link, graphData)
    }
  }

  const handleEdgeClick = (edge) => {
    const targetNode = graphData.nodes.find(n =>
      n.id === edge.target || n.id === edge.target?.id
    )
    if (!targetNode || targetNode.type === 'user') return

    setSelectedRelation(targetNode)
    setShowPanel(true)
  }

  const closePanel = () => {
    setShowPanel(false)
    setSelectedRelation(null)
  }

  const typeColors = {
    '핵심': '#ef4444',      // 빨강 - 가장 중요
    '협력': '#584cdc',      // 보라 - 업무 협력
    '네트워킹': '#3b82f6',  // 파랑 - 인맥
    '신규': '#22c55e',      // 초록 - 새로운 기회
    '개인': '#f59e0b',      // 주황 - 개인적
    '휴면': '#6b7280',      // 회색 - 휴면
  }

  return (
    <div className="relation-graph-page">
      {/* 설정 팝업 */}
      {showSettingsModal && (
        <>
          <div className="rg-modal-overlay" onClick={() => hasCache && handleUseCache()}></div>
          <div className="rg-settings-modal">
            <button
              className="rg-modal-close"
              onClick={() => {
                // 그래프가 이미 표시 중이면 닫기만, 최초 진입(표시 데이터 없음)이면 뒤로가기
                if (graphData || hasCache) setShowSettingsModal(false)
                else navigate(-1)
              }}
              aria-label="닫기"
            >
              ×
            </button>
            <div className="rg-modal-title">분석 설정</div>
            <p className="rg-modal-desc">관계 그래프 분석에 필요한 설정을 입력해주세요</p>

            <div className="rg-modal-field">
              <label>분석할 명함 수</label>
              <input
                type="number"
                min="5"
                max={maxAnalyzeCount}
                value={analyzeCount}
                onChange={(e) => setAnalyzeCount(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                onBlur={(e) => {
                  const val = parseInt(e.target.value) || 5
                  setAnalyzeCount(Math.min(maxAnalyzeCount, Math.max(5, val)))
                }}
              />
              <span className="rg-modal-hint">
                LLM이 분석할 명함 (5~{maxAnalyzeCount}개)
                {totalCardCount > 0 && <span className="rg-card-count"> · 보유 명함: {totalCardCount}개</span>}
              </span>
            </div>

            <div className="rg-modal-field">
              <label>그래프에 표시할 명함 수</label>
              <input
                type="number"
                min="3"
                max="20"
                value={displayCount}
                onChange={(e) => setDisplayCount(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                onBlur={(e) => {
                  const val = parseInt(e.target.value) || 3
                  setDisplayCount(Math.min(20, Math.max(3, val)))
                }}
              />
              <span className="rg-modal-hint">상위 N개만 그래프에 표시 (3~20개)</span>
            </div>

            {/* 유효성 검사 경고 */}
            {analyzeCount !== '' && displayCount !== '' && parseInt(analyzeCount) < parseInt(displayCount) && (
              <p className="rg-modal-warning">⚠️ 분석할 명함 수는 그래프에 표시할 명함 수보다 크거나 같아야 합니다.</p>
            )}

            <div className="rg-modal-buttons">
              {hasCache && (
                <button className="rg-modal-btn-secondary" onClick={handleUseCache}>
                  캐시 사용
                </button>
              )}
              <button
                className="rg-modal-btn-primary"
                onClick={handleStartAnalysis}
                disabled={analyzeCount === '' || displayCount === '' || parseInt(analyzeCount) < parseInt(displayCount)}
              >
                분석 시작
              </button>
            </div>

            {hasCache && (
              <p className="rg-modal-cache-hint">
                이전 분석 결과가 있습니다.
                <br />
                캐시를 사용하면 바로 볼 수 있어요!
              </p>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <div className="rg-header">
        <button className="rg-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="rg-header-content">
          <h1 className="rg-title">관계 그래프</h1>
          <p className="rg-subtitle">명함 데이터를 기반 관계 분석 결과를 확인해보세요</p>
        </div>
        <button className="rg-refresh-btn" onClick={handleRefresh}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {isAnalyzing ? (
        <div className="rg-loading">
          <div className="rg-progress-container">
            {/* 진행률 바 */}
            <div className="rg-progress-bar-container">
              <div 
                className="rg-progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="rg-progress-text">{Math.round(progress)}%</div>
            
            {/* 단계 표시 */}
            <div className="rg-progress-steps">
              {[1, 2, 3, 4, 5].map(step => (
                <div 
                  key={step}
                  className={`rg-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
              ))}
            </div>
            
            {/* 진행 메시지 */}
            <p className="rg-progress-message">{progressMessage || '분석 준비 중...'}</p>
            
            {/* 분석 카운트 */}
            {analyzedCount > 0 && (
              <p className="rg-progress-count">
                {analyzedCount} / {totalAnalyzeCount}명 분석 완료
              </p>
            )}
            
            <p className="rg-progress-hint">분석 중 다른 서비스를 이용하셔도 돼요 😊</p>
          </div>
          
          <div className="rg-loading-actions">
            <button className="rg-back-while-loading" onClick={() => navigate(-1)}>
              뒤로가기
            </button>
            <button className="rg-cancel-btn" onClick={cancelAnalysis}>
              분석 취소
            </button>
          </div>
        </div>
      ) : graphData ? (
        <div className="rg-content">
          {/* Stats */}
          {stats && (
            <div className="rg-stats">
              <div className="rg-stat-item">
                <span className="rg-stat-value">{stats.totalAnalyzed}</span>
                <span className="rg-stat-label">분석된 명함</span>
              </div>
              <div className="rg-stat-item">
                <span className="rg-stat-value">{stats.avgScore}</span>
                <span className="rg-stat-label">평균 점수</span>
              </div>
              <div className="rg-stat-item">
                <span className="rg-stat-value">{stats.maxScore}</span>
                <span className="rg-stat-label">최고 점수</span>
              </div>
              <div className="rg-stat-item">
                <span className="rg-stat-value">{graphData?.edges?.length || 0}</span>
                <span className="rg-stat-label">연결 수</span>
              </div>
            </div>
          )}

          {/* Graph */}
          <div className="rg-graph-card">
            <div className="rg-graph-header">
              <div className="rg-graph-title">관계 네트워크 (Top {displayCount})</div>
            </div>
            <div className="rg-graph-container" ref={graphRef}>
              <div className="rg-graph-hint">노드나 선을 탭하여 상세 정보 확인</div>
            </div>
          </div>

          {/* 휴면 관계 섹션 */}
          {dormantCards.length > 0 && (
            <div className="rg-dormant-section">
              <div className="rg-dormant-banner" onClick={() => setShowDormantPopup(true)}>
                <div className="rg-dormant-banner-content">
                  <div className="rg-dormant-banner-title">다시 가까워져봐요</div>
                  <div className="rg-dormant-banner-desc">
                    연락이 뜸해진 <strong>{dormantCards.length}명</strong>의 지인이 있어요
                  </div>
                </div>
                <div className="rg-dormant-banner-arrow">&gt;</div>
              </div>
            </div>
          )}

          {/* Score Ranking */}
          <div className="rg-card">
            <div className="rg-card-title">관계 점수 순위</div>
            <div className="rg-score-list">
              {scoreList.map((node, index) => (
                <div key={node.id} className="rg-score-item" onClick={() => {
                  setSelectedRelation(node)
                  setShowPanel(true)
                }}>
                  <span className="rg-rank">{index + 1}</span>
                  <div className="rg-score-info">
                    <span className="rg-score-name">{node.label}</span>
                    <span className="rg-score-company">{node.company || '-'}</span>
                  </div>
                  <div className="rg-score-right">
                    <span className="rg-score-value">{node.score || 0}점</span>
                    <span
                      className="rg-grade-badge"
                      style={{
                        background: `${node.grade?.color || '#888'}20`,
                        color: node.grade?.color || '#888'
                      }}
                    >
                      {node.grade?.level || '?'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* 관계 상세 팝업 */}
      {showPanel && selectedRelation && (
        <>
          <div className="rg-overlay" onClick={closePanel}></div>
          <div className="rg-relation-popup">
            <button className="rg-popup-close" onClick={closePanel}>×</button>

            <div className="rg-popup-header">
              <div className="rg-popup-name">{selectedRelation.label}</div>
              <div className="rg-popup-company">{selectedRelation.company || ''}</div>
            </div>

            <div className="rg-popup-score-section">
              <div
                className="rg-popup-score"
                style={{ color: selectedRelation.grade?.color || '#888' }}
              >
                {selectedRelation.score || 0}점
              </div>
              <div className="rg-popup-tags">
                <span
                  className="rg-popup-tag"
                  style={{
                    background: `${selectedRelation.grade?.color || '#888'}15`,
                    color: selectedRelation.grade?.color || '#888'
                  }}
                >
                  {selectedRelation.grade?.level || '?'} - {selectedRelation.grade?.label || '알 수 없음'}
                </span>
                <span
                  className="rg-popup-tag"
                  style={{
                    background: `${typeColors[selectedRelation.relationshipType] || '#888'}15`,
                    color: typeColors[selectedRelation.relationshipType] || '#888'
                  }}
                >
                  {selectedRelation.relationshipType || '-'}
                </span>
              </div>
            </div>

            {selectedRelation.summary && (
              <div className="rg-popup-section">
                <div className="rg-popup-section-title">관계 요약</div>
                <div className="rg-popup-section-content">{selectedRelation.summary}</div>
              </div>
            )}

            {selectedRelation.reasoning && (
              <div className="rg-popup-section">
                <div className="rg-popup-section-title">LLM 분석 근거</div>
                <div className="rg-popup-section-content">{selectedRelation.reasoning}</div>
              </div>
            )}

            {selectedRelation.strengths && selectedRelation.strengths.length > 0 && (
              <div className="rg-popup-section">
                <div className="rg-popup-section-title">✨ 관계의 강점</div>
                <ul className="rg-popup-list">
                  {selectedRelation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="rg-popup-memo-btn"
              onClick={() => {
                closePanel()
                navigate(`/memo?businessCardId=${selectedRelation.cardId}`, {
                  state: { returnTo: '/relation-graph' }
                })
              }}
            >
              명함에 메모 작성하러 가기
            </button>
          </div>
        </>
      )}

      {/* 휴면 클러스터 팝업 */}
      {showDormantPopup && (
        <>
          <div className="rg-overlay" onClick={() => setShowDormantPopup(false)}></div>
          <div className="rg-dormant-popup">
            <div className="rg-dormant-header">
              <h3>휴면 관계 명함</h3>
              <p>오래 연락하지 못한 분들이에요. 약속을 잡아보세요!</p>
              <button className="rg-dormant-close" onClick={() => setShowDormantPopup(false)}>×</button>
            </div>
            <div className="rg-dormant-list">
              {dormantCards.length === 0 ? (
                <div className="rg-dormant-empty">휴면 관계가 없습니다 🎉</div>
              ) : (
                dormantCards.map(card => (
                  <div key={card.id} className="rg-dormant-item">
                    <div className="rg-dormant-info">
                      <span className="rg-dormant-name">{card.label}</span>
                      <span className="rg-dormant-company">{card.company || '-'}</span>
                    </div>
                    <span className="rg-dormant-score">{card.score}점</span>
                    <button
                      className="rg-dormant-schedule-btn"
                      onClick={() => {
                        setShowDormantPopup(false)
                        // 일정 추가 페이지로 이동하면서 명함 정보 전달
                        navigate('/calendar/add', {
                          state: {
                            scheduleWith: {
                              cardId: card.cardId,
                              name: card.label,
                              company: card.company
                            }
                          }
                        })
                      }}
                    >
                      약속잡기
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RelationGraphPage
