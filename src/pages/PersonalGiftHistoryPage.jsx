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
            {giftHistory.map((gift) => (
              <div key={gift.id} className="personal-gift-card">
                <div className="personal-gift-image-wrapper">
                  <img src={gift.image} alt={gift.giftName} className="personal-gift-image" />
                </div>
                <div className="personal-gift-info">
                  <div className="personal-gift-recipient">
                    {gift.recipient} {gift.recipientPosition}
                  </div>
                  <h3 className="personal-gift-name">{gift.giftName}</h3>
                  <div className="personal-gift-tags">
                    <span className="personal-category-tag">{gift.category}</span>
                    <span className="personal-status-tag">{gift.status}</span>
                  </div>
                  <div className="personal-gift-footer">
                    <span className="personal-gift-date">{gift.date}</span>
                    <span className="personal-gift-price">{gift.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

export default PersonalGiftHistoryPage

