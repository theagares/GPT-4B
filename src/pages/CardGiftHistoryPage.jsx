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

  // 사용 가능한 모든 연도 추출
  const availableYears = [...new Set(gifts.map(g => getGiftYear(g)))].sort((a, b) => b.localeCompare(a))

  // 초기 선택 연도: 현재 연도
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // gifts가 로드되면 가장 최근 연도로 자동 선택
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [gifts.length]) // gifts.length를 의존성으로 사용하여 gifts가 로드될 때만 실행

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

  // 날짜를 YYYY.MM.DD 형식으로 변환
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="card-gift-history-title">선물 이력</h1>
        </div>

        {/* 탭 리스트 */}
        <div className="tab-list">
          <button 
            className={`tab-button ${selectedYear === '2025' ? 'active' : ''}`}
            onClick={() => setSelectedYear('2025')}
          >
            2025년 ({count2025})
          </button>
          <button 
            className={`tab-button ${selectedYear === '2024' ? 'active' : ''}`}
            onClick={() => setSelectedYear('2024')}
          >
            2024년 ({count2024})
          </button>
        </div>

        {/* 선물 이력 리스트 */}
        {loading ? (
          <div className="card-loading">로딩 중...</div>
        ) : error ? (
          <div className="card-error">{error}</div>
        ) : giftHistory.length > 0 ? (
          <div className="card-gift-list">
            {giftHistory.map((gift) => (
              <div key={gift.id} className="card-gift-card">
                <div className="card-gift-image-wrapper">
                  <img src={gift.image} alt={gift.giftName} className="card-gift-image" />
                </div>
                <div className="card-gift-info">
                  <div className="card-gift-recipient">
                    {gift.recipient} {gift.recipientPosition}
                  </div>
                  <div className="gift-info">
                    <div className="gift-header">
                      <p className="gift-recipient">{gift.name} {gift.position}</p>
                      <p className="gift-name">{gift.giftName}</p>
                    </div>
                    <div className="gift-badges">
                      <span className="category-badge">{gift.category}</span>
                      <span className="status-badge">{gift.status}</span>
                    </div>
                    <div className="gift-footer">
                      <div className="gift-date">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="date-icon">
                          <path d="M12.6667 2.66667H12V2C12 1.63181 11.7015 1.33333 11.3333 1.33333C10.9651 1.33333 10.6667 1.63181 10.6667 2V2.66667H5.33333V2C5.33333 1.63181 5.03486 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2V2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM12.6667 12.6667H3.33333V6.66667H12.6667V12.6667Z" fill="#6a7282"/>
                        </svg>
                        <span>{gift.date}</span>
                      </div>
                      <span className="gift-price">{gift.price}</span>
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
