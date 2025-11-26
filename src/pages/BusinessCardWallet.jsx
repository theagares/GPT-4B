import { useState } from 'react'
import BottomNavigation from '../components/BottomNavigation'
import './BusinessCardWallet.css'

const imgIcon = "https://www.figma.com/api/mcp/asset/d56d758a-c7b8-42c8-bd08-19709b82a5d6"

function BusinessCardWallet() {
  const [searchQuery, setSearchQuery] = useState('')

  // 임시 명함 데이터
  const businessCards = Array(10).fill(null).map((_, index) => ({
    id: index + 1,
    name: `명함 ${index + 1}`,
    company: `회사명 ${index + 1}`,
    position: '직책'
  }))

  return (
    <div className="business-card-wallet">
      <div className="wallet-container">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <img src={imgIcon} alt="search" className="search-icon" />
            <input
              type="text"
              placeholder="회사명, 직책 등을 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Business Cards Grid */}
        <div className="cards-grid">
          {businessCards.map((card) => (
            <div key={card.id} className="business-card-item">
              <div className="card-placeholder">
                {/* 명함 이미지가 들어갈 자리 */}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="wallet-footer">
          <p className="footer-text">더 많은 명함을 저장해 관리하세요</p>
          <a href="#" className="upgrade-link">GPT-4b+ 살펴보기</a>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default BusinessCardWallet

