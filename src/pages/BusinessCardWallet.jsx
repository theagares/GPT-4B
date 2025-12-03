import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { fetchBusinessCardGiftHistory } from './BusinessCardGiftHistoryPage'
import './BusinessCardWallet.css'

// 돋보기 아이콘 SVG 컴포넌트
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 19L14.65 14.65" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 연필 아이콘 SVG 컴포넌트 (수동 명함 등록)
function PenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 카메라 아이콘 SVG 컴포넌트 (OCR로 명함 추가)
function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 전체 선물 이력 데이터 (실제로는 store나 API에서 가져와야 함)
const allGiftHistory = [
  {
    id: 1,
    cardId: 'card-park-sangmu',
    cardName: '박상무',
    giftName: '프리미엄 와인 세트',
    year: '2025'
  },
  {
    id: 2,
    cardId: 'card-1',
    cardName: '안연주',
    giftName: '명품 선물 세트',
    year: '2025'
  },
  {
    id: 3,
    cardId: 'card-2',
    cardName: '이부장',
    giftName: '꽃다발 선물',
    year: '2025'
  },
  {
    id: 4,
    cardId: 'card-3',
    cardName: '최대리',
    giftName: '초콜릿 선물 세트',
    year: '2025'
  },
  {
    id: 5,
    cardId: 'card-1',
    cardName: '안연주',
    giftName: '선물 배송 상자',
    year: '2024'
  },
  {
    id: 6,
    cardId: 'card-2',
    cardName: '이부장',
    giftName: '고급 와인 세트',
    year: '2024'
  }
]

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

// 페이지 배경색 맵 (명함 색상에 맞춘 연한 배경)
const pageBackgroundDesigns = {
  'design-1': 'linear-gradient(180deg, rgba(200, 195, 245, 1) 0%, rgba(168, 162, 242, 1) 50%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(180deg, rgba(191, 219, 254, 1) 0%, rgba(147, 197, 253, 1) 50%, rgba(59, 130, 246, 1) 100%)',
  'design-3': 'linear-gradient(180deg, rgba(167, 243, 208, 1) 0%, rgba(110, 231, 183, 1) 50%, rgba(16, 185, 129, 1) 100%)',
  'design-4': 'linear-gradient(180deg, rgba(252, 231, 243, 1) 0%, rgba(251, 182, 206, 1) 50%, rgba(236, 72, 153, 1) 100%)',
  'design-5': 'linear-gradient(180deg, rgba(255, 237, 213, 1) 0%, rgba(254, 215, 170, 1) 50%, rgba(249, 115, 22, 1) 100%)',
  'design-6': 'linear-gradient(180deg, rgba(221, 214, 254, 1) 0%, rgba(196, 181, 253, 1) 50%, rgba(99, 102, 241, 1) 100%)',
}

function BusinessCardWallet() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [flippingCardId, setFlippingCardId] = useState(null)
  const [isGridView, setIsGridView] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480)
  const cards = useCardStore((state) => state.cards)
  
  // 모바일 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // location.state에서 openCardId 또는 selectCardId를 확인하고 처리
  useEffect(() => {
    const openCardId = location.state?.openCardId
    const selectCardId = location.state?.selectCardId
    
    if (filteredCards.length > 0) {
      // openCardId가 있으면 모달 열기
      if (openCardId) {
        const cardIndex = filteredCards.findIndex(card => card.id === openCardId)
        if (cardIndex !== -1) {
          setCurrentIndex(cardIndex)
          // 부드러운 모달 열기 애니메이션
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setShowDetailModal(true)
            })
          })
          // state 초기화 (뒤로가기 시 다시 열리지 않도록)
          navigate(location.pathname, { replace: true, state: {} })
        }
      }
      // selectCardId가 있으면 해당 명함으로 인덱스만 변경
      else if (selectCardId) {
        const cardIndex = filteredCards.findIndex(card => card.id === selectCardId)
        if (cardIndex !== -1) {
          setCurrentIndex(cardIndex)
          // state 초기화
          navigate(location.pathname, { replace: true, state: {} })
        }
      }
    }
  }, [location.state, filteredCards, navigate, location.pathname])

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
    // 모달 닫기 애니메이션을 위해 약간의 지연
    const modalElement = document.querySelector('.card-detail-modal')
    if (modalElement) {
      modalElement.style.animation = 'slideDownModal 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      const overlayElement = document.querySelector('.card-detail-modal-overlay')
      if (overlayElement) {
        overlayElement.style.animation = 'fadeOutOverlay 0.3s ease-out forwards'
      }
      setTimeout(() => {
        setShowDetailModal(false)
        setFlippingCardId(null)
      }, 300)
    } else {
      setShowDetailModal(false)
      setFlippingCardId(null)
    }
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
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <div className="search-icon">
              <SearchIcon />
            </div>
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

        {/* Action Buttons and View Toggle */}
        <div className="action-buttons-section">
          <div className="header-actions">
            <button 
              className="header-action-btn"
              onClick={() => navigate('/manual-add')}
            >
              <span className="action-icon">
                <PenIcon />
              </span>
              <span className="action-label">수동 명함 등록</span>
            </button>
            <button 
              className="header-action-btn"
              onClick={() => navigate('/ocr')}
            >
              <span className="action-icon">
                <CameraIcon />
              </span>
              <span className="action-label">OCR로 명함 추가</span>
            </button>
          </div>
          {filteredCards.length > 0 && (
            <div className="view-all-section">
              <button 
                className="view-all-btn"
                onClick={() => setIsGridView(!isGridView)}
              >
                {isGridView ? '슬라이드로 보기' : '전체 펼쳐보기'}
              </button>
            </div>
          )}
        </div>

        {/* Business Card Display */}
        {filteredCards.length > 0 ? (
          <div className="card-carousel-section">
            {!isGridView ? (
              <>
                <div className="carousel-container">
                  <button 
                    className="carousel-nav-btn carousel-nav-prev"
                    onClick={handlePrev}
                    aria-label="Previous card"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                              transform: `translateX(${offset * 85}%) scale(${isActive ? (isMobile ? 0.85 : 1) : 0.7})`,
                              opacity: isActive ? 1 : 0.3,
                              filter: isActive ? 'blur(0)' : 'blur(3px)',
                              zIndex: isActive ? 10 : 5 - Math.abs(offset)
                            }}
                            onClick={() => isActive && handleCardClick(card.id)}
                          >
                            <div 
                              className="business-card-display"
                              style={{
                                background: card.design && cardDesigns[card.design] 
                                  ? cardDesigns[card.design] 
                                  : cardDesigns['design-1']
                              }}
                            >
                              <div className="card-display-content">
                                <div className="card-top-section">
                                  {card.company && <p className="card-company">{card.company}</p>}
                                  <div className="card-contact">
                                    {card.phone && <p className="card-phone">{card.phone}</p>}
                                    {card.email && <p className="card-email">{card.email}</p>}
                                  </div>
                                </div>
                                <div className="card-info-section">
                                  <div>
                                    <h3 className="card-name">{card.name}</h3>
                                    {card.position && <p className="card-position">{card.position}</p>}
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
                      <path d="M9 18L15 12L9 6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              </>
            ) : (
              <div className="cards-grid">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="grid-card-item"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div 
                      className="grid-business-card"
                      style={{
                        background: card.design && cardDesigns[card.design] 
                          ? cardDesigns[card.design] 
                          : cardDesigns['design-1']
                      }}
                    >
                      <div className="grid-card-content">
                        {card.company && <p className="grid-card-company">{card.company}</p>}
                        <div className="grid-card-info">
                          <div>
                            <h3 className="grid-card-name">{card.name}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <p className="footer-text">더 많은 명함을 관리할 수 있어요</p>
          <a 
            href="#" 
            className="upgrade-link"
            onClick={(e) => {
              e.preventDefault()
              navigate('/upgrade')
            }}
          >
            gpt-4b+ 살펴보기
          </a>
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
  const deleteCard = useCardStore((state) => state.deleteCard)

  // 현재 명함의 선물 이력 개수 계산 (BusinessCardGiftHistoryPage 데이터와 연동)
  const [giftHistoryCount, setGiftHistoryCount] = useState(0)
  
  useEffect(() => {
    if (!card) {
      setGiftHistoryCount(0)
      return
    }
    
    const loadGiftHistoryCount = async () => {
      try {
        // 두 연도의 데이터를 모두 가져와서 총 개수 계산
        const [data2025, data2024] = await Promise.all([
          fetchBusinessCardGiftHistory(card.id, card.name, '2025'),
          fetchBusinessCardGiftHistory(card.id, card.name, '2024')
        ])
        setGiftHistoryCount(data2025.length + data2024.length)
      } catch (error) {
        console.error('Failed to load gift history count:', error)
        setGiftHistoryCount(0)
      }
    }
    
    loadGiftHistoryCount()
  }, [card])

  const handleSaveMemo = () => {
    updateCard(card.id, { memo })
  }

  const handleCustomize = () => {
    navigate('/customize', { state: { card } })
  }

  const handleDelete = () => {
    if (window.confirm(`${card.name}님의 명함을 삭제하시겠습니까?`)) {
      deleteCard(card.id)
      onClose()
    }
  }

  const handleCall = () => {
    if (card.phone) {
      window.location.href = `tel:${card.phone.replace(/-/g, '')}`
    }
  }

  const handleEmail = () => {
    if (card.email) {
      window.location.href = `mailto:${card.email}`
    }
  }

  const handleGiftRecommend = () => {
    // 선물 추천 받기 페이지로 이동
    navigate('/gift-recommend', { state: { card } })
  }

  const handleGiftHistory = () => {
    // 해당 명함의 선물 히스토리 페이지로 이동 (새로운 독립적인 페이지)
    navigate('/business-card/gift-history', { state: { card } })
  }

  // 모달 배경색 (명함 디자인에 맞춤)
  const modalBackground = card?.design 
    ? pageBackgroundDesigns[card.design] || pageBackgroundDesigns['design-1']
    : pageBackgroundDesigns['design-1']

  // 프로필 카드 배경색 (명함 디자인에 맞춤)
  const profileCardBackground = card?.design 
    ? cardDesigns[card.design] || cardDesigns['design-1']
    : cardDesigns['design-1']

  return (
    <div className="card-detail-modal-overlay" onClick={onClose}>
      <div 
        className="card-detail-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: modalBackground
        }}
      >
        {/* Top Navigation */}
        <div className="modal-top-nav">
          <button className="modal-back-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="modal-top-right">
            <button className="modal-share-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#1f2937"/>
              </svg>
            </button>
            <div className="modal-top-actions">
              <button className="modal-customize-button" onClick={handleCustomize}>
                명함 커스텀하기
              </button>
            </div>
          </div>
        </div>

        {/* Main Card Info */}
        <div 
          className="modal-main-card"
          style={{
            background: profileCardBackground
          }}
        >
          {/* 우측 상단 연락처 정보 */}
          <div className="modal-profile-contact">
            {card.phone && <p className="modal-profile-phone">{card.phone}</p>}
            {card.email && <p className="modal-profile-email">{card.email}</p>}
          </div>

          <div className="modal-profile-section">
            <div className="modal-profile-left">
              <div className="modal-profile-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
                  <path d="M20 12C21.6569 12 23 13.3431 23 15C23 16.6569 21.6569 18 20 18C18.3431 18 17 16.6569 17 15C17 13.3431 18.3431 12 20 12Z" fill="#9CA3AF"/>
                  <path d="M14 26C14 23.2386 16.2386 21 19 21H21C23.7614 21 26 23.2386 26 26V28H14V26Z" fill="#9CA3AF"/>
                </svg>
              </div>
              <div className="modal-profile-info">
                <h2 className="modal-profile-name">
                  {card.name}
                </h2>
              </div>
            </div>
            <div className="modal-profile-details">
              {card.company && <p className="modal-profile-company">{card.company}</p>}
              {card.position && <p className="modal-profile-position">{card.position}</p>}
            </div>
          </div>
        </div>

        {/* Gift Action Buttons */}
        <div className="modal-gift-actions">
          <button className="modal-gift-card-button modal-gift-recommend-button" onClick={handleGiftRecommend}>
            <div className="gift-card-content-wrapper">
              <div className="gift-card-info">
                <div className="gift-card-label-row">
                  <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="gift-card-logo" />
                  <div className="gift-card-label-wrapper">
                    <span className="gift-card-label">선물 추천</span>
                    <span className="gift-card-label">받으러가기</span>
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-card-arrow">
                <path d="M9 18L15 12L9 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
          
          <button className="modal-gift-card-button" onClick={handleGiftHistory}>
            <div className="gift-card-content-wrapper">
              <div className="gift-card-info">
                <div className="gift-card-label-row">
                  <svg className="gift-card-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2L3 5V11C3 11.5523 3.44772 12 4 12H12C12.5523 12 13 11.5523 13 11V5L8 2Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 5L8 8L13 5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="gift-card-label">선물 이력</span>
                </div>
                <p className="gift-card-value gift-card-value-left">{giftHistoryCount}회</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-card-arrow">
                <path d="M9 18L15 12L9 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Business Card Information Section */}
        <div className="modal-info-section">
          <h3 className="modal-info-title">명함 정보</h3>
          <div className="modal-info-card">
            {/* Phone Number */}
            {card.phone && (
              <>
                <div className="modal-info-row">
                  <span className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.6667 11.28V13.28C14.6667 13.68 14.3467 14 13.9467 14C6.26667 14 0 7.73333 0 0.0533333C0 -0.346667 0.32 -0.666667 0.72 -0.666667H2.72C3.12 -0.666667 3.44 -0.346667 3.44 0.0533333C3.44 0.72 3.52 1.36 3.65333 1.97333C3.76 2.26667 3.73333 2.61333 3.52 2.85333L2.42667 3.94667C3.22667 5.70667 4.29333 6.77333 6.05333 7.57333L7.14667 6.48C7.38667 6.26667 7.73333 6.24 8.02667 6.34667C8.64 6.48 9.28 6.56 9.94667 6.56C10.3467 6.56 10.6667 6.88 10.6667 7.28V9.28C10.6667 9.68 10.3467 10 9.94667 10H14.6667Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div className="info-content">
                    <span className="info-label">전화번호</span>
                    <span className="info-value">{card.phone}</span>
                  </div>
                  <button className="info-action-button" onClick={handleCall}>전화</button>
                </div>
                <div className="info-divider"></div>
              </>
            )}

            {/* Email */}
            {card.email && (
              <>
                <div className="modal-info-row">
                  <span className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.66667 2.66667H13.3333C14.0667 2.66667 14.6667 3.26667 14.6667 4V12C14.6667 12.7333 14.0667 13.3333 13.3333 13.3333H2.66667C1.93333 13.3333 1.33333 12.7333 1.33333 12V4C1.33333 3.26667 1.93333 2.66667 2.66667 2.66667Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.6667 4L8 8.66667L1.33333 4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div className="info-content">
                    <span className="info-label">이메일</span>
                    <span className="info-value">{card.email}</span>
                  </div>
                  <button className="info-action-button" onClick={handleEmail}>메일</button>
                </div>
                <div className="info-divider"></div>
              </>
            )}

            {/* Position/Department */}
            <div className="modal-info-row">
              <span className="info-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H13C13.5523 3 14 3.44772 14 4V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4C2 3.44772 2.44772 3 3 3Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 6H11" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 9H9" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="info-content">
                <span className="info-label">소속 / 직급</span>
                <span className="info-value">
                  {card.position && card.company ? `${card.company} / ${card.position}` : card.position || card.company || '-'}
                </span>
              </div>
            </div>
            <div className="info-divider"></div>

            {/* Memo */}
            <div className="modal-info-row">
              <span className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H9H8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="info-content info-content-memo">
                <span className="info-label">메모</span>
                <textarea
                  className="modal-memo-input"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  onBlur={handleSaveMemo}
                  placeholder="메모를 입력하세요"
                />
              </div>
            </div>
          </div>
          
          {/* Delete Button */}
          <div className="modal-delete-section">
            <button className="modal-delete-text-button" onClick={handleDelete}>
              명함 삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessCardWallet

