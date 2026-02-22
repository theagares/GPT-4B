import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { giftAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './CardGiftHistoryPage.css'

// CardGiftHistoryPage 전용 이미지 URL (다른 컴포넌트와 완전히 독립적)
const cardGiftImage1 = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const cardGiftImage2 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const cardGiftImage3 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const cardGiftImage4 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const cardGiftImage5 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"

// 뒤로가기 아이콘 SVG 컴포넌트 (main 디자인)
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CardGiftHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // location.state에서 card 정보 가져오기
  const card = location.state?.card

  // 모든 선물에서 연도 추출 함수
  const getGiftYear = (gift) => {
    if (gift.year) return String(gift.year)
    if (gift.purchaseDate || gift.createdAt) {
      const date = new Date(gift.purchaseDate || gift.createdAt)
      return String(date.getFullYear())
    }
    return String(new Date().getFullYear())
  }

  // 사용 가능한 모든 연도 추출 (peter - API 기반 동적 연도)
  const availableYears = [...new Set(gifts.map(g => getGiftYear(g)))].sort((a, b) => b.localeCompare(a))

  // 초기 선택 연도: 현재 연도
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // gifts가 로드되면 가장 최근 연도로 자동 선택
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [gifts.length]) // gifts.length를 의존성으로 사용하여 gifts가 로드될 때만 실행

  // DB에서 해당 프로필의 선물 이력 가져오기 (peter - API 연동)
  useEffect(() => {
    const fetchGifts = async () => {
      if (!isAuthenticated()) {
        setGifts([])
        setLoading(false)
        setError('로그인이 필요합니다.')
        return
      }

      if (!card || !card.id) {
        setGifts([])
        setLoading(false)
        setError('프로필 정보가 없습니다.')
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

        console.log('[CardGiftHistoryPage] Fetching gifts for cardId:', cardId)
        const response = await giftAPI.getAll({ cardId: String(cardId) })
        console.log('[CardGiftHistoryPage] API Response:', response.data)

        if (response.data && response.data.success) {
          const giftsData = Array.isArray(response.data.data) ? response.data.data : []
          console.log('[CardGiftHistoryPage] Fetched gifts from DB:', giftsData)
          console.log('[CardGiftHistoryPage] Gifts count:', giftsData.length)

          // DB에서 가져온 데이터만 설정 (더미 데이터 없음)
          setGifts(giftsData)

          if (giftsData.length === 0) {
            console.log('[CardGiftHistoryPage] No gifts found in DB for cardId:', cardId)
          }
        } else {
          const errorMsg = response.data?.message || '선물 이력을 불러오는데 실패했습니다.'
          console.error('[CardGiftHistoryPage] API returned error:', errorMsg)
          setError(errorMsg)
          setGifts([])
        }
      } catch (err) {
        console.error('[CardGiftHistoryPage] Failed to fetch gifts:', err)
        console.error('[CardGiftHistoryPage] Error details:', err.response?.data)
        const errorMsg = err.response?.data?.message || err.message || '선물 이력을 불러오는 중 오류가 발생했습니다.'
        setError(errorMsg)
        setGifts([])
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [card])

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
    const images = [cardGiftImage1, cardGiftImage2, cardGiftImage3, cardGiftImage4, cardGiftImage5]
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

  const handleBack = () => {
    navigate(-1)
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
  }

  // UI 형식으로 변환
  const giftHistory = giftHistoryByYear.map((gift, index) => ({
    id: gift.id,
    image: getGiftImage(index, gift.giftImage),
    recipient: gift.cardName || card?.name || '이름 없음',
    recipientPosition: gift.cardCompany || card?.company || '',
    giftName: gift.giftName || '선물',
    category: gift.category || '기타',
    status: '전달 완료',
    date: formatDate(gift.purchaseDate || gift.createdAt),
    price: formatPrice(gift.price)
  }))

  return (
    <div className="card-gift-history-page">
      <div className="card-gift-history-container">
        {/* 헤더 */}
        <div className="card-gift-history-header">
          <button className="card-back-button" onClick={handleBack}>
            <BackIcon />
          </button>
          <h1 className="card-gift-history-title">선물 이력</h1>
        </div>

        {/* 탭 리스트 (peter - 동적 연도 탭) */}
        <div className="card-tab-list">
          {availableYears.length > 0 ? (
            availableYears.map(year => (
              <button 
                key={year}
                className={`card-tab-button ${selectedYear === year ? 'active' : ''}`}
                onClick={() => handleYearChange(year)}
              >
                {year}년 ({yearCounts[year] || 0})
              </button>
            ))
          ) : (
            <button className="card-tab-button active">
              {new Date().getFullYear()}년 (0)
            </button>
          )}
        </div>

        {/* 선물 이력 리스트 */}
        {loading ? (
          <div className="card-loading">로딩 중...</div>
        ) : error ? (
          <div className="card-error">{error}</div>
        ) : giftHistory.length > 0 ? (
          <div className="gift-list">
            {giftHistory.map((gift) => (
              <div key={gift.id} className="gift-card">
                <div className="gift-card-content">
                  <div className="gift-image-wrapper">
                    <img src={gift.image} alt={gift.giftName} className="card-gift-image" />
                  </div>
                  <div className="gift-info">
                    <div className="gift-header">
                      <p className="gift-recipient">{gift.recipient} {gift.recipientPosition}</p>
                      <p className="card-gift-name">{gift.giftName}</p>
                    </div>
                    <div className="card-gift-tags">
                      <span className="category-badge">{gift.category}</span>
                      <span className="status-badge">{gift.status}</span>
                    </div>
                    <div className="card-gift-footer">
                      <div className="card-gift-date">
                        <span>{gift.date}</span>
                      </div>
                      <span className="card-gift-price">{gift.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-empty">등록된 선물 이력이 없습니다.</div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

export default CardGiftHistoryPage
