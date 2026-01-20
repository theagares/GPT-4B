import { useState, useEffect } from 'react'
import { relationshipAPI } from '../../utils/api'
import './RelationshipGraph.css'

function RelationshipSummaryModal({ contactId, maxIntimacyScore = 50, onClose }) {
  const [summary, setSummary] = useState(null)
  const [llmSummaries, setLlmSummaries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [llmLoading, setLlmLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedKeywords, setExpandedKeywords] = useState({}) // 더보기 확장 상태
  const [forceRefresh, setForceRefresh] = useState(false) // 강제 새로고침 플래그

  // 기본 정보 먼저 가져오기 (LLM 없이)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const response = await relationshipAPI.getRelationshipSummary(contactId)
        
        if (response.data.success) {
          setSummary(response.data.data)
          setLoading(false)
        } else {
          setError('관계 요약 정보를 불러오는데 실패했습니다.')
          setLoading(false)
        }
      } catch (err) {
        console.error('관계 요약 조회 오류:', err)
        setError(err.response?.data?.message || '관계 요약 정보를 불러오는데 실패했습니다.')
        setLoading(false)
      }
    }

    if (contactId) {
      fetchSummary()
    }
  }, [contactId])

  // LLM 요약 별도로 가져오기 (캐싱 적용)
  useEffect(() => {
    const fetchLLMSummaries = async () => {
      if (!summary || !contactId) return
      
      // 캐시 키 생성 (contactId와 factTypeStats의 해시 기반)
      const cacheKey = `llm_summary_${contactId}_${JSON.stringify(summary.factTypeStats)}`
      
      // 강제 새로고침이 아니면 캐시 확인
      if (!forceRefresh) {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          try {
            const cachedData = JSON.parse(cached)
            setLlmSummaries(cachedData)
            setLlmLoading(false)
            return
          } catch (e) {
            console.error('캐시 파싱 오류:', e)
          }
        }
      }
      
      // 캐시가 없거나 강제 새로고침이면 API 호출
      try {
        setLlmLoading(true)
        const response = await relationshipAPI.getLLMSummaries(contactId)
        
        if (response.data.success) {
          setLlmSummaries(response.data.data)
          // 캐시에 저장
          localStorage.setItem(cacheKey, JSON.stringify(response.data.data))
          setLlmLoading(false)
          setForceRefresh(false) // 새로고침 완료 후 플래그 리셋
        } else {
          setLlmLoading(false)
          setForceRefresh(false)
        }
      } catch (err) {
        console.error('LLM 요약 조회 오류:', err)
        setLlmLoading(false)
        setForceRefresh(false)
      }
    }

    // 기본 정보가 로드된 후 LLM 요약 가져오기
    if (summary && !loading) {
      fetchLLMSummaries()
    }
  }, [summary, contactId, loading, forceRefresh])

  // 관계 업데이트 버튼 핸들러
  const handleRefresh = () => {
    setForceRefresh(true)
    setLlmLoading(true)
    setLlmSummaries(null) // 기존 요약 초기화
  }

  if (loading) {
    return (
      <div className="summary-modal-overlay" onClick={onClose}>
        <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="summary-modal-loading">
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="summary-modal-overlay" onClick={onClose}>
        <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="summary-modal-error">
            <p>{error || '정보를 불러올 수 없습니다.'}</p>
            <button onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    )
  }

  // 기본 정보는 로드되었으므로 모달 표시 (LLM 요약은 로딩 중일 수 있음)

  // 친밀도 퍼센트 계산
  const intimacyPercentage = Math.min(100, Math.round((summary.intimacyScore / maxIntimacyScore) * 100))
  
  // 키워드 추출 (신뢰도 0.7 이상 우선)
  const getKeywords = (facts, category, showAll = false) => {
    if (!facts || facts.length === 0) return []
    
    // 신뢰도 높은 것 우선 정렬
    const sorted = [...facts].sort((a, b) => (b.confidence || 0.7) - (a.confidence || 0.7))
    
    // 더보기가 확장되었으면 전체, 아니면 5개만
    const maxCount = showAll ? facts.length : 5
    return sorted.slice(0, maxCount).map(f => ({
      keyword: f.fact_key,
      isSpeculative: (f.confidence || 0.7) < 0.7
    }))
  }

  // 더보기 토글 함수
  const toggleExpand = (category) => {
    setExpandedKeywords(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const interactionStats = summary.factTypeStats?.INTERACTION
  const preferenceStats = summary.factTypeStats?.PREFERENCE
  const dateStats = summary.factTypeStats?.DATE
  const contextStats = summary.factTypeStats?.CONTEXT
  const roleStats = summary.factTypeStats?.ROLE_OR_ORG

  return (
    <div className="summary-modal-overlay" onClick={onClose}>
      <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="summary-modal-header">
          <h2 className="summary-modal-title">{summary.contactName}님과의 관계</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="summary-refresh-button"
              onClick={handleRefresh}
              disabled={llmLoading}
              title="관계 정보 업데이트"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="summary-modal-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="summary-modal-body">
          {/* 기본 정보 */}
          <div className="summary-section">
            <h3 className="summary-section-title">기본 정보</h3>
            <div className="summary-info-grid">
              <div className="summary-info-item">
                <span className="summary-info-label">친밀도</span>
                <span className="summary-info-value">{intimacyPercentage}%</span>
              </div>
            </div>
          </div>

          {/* 종합 판단 */}
          <div className="summary-section">
            <h3 className="summary-section-title">종합 판단</h3>
            {llmLoading || !llmSummaries?.overallSummary ? (
              <div className="summary-text-content" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                분석 중...
              </div>
            ) : (
              <div className="summary-text-content">
                {llmSummaries.overallSummary}
              </div>
            )}
          </div>

          {/* 상호작용 요약 */}
          <div className="summary-section">
            <h3 className="summary-section-title">상호작용</h3>
            {llmLoading || !llmSummaries?.categorySummaries?.INTERACTION ? (
              <div className="summary-text-content" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                분석 중...
              </div>
            ) : (
              <div className="summary-text-content">
                {llmSummaries.categorySummaries.INTERACTION}
              </div>
            )}
          </div>

          {/* 선호도 */}
          <div className="summary-section">
            <h3 className="summary-section-title">선호도</h3>
            {llmLoading || !llmSummaries?.categorySummaries?.PREFERENCE ? (
              <div className="summary-text-content" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                분석 중...
              </div>
            ) : (
              <div className="summary-text-content">
                {llmSummaries.categorySummaries.PREFERENCE}
              </div>
            )}
            {preferenceStats && preferenceStats.facts && preferenceStats.facts.length > 0 && (
              <div className="summary-keywords" style={{ marginTop: '12px' }}>
                {getKeywords(preferenceStats.facts, 'PREFERENCE', expandedKeywords['PREFERENCE']).map((item, index) => (
                  <span 
                    key={index} 
                    className={`summary-keyword-tag ${item.isSpeculative ? 'speculative' : ''}`}
                    title={item.isSpeculative ? '추정 정보' : ''}
                  >
                    {item.keyword}
                    {item.isSpeculative && '?'}
                  </span>
                ))}
                {preferenceStats.count > 5 && (
                  <span 
                    className="summary-more-indicator"
                    onClick={() => toggleExpand('PREFERENCE')}
                    style={{ cursor: 'pointer' }}
                  >
                    {expandedKeywords['PREFERENCE'] ? '접기' : `+${preferenceStats.count - 5}개 더보기`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 중요 날짜 */}
          <div className="summary-section">
            <h3 className="summary-section-title">중요 날짜</h3>
            {llmLoading || !llmSummaries?.categorySummaries?.DATE ? (
              <div className="summary-text-content" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                분석 중...
              </div>
            ) : (
              <div className="summary-text-content">
                {llmSummaries.categorySummaries.DATE}
              </div>
            )}
            {dateStats && dateStats.facts && dateStats.facts.length > 0 && (
              <div className="summary-keywords" style={{ marginTop: '12px' }}>
                {getKeywords(dateStats.facts, 'DATE', expandedKeywords['DATE']).map((item, index) => (
                  <span 
                    key={index} 
                    className={`summary-keyword-tag ${item.isSpeculative ? 'speculative' : ''}`}
                    title={item.isSpeculative ? '추정 정보' : ''}
                  >
                    {item.keyword}
                    {item.isSpeculative && '?'}
                  </span>
                ))}
                {dateStats.count > 5 && (
                  <span 
                    className="summary-more-indicator"
                    onClick={() => toggleExpand('DATE')}
                    style={{ cursor: 'pointer' }}
                  >
                    {expandedKeywords['DATE'] ? '접기' : `+${dateStats.count - 5}개 더보기`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 배경 정보 */}
          <div className="summary-section">
            <h3 className="summary-section-title">배경 정보</h3>
            {llmLoading || !llmSummaries?.categorySummaries?.CONTEXT ? (
              <div className="summary-text-content" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                분석 중...
              </div>
            ) : (
              <div className="summary-text-content">
                {llmSummaries.categorySummaries.CONTEXT}
              </div>
            )}
            {contextStats && contextStats.facts && contextStats.facts.length > 0 && (
              <div className="summary-keywords" style={{ marginTop: '12px' }}>
                {getKeywords(contextStats.facts, 'CONTEXT', expandedKeywords['CONTEXT']).map((item, index) => (
                  <span 
                    key={index} 
                    className={`summary-keyword-tag ${item.isSpeculative ? 'speculative' : ''}`}
                    title={item.isSpeculative ? '추정 정보' : ''}
                  >
                    {item.keyword}
                    {item.isSpeculative && '?'}
                  </span>
                ))}
                {contextStats.count > 5 && (
                  <span 
                    className="summary-more-indicator"
                    onClick={() => toggleExpand('CONTEXT')}
                    style={{ cursor: 'pointer' }}
                  >
                    {expandedKeywords['CONTEXT'] ? '접기' : `+${contextStats.count - 5}개 더보기`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 역할/조직 */}
          <div className="summary-section">
            <h3 className="summary-section-title">역할/조직</h3>
            {llmLoading || !llmSummaries?.categorySummaries?.ROLE_OR_ORG ? (
              <div className="summary-text-content" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                분석 중...
              </div>
            ) : (
              <div className="summary-text-content">
                {llmSummaries.categorySummaries.ROLE_OR_ORG}
              </div>
            )}
            {roleStats && roleStats.facts && roleStats.facts.length > 0 && (
              <div className="summary-keywords" style={{ marginTop: '12px' }}>
                {getKeywords(roleStats.facts, 'ROLE_OR_ORG', expandedKeywords['ROLE_OR_ORG']).map((item, index) => (
                  <span 
                    key={index} 
                    className={`summary-keyword-tag ${item.isSpeculative ? 'speculative' : ''}`}
                    title={item.isSpeculative ? '추정 정보' : ''}
                  >
                    {item.keyword}
                    {item.isSpeculative && '?'}
                  </span>
                ))}
                {roleStats.count > 5 && (
                  <span 
                    className="summary-more-indicator"
                    onClick={() => toggleExpand('ROLE_OR_ORG')}
                    style={{ cursor: 'pointer' }}
                  >
                    {expandedKeywords['ROLE_OR_ORG'] ? '접기' : `+${roleStats.count - 5}개 더보기`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getFactTypeLabel(type) {
  const labels = {
    'INTERACTION': '상호작용',
    'PREFERENCE': '선호도',
    'DATE': '중요 날짜',
    'CONTEXT': '배경 정보',
    'ROLE_OR_ORG': '역할/조직'
  }
  return labels[type] || type
}

export default RelationshipSummaryModal
