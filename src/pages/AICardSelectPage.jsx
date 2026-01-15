import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCardStore } from '../store/cardStore'
import { isAuthenticated } from '../utils/auth'
import './AICardSelectPage.css'

// 검색 아이콘 SVG 컴포넌트
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 19L14.65 14.65" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 하트 아이콘 SVG 컴포넌트
function HeartIcon({ filled = false }) {
  if (filled) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 토스트용 빨간색 하트 아이콘 SVG 컴포넌트
function ToastHeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

function AICardSelectPage() {
  const navigate = useNavigate()
  const { cards, fetchCards, isLoading } = useCardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // 명함 정렬 함수 (하트 우선 → 가나다순)
  const sortCards = (cards) => {
    const isKorean = (char) => {
      if (!char) return false
      const code = char.charCodeAt(0)
      return code >= 0xAC00 && code <= 0xD7A3 // 한글 유니코드 범위
    }

    const isEnglish = (char) => {
      if (!char) return false
      const code = char.charCodeAt(0)
      return (code >= 0x0041 && code <= 0x005A) || // A-Z
             (code >= 0x0061 && code <= 0x007A)    // a-z
    }

    const getLanguageType = (name) => {
      if (!name || name.length === 0) return 'other'
      const firstChar = name.charAt(0)
      if (isKorean(firstChar)) return 'korean'
      if (isEnglish(firstChar)) return 'english'
      return 'other'
    }

    return [...cards].sort((a, b) => {
      // 하트 우선 정렬
      const favoriteA = a.isFavorite ? 1 : 0
      const favoriteB = b.isFavorite ? 1 : 0
      if (favoriteA !== favoriteB) {
        return favoriteB - favoriteA // 하트가 있는 것이 앞에
      }

      // 같은 하트 상태일 때만 가나다순 정렬
      const nameA = a.name || ''
      const nameB = b.name || ''
      
      if (!nameA && !nameB) return 0
      if (!nameA) return 1
      if (!nameB) return -1

      const langA = getLanguageType(nameA)
      const langB = getLanguageType(nameB)

      // 한글과 영어 구분: 한글이 먼저, 그 다음 영어, 마지막 기타
      if (langA === 'korean' && langB !== 'korean') return -1
      if (langA !== 'korean' && langB === 'korean') return 1

      if (langA === 'english' && langB !== 'english' && langB !== 'korean') return -1
      if (langA !== 'english' && langA !== 'korean' && langB === 'english') return 1

      // 둘 다 한글일 때
      if (langA === 'korean' && langB === 'korean') {
        return nameA.localeCompare(nameB, 'ko')
      }
      
      // 둘 다 영어일 때 (대소문자 무시)
      if (langA === 'english' && langB === 'english') {
        return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' })
      }

      // 기타 경우 (숫자, 특수문자 등)
      return nameA.localeCompare(nameB, 'ko')
    })
  }

  // 검색어로 명함 필터링 및 정렬
  const filteredCards = useMemo(() => {
    let filtered = cards

    // 검색어가 있으면 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = cards.filter((card) => {
        const name = (card.name || '').toLowerCase()
        const company = (card.company || '').toLowerCase()
        const position = (card.position || '').toLowerCase()
        return name.includes(query) || company.includes(query) || position.includes(query)
      })
    }

    // 정렬 적용
    return sortCards(filtered)
  }, [cards, searchQuery])

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleCardSelect = (card) => {
    navigate('/gift-recommend', { state: { card, from: 'ai-card-select' } })
  }

  const handleHistoryClick = () => {
    navigate('/chat-history')
  }

  const handleNavigateToCards = () => {
    navigate('/business-cards')
  }

  const handleHeartClick = (e) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    
    // 이미 토스트가 표시 중이면 무시
    if (showToast) return
    
    // 토스트 메시지 표시
    setShowToast(true)
    setIsFading(false)
    
    // 2초 후 fade-away 시작
    setTimeout(() => {
      setIsFading(true)
      // fade-away 애니메이션 후 완전히 제거
      setTimeout(() => {
        setShowToast(false)
        setIsFading(false)
      }, 500) // fade-away 시간
    }, 2000) // 2초간 표시
  }

  return (
    <div className="ai-card-select-page">
      <div className="ai-card-select-container">
        {/* Header */}
        <div className="ai-card-select-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="ai-card-select-header-content">
            <h1 className="ai-card-select-header-title">선물 추천</h1>
            <p className="ai-card-select-header-subtitle">명함을 눌러 선물 추천 대상을 선택할 수 있어요</p>
          </div>
          {/* Search Bar and History Button Container */}
          <div className="search-history-container">
          <div className="ai-card-select-search-bar">
            <div className="ai-card-select-search-icon-wrapper">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="ai-card-select-search-input"
              placeholder="명함 검색 (이름, 회사, 직급)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
            <button className="history-button" onClick={handleHistoryClick}>
              추천 내역
            </button>
          </div>
        </div>

        {/* Card List */}
        <div className="card-list-container">
          {isLoading ? (
            <div className="loading-state">
              <p>명함을 불러오는 중...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="empty-state">
              <p>등록된 명함이 없습니다.</p>
            </div>
          ) : (
            <>
              {filteredCards.length === 0 ? (
                <div className="empty-state">
                  <p>검색 결과가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="cards-grid">
                    {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="card-item"
                    onClick={() => handleCardSelect(card)}
                  >
                    <button
                      className="ai-card-heart-button"
                      onClick={(e) => handleHeartClick(e, card)}
                      aria-label={card.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <HeartIcon filled={card.isFavorite} />
                    </button>
                    <div className="card-item-content">
                      <div className="card-item-company">
                        {card.company || '소속 정보 없음'}
                      </div>
                      <div className="card-item-position">
                        {card.position || '직급 정보 없음'}
                      </div>
                      <div className="card-item-name">
                        {card.name || '이름 없음'}
                      </div>
                    </div>
                  </div>
                    ))}
                  </div>
                  {!searchQuery && (
                    <p className="card-add-guide">
                      명함 추가는{' '}
                      <button 
                        className="card-add-link-button"
                        onClick={handleNavigateToCards}
                      >
                        여기
                      </button>
                      에서 도와드릴게요
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Toast Message */}
      {showToast && (
        <div className={`ai-card-toast ${isFading ? 'fade-away' : ''}`}>
          <p>
            <span className="toast-quote">"</span>
            <span className="toast-heart">
              <ToastHeartIcon />
            </span>
            <span className="toast-quote">"</span>
            <span> 설정은 명함집 탭에서 가능합니다</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default AICardSelectPage

