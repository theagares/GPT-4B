import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './CardGiftHistoryPage.css'

// 이미지 URL
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const imgImageWithFallback4 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"
const imgIcon = "https://www.figma.com/api/mcp/asset/4559e990-44f1-4e81-b6c5-efd365a6f9d0"
const imgIcon1 = "https://www.figma.com/api/mcp/asset/fe12d10e-419c-476a-b374-b338c1dbe6ac"
const imgIcon2 = "https://www.figma.com/api/mcp/asset/8f3100aa-3650-47a0-a821-c71242a680d5"
const imgIcon3 = "https://www.figma.com/api/mcp/asset/1080043a-0fab-4492-95f0-0f0e5044b808"
const imgIcon4 = "https://www.figma.com/api/mcp/asset/988283d6-6878-4cbf-8f8a-db34ab956392"
const imgIcon5 = "https://www.figma.com/api/mcp/asset/a5dde2e3-0ba0-4ff7-aea7-b8a954df0490"
const imgIcon6 = "https://www.figma.com/api/mcp/asset/0636429d-fceb-48c6-8f3f-ef670746ab4a"
const imgIcon7 = "https://www.figma.com/api/mcp/asset/2f9bc1d1-6e2d-4be5-809b-b2b414fcd824"
const imgIcon8 = "https://www.figma.com/api/mcp/asset/506a72c8-4ef6-4dc5-9692-6ca8071e44e9"
const imgIcon9 = "https://www.figma.com/api/mcp/asset/9967873f-8e09-4acf-9f4b-eabdb6d4bbd3"
const imgVector4 = "https://www.figma.com/api/mcp/asset/9f59a389-f83e-4f13-b23f-43517aa98dce"

function CardGiftHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedYear, setSelectedYear] = useState('2025')
  
  // location.state에서 card 정보 가져오기
  const card = location.state?.card
  
  const handleBack = () => {
    navigate(-1) // 이전 페이지로 돌아가기
  }

  // 전체 선물 이력 데이터 (실제로는 store나 API에서 가져와야 함)
  const allGiftHistory = [
    {
      id: 1,
      cardId: 'card-park-sangmu', // 박상무 명함 ID
      cardName: '박상무',
      image: imgImageWithFallback,
      icon: imgIcon,
      name: '박상무',
      position: '상무',
      giftName: '프리미엄 와인 세트',
      category: '주류',
      status: '전달 완료',
      date: '2025.10.15',
      price: '150,000원',
      year: '2025'
    },
    {
      id: 2,
      cardId: 'card-1',
      cardName: '안연주',
      image: imgImageWithFallback1,
      icon: imgIcon,
      name: '안연주',
      position: '대리',
      giftName: '명품 선물 세트',
      category: '고급 선물',
      status: '전달 완료',
      date: '2025.09.20',
      price: '300,000원',
      year: '2025'
    },
    {
      id: 3,
      cardId: 'card-2',
      cardName: '이부장',
      image: imgImageWithFallback2,
      icon: imgIcon2,
      name: '이부장',
      position: '부장',
      giftName: '꽃다발 선물',
      category: '꽃',
      status: '전달 완료',
      date: '2025.08.05',
      price: '50,000원',
      year: '2025'
    },
    {
      id: 4,
      cardId: 'card-3',
      cardName: '최대리',
      image: imgImageWithFallback3,
      icon: imgIcon4,
      name: '최대리',
      position: '대리',
      giftName: '초콜릿 선물 세트',
      category: '식품',
      status: '전달 완료',
      date: '2025.07.12',
      price: '80,000원',
      year: '2025'
    },
    {
      id: 5,
      cardId: 'card-1',
      cardName: '안연주',
      image: imgImageWithFallback4,
      icon: imgIcon,
      name: '안연주',
      position: '대리',
      giftName: '선물 배송 상자',
      category: '기타',
      status: '전달 완료',
      date: '2024.12.20',
      price: '200,000원',
      year: '2024'
    },
    {
      id: 6,
      cardId: 'card-2',
      cardName: '이부장',
      image: imgImageWithFallback,
      icon: imgIcon2,
      name: '이부장',
      position: '부장',
      giftName: '고급 와인 세트',
      category: '주류',
      status: '전달 완료',
      date: '2024.11.15',
      price: '180,000원',
      year: '2024'
    }
  ]

  // 특정 명함의 선물 이력만 필터링
  const cardGiftHistory = card 
    ? allGiftHistory.filter(gift => gift.cardId === card.id || gift.cardName === card.name)
    : []

  // 연도별로 필터링
  const giftHistory = cardGiftHistory.filter(gift => gift.year === selectedYear)

  // 연도별 개수 계산
  const count2025 = cardGiftHistory.filter(g => g.year === '2025').length
  const count2024 = cardGiftHistory.filter(g => g.year === '2024').length

  return (
    <div className="card-gift-history-page">
      <div className="card-gift-history-container">
        {/* 헤더 */}
        <div className="card-gift-history-header">
          <button className="back-button" onClick={handleBack}>
            <div className="back-icon">
              <img src={imgVector4} alt="뒤로" />
            </div>
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
        <div className="gift-list">
          {giftHistory.length > 0 ? (
            giftHistory.map((gift) => (
              <div key={gift.id} className="gift-card">
                <div className="gift-card-content">
                  <div className="gift-image-wrapper">
                    <img src={gift.image} alt={gift.giftName} className="gift-image" />
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
            ))
          ) : (
            <div className="empty-gift-history">
              <p>선물 이력이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default CardGiftHistoryPage


