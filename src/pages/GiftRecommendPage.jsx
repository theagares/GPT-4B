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

// 비즈니스 팁 목록
const businessTips = [
  '명함을 주고받을 때는 두 손으로 받고, 받은 명함을 즉시 명함집에 보관하세요.',
  '비즈니스 미팅 전 상대방의 회사와 직책을 미리 파악하면 더 효과적인 대화가 가능합니다.',
  '명함 뒷면에 만난 날짜, 장소, 특징을 메모해두면 나중에 상대방을 기억하는데 도움이 됩니다.',
  '명함을 받은 후 24시간 이내에 인사 메시지를 보내면 좋은 인상을 남길 수 있습니다.',
  '명함의 정보를 정기적으로 업데이트하여 최신 정보를 유지하세요.',
  '네트워킹 이벤트에서는 명함을 많이 교환하기보다 깊이 있는 대화를 나누는 것이 중요합니다.',
  '명함을 보관할 때는 GPT-4b를 사용하면 더욱 쉽게 찾을 수 있어요.',
  '디지털 명함과 종이 명함을 함께 활용하면 더 효과적인 네트워킹이 가능합니다.',
  '명함을 교환할 때는 상대방의 이름을 큰 소리로 불러보며 확인하세요.',
  '비즈니스 관계를 유지하기 위해 명함 정보를 바탕으로 정기적으로 연락을 취하세요.'
]

function GiftRecommendPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const card = location.state?.card
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentTip, setCurrentTip] = useState('')
  
  // 메모를 배열로 변환 (실제로는 별도 store나 API에서 가져와야 함)
  const initialMemos = card?.memo 
    ? (Array.isArray(card.memo) ? card.memo : [card.memo])
    : []
  
  const [memos, setMemos] = useState(initialMemos)
  
  // 랜덤 팁 선택 함수
  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * businessTips.length)
    return businessTips[randomIndex]
  }

  // 2초 후 로딩 화면 숨기기
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])
  
  // 처리 중일 때 랜덤 팁 표시
  useEffect(() => {
    if (isProcessing) {
      // 처음 팁 선택
      setCurrentTip(getRandomTip())
      
      // 3초마다 팁 변경
      const tipInterval = setInterval(() => {
        setCurrentTip(getRandomTip())
      }, 3000)
      
      return () => clearInterval(tipInterval)
    }
  }, [isProcessing])

  const handleBack = () => {
    // AI 추천 명함 선택 페이지에서 온 경우
    if (location.state?.from === 'ai-card-select') {
      navigate('/ai-card-select')
      return
    }
    
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

  // 최소 가격 값 정규화 (1 미만은 1로)
  const normalizeMinPrice = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ''
    if (numValue < 1) return 1
    return Math.round(numValue)
  }

  // 최대 가격 값 정규화 (제한 없음, 숫자만 반올림)
  const normalizeMaxPrice = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ''
    return Math.round(numValue)
  }

  const handleMinPriceChange = (e) => {
    const value = e.target.value
    // 숫자만 입력 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMinPrice(value)
      // 실시간으로 1 이하 값이 입력되면 1로 자동 변경
      if (value !== '' && parseFloat(value) < 1) {
        setMinPrice('1')
      }
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
    // 최소값이 비어있거나 1 이하이면 1로 설정 (필수 입력)
    if (minPrice === '' || parseFloat(minPrice) < 1 || isNaN(parseFloat(minPrice))) {
      setMinPrice('1')
    } else {
      const normalized = normalizeMinPrice(minPrice)
      setMinPrice(normalized.toString())
    }
  }

  const handleMaxPriceBlur = () => {
    if (maxPrice !== '') {
      const normalized = normalizeMaxPrice(maxPrice)
      setMaxPrice(normalized.toString())
    }
  }

  const handleGetRecommendation = async () => {
    // 최소 가격 입력 검증
    if (minPrice === '' || isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 1) {
      alert('최소 가격을 입력해주세요.(1 이상)')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // 최소값이 비어있거나 1 이하이면 1로 설정 (필수 입력)
      const finalMinPrice = normalizeMinPrice(minPrice)
      
      // API 명세서에 맞게 요청 데이터 구성
      const requestData = {
        cardId: card?.id,
        additionalInfo: additionalInfo || undefined,
        gender: card?.gender || undefined,
        memos: memos.length > 0 ? memos : undefined,
        minPrice: finalMinPrice,
        maxPrice: maxPrice ? normalizeMaxPrice(maxPrice) : undefined,
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
        <p className="loading-text">GPT-4b가 생각중입니다</p>
        {currentTip && (
          <div className="business-tip-container">
            <p className="business-tip-label">💡 비즈니스 팁</p>
            <p className="business-tip-text">{currentTip}</p>
          </div>
        )}
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
          <h1 className="page-title">선물 추천 설정</h1>
          <div style={{ width: '40px' }}></div>
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
            placeholder="상대방의 취미, 취향 등 추천에 도움이 될 만한 힌트"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>

        {/* Price Range Section */}
        <div className="price-range-section">
          <h2 className="section-title">
            선물 가격 범위
            <span className="section-subtitle">1만원 이상의 선물을 추천해드립니다</span>
          </h2>
          <div className="price-range-container">
            <label className="price-label-inline">최소 <span style={{ color: '#ef4444' }}>*</span></label>
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
                required
                />
                <span className="price-unit">만원</span>
            </div>
            <span className="price-separator">~</span>
            <label className="price-label-inline">최대</label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  className="price-input"
                  placeholder=""
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  onBlur={handleMaxPriceBlur}
                  min="1"
                />
                <span className="price-unit">만원</span>
              </div>
            </div>
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

