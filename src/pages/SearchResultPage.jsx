import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { searchAPI, cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './SearchResultPage.css'

function SearchResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // location.state에서 검색어 가져오기
    if (location.state?.query) {
      const query = location.state.query
      setSearchQuery(query)
      // 검색 실행
      performSearch(query)
    }
  }, [location.state])

  const performSearch = async (query) => {
    if (!query || !query.trim()) {
      setError('검색어를 입력해주세요.')
      return
    }

    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      console.log('🔍 검색 시작:', query.trim())
      
      // 1. cardSearch API 호출
      const searchResponse = await searchAPI.search(query.trim())
      console.log('✅ 검색 응답:', searchResponse.data)
      
      if (!searchResponse.data.success) {
        const errorMsg = searchResponse.data.message || '검색 중 오류가 발생했습니다.'
        console.error('❌ 검색 실패:', errorMsg)
        setError(errorMsg)
        return
      }

      const searchData = searchResponse.data.data || {}
      const cardIds = searchData.cardIds || []
      const evidenceMap = searchData.evidenceMap || {}

      console.log('📊 검색된 cardIds:', cardIds)
      console.log('📊 evidenceMap:', evidenceMap)

      if (cardIds.length === 0) {
        setResults([])
        return
      }

      // 2. cardIds로 명함 정보 가져오기
      const cardIdsParam = cardIds.join(',')
      const cardsResponse = await cardAPI.getAll({ cardIds: cardIdsParam })
      console.log('✅ 명함 정보 응답:', cardsResponse.data)

      if (!cardsResponse.data.success) {
        setError('명함 정보를 가져오는데 실패했습니다.')
        return
      }

      const cards = cardsResponse.data.data || []

      // 3. 명함 정보와 evidence를 결합
      const combinedResults = cardIds.map((cardId) => {
        const card = cards.find((c) => c.id === cardId)
        let evidences = evidenceMap[cardId] || []
        
        // evidence가 배열이 아닌 경우 배열로 변환
        if (!Array.isArray(evidences)) {
          evidences = evidences ? [evidences] : []
        }
        
        // 빈 문자열이나 null 제거
        evidences = evidences.filter(ev => ev && ev.trim() !== '')

        console.log(`📋 CardId ${cardId}의 evidence:`, evidences)

        return {
          card: card || { id: cardId, name: '알 수 없음' },
          evidences: evidences, // 모든 evidence를 저장
          matchingFact: {
            evidence: evidences[0] || '', // 호환성을 위해 첫 번째 evidence도 유지
            factType: 'evidence',
            factKey: 'search',
            confidence: 1.0,
          },
          similarity: 1.0, // cardSearch는 유사도 점수를 제공하지 않으므로 기본값
          finalScore: 1.0,
        }
      }).filter((result) => result.card && result.card.id) // 유효한 명함만 필터링

      console.log('📊 최종 결과 개수:', combinedResults.length)
      setResults(combinedResults)
    } catch (err) {
      console.error('❌ 검색 에러:', err)
      console.error('  - 에러 메시지:', err.message)
      console.error('  - 응답 데이터:', err.response?.data)
      console.error('  - 상태 코드:', err.response?.status)
      
      const errorMsg = err.response?.data?.message || err.message || '검색 중 오류가 발생했습니다.'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleCardClick = (cardId) => {
    navigate('/business-cards', { 
      state: { 
        openCardId: cardId,
        returnToSearchResult: true,
        searchQuery: searchQuery 
      } 
    })
  }

  return (
    <div className="search-result-page">
      <div className="search-result-container">
        {/* Header */}
        <div className="search-result-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="search-result-header-content">
            <h1 className="search-result-header-title">검색 결과</h1>
          </div>
        </div>

        {/* Result Content */}
        <div className="search-result-content">
          {isLoading ? (
            <div className="loading-state">
              <p>검색 중...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-text">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-result-state">
              <div className="empty-result-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="empty-result-text">검색 결과가 없습니다</p>
              <p className="empty-result-hint">다른 검색어로 시도해보세요</p>
            </div>
          ) : (
            <div className="result-list-container">
              <div className="search-results-grid">
                {results.map((result, index) => (
                  <div
                    key={result.card.id}
                    className="search-result-card"
                    onClick={() => handleCardClick(result.card.id)}
                  >
                    <div className="search-card-content">
                      {result.card.company && (
                        <div className="search-card-company">
                          {result.card.company}
                        </div>
                      )}
                      <div className="search-card-name">
                        {result.card.name || '이름 없음'}
                      </div>
                      {result.card.position && (
                        <div className="search-card-position">
                          {result.card.position}
                        </div>
                      )}
                      {result.evidences && result.evidences.length > 0 && (
                        <div className="search-card-evidence-list">
                          {result.evidences.map((evidence, idx) => (
                            <div key={idx} className="search-card-evidence">
                              <span className="evidence-prefix">근거:</span> {evidence}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResultPage
