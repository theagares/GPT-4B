import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { giftAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './GiftHistoryPage.css'

// GiftHistoryPage 전용 이미지 URL (LandingPage와 독립적)
const giftHistoryImage1 = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const giftHistoryImage2 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const giftHistoryImage3 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const giftHistoryImage4 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const giftHistoryImage5 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"
const imgVector4 = "https://www.figma.com/api/mcp/asset/9f59a389-f83e-4f13-b23f-43517aa98dce"

function GiftHistoryPage() {
  const navigate = useNavigate()
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 모든 선물에서 연도 추출 함수
  const getGiftYear = (gift) => {
    if (gift.year) return String(gift.year)
    if (gift.purchaseDate || gift.createdAt) {
      const date = new Date(gift.purchaseDate || gift.createdAt)
      return String(date.getFullYear())
    }
    return String(new Date().getFullYear())
  }
  
  // 초기 선택 연도
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  
  // 사용 가능한 모든 연도 추출
  const availableYears = [...new Set(gifts.map(g => getGiftYear(g)))].sort((a, b) => b.localeCompare(a))
  
  // gifts가 로드되면 가장 최근 연도로 자동 선택
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [gifts.length]) // gifts.length를 의존성으로 사용하여 gifts가 로드될 때만 실행

  const handleBack = () => {
    navigate('/my/detail')
  }

  // DB에서 선물 이력 가져오기 (더미 데이터 없이 DB 데이터만 사용)
  useEffect(() => {
    const fetchGifts = async () => {
      if (!isAuthenticated()) {
        setGifts([]) // 인증되지 않으면 빈 배열
        setLoading(false)
        setError('로그인이 필요합니다.')
        return
      }

      setLoading(true)
      setError(null)
      setGifts([]) // 로딩 시작 시 빈 배열로 초기화 (더미 데이터 방지)

      try {
        console.log('[GiftHistoryPage] Fetching gifts from DB...')
        const response = await giftAPI.getAll()
        console.log('[GiftHistoryPage] API Response:', response.data)
        
        if (response.data && response.data.success) {
          const giftsData = Array.isArray(response.data.data) ? response.data.data : []
          console.log('[GiftHistoryPage] Fetched gifts from DB:', giftsData)
          console.log('[GiftHistoryPage] Gifts count:', giftsData.length)
          
          // DB에서 가져온 데이터만 설정 (더미 데이터 없음)
          setGifts(giftsData)
          
          if (giftsData.length === 0) {
            console.log('[GiftHistoryPage] No gifts found in DB for current user')
          }
        } else {
          const errorMsg = response.data?.message || '선물 이력을 불러오는데 실패했습니다.'
          console.error('[GiftHistoryPage] API returned error:', errorMsg)
          setError(errorMsg)
          setGifts([]) // 에러 시 빈 배열
        }
      } catch (err) {
        console.error('[GiftHistoryPage] Failed to fetch gifts:', err)
        console.error('[GiftHistoryPage] Error details:', err.response?.data)
        const errorMsg = err.response?.data?.message || err.message || '선물 이력을 불러오는 중 오류가 발생했습니다.'
        setError(errorMsg)
        setGifts([]) // 에러 시 빈 배열
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [])

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
    const images = [giftHistoryImage1, giftHistoryImage2, giftHistoryImage3, giftHistoryImage4, giftHistoryImage5]
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
  
  console.log('Selected year:', selectedYear) // 디버깅용
  console.log('Total gifts:', gifts.length) // 디버깅용
  console.log('Available years:', availableYears) // 디버깅용
  console.log('Gifts by year:', giftHistoryByYear.length) // 디버깅용
  console.log('Year counts:', yearCounts) // 디버깅용

  const totalGifts = gifts.length

  return (
    <div className="gift-history-page">
      <div className="gift-history-container">
        {/* 헤더 */}
        <div className="gift-history-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="gift-history-title">선물 히스토리</h1>
        </div>

        {/* 수신자 정보 섹션 */}
        <div className="recipient-section">
          <div className="recipient-avatar">
            <span className="recipient-initial">선</span>
          </div>
          <div className="recipient-info">
            <p className="recipient-title">선물 히스토리</p>
            <p className="recipient-count">총 {totalGifts}개의 선물</p>
          </div>
        </div>

        {/* 탭 리스트 */}
        {availableYears.length > 0 && (
          <div className="tab-list">
            {availableYears.map((year) => (
              <button
                key={year}
                className={`tab-button ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}년 ({yearCounts[year] || 0})
              </button>
            ))}
          </div>
        )}

        {/* 선물 이력 리스트 */}
        <div className="gift-list">
          {loading ? (
            <div className="loading-message">로딩 중...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : giftHistoryByYear.length > 0 ? (
            giftHistoryByYear.map((gift, index) => (
            <div key={gift.id} className="gift-card">
              <div className="gift-image-wrapper">
                <img src={getGiftImage(index, gift.giftImage)} alt={gift.giftName || '선물'} className="gift-image" />
              </div>
              <div className="gift-info">
                <div className="gift-header-info">
                  <h3 className="gift-name">{gift.giftName || '선물'}</h3>
                  <button className="status-badge">선물 완료</button>
                </div>
                <p className="gift-price">{formatPrice(gift.price)}</p>
                <div className="gift-date">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="date-icon">
                    <path d="M12.6667 2.66667H12V2C12 1.63181 11.7015 1.33333 11.3333 1.33333C10.9651 1.33333 10.6667 1.63181 10.6667 2V2.66667H5.33333V2C5.33333 1.63181 5.03486 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2V2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM12.6667 12.6667H3.33333V6.66667H12.6667V12.6667Z" fill="#6a7282"/>
                  </svg>
                  <span className="date-value">{formatDate(gift.purchaseDate || gift.createdAt)}</span>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="empty-message">등록된 선물 이력이 없습니다.</div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default GiftHistoryPage
