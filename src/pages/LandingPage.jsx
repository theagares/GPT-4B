import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './LandingPage.css'

const imgGpt4B1 = "https://www.figma.com/api/mcp/asset/a3f2241c-a552-4bd3-b5e3-fa9bb210880a"
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/e61c2b5d-68eb-409e-9b25-a90abd759a96"
const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/2fbadc50-65b5-4cb8-8a55-788f604b6dd8"
const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/a166d192-abaa-4496-bc6a-bd5336537959"
const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/33109928-c22e-44a9-be00-18c92d851a45"
const imgIcon = "https://www.figma.com/api/mcp/asset/dd2c3a79-4460-4073-9292-db10d6d07dab"
const imgIcon1 = "https://www.figma.com/api/mcp/asset/49a9be54-9062-4383-b3ba-bd80bcd932c2"

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <img src={imgGpt4B1} alt="GPT-4b Logo" className="header-logo" />
        </div>

        {/* AI Gift Recommendation Banner */}
        <div className="ai-banner">
          <div className="banner-content">
            <div className="banner-text">
              <p className="banner-subtitle">AI 맞춤형 선물 추천</p>
              <p className="banner-title">상대방의 정보를 기반으로 최적의 선물을 찾아드립니다</p>
            </div>
            <button className="banner-button">
              <img src={imgIcon} alt="arrow" className="button-icon" />
              <span>추천 받으러 가기</span>
            </button>
          </div>
        </div>

        {/* Popular Gifts Section */}
        <div className="popular-gifts-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <img src={imgIcon1} alt="gift" className="section-icon" />
              <h2 className="section-title">인기 선물</h2>
            </div>
            <button className="sort-button">판매량순 ▼</button>
          </div>

          <div className="gift-cards-container">
            <div className="gift-card">
              <div className="gift-card-image">
                <img src={imgImageWithFallback} alt="프리미엄 와인 세트" />
                <div className="rank-badge">#1</div>
              </div>
              <div className="gift-card-content">
                <div className="category-badge">주류</div>
                <h3 className="gift-card-title">프리미엄 와인 세트</h3>
                <div className="gift-card-price">
                  <span className="price">150,000원</span>
                  <span className="popularity">인기 95%</span>
                </div>
              </div>
            </div>

            <div className="gift-card">
              <div className="gift-card-image">
                <img src={imgImageWithFallback1} alt="명품 선물 세트" />
                <div className="rank-badge">#2</div>
              </div>
              <div className="gift-card-content">
                <div className="category-badge">고급 선물</div>
                <h3 className="gift-card-title">명품 선물 세트</h3>
                <div className="gift-card-price">
                  <span className="price">300,000원</span>
                  <span className="popularity">인기 92%</span>
                </div>
              </div>
            </div>

            <div className="gift-card">
              <div className="gift-card-image">
                <img src={imgImageWithFallback2} alt="스페셜티 커피 세트" />
                <div className="rank-badge">#3</div>
              </div>
              <div className="gift-card-content">
                <div className="category-badge">식음료</div>
                <h3 className="gift-card-title">스페셜티 커피 세트</h3>
                <div className="gift-card-price">
                  <span className="price">80,000원</span>
                  <span className="popularity">인기 88%</span>
                </div>
              </div>
            </div>

            <div className="gift-card">
              <div className="gift-card-image">
                <img src={imgImageWithFallback3} alt="비즈니스 선물 세트" />
                <div className="rank-badge">#4</div>
              </div>
              <div className="gift-card-content">
                <div className="category-badge">사무용품</div>
                <h3 className="gift-card-title">비즈니스 선물 세트</h3>
                <div className="gift-card-price">
                  <span className="price">120,000원</span>
                  <span className="popularity">인기 85%</span>
                </div>
              </div>
            </div>
          </div>

          <button className="view-all-button" onClick={() => navigate('/popular-gifts')}>전체보기</button>
        </div>

        {/* Important Alerts Section */}
        <div className="alerts-section">
          <h2 className="alerts-title">중요 알림</h2>
          <div className="alerts-list">
            <div className="alert-card">
              <div className="alert-icon">🔔</div>
              <p className="alert-text">박상무 님과 연락한 지 90일이 지났습니다. 간단한 선물로 안부를 전해보세요.</p>
              <button className="alert-button">보기</button>
            </div>

            <div className="alert-card">
              <div className="alert-icon">🎁</div>
              <p className="alert-text">이부장 님의 생일이 5일 남았습니다. 선물을 준비해보세요.</p>
              <button className="alert-button">보기</button>
            </div>

            <div className="alert-card">
              <div className="alert-icon">🔔</div>
              <p className="alert-text">최대리 님과의 미팅 약속이 내일 오후 2시입니다.</p>
              <button className="alert-button">보기</button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default LandingPage

