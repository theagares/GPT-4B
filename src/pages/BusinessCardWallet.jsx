import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import './BusinessCardWallet.css'

const imgIcon = "https://www.figma.com/api/mcp/asset/d56d758a-c7b8-42c8-bd08-19709b82a5d6"

function BusinessCardWallet() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [flippingCardId, setFlippingCardId] = useState(null)
  const cards = useCardStore((state) => state.cards)

  // 검색 필터링
  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase()
    return (
      card.company?.toLowerCase().includes(query) ||
      card.position?.toLowerCase().includes(query) ||
      card.name?.toLowerCase().includes(query)
    )
  })

  const currentCard = filteredCards[currentIndex] || filteredCards[0]

  const handlePrev = () => {
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1))
    }
  }

  const handleNext = () => {
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1))
    }
  }

  const handleConfirmCard = () => {
    if (currentCard) {
      handleCardClick(currentCard.id)
    }
  }

  const handleCardClick = (cardId) => {
    setFlippingCardId(cardId)
    setIsFlipping(true)
    
    // 뒤집기 애니메이션 후 모달 표시
    setTimeout(() => {
      setShowDetailModal(true)
      setIsFlipping(false)
    }, 600) // 애니메이션 시간과 맞춤
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setFlippingCardId(null)
  }

  const handleEditInfo = () => {
    if (currentCard) {
      // Navigate to add page with card as draft for editing
      navigate('/add', { state: { draft: currentCard } })
    }
  }

  return (
    <div className="business-card-wallet">
      <div className="wallet-container">
        {/* Header Section */}
        <div className="wallet-header">
          <div className="header-content">
            <div className="header-instruction">
              <p>명함을 찾아서</p>
              <p>내용을 수정할 수 있어요.</p>
            </div>
            <div className="header-actions">
              <button 
                className="header-action-btn"
                onClick={() => navigate('/add')}
              >
                <span className="action-icon">📝</span>
                <span className="action-label">수동 명함 등록</span>
              </button>
              <button 
                className="header-action-btn"
                onClick={() => navigate('/ocr')}
              >
                <span className="action-icon">📷</span>
                <span className="action-label">OCR로 명함 추가</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <img src={imgIcon} alt="search" className="search-icon" />
            <input
              type="text"
              placeholder="회사명, 직책 등을 검색하세요"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentIndex(0)
              }}
              className="search-input"
            />
          </div>
        </div>

        {/* Business Card Carousel */}
        {filteredCards.length > 0 ? (
          <div className="card-carousel-section">
            <div className="carousel-container">
              <button 
                className="carousel-nav-btn carousel-nav-prev"
                onClick={handlePrev}
                aria-label="Previous card"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="carousel-wrapper">
                <div className="carousel-track">
                  {filteredCards.map((card, index) => {
                    const offset = index - currentIndex
                    const isActive = index === currentIndex
                    const isVisible = Math.abs(offset) <= 1
                    
                    if (!isVisible) return null
                    
                    return (
                      <div 
                        key={card.id} 
                        className={`carousel-card ${isActive ? 'active' : ''} ${flippingCardId === card.id && isFlipping ? 'flipping' : ''}`}
                        style={{
                          transform: `translateX(${offset * 85}%) scale(${isActive ? 1 : 0.7})`,
                          opacity: isActive ? 1 : 0.3,
                          filter: isActive ? 'blur(0)' : 'blur(3px)',
                          zIndex: isActive ? 10 : 5 - Math.abs(offset)
                        }}
                        onClick={() => isActive && handleCardClick(card.id)}
                      >
                        <div className="business-card-display">
                          <div className="card-display-content">
                            {card.company && <p className="card-company">{card.company}</p>}
                            <div className="card-info-section">
                              <div>
                                <h3 className="card-name">{card.name}</h3>
                                {card.position && <p className="card-position">{card.position}</p>}
                              </div>
                              <div className="card-contact">
                                {card.phone && <p className="card-phone">{card.phone}</p>}
                                {card.email && <p className="card-email">{card.email}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button 
                className="carousel-nav-btn carousel-nav-next"
                onClick={handleNext}
                aria-label="Next card"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="card-actions">
              <button 
                className="action-btn action-btn-primary"
                onClick={handleConfirmCard}
              >
                명함 확인하기
              </button>
              <button 
                className="action-btn action-btn-secondary"
                onClick={handleEditInfo}
              >
                정보 수정
              </button>
            </div>

            {/* View All Button */}
            <div className="view-all-section">
              <button 
                className="view-all-btn"
                onClick={() => {
                  // Show all cards in a grid view - could navigate to a different view or toggle display
                  // For now, just scroll to show more context
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                전체 펼쳐보기
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-message">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Footer Message */}
        <div className="wallet-footer">
          <div className="usage-indicator">
            <span className="usage-count">{cards.length}/200</span>
          </div>
          <p className="footer-text">더 많은 명함을 저장해 관리하세요</p>
          <a href="#" className="upgrade-link">gpt-4b+ 살펴보기</a>
        </div>
      </div>

      <BottomNavigation />

      {/* Card Detail Modal */}
      {showDetailModal && currentCard && (
        <CardDetailModal 
          card={currentCard} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

// Card Detail Modal Component
function CardDetailModal({ card, onClose }) {
  const [memo, setMemo] = useState(card.memo || '')
  const navigate = useNavigate()
  const updateCard = useCardStore((state) => state.updateCard)

  const handleSaveMemo = () => {
    updateCard(card.id, { memo })
  }

  const handleCustomize = () => {
    navigate('/add', { state: { draft: card } })
  }

  return (
    <div className="card-detail-modal-overlay" onClick={onClose}>
      <div className="card-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-back-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="modal-header">
          <h2 className="modal-title">알고 있는 정보를 더 알려주세요!</h2>
        </div>

        <div className="modal-card-display">
          <div className="modal-business-card">
            <div className="modal-card-content">
              {card.company && <p className="modal-card-company">{card.company}</p>}
              <div className="modal-card-info-section">
                <div>
                  <h3 className="modal-card-name">{card.name}</h3>
                  {card.position && <p className="modal-card-position">{card.position}</p>}
                </div>
                <div className="modal-card-contact">
                  {card.phone && <p className="modal-card-phone">{card.phone}</p>}
                  {card.email && <p className="modal-card-email">{card.email}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-memo-section">
          <h3 className="memo-title">메모</h3>
          <textarea
            className="memo-textarea"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={handleSaveMemo}
            placeholder="12월 7일이 생일이라 하심"
          />
        </div>

        <div className="modal-footer">
          <p className="footer-message">곧 {card.name}님의 명함이 완성됩니다!</p>
          <button className="customize-button" onClick={handleCustomize}>
            명함 커스텀 하러 가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default BusinessCardWallet

