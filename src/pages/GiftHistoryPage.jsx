import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
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
  const [selectedYear, setSelectedYear] = useState('2025')

  const handleBack = () => {
    navigate('/my/detail')
  }

  // 선물 이력 데이터 (LandingPage와 독립적)
  const giftHistory2025 = [
    {
      id: 1,
      image: giftHistoryImage1,
      name: '박부장',
      position: '부장',
      giftName: '프리미엄 와인 세트',
      status: '선물 완료',
      date: '2025.10.15',
      price: '150,000원'
    },
    {
      id: 2,
      image: giftHistoryImage2,
      name: '이부장',
      position: '부장',
      giftName: '명품 신발 세트',
      status: '선물 완료',
      date: '2025.09.20',
      price: '300,000원'
    },
    {
      id: 3,
      image: giftHistoryImage3,
      name: '최대리',
      position: '대리',
      giftName: '명품 가방',
      status: '선물 완료',
      date: '2025.08.05',
      price: '450,000원'
    },
    {
      id: 4,
      image: giftHistoryImage4,
      name: '김과장',
      position: '과장',
      giftName: '스마트워치',
      status: '선물 완료',
      date: '2025.07.12',
      price: '350,000원'
    },
    {
      id: 5,
      image: giftHistoryImage5,
      name: '정이사',
      position: '이사',
      giftName: '프리미엄 와인 세트',
      status: '선물 완료',
      date: '2025.06.28',
      price: '150,000원'
    }
  ]

  const giftHistory2024 = [
    {
      id: 6,
      image: giftHistoryImage1,
      name: '박상무',
      position: '상무',
      giftName: '고급 와인 세트',
      status: '선물 완료',
      date: '2024.12.20',
      price: '180,000원'
    },
    {
      id: 7,
      image: giftHistoryImage2,
      name: '이부장',
      position: '부장',
      giftName: '프리미엄 선물 박스',
      status: '선물 완료',
      date: '2024.11.15',
      price: '250,000원'
    }
  ]

  const giftHistory = selectedYear === '2025' ? giftHistory2025 : giftHistory2024
  const totalGifts = giftHistory.length

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
            <span className="recipient-initial">박</span>
          </div>
          <div className="recipient-info">
            <p className="recipient-title">박부장님께 보낸 선물</p>
            <p className="recipient-count">총 {totalGifts}개의 선물</p>
          </div>
        </div>

        {/* 탭 리스트 */}
        <div className="tab-list">
          <button 
            className={`tab-button ${selectedYear === '2025' ? 'active' : ''}`}
            onClick={() => setSelectedYear('2025')}
          >
            2025년 (5)
          </button>
          <button 
            className={`tab-button ${selectedYear === '2024' ? 'active' : ''}`}
            onClick={() => setSelectedYear('2024')}
          >
            2024년 (2)
          </button>
        </div>

        {/* 선물 이력 리스트 */}
        <div className="gift-list">
          {giftHistory.map((gift) => (
            <div key={gift.id} className="gift-card">
              <div className="gift-image-wrapper">
                <img src={gift.image} alt={gift.giftName} className="gift-image" />
              </div>
              <div className="gift-info">
                <div className="gift-header-info">
                  <h3 className="gift-name">{gift.giftName}</h3>
                  <button className="status-badge">{gift.status}</button>
                </div>
                <p className="gift-price">{gift.price}</p>
                <div className="gift-date">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="date-icon">
                    <path d="M12.6667 2.66667H12V2C12 1.63181 11.7015 1.33333 11.3333 1.33333C10.9651 1.33333 10.6667 1.63181 10.6667 2V2.66667H5.33333V2C5.33333 1.63181 5.03486 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2V2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM12.6667 12.6667H3.33333V6.66667H12.6667V12.6667Z" fill="#6a7282"/>
                  </svg>
                  <span className="date-value">{gift.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default GiftHistoryPage
