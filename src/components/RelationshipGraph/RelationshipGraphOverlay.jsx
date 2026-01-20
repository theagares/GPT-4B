import { useEffect, useMemo, useRef, useState } from 'react'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'
import { relationshipSummaryAPI } from '../../utils/api'
import './RelationshipGraph.css'

const NODE_WIDTH = 120
const NODE_HEIGHT = 58
const ME_RADIUS = 36
const designGradients = {
  'design-1': 'linear-gradient(135deg, #6d30df 0%, #584cdc 100%)',
  'design-2': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  'design-3': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'design-4': 'linear-gradient(135deg, #f45aaa 0%, #e63787 100%)',
  'design-5': 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
  'design-6': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
}

const normalizeFacts = (facts) => {
  if (!facts) return {}
  if (typeof facts === 'string') {
    try {
      const parsed = JSON.parse(facts)
      return normalizeFacts(parsed)
    } catch (error) {
      return {}
    }
  }
  if (Array.isArray(facts)) {
    return facts.reduce((acc, item) => {
      if (!item || typeof item !== 'object') return acc
      const key = item.key || item.type || item.name
      const value = item.value || item.content || item.detail
      if (key && value) acc[key] = value
      return acc
    }, {})
  }
  if (typeof facts === 'object') return facts
  return {}
}

const parseSnapshotLines = (llmText = '') => {
  const lines = llmText.split('\n').map((line) => line.trim()).filter(Boolean)
  const picks = {
    relationshipDensity: /관계\s*밀도[:：]/,
    businessRelevance: /비즈니스\s*연관성[:：]/,
    personalAffinity: /개인적\s*친밀도[:：]/,
    decisionInfluence: /의사결정\s*영향력[:：]/,
    growthPotential: /향후\s*확장\s*가능성[:：]/,
  }

  const snapshot = {}
  Object.entries(picks).forEach(([key, regex]) => {
    const line = lines.find((l) => regex.test(l))
    if (line) {
      snapshot[key] = line.split(/[:：]/).slice(1).join(':').trim()
    }
  })
  return snapshot
}

const extractSection = (llmText = '', header) => {
  if (!llmText || !header) return ''
  const lines = llmText.split('\n')
  const startIndex = lines.findIndex((line) => line.trim() === header)
  if (startIndex < 0) return ''
  const collected = []
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    if (
      line === '관계로 이어진 맥락' ||
      line === '함께 한 것 / 상호작용' ||
      line === '취미·일상 공유' ||
      line === '가치·생활 공감' ||
      line === '키워드 요약'
    ) {
      break
    }
    collected.push(line)
  }
  return collected.join('\n').trim()
}

const extractSectionFromBlock = (llmText = '', blockHeader, sectionHeader) => {
  if (!llmText || !blockHeader || !sectionHeader) return ''
  const lines = llmText.split('\n').map((line) => line.trim())
  const blockIndex = lines.findIndex((line) => line === blockHeader)
  if (blockIndex < 0) return ''

  let sectionIndex = -1
  for (let i = blockIndex + 1; i < lines.length; i += 1) {
    if (lines[i] === sectionHeader) {
      sectionIndex = i
      break
    }
  }
  if (sectionIndex < 0) return ''

  const collected = []
  for (let i = sectionIndex + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line) continue
    if (
      line === '관계로 이어진 맥락' ||
      line === '함께 한 것 / 상호작용' ||
      line === '취미·일상 공유' ||
      line === '가치·생활 공감' ||
      line === '키워드 요약'
    ) {
      break
    }
    collected.push(line)
  }
  return collected.join('\n').trim()
}

export default function RelationshipGraphOverlay({ cards = [], meName = 'Me', onClose }) {
  const containerRef = useRef(null)
  const nodesRef = useRef([])
  const linksRef = useRef([])
  const simulationRef = useRef(null)
  const rafRef = useRef(null)
  const [, setTick] = useState(0)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [summaryByCardId, setSummaryByCardId] = useState({})
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [showKeywordsOnly, setShowKeywordsOnly] = useState(true)

  const favoriteCards = useMemo(
    () => (cards || []).filter((card) => card && card.isFavorite),
    [cards]
  )

  const selectedPerson = useMemo(
    () => favoriteCards.find((card) => String(card.id) === String(selectedPersonId)),
    [favoriteCards, selectedPersonId]
  )
  const selectedSummary = useMemo(
    () => summaryByCardId[selectedPersonId],
    [selectedPersonId, summaryByCardId]
  )

  const snapshotDisplay = useMemo(() => {
    if (!selectedSummary) return null
    if (selectedSummary.snapshot) return selectedSummary.snapshot
    if (selectedSummary.llmText) return parseSnapshotLines(selectedSummary.llmText)
    return null
  }, [selectedSummary])

  const layerDisplay = useMemo(() => {
    if (!selectedSummary?.llmText) return []
    return [
      {
        title: '관계로 이어진 맥락',
        content: showKeywordsOnly
          ? extractSectionFromBlock(selectedSummary.llmText, '키워드 요약', '관계로 이어진 맥락')
          : extractSection(selectedSummary.llmText, '관계로 이어진 맥락'),
      },
      {
        title: '함께 한 것 / 상호작용',
        content: showKeywordsOnly
          ? extractSectionFromBlock(selectedSummary.llmText, '키워드 요약', '함께 한 것 / 상호작용')
          : extractSection(selectedSummary.llmText, '함께 한 것 / 상호작용'),
      },
      {
        title: '취미·일상 공유',
        content: showKeywordsOnly
          ? extractSectionFromBlock(selectedSummary.llmText, '키워드 요약', '취미·일상 공유')
          : extractSection(selectedSummary.llmText, '취미·일상 공유'),
      },
      {
        title: '가치·생활 공감',
        content: showKeywordsOnly
          ? extractSectionFromBlock(selectedSummary.llmText, '키워드 요약', '가치·생활 공감')
          : extractSection(selectedSummary.llmText, '가치·생활 공감'),
      },
    ].filter((layer) => layer.content)
  }, [selectedSummary, showKeywordsOnly])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')

    html.classList.add('graph-fullscreen')
    body.classList.add('graph-fullscreen')
    root?.classList.add('graph-fullscreen')
    window.scrollTo(0, 0)

    return () => {
      html.classList.remove('graph-fullscreen')
      body.classList.remove('graph-fullscreen')
      root?.classList.remove('graph-fullscreen')
    }
  }, [])

  useEffect(() => {
    if (!size.width || !size.height) return
    const padding = 48
    const horizontalPadding = NODE_WIDTH / 2 + 18
    const topPadding = padding + 10

    const meNode = {
      id: 'me',
      name: meName || 'Me',
      type: 'me',
      fx: size.width / 2,
      fy: size.height / 2,
      x: size.width / 2,
      y: size.height / 2,
    }

    const cardNodes = favoriteCards.map((card) => ({
      id: String(card.id),
      name: card.name || card.displayName || '이름 없음',
      company: card.company || '',
      design: card.design || 'design-1',
      type: 'card',
    }))

    const nodes = [meNode, ...cardNodes]
    const links = cardNodes.map((node) => ({
      source: 'me',
      target: node.id,
    }))

    nodesRef.current = nodes
    linksRef.current = links

    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    const simulation = forceSimulation(nodes)
      .alpha(0.35)
      .alphaDecay(0.06)
      .velocityDecay(0.45)
      .force('charge', forceManyBody().strength(-320))
      .force('center', forceCenter(size.width / 2, size.height / 2))
      .force('collide', forceCollide((node) => (node.type === 'me' ? 64 : 56)).iterations(3))
      .force(
        'link',
        forceLink(links)
          .id((node) => node.id)
          .distance(220)
          .strength(0.7)
      )

    simulation.on('tick', () => {
      nodes.forEach((node) => {
        if (node.type === 'me') return
        const minX = horizontalPadding
        const maxX = size.width - horizontalPadding
        const minY = topPadding
        const maxY = size.height - padding
        if (node.x != null) node.x = Math.max(minX, Math.min(maxX, node.x))
        if (node.y != null) node.y = Math.max(minY, Math.min(maxY, node.y))
      })
      if (rafRef.current) return
      rafRef.current = window.requestAnimationFrame(() => {
        setTick((value) => value + 1)
        rafRef.current = null
      })
    })

    simulationRef.current = simulation

    return () => {
      simulation.stop()
    }
  }, [favoriteCards, meName, size.width, size.height])

  useEffect(() => {
    if (!simulationRef.current) return undefined
    const simulation = simulationRef.current

    const pulse = () => {
      simulation.alphaTarget(0.06).restart()
      setTimeout(() => {
        simulation.alphaTarget(0)
      }, 700)
    }

    pulse()
    const intervalId = setInterval(pulse, 2600)

    return () => {
      clearInterval(intervalId)
    }
  }, [favoriteCards.length, size.width, size.height])

  useEffect(() => {
    if (!favoriteCards.length) {
      setSelectedPersonId(null)
    }
  }, [favoriteCards])

  useEffect(() => {
    if (!selectedPersonId) return
    setShowKeywordsOnly(true)
  }, [selectedPersonId])


  useEffect(() => {
    if (!selectedPersonId) return
    if (summaryByCardId[selectedPersonId]) return

    let isActive = true
    const loadSummary = async () => {
      setIsSummaryLoading(true)
      try {
        const response = await relationshipSummaryAPI.getByCardId(selectedPersonId)
        if (!isActive) return
        if (response?.data?.success) {
          setSummaryByCardId((prev) => ({
            ...prev,
            [selectedPersonId]: response.data.data,
          }))
        }
      } catch (error) {
        console.error('Failed to load relationship summary:', error)
      } finally {
        if (isActive) setIsSummaryLoading(false)
      }
    }

    loadSummary()
    return () => {
      isActive = false
    }
  }, [selectedPersonId, summaryByCardId])

  const renderEdges = () =>
    linksRef.current.map((link) => {
      const source = link.source
      const target = link.target
      if (!source || !target) return null

      const sourceId = typeof source === 'object' ? source.id : source
      const targetId = typeof target === 'object' ? target.id : target
      const isSelected = String(targetId) === String(selectedPersonId)

      const x1 = typeof source === 'object' ? source.x : 0
      const y1 = typeof source === 'object' ? source.y : 0
      const x2 = typeof target === 'object' ? target.x : 0
      const y2 = typeof target === 'object' ? target.y : 0

      return (
        <line
          key={`${sourceId}-${targetId}`}
          className={`graph-edge ${isSelected ? 'selected' : ''}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          onClick={() => setSelectedPersonId(targetId)}
          aria-label={`${targetId} 관계선`}
        />
      )
    })

  const renderNodes = () =>
    nodesRef.current.map((node) => {
      if (!node) return null
      const isMe = node.type === 'me'
      const isSelected = String(node.id) === String(selectedPersonId)
      const x = node.x || 0
      const y = node.y || 0

      if (isMe) {
        return (
          <g key={node.id} className="graph-node me-node" transform={`translate(${x}, ${y})`}>
            <circle r={ME_RADIUS} />
            <text className="node-title" textAnchor="middle" y={4}>
              {node.name || 'Me'}
            </text>
          </g>
        )
      }

      const nodeGradient = designGradients[node.design] || designGradients['design-1']

      return (
        <g
          key={node.id}
          className={`graph-node card-node ${isSelected ? 'selected' : ''}`}
          transform={`translate(${x}, ${y})`}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedPersonId(node.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setSelectedPersonId(node.id)
            }
          }}
          aria-label={`${node.name} 명함 선택`}
        >
          <foreignObject
            x={-NODE_WIDTH / 2}
            y={-NODE_HEIGHT / 2}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
          >
            <div className="graph-card" style={{ background: nodeGradient }}>
              <div className="graph-card-title">{node.name}</div>
              <div className="graph-card-subtitle">{node.company || '소속 정보 없음'}</div>
            </div>
          </foreignObject>
        </g>
      )
    })

  return (
    <div className="relationship-graph-overlay" role="dialog" aria-modal="true">
      <div className="relationship-graph-header">
        <div className="graph-header-actions">
          <button
            className="graph-close-button"
            onClick={onClose}
            aria-label="관계도 닫기"
          >
            닫기
          </button>
        </div>
        <div className="graph-title">
          선호 명함 관계도
        </div>
        <div className="panel-spacer" />
      </div>

      <div className="relationship-graph-body">
        <div className="relationship-graph-canvas" ref={containerRef}>
          {favoriteCards.length === 0 ? (
            <div className="graph-empty-state">
              하트를 누른 명함이 없습니다.
            </div>
          ) : (
            <svg className="relationship-graph-svg" width={size.width} height={size.height} role="img" aria-label="명함 관계 그래프">
              <g className="graph-edges">{renderEdges()}</g>
              <g className="graph-nodes">{renderNodes()}</g>
            </svg>
          )}
        </div>
      </div>

      {selectedPerson && (
        <aside className="relationship-summary-dock" role="status" aria-live="polite">
          <div className="summary-header">
            <span>관계 요약</span>
            <button
              className="panel-toggle-mini"
              onClick={() => setSelectedPersonId(null)}
              aria-label="관계 요약 닫기"
            >
              닫기
            </button>
          </div>
          <div className="summary-toggle-row">
            <button
              className="graph-toggle-button"
              onClick={() => setShowKeywordsOnly((prev) => !prev)}
              aria-label={showKeywordsOnly ? '문장으로 보기' : '키워드로 보기'}
            >
              {showKeywordsOnly ? '문장으로 보기' : '키워드로 보기'}
            </button>
          </div>
          <div className="summary-content">
            <h3>{selectedPerson.name || selectedPerson.displayName || '이름 없음'}</h3>
            {isSummaryLoading ? (
              <p className="summary-empty">관계 정보를 불러오는 중...</p>
            ) : (
              <>
                {layerDisplay.length > 0 && (
                  <div className="summary-layers">
                    {layerDisplay.map((layer) => (
                      <div key={layer.title} className="summary-layer-card">
                        <div className="summary-layer-title">{layer.title}</div>
                        <div className="summary-layer-body">{layer.content}</div>
                      </div>
                    ))}
                  </div>
                )}
                {!selectedSummary && <p>정보 없음</p>}
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}

