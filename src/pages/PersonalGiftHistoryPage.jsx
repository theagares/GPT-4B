import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './PersonalGiftHistoryPage.css'

// PersonalGiftHistoryPage 전용 이미지 URL (다른 컴포넌트와 완전히 독립적)
const personalGiftImage1 = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const personalGiftImage2 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const personalGiftImage3 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const personalGiftImage4 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const personalGiftImage5 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"

// PersonalGiftHistoryPage 전용 데이터 페칭 함수 (독립적)
const fetchPersonalGiftHistory = async (year) => {
  // 실제로는 API 호출이지만, 여기서는 독립적인 모의 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      if (year === '2025') {
        resolve([
          {
            id: 'pgh-1',
            image: personalGiftImage1,
            recipient: '박상무',
            recipientPosition: '상무',
            giftName: '프리미엄 와인 세트',
            category: '주류',
            status: '전달 완료',
            date: '2025.10.15',
            price: '150,000원'
          },
          {
            id: 'pgh-2',
            image: personalGiftImage2,
            recipient: '이부장',
            recipientPosition: '부장',
            giftName: '명품 선물 세트',
            category: '고급 선물',
            status: '전달 완료',
            date: '2025.09.20',
            price: '300,000원'
          },
          {
            id: 'pgh-3',
            image: personalGiftImage3,
            recipient: '최대리',
            recipientPosition: '대리',
            giftName: '꽃다발 선물',
            category: '꽃',
            status: '전달 완료',
            date: '2025.08.05',
            price: '50,000원'
          },
          {
            id: 'pgh-4',
            image: personalGiftImage4,
            recipient: '김과장',
            recipientPosition: '과장',
            giftName: '초콜릿 선물 세트',
            category: '식품',
            status: '전달 완료',
            date: '2025.07.12',
            price: '80,000원'
          },
          {
            id: 'pgh-5',
            image: personalGiftImage5,
            recipient: '정이사',
            recipientPosition: '이사',
            giftName: '선물 배송 상자',
            category: '기타',
            status: '전달 완료',
            date: '2025.06.28',
            price: '200,000원'
          }
        ])
      } else {
        resolve([
          {
            id: 'pgh-6',
            image: personalGiftImage1,
            recipient: '박상무',
            recipientPosition: '상무',
            giftName: '고급 와인 세트',
            category: '주류',
            status: '전달 완료',
            date: '2024.12.20',
            price: '180,000원'
          },
          {
            id: 'pgh-7',
            image: personalGiftImage2,
            recipient: '이부장',
            recipientPosition: '부장',
            giftName: '프리미엄 선물 박스',
            category: '고급 선물',
            status: '전달 완료',
            date: '2024.11.15',
            price: '250,000원'
          }
        ])
      }
    }, 100)
  })
}

function PersonalGiftHistoryPage() {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState('2025')
  const [giftHistory, setGiftHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [yearCounts, setYearCounts] = useState({ '2025': 0, '2024': 0 })

  // 초기 로드 시 두 연도 데이터를 모두 가져와서 개수 계산
  useEffect(() => {
    const loadAllYearCounts = async () => {
      try {
        const [data2025, data2024] = await Promise.all([
          fetchPersonalGiftHistory('2025'),
          fetchPersonalGiftHistory('2024')
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
  }, [])

  // 선택된 연도 데이터 로드
  useEffect(() => {
    const loadGiftHistory = async () => {
      setLoading(true)
      try {
        const data = await fetchPersonalGiftHistory(selectedYear)
        setGiftHistory(data)
      } catch (error) {
        console.error('Failed to load gift history:', error)
        setGiftHistory([])
      } finally {
        setLoading(false)
      }
    }
    loadGiftHistory()
  }, [selectedYear])

  const handleBack = () => {
    navigate('/my/detail')
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
  }

  return (
    <div className="personal-gift-history-page">
      <div className="personal-gift-history-container">
        {/* 헤더 */}
        <div className="personal-gift-history-header">
          <button className="personal-back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="personal-gift-history-title">선물 이력</h1>
        </div>

        {/* 연도별 탭 */}
        <div className="personal-tab-list">
          <button 
            className={`personal-tab-button ${selectedYear === '2025' ? 'active' : ''}`}
            onClick={() => handleYearChange('2025')}
          >
            2025년 ({yearCounts['2025']})
          </button>
          <button 
            className={`personal-tab-button ${selectedYear === '2024' ? 'active' : ''}`}
            onClick={() => handleYearChange('2024')}
          >
            2024년 ({yearCounts['2024']})
          </button>
        </div>

        {/* 선물 이력 리스트 */}
        {loading ? (
          <div className="personal-loading">로딩 중...</div>
        ) : (
          <div className="personal-gift-list">
            {giftHistory.length > 0 ? (
              giftHistory.map((gift) => (
                <div key={gift.id} className="personal-gift-card">
                  <div className="personal-gift-card-content">
                    <div className="personal-gift-image-wrapper">
                      <img src={gift.image} alt={gift.giftName} className="personal-gift-image" />
                    </div>
                    <div className="personal-gift-info">
                      <div className="personal-gift-header">
                        <p className="personal-gift-recipient">{gift.recipient} {gift.recipientPosition}</p>
                        <p className="personal-gift-name">{gift.giftName}</p>
                      </div>
                      <div className="personal-gift-badges">
                        <span className="personal-category-badge">{gift.category}</span>
                        <span className="personal-status-badge">{gift.status}</span>
                      </div>
                      <div className="personal-gift-footer">
                        <div className="personal-gift-date">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="personal-date-icon">
                            <path d="M12.6667 2.66667H12V2C12 1.63181 11.7015 1.33333 11.3333 1.33333C10.9651 1.33333 10.6667 1.63181 10.6667 2V2.66667H5.33333V2C5.33333 1.63181 5.03486 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2V2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM12.6667 12.6667H3.33333V6.66667H12.6667V12.6667Z" fill="#6a7282"/>
                          </svg>
                          <span>{gift.date}</span>
                        </div>
                        <span className="personal-gift-price">{gift.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="personal-empty-gift-history">
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

export default PersonalGiftHistoryPage

