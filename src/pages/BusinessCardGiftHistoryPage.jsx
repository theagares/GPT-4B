import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { giftAPI, cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './BusinessCardGiftHistoryPage.css'

// BusinessCardGiftHistoryPage 전용 이미지 URL (완전히 독립적)
const businessCardGiftImage1 = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const businessCardGiftImage2 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const businessCardGiftImage3 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const businessCardGiftImage4 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const businessCardGiftImage5 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"

function BusinessCardGiftHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [card, setCard] = useState(null)
  
  // location.state에서 card 정보 가져오기 (우선순위 1)
  // URL 쿼리 파라미터에서 cardId 가져오기 (우선순위 2)
  const stateCard = location.state?.card
  const cardIdFromUrl = searchParams.get('cardId')

  // card 정보 로드 (state에서 가져오거나 URL 파라미터로부터 API 호출)
  useEffect(() => {
    const loadCard = async () => {
      // state에서 card 정보가 있으면 사용
      if (stateCard) {
        setCard(stateCard)
        return
      }

      // URL 파라미터에서 cardId가 있으면 API로 가져오기
      if (cardIdFromUrl) {
        try {
          const response = await cardAPI.getById(cardIdFromUrl)
          if (response.data && response.data.success) {
            setCard(response.data.data)
          } else {
            setError('명함을 찾을 수 없습니다.')
            setLoading(false)
          }
        } catch (err) {
          console.error('[BusinessCardGiftHistoryPage] Failed to fetch card:', err)
          setError('명함 정보를 불러오는데 실패했습니다.')
          setLoading(false)
        }
      } else {
        // card 정보가 없으면 에러 표시
        setError('명함 정보가 없습니다.')
        setLoading(false)
      }
    }

    loadCard()
  }, [stateCard, cardIdFromUrl])

  // 모든 선물에서 연도 추출 함수
  const getGiftYear = (gift) => {
    if (gift.year) return String(gift.year)
    if (gift.purchaseDate || gift.createdAt) {
      const date = new Date(gift.purchaseDate || gift.createdAt)
      return String(date.getFullYear())
    }
    return String(new Date().getFullYear())
  }

  // 사용 가능한 모든 연도 추출
  const availableYears = [...new Set(gifts.map(g => getGiftYear(g)))].sort((a, b) => b.localeCompare(a))

  // 초기 선택 연도: 현재 연도
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // gifts가 로드되면 가장 최근 연도로 자동 선택
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [gifts.length])

  // DB에서 해당 명함의 선물 이력 가져오기 (더미 데이터 없이 DB 데이터만 사용)
  useEffect(() => {
    const fetchGifts = async () => {
      if (!isAuthenticated()) {
        setGifts([])
        setLoading(false)
        setError('로그인이 필요합니다.')
        return
      }

      if (!card || !card.id) {
        // card가 아직 로드 중이면 기다림
        if (cardIdFromUrl || stateCard) {
          return
        }
        setGifts([])
        setLoading(false)
        setError('명함 정보가 없습니다.')
        return
      }

      setLoading(true)
      setError(null)
      setGifts([]) // 로딩 시작 시 빈 배열로 초기화 (더미 데이터 방지)

      try {
        // card.id를 숫자로 변환 (DB의 cardId는 INT 타입)
        let cardId = card.id
        if (typeof cardId === 'string') {
          cardId = parseInt(cardId, 10)
          if (isNaN(cardId)) {
            throw new Error('Invalid card ID format')
          }
        }

        console.log('[BusinessCardGiftHistoryPage] Fetching gifts for cardId:', cardId)
        const response = await giftAPI.getAll({ cardId: String(cardId) })
        console.log('[BusinessCardGiftHistoryPage] API Response:', response.data)

        if (response.data && response.data.success) {
          const giftsData = Array.isArray(response.data.data) ? response.data.data : []
          console.log('[BusinessCardGiftHistoryPage] Fetched gifts from DB:', giftsData)
          console.log('[BusinessCardGiftHistoryPage] Gifts count:', giftsData.length)

          // DB에서 가져온 데이터만 설정 (더미 데이터 없음)
          setGifts(giftsData)

          if (giftsData.length === 0) {
            console.log('[BusinessCardGiftHistoryPage] No gifts found in DB for cardId:', cardId)
          }
        } else {
          const errorMsg = response.data?.message || '선물 이력을 불러오는데 실패했습니다.'
          console.error('[BusinessCardGiftHistoryPage] API returned error:', errorMsg)
          setError(errorMsg)
          setGifts([])
        }
      } catch (err) {
        console.error('[BusinessCardGiftHistoryPage] Failed to fetch gifts:', err)
        console.error('[BusinessCardGiftHistoryPage] Error details:', err.response?.data)
        const errorMsg = err.response?.data?.message || err.message || '선물 이력을 불러오는 중 오류가 발생했습니다.'
        setError(errorMsg)
        setGifts([])
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [card, cardIdFromUrl, stateCard])

  // 날짜를 YYYY.MM.DD 형식으로 변환 (시간대 문제 해결)
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    try {
      let date = new Date(dateString)
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return ''
      }
      
      // 서버에서 UTC 시간으로 보내는 경우를 대비해 한국 시간(UTC+9)으로 변환
      // MySQL DATETIME은 시간대 정보가 없으므로 UTC로 가정하고 변환
      // 시간대 정보가 없는 경우 (예: "2024-01-15 10:30:00")
      if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
        // UTC로 파싱된 시간을 한국 시간으로 변환 (9시간 추가)
        const utcTime = date.getTime()
        const koreaOffset = 9 * 60 * 60 * 1000 // 9시간을 밀리초로
        date = new Date(utcTime + koreaOffset)
      }
      // 시간대 정보가 있는 경우 (예: "2024-01-15T10:30:00Z" 또는 "2024-01-15T10:30:00+09:00")
      // new Date()가 자동으로 로컬 시간으로 변환하므로 그대로 사용
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return ''
    }
  }

  // 가격을 원화 형식으로 변환
  const formatPrice = (price) => {
    if (!price) return '0원'
    return `${Number(price).toLocaleString('ko-KR')}원`
  }

  // 이미지 선택 (giftImage가 있으면 사용, 없으면 기본 이미지 순환)
  const getGiftImage = (index, giftImage) => {
    if (giftImage) return giftImage
    const images = [businessCardGiftImage1, businessCardGiftImage2, businessCardGiftImage3, businessCardGiftImage4, businessCardGiftImage5]
    return images[index % images.length]
  }

  // 연도별로 필터링
  const giftHistoryByYear = gifts.filter(gift => {
    const giftYear = getGiftYear(gift)
    return giftYear === String(selectedYear)
  })

  // 연도별 개수 계산 (동적으로)
  const yearCounts = availableYears.reduce((acc, year) => {
    acc[year] = gifts.filter(g => getGiftYear(g) === year).length
    return acc
  }, {})

  // UI 형식으로 변환
  const giftHistory = giftHistoryByYear.map((gift, index) => ({
    id: gift.id,
    image: getGiftImage(index, gift.giftImage),
    recipient: card?.name || gift.cardName || '',
    recipientPosition: card?.position || '',
    giftName: gift.giftName || '',
    category: gift.category || '',
    status: '전달 완료',
    date: formatDate(gift.purchaseDate || gift.createdAt),
    price: formatPrice(gift.price)
  }))

  const handleBack = () => {
    // 명함 상세 모달을 열기 위해 명함집 페이지로 이동하면서 openCardId 전달
    if (card && card.id) {
      navigate('/business-cards', { 
        state: { 
          openCardId: card.id 
        } 
      })
    } else {
      navigate(-1) // card 정보가 없으면 이전 페이지로 돌아가기
    }
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
  }

  return (
    <div className="business-card-gift-history-page">
      <div className="business-card-gift-history-container">
        {/* 헤더 */}
        <div className="business-card-gift-history-header">
          <button className="business-card-back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="business-card-gift-history-title">선물 이력</h1>
        </div>

        {/* 연도별 탭 */}
        <div className="business-card-tab-list">
          {availableYears.map((year) => (
            <button
              key={year}
              className={`business-card-tab-button ${selectedYear === year ? 'active' : ''}`}
              onClick={() => handleYearChange(year)}
            >
              {year}년 ({yearCounts[year] || 0})
            </button>
          ))}
          {availableYears.length === 0 && (
            <>
              <button className="business-card-tab-button">2025년 (0)</button>
              <button className="business-card-tab-button">2024년 (0)</button>
            </>
          )}
        </div>

        {/* 선물 이력 리스트 */}
        {loading ? (
          <div className="business-card-loading">로딩 중...</div>
        ) : error ? (
          <div className="business-card-error">{error}</div>
        ) : (
          <div className="business-card-gift-list">
            {giftHistory.length > 0 ? (
              giftHistory.map((gift) => (
                <div key={gift.id} className="business-card-gift-card">
                  <div className="business-card-gift-card-content">
                    <div className="business-card-gift-image-wrapper">
                      <img src={gift.image} alt={gift.giftName} className="business-card-gift-image" />
                    </div>
                    <div className="business-card-gift-info">
                      <div className="business-card-gift-header">
                        <p className="business-card-gift-recipient">{gift.recipient} {gift.recipientPosition}</p>
                        <p className="business-card-gift-name">{gift.giftName}</p>
                      </div>
                      <div className="business-card-gift-badges">
                        <span className="business-card-category-badge">{gift.category}</span>
                        <span className="business-card-status-badge">{gift.status}</span>
                      </div>
                      <div className="business-card-gift-footer">
                        <div className="business-card-gift-date">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="business-card-date-icon">
                            <path d="M12.6667 2.66667H12V2C12 1.63181 11.7015 1.33333 11.3333 1.33333C10.9651 1.33333 10.6667 1.63181 10.6667 2V2.66667H5.33333V2C5.33333 1.63181 5.03486 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2V2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM12.6667 12.6667H3.33333V6.66667H12.6667V12.6667Z" fill="#6a7282"/>
                          </svg>
                          <span>{gift.date}</span>
                        </div>
                        <span className="business-card-gift-price">{gift.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="business-card-empty-gift-history">
                <p>선물 이력이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

export default BusinessCardGiftHistoryPage

