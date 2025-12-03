import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import './LandingPage.css'
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/e61c2b5d-68eb-409e-9b25-a90abd759a96"
const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/2fbadc50-65b5-4cb8-8a55-788f604b6dd8"
const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/a166d192-abaa-4496-bc6a-bd5336537959"
const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/33109928-c22e-44a9-be00-18c92d851a45"

// 인기 선물 데이터 (랭킹 순으로 정렬)
const popularGifts = [
  {
    id: 1,
    rank: 1,
    image: imgImageWithFallback,
    title: "프리미엄 와인 세트",
    category: "주류",
    price: "150,000원",
    popularity: "인기 95%"
  },
  {
    id: 2,
    rank: 2,
    image: imgImageWithFallback1,
    title: "명품 선물 세트",
    category: "고급 선물",
    price: "300,000원",
    popularity: "인기 92%"
  },
  {
    id: 3,
    rank: 3,
    image: imgImageWithFallback2,
    title: "스페셜티 커피 세트",
    category: "식음료",
    price: "80,000원",
    popularity: "인기 88%"
  },
  {
    id: 4,
    rank: 4,
    image: imgImageWithFallback3,
    title: "비즈니스 선물 세트",
    category: "사무용품",
    price: "120,000원",
    popularity: "인기 85%"
  }
].sort((a, b) => a.rank - b.rank) // 랭킹 순으로 정렬
.slice(0, 4) // 최대 4개까지만 표시

function LandingPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const cards = useCardStore((state) => state.cards)

  useEffect(() => {
    const name = localStorage.getItem('userName')
    if (name) {
      setUserName(name)
    }
  }, [])

  // 알림 텍스트에서 이름 추출 함수
  const extractNameFromAlert = (alertText) => {
    // "최하늘 님과..." 또는 "강지민 님의..." 형식에서 이름 추출
    const match = alertText.match(/^([가-힣]+)\s+님/)
    return match ? match[1] : null
  }

  // 알림 데이터 구조화
  const alerts = [
    {
      id: 1,
      icon: '🔔',
      text: '최하늘 님과 연락한 지 90일이 지났습니다. 간단한 선물로 안부를 전해보세요.',
    },
    {
      id: 2,
      icon: '🎁',
      text: '강지민 님의 생일이 5일 남았습니다. 선물을 준비해보세요.',
    },
  ]

  // "보기" 버튼 클릭 핸들러
  const handleViewAlert = (alertText) => {
    const name = extractNameFromAlert(alertText)
    if (name) {
      // 해당 이름의 명함 찾기
      const card = cards.find(c => c.name === name)
      if (card) {
        // 타인명함 상세 페이지로 이동 (모달 열기)
        navigate('/business-cards', { 
          state: { openCardId: card.id } 
        })
      } else {
        // 명함이 없으면 명함 목록으로 이동
        navigate('/business-cards')
      }
    } else {
      // 이름을 추출할 수 없으면 명함 목록으로 이동
      navigate('/business-cards')
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="header-logo" />
          {userName && (
            <span className="welcome-message">{userName}님 환영합니다!</span>
          )}
        </div>

        {/* AI Gift Recommendation Banner */}
        <div className="ai-banner">
          <div className="banner-content">
            <div className="banner-text">
              <p className="banner-subtitle">AI 맞춤형 선물 추천</p>
              <p className="banner-title">상대방의 정보를 기반으로 최적의 선물을 찾아드립니다</p>
            </div>
          </div>
        </div>

        {/* Popular Gifts Section */}
        <div className="popular-gifts-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">인기 선물</h2>
            </div>
          </div>

          <div className="gift-cards-container">
            {popularGifts.map((gift) => (
              <div key={gift.id} className="gift-card">
                <div className="gift-card-image">
                  <img src={gift.image} alt={gift.title} />
                  <div className="rank-badge">#{gift.rank}</div>
                </div>
                <div className="gift-card-content">
                  <div className="category-badge">{gift.category}</div>
                  <h3 className="gift-card-title">{gift.title}</h3>
                  <div className="gift-card-price">
                    <span className="price">{gift.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="view-all-button" onClick={() => navigate('/popular-gifts')}>전체보기</button>
        </div>

        {/* Important Alerts Section */}
        <div className="alerts-section">
          <h2 className="alerts-title">중요 알림</h2>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="alert-card">
                <div className="alert-icon">{alert.icon}</div>
                <p className="alert-text">{alert.text}</p>
                <button 
                  className="alert-button"
                  onClick={() => handleViewAlert(alert.text)}
                >
                  보기
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default LandingPage

