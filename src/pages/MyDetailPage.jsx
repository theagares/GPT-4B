import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import './MyDetailPage.css'

// 명함 디자인 맵 (MyDetailPage용 - 유사 색상 그라데이션)
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(139, 92, 246, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(96, 165, 250, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(52, 211, 153, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(244, 114, 182, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(251, 146, 60, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(129, 140, 248, 1) 100%)',
}

// 페이지 배경 디자인 맵 (명함 색상에 맞춘 연한 배경)
const pageBackgroundDesigns = {
  'design-1': 'linear-gradient(180deg, rgba(168, 162, 242, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(180deg, rgba(147, 197, 253, 1) 0%, rgba(59, 130, 246, 1) 100%)',
  'design-3': 'linear-gradient(180deg, rgba(110, 231, 183, 1) 0%, rgba(16, 185, 129, 1) 100%)',
  'design-4': 'linear-gradient(180deg, rgba(251, 182, 206, 1) 0%, rgba(236, 72, 153, 1) 100%)',
  'design-5': 'linear-gradient(180deg, rgba(254, 215, 170, 1) 0%, rgba(249, 115, 22, 1) 100%)',
  'design-6': 'linear-gradient(180deg, rgba(196, 181, 253, 1) 0%, rgba(99, 102, 241, 1) 100%)',
}

// 이미지 URL
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/3b95cfd9-db95-4104-9484-d911aac379e5"
const imgVector = "https://www.figma.com/api/mcp/asset/1add6121-300a-4db2-9a42-890b6a55dee7"
const imgVector1 = "https://www.figma.com/api/mcp/asset/239848fd-423e-49f5-a070-6e3fd15a1445"
const imgVector2 = "https://www.figma.com/api/mcp/asset/13c42b79-cc2b-4d57-b6b0-746b06d8bd04"
const imgVector3 = "https://www.figma.com/api/mcp/asset/675e7aad-5822-4717-88d2-1b35bc0e7c3e"
const imgVector4 = "https://www.figma.com/api/mcp/asset/9f59a389-f83e-4f13-b23f-43517aa98dce"
const imgVector5 = "https://www.figma.com/api/mcp/asset/e71af735-2a29-47a8-bafd-4888fe0e7a29"
const imgIcon = "https://www.figma.com/api/mcp/asset/bd9c8744-6965-436c-bae8-6c45e9c85ec3"
const imgIcon1 = "https://www.figma.com/api/mcp/asset/fe25d611-37cd-4fb2-b0ee-4307e8b4c14f"
const imgIcon2 = "https://www.figma.com/api/mcp/asset/d6582f6f-6223-4128-b8b6-49b616da781c"
const imgIcon3 = "https://www.figma.com/api/mcp/asset/1f3d9c82-6f21-4254-94d8-62b7a94a0dc1"
const imgIcon4 = "https://www.figma.com/api/mcp/asset/2aba6a6f-c4a0-413f-beb5-22c0c7a7f953"
const imgIcon5 = "https://www.figma.com/api/mcp/asset/a449d7fe-86bc-419e-a053-3b2baf2a7359"

function MyDetailPage() {
  const navigate = useNavigate()
  const [myCardDesign, setMyCardDesign] = useState('design-1')
  const cards = useCardStore((state) => state.cards)

  // localStorage에서 내 명함 디자인 불러오기
  useEffect(() => {
    const savedDesign = localStorage.getItem('my-card-design')
    if (savedDesign) {
      setMyCardDesign(savedDesign)
    }
  }, [])

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDesign = localStorage.getItem('my-card-design')
      if (savedDesign) {
        setMyCardDesign(savedDesign)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    // 같은 탭에서의 변경도 감지하기 위해 커스텀 이벤트 사용
    window.addEventListener('myCardDesignChanged', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('myCardDesignChanged', handleStorageChange)
    }
  }, [])

  const handleBack = () => {
    navigate('/my')
  }

  const handleCustomize = () => {
    // 내 명함 정보를 BusinessCard 형태로 만들어서 CardCustomize로 전달
    const myCard = {
      id: 'my-card',
      name: '박상무',
      position: '상무',
      company: '영업본부',
      phone: '010-1234-5678',
      email: 'park.sangmu@company.com',
      design: myCardDesign
    }
    navigate('/customize', { state: { card: myCard } })
  }

  const handleCall = () => {
    window.location.href = 'tel:010-1234-5678'
  }

  const handleEmail = () => {
    window.location.href = 'mailto:park.sangmu@company.com'
  }

  const handleBusinessCards = () => {
    navigate('/business-cards')
  }

  const handleGiftHistory = () => {
    navigate('/my/gift-history')
  }

  return (
    <div 
      className="my-detail-page"
      style={{
        background: pageBackgroundDesigns[myCardDesign] || pageBackgroundDesigns['design-1']
      }}
    >
      <div className="my-detail-background">
        {/* 헤더 */}
        <div className="detail-header">
        </div>

        {/* 상단 텍스트 */}
        <div className="my-detail-title-section">
          <h1 className="my-detail-title">내 정보</h1>
          <p className="my-detail-subtitle">나의 세부 정보를 확인할 수 있어요.</p>
        </div>

        {/* 명함 커스텀 버튼 */}
        <button className="customize-button" onClick={handleCustomize}>
          명함 커스텀하기
        </button>

        {/* 프로필 카드 */}
        <div 
          className="profile-card"
          style={{
            background: cardDesigns[myCardDesign] || cardDesigns['design-1']
          }}
        >
          {/* 우측 상단 연락처 정보 */}
          <div className="profile-contact">
            <p className="profile-phone">010-1234-5678</p>
            <p className="profile-email">park.sangmu@company.com</p>
          </div>

          <div className="profile-header">
            <div className="profile-image-wrapper">
              <img src={imgImageWithFallback} alt="프로필" className="profile-image" />
              <div className="profile-image-overlay">
                <img src={imgVector} alt="" />
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">박상무</h2>
            </div>
          </div>
          
          {/* 하단 소속/직급 정보 */}
          <div className="profile-details">
            <p className="profile-company">한국프로축구연맹 영업본부</p>
            <p className="profile-position">상무</p>
          </div>
        </div>


        {/* 통계 카드 */}
        <div className="stats-section">
          <div className="stat-card" onClick={handleBusinessCards} style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label-row">
                  <img src={imgIcon} alt="명함" className="stat-icon" />
                  <span className="stat-label">총 명함 갯수</span>
                </div>
                <p className="stat-value">{cards.length}개</p>
              </div>
              <img src={imgIcon1} alt="화살표" className="stat-arrow" />
            </div>
          </div>
          <div className="stat-card" onClick={handleGiftHistory} style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label-row">
                  <img src={imgIcon2} alt="선물" className="stat-icon" />
                  <span className="stat-label">선물 이력</span>
                </div>
                <p className="stat-value">15회</p>
              </div>
              <img src={imgIcon1} alt="화살표" className="stat-arrow" />
            </div>
          </div>
        </div>

        {/* 명함 정보 섹션 */}
        <div className="info-section">
          <h3 className="info-section-title">명함 정보</h3>
          <div className="info-card">
            <div className="info-row">
              <img src={imgIcon4} alt="전화" className="info-icon" />
              <div className="info-content">
                <p className="info-label">전화번호</p>
                <p className="info-value">010-1234-5678</p>
              </div>
              <button className="action-button" onClick={handleCall}>전화</button>
            </div>
            <div className="info-row">
              <img src={imgIcon5} alt="이메일" className="info-icon" />
              <div className="info-content">
                <p className="info-label">이메일</p>
                <p className="info-value">park.sangmu@company.com</p>
              </div>
              <button className="action-button" onClick={handleEmail}>메일</button>
            </div>
            <div className="info-row">
              <img src={imgIcon3} alt="소속" className="info-icon" />
              <div className="info-content">
                <p className="info-label">소속 / 직급</p>
                <p className="info-value">한국프로축구연맹 영업본부 / 상무</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default MyDetailPage

