import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './BusinessCardGiftHistoryPage.css'

// BusinessCardGiftHistoryPage 전용 이미지 URL (완전히 독립적)
const businessCardGiftImage1 = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"

// BusinessCardGiftHistoryPage 전용 데이터 페칭 함수 (완전히 독립적)
// 대시보드, PersonalGiftHistoryPage와 절대 공유하지 않음
// BusinessCardWallet에서도 사용할 수 있도록 export
export const fetchBusinessCardGiftHistory = async (cardId, cardName, year) => {
  // 실제로는 API 호출이지만, 여기서는 독립적인 모의 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      // 박상무 명함에 대한 선물 이력 데이터만 반환 (card-park-sangmu)
      if (cardId === 'card-park-sangmu' || cardName === '박상무') {
        if (year === '2025') {
          resolve([
            {
              id: 'bcgh-1',
              image: businessCardGiftImage1,
              recipient: cardName || '박상무',
              recipientPosition: '상무',
              giftName: '프리미엄 와인 세트',
              category: '주류',
              status: '전달 완료',
              date: '2025.10.15',
              price: '150,000원'
            }
          ])
        } else {
          resolve([
            {
              id: 'bcgh-6',
              image: businessCardGiftImage1,
              recipient: cardName || '박상무',
              recipientPosition: '상무',
              giftName: '고급 와인 세트',
              category: '주류',
              status: '전달 완료',
              date: '2024.12.20',
              price: '180,000원'
            }
          ])
        }
      } else {
        // 다른 명함에 대해서는 빈 배열 반환
        resolve([])
      }
    }, 100)
  })
}

function BusinessCardGiftHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedYear, setSelectedYear] = useState('2025')
  const [giftHistory, setGiftHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [yearCounts, setYearCounts] = useState({ '2025': 0, '2024': 0 })
  
  // location.state에서 card 정보 가져오기
  const card = location.state?.card

  // 초기 로드 시 두 연도 데이터를 모두 가져와서 개수 계산
  useEffect(() => {
    if (!card) return
    
    const loadAllYearCounts = async () => {
      try {
        const [data2025, data2024] = await Promise.all([
          fetchBusinessCardGiftHistory(card.id, card.name, '2025'),
          fetchBusinessCardGiftHistory(card.id, card.name, '2024')
        ])
        setYearCounts({
          '2025': data2025.length,
          '2024': data2024.length
        })
      } catch (error) {
        console.error('Failed to load year counts:', error)
      }
    }
    loadAllYearCounts()
  }, [card])

  // 선택된 연도 데이터 로드
  useEffect(() => {
    if (!card) return
    
    const loadGiftHistory = async () => {
      setLoading(true)
      try {
        const data = await fetchBusinessCardGiftHistory(card.id, card.name, selectedYear)
        setGiftHistory(data)
      } catch (error) {
        console.error('Failed to load gift history:', error)
        setGiftHistory([])
      } finally {
        setLoading(false)
      }
    }
    loadGiftHistory()
  }, [selectedYear, card])

  const handleBack = () => {
    navigate(-1) // 이전 페이지로 돌아가기
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
          <button 
            className={`business-card-tab-button ${selectedYear === '2025' ? 'active' : ''}`}
            onClick={() => handleYearChange('2025')}
          >
            2025년 ({yearCounts['2025']})
          </button>
          <button 
            className={`business-card-tab-button ${selectedYear === '2024' ? 'active' : ''}`}
            onClick={() => handleYearChange('2024')}
          >
            2024년 ({yearCounts['2024']})
          </button>
        </div>

        {/* 선물 이력 리스트 */}
        {loading ? (
          <div className="business-card-loading">로딩 중...</div>
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

