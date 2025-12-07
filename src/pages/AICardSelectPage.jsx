import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCardStore } from '../store/cardStore'
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

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // 검색어로 명함 필터링
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return cards
    }
    const query = searchQuery.toLowerCase().trim()
    return cards.filter((card) => {
      const name = (card.name || '').toLowerCase()
      const company = (card.company || '').toLowerCase()
      const position = (card.position || '').toLowerCase()
      return name.includes(query) || company.includes(query) || position.includes(query)
    })
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
          <div className="header-title-section">
            <h1 className="page-title">선물 추천</h1>
          </div>
          <button className="history-button" onClick={handleHistoryClick}>
            추천 내역
          </button>
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
              <p className="card-selection-guide">명함을 눌러 선물 추천 대상을 선택할 수 있어요</p>
              {/* Search Bar */}
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
    </div>
  )
}

export default AICardSelectPage

