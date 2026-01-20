import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import './RelationGraphPage.css'

const API_BASE = 'http://localhost:3002'
const CACHE_KEY = 'relation_graph_cache'

function RelationGraphPage() {
  const navigate = useNavigate()
  const graphRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)
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
  const [hasCache, setHasCache] = useState(false)

  // 페이지 진입 시 캐시 확인 및 팝업 표시
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      setHasCache(true)
      loadFromCache()
    } else {
      setShowSettingsModal(true)
    }
  }, [])

  // 캐시에서 데이터 로드
  const loadFromCache = () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
      if (cached && cached.data) {
        applyData(cached.data, cached.displayCount || 10)
        setAnalyzeCount(cached.analyzeCount || 20)
        setDisplayCount(cached.displayCount || 10)
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

  // API에서 데이터 로드
  const loadData = async (limit, topK) => {
    setLoading(true)
    setShowSettingsModal(false)
    try {
      const response = await fetch(`${API_BASE}/api/llm-auto?limit=${limit}&maxIterations=2`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = result.data

      // 캐시에 저장
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        analyzeCount: limit,
        displayCount: topK,
        timestamp: Date.now()
      }))
      setHasCache(true)

      applyData(data, topK)

    } catch (error) {
      console.error('데이터 로드 오류:', error)
      alert('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 설정 확인 후 분석 시작
  const handleStartAnalysis = () => {
    loadData(analyzeCount, displayCount)
  }

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
      const minDist = 30   // 점수 100일 때 (가장 친밀)
      const maxDist = 120  // 점수 0일 때 (가장 덜 친밀)
      return maxDist - (score / 100) * (maxDist - minDist)
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
      .alphaDecay(0.02)
      .alphaMin(0.001)
      .velocityDecay(0.3)
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

    // 🌊 지속적인 미세 움직임 (floating effect)
    const floatingAnimation = () => {
      const time = Date.now() * 0.001

      graphData.nodes.forEach(d => {
        if (!d.isDragging && !d.wasDragged) {
          // 부드러운 사인파 움직임 (드래그 안된 노드만)
          const floatX = Math.sin(time * d.floatSpeed + d.floatPhase) * d.floatAmplitude
          const floatY = Math.cos(time * d.floatSpeed * 0.7 + d.floatPhase) * d.floatAmplitude

          d.vx = (d.vx || 0) + floatX * 0.008
          d.vy = (d.vy || 0) + floatY * 0.008
        }
      })

      // alpha 값을 최소값 이상으로 유지하여 시뮬레이션 지속
      if (simulationRef.current.alpha() < 0.03) {
        simulationRef.current.alpha(0.03)
      }

      animationFrameRef.current = requestAnimationFrame(floatingAnimation)
    }

    // 초기 안정화 후 floating 시작
    setTimeout(() => {
      floatingAnimation()
    }, 2500)

    function dragstarted(event, d) {
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
      if (!event.active) simulationRef.current.alphaTarget(0.1).restart()
      d.isDragging = false
      d.wasDragged = true  // 드래그된 적 있음 표시 → 클러스터링에서 제외
      // 드래그 종료 후 자유롭게 움직이도록 fx, fy 해제
      d.fx = null
      d.fy = null
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
    '비즈니스': '#584cdc',
    '개인적': '#22c55e',
    '잠재적': '#eab308',
    '소원': '#f97316',
    '혼합': '#a855f7'
  }

  return (
    <div className="relation-graph-page">
      {/* 설정 팝업 */}
      {showSettingsModal && (
        <>
          <div className="rg-modal-overlay" onClick={() => hasCache && handleUseCache()}></div>
          <div className="rg-settings-modal">
            <div className="rg-modal-title">🔧 분석 설정</div>
            <p className="rg-modal-desc">관계 그래프 분석에 필요한 설정을 입력해주세요</p>
            
            <div className="rg-modal-field">
              <label>분석할 명함 수</label>
              <input
                type="number"
                min="5"
                max="50"
                value={analyzeCount}
                onChange={(e) => setAnalyzeCount(Math.min(50, Math.max(5, parseInt(e.target.value) || 5)))}
              />
              <span className="rg-modal-hint">LLM이 분석할 명함 (5~50개)</span>
            </div>

            <div className="rg-modal-field">
              <label>그래프에 표시할 명함 수</label>
              <input
                type="number"
                min="3"
                max="20"
                value={displayCount}
                onChange={(e) => setDisplayCount(Math.min(20, Math.max(3, parseInt(e.target.value) || 3)))}
              />
              <span className="rg-modal-hint">상위 N개만 그래프에 표시 (3~20개)</span>
            </div>

            <div className="rg-modal-buttons">
              {hasCache && (
                <button className="rg-modal-btn-secondary" onClick={handleUseCache}>
                  캐시 사용
                </button>
              )}
              <button className="rg-modal-btn-primary" onClick={handleStartAnalysis}>
                분석 시작
              </button>
            </div>

            {hasCache && (
              <p className="rg-modal-cache-hint">💡 이전 분석 결과가 있습니다. 캐시를 사용하면 바로 볼 수 있어요!</p>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <div className="rg-header">
        <button className="rg-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="rg-header-content">
          <h1 className="rg-title">🔗 관계 그래프</h1>
          <p className="rg-subtitle">명함 데이터 기반 관계 분석</p>
        </div>
        <button className="rg-refresh-btn" onClick={handleRefresh}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 20V14H17" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="rg-loading">
          <div className="rg-spinner"></div>
          <p>분석 중... (시간이 소요될 수 있습니다)</p>
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
            <div className="rg-graph-title">🕸️ 관계 네트워크 (Top {displayCount})</div>
            <div className="rg-graph-container" ref={graphRef}>
              <div className="rg-graph-hint">💡 노드나 선을 탭하여 상세 정보 확인</div>
            </div>
          </div>

          {/* Score Ranking */}
          <div className="rg-card">
            <div className="rg-card-title">🏆 관계 점수 순위</div>
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

      {/* Detail Panel */}
      <div className={`rg-panel ${showPanel ? 'open' : ''}`}>
        <div className="rg-panel-header">
          <span className="rg-panel-title">관계 상세</span>
          <button className="rg-panel-close" onClick={closePanel}>×</button>
        </div>
        {selectedRelation && (
          <div className="rg-panel-content">
            <div className="rg-panel-name">{selectedRelation.label}</div>
            <div className="rg-panel-company">{selectedRelation.company || ''}</div>

            <div className="rg-panel-score">
              <div 
                className="rg-panel-score-value"
                style={{ color: selectedRelation.grade?.color || '#888' }}
              >
                {selectedRelation.score || 0}
              </div>
              <div className="rg-panel-score-label">관계 점수</div>
            </div>

            <div className="rg-panel-tags">
              <span 
                className="rg-panel-tag"
                style={{ 
                  background: `${selectedRelation.grade?.color || '#888'}20`,
                  color: selectedRelation.grade?.color || '#888'
                }}
              >
                {selectedRelation.grade?.level || '?'} - {selectedRelation.grade?.label || '알 수 없음'}
              </span>
              <span 
                className="rg-panel-tag"
                style={{ 
                  background: `${typeColors[selectedRelation.relationshipType] || '#888'}20`,
                  color: typeColors[selectedRelation.relationshipType] || '#888'
                }}
              >
                {selectedRelation.relationshipType || '-'}
              </span>
            </div>

            {selectedRelation.summary && (
              <div className="rg-panel-section">
                <div className="rg-panel-section-title">관계 요약</div>
                <div className="rg-panel-section-content">{selectedRelation.summary}</div>
              </div>
            )}

            {selectedRelation.reasoning && (
              <div className="rg-panel-section">
                <div className="rg-panel-section-title">💡 LLM 분석 근거</div>
                <div className="rg-panel-section-content">{selectedRelation.reasoning}</div>
              </div>
            )}

            {selectedRelation.strengths && selectedRelation.strengths.length > 0 && (
              <div className="rg-panel-section">
                <div className="rg-panel-section-title">관계의 강점</div>
                <ul className="rg-panel-list">
                  {selectedRelation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay */}
      {showPanel && <div className="rg-overlay" onClick={closePanel}></div>}
    </div>
  )
}

export default RelationGraphPage
