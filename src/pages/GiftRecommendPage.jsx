import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { giftAPI } from '../utils/api'
import './GiftRecommendPage.css'

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

function GiftRecommendPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const card = location.state?.card
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  
  // 메모를 배열로 변환 (실제로는 별도 store나 API에서 가져와야 함)
  const initialMemos = card?.memo 
    ? (Array.isArray(card.memo) ? card.memo : [card.memo])
    : []
  
  const [memos, setMemos] = useState(initialMemos)

  // 2초 후 로딩 화면 숨기기
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    // 명함 상세 모달로 돌아가기
    if (card?.id) {
      navigate('/business-cards', { 
        state: { 
          openCardId: card.id 
        } 
      })
    } else {
      navigate(-1)
    }
  }

  const handleDeleteMemo = (index) => {
    setMemos(memos.filter((_, i) => i !== index))
  }

  // 가격 범위 값 정규화 (1 미만은 1로, 20 이상은 20으로)
  const normalizePrice = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ''
    if (numValue < 1) return 1
    if (numValue > 20) return 20
    return Math.round(numValue)
  }

  const handleMinPriceChange = (e) => {
    const value = e.target.value
    // 숫자만 입력 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMinPrice(value)
    }
  }

  const handleMaxPriceChange = (e) => {
    const value = e.target.value
    // 숫자만 입력 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMaxPrice(value)
    }
  }

  const handleMinPriceBlur = () => {
    if (minPrice !== '') {
      const normalized = normalizePrice(minPrice)
      setMinPrice(normalized.toString())
    }
  }

  const handleMaxPriceBlur = () => {
    if (maxPrice !== '') {
      const normalized = normalizePrice(maxPrice)
      setMaxPrice(normalized.toString())
    }
  }

  const handleGetRecommendation = async () => {
    setIsProcessing(true)
    
    try {
      // API 명세서에 맞게 요청 데이터 구성
      const requestData = {
        cardId: card?.id,
        additionalInfo: additionalInfo || undefined,
        gender: card?.gender || undefined,
        memos: memos.length > 0 ? memos : undefined,
        minPrice: minPrice ? normalizePrice(minPrice) : undefined,
        maxPrice: maxPrice ? normalizePrice(maxPrice) : undefined,
        includeNaver: true
      }

      console.log('Gift Recommend Request:', requestData)
      
      const response = await giftAPI.recommend(requestData)
      
      console.log('Gift Recommend Response:', response.data)

      if (response.data && response.data.success) {
        // API 응답 데이터와 함께 결과 페이지로 이동
        navigate('/gift-recommend/result', { 
          state: { 
            card,
            additionalInfo,
            memos,
            // API 응답 데이터
            recommendedGifts: response.data.data?.recommendedGifts || [],
            rationaleCards: response.data.data?.rationaleCards || [],
            personaString: response.data.data?.personaString || ''
          } 
        })
      } else {
        throw new Error(response.data?.message || '선물 추천에 실패했습니다.')
      }
    } catch (error) {
      console.error('Gift recommendation error:', error)
      const errorMessage = error.response?.data?.message || error.message || '선물 추천에 실패했습니다.'
      alert(errorMessage)
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="gift-recommend-loading">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-text">정보를 불러오고 있어요</p>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="gift-recommend-loading">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-text">LLM이 생각중입니다</p>
      </div>
    )
  }

  return (
    <div className="gift-recommend-page">
      <div className="gift-recommend-container">
        {/* Header */}
        <div className="gift-recommend-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Contact Info */}
        <div 
          className="contact-info-section"
          style={{
            background: card?.design && cardDesigns[card.design] 
              ? cardDesigns[card.design] 
              : cardDesigns['design-1']
          }}
        >
          <div className="contact-name-row">
            <h1 className="contact-name">{card?.name || '이름 없음'}</h1>
          </div>
          <div className="contact-details">
            <div className="contact-detail-row">
              <span className="detail-label">소속</span>
              <span className="detail-value">{card?.company || '-'}</span>
            </div>
            <div className="contact-detail-row">
              <span className="detail-label">직급</span>
              <span className="detail-value">{card?.position || '-'}</span>
            </div>
          </div>
        </div>

        {/* Memos Section */}
        {memos.length > 0 && (
          <div className="memos-section">
            <h2 className="section-title">남겼던 메모</h2>
            <div className="memos-list">
              {memos.map((memo, index) => (
                <div key={index} className="memo-item">
                  <p className="memo-text">{memo}</p>
                  <button 
                    className="delete-memo-button"
                    onClick={() => handleDeleteMemo(index)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4L12 12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="additional-info-section">
          <h2 className="section-title">추가 정보 입력</h2>
          <textarea
            className="additional-info-textarea"
            placeholder="취향, 취미, 무슨날 등등.. 선물추천에 도움이 되는 힌트를 입력할수있어요"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>

        {/* Price Range Section */}
        <div className="price-range-section">
          <h2 className="section-title">선물 가격 범위</h2>
          <div className="price-range-container">
            <div className="price-input-group">
              <label className="price-label">최소 가격</label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  className="price-input"
                  placeholder="1"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  onBlur={handleMinPriceBlur}
                  min="1"
                  max="20"
                />
                <span className="price-unit">만원</span>
              </div>
            </div>
            <div className="price-separator">~</div>
            <div className="price-input-group">
              <label className="price-label">최대 가격</label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  className="price-input"
                  placeholder="20"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  onBlur={handleMaxPriceBlur}
                  min="1"
                  max="20"
                />
                <span className="price-unit">만원</span>
              </div>
            </div>
          </div>
          <p className="price-range-hint">가격 범위는 1만원 ~ 20만원 사이입니다</p>
        </div>

        {/* Get Recommendation Button */}
        <div className="recommend-button-container">
          <button 
            className="get-recommendation-button"
            onClick={handleGetRecommendation}
          >
            선물 추천 받기
          </button>
        </div>
      </div>
    </div>
  )
}

export default GiftRecommendPage

