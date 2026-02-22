import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAPI, cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import BottomNavigation from '../components/BottomNavigation'
import './SearchPage.css'

function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [bestMatch, setBestMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchMode, setSearchMode] = useState('topN') // 'topN' or 'best'
  const [isListening, setIsListening] = useState(false)
  const [isSTTSupported, setIsSTTSupported] = useState(false)
  const recognitionRef = useRef(null)

  // 검색 실행 (쿼리 파라미터로)
  const handleSearchWithQuery = useCallback(async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
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
    setBestMatch(null)

    try {
      console.log('🔍 검색 시작:', searchQuery.trim())
      
      // 1. cardSearch API 호출
      const searchResponse = await searchAPI.search(searchQuery.trim())
      console.log('✅ 검색 응답:', searchResponse.data)
      
      if (!searchResponse.data.success) {
        const errorMsg = searchResponse.data.message || '검색 중 오류가 발생했습니다.'
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
        setBestMatch(null)
        setError('검색 결과가 없습니다.')
        return
      }

      // 2. cardIds로 프로필 정보 가져오기
      const cardIdsParam = cardIds.join(',')
      const cardsResponse = await cardAPI.getAll({ cardIds: cardIdsParam })
      console.log('✅ 프로필 정보 응답:', cardsResponse.data)

      if (!cardsResponse.data.success) {
        setError('프로필 정보를 가져오는데 실패했습니다.')
        return
      }

      const cards = cardsResponse.data.data || []

      // 3. 프로필 정보와 evidence를 결합
      const combinedResults = cardIds.map((cardId) => {
        const card = cards.find((c) => c.id === cardId)
        const evidences = evidenceMap[cardId] || []
        const primaryEvidence = evidences[0] || ''

        return {
          card: card || { id: cardId, name: '알 수 없음' },
          matchingFact: {
            evidence: primaryEvidence,
            factType: 'evidence',
            factKey: 'search',
            confidence: 1.0,
          },
          similarity: 1.0,
          finalScore: 1.0,
        }
      }).filter((result) => result.card && result.card.id)

      console.log('📊 최종 결과 개수:', combinedResults.length)

      if (searchMode === 'best') {
        // 가장 적합한 프로필 (첫 번째 결과)
        setBestMatch(combinedResults[0] || null)
      } else {
        // topN 검색 (최대 5개)
        setResults(combinedResults.slice(0, 5))
        if (combinedResults.length === 0) {
          setError('검색 결과가 없습니다.')
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err.response?.data?.message || '검색 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [searchMode, navigate])

  // STT 지원 여부 확인 및 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSTTSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = 'ko-KR' // 한국어 설정
      recognition.continuous = false // 한 번만 인식
      recognition.interimResults = false // 최종 결과만 받기
      
      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        // 자동으로 검색 실행
        setTimeout(() => {
          handleSearchWithQuery(transcript)
        }, 100)
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          setError('음성이 감지되지 않았습니다. 다시 시도해주세요.')
        } else if (event.error === 'not-allowed') {
          setError('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        } else {
          setError('음성 인식 중 오류가 발생했습니다.')
        }
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [handleSearchWithQuery])

  // STT 시작/중지
  const toggleListening = () => {
    if (!isSTTSupported) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }
    
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        setError('음성 인식을 시작할 수 없습니다.')
      }
    }
  }

  // 검색 실행
  const handleSearch = async () => {
    await handleSearchWithQuery(query)
  }

  // Enter 키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 프로필 상세 페이지로 이동
  const handleCardClick = (cardId) => {
    navigate(`/cards/${cardId}`)
  }

  return (
    <div className="search-page">
      <div className="search-container">
        {/* 헤더 */}
        <div className="search-header">
          <h1>프로필 검색</h1>
          <p className="search-subtitle">evidence 정보를 기반으로 관련 프로필을 찾습니다</p>
        </div>

        {/* 검색 입력 */}
        <div className="search-input-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="검색어를 입력하세요 (예: 커피를 좋아함, 골프 취미)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isListening}
            />
            {isSTTSupported && (
              <button
                className={`voice-button ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={isLoading}
                title={isListening ? '음성 인식 중...' : '음성으로 검색'}
              >
                {isListening ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
                    <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z" fill="currentColor"/>
                    <path d="M11 22H13V24H11V22Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            )}
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={isLoading || !query.trim() || isListening}
            >
              {isLoading ? '검색 중...' : '검색'}
            </button>
          </div>
          {isListening && (
            <div className="listening-indicator">
              <div className="listening-pulse"></div>
              <span>음성 인식 중... 말씀해주세요</span>
            </div>
          )}

          {/* 검색 모드 선택 */}
          <div className="search-mode-toggle">
            <button
              className={`mode-button ${searchMode === 'topN' ? 'active' : ''}`}
              onClick={() => setSearchMode('topN')}
            >
              Top 5 결과
            </button>
            <button
              className={`mode-button ${searchMode === 'best' ? 'active' : ''}`}
              onClick={() => setSearchMode('best')}
            >
              가장 적합한 결과
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="search-error">
            <p>{error}</p>
          </div>
        )}

        {/* 검색 결과 */}
        {!isLoading && (
          <>
            {/* TopN 결과 */}
            {searchMode === 'topN' && results.length > 0 && (
              <div className="search-results">
                <h2 className="results-title">검색 결과 ({results.length}개)</h2>
                <div className="results-list">
                  {results.map((result, index) => (
                    <div
                      key={result.card.id}
                      className="result-card"
                      onClick={() => handleCardClick(result.card.id)}
                    >
                      <div className="result-header">
                        <div className="result-rank">#{index + 1}</div>
                        <div className="result-score">
                          유사도: {(result.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="result-card-info">
                        <h3 className="card-name">{result.card.name}</h3>
                        {result.card.position && (
                          <p className="card-position">{result.card.position}</p>
                        )}
                        {result.card.company && (
                          <p className="card-company">{result.card.company}</p>
                        )}
                      </div>
                      <div className="result-evidence">
                        <p className="evidence-label">매칭된 근거:</p>
                        <p className="evidence-text">"{result.matchingFact.evidence}"</p>
                        <div className="evidence-meta">
                          <span className="fact-type">{result.matchingFact.factType}</span>
                          <span className="fact-key">{result.matchingFact.factKey}</span>
                          <span className="confidence">
                            신뢰도: {(result.matchingFact.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Match 결과 */}
            {searchMode === 'best' && bestMatch && (
              <div className="search-results">
                <h2 className="results-title">가장 적합한 프로필</h2>
                <div className="best-match-card">
                  <div className="result-header">
                    <div className="best-badge">BEST MATCH</div>
                    <div className="result-score">
                      유사도: {(bestMatch.similarity * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="result-card-info">
                    <h3 className="card-name">{bestMatch.card.name}</h3>
                    {bestMatch.card.position && (
                      <p className="card-position">{bestMatch.card.position}</p>
                    )}
                    {bestMatch.card.company && (
                      <p className="card-company">{bestMatch.card.company}</p>
                    )}
                    {bestMatch.card.email && (
                      <p className="card-email">{bestMatch.card.email}</p>
                    )}
                    {bestMatch.card.phone && (
                      <p className="card-phone">{bestMatch.card.phone}</p>
                    )}
                  </div>
                  <div className="result-evidence">
                    <p className="evidence-label">매칭된 근거:</p>
                    <p className="evidence-text">"{bestMatch.matchingFact.evidence}"</p>
                    <div className="evidence-meta">
                      <span className="fact-type">{bestMatch.matchingFact.factType}</span>
                      <span className="fact-key">{bestMatch.matchingFact.factKey}</span>
                      <span className="confidence">
                        신뢰도: {(bestMatch.matchingFact.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <button
                    className="view-detail-button"
                    onClick={() => handleCardClick(bestMatch.card.id)}
                  >
                    프로필 상세보기
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

export default SearchPage
