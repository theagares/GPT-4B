import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { userAPI, giftAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
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
  const [myInfo, setMyInfo] = useState({
    name: '',
    position: '',
    company: '',
    phone: '',
    email: '',
    memo: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [giftCount, setGiftCount] = useState(0)
  
  // DB에서 선물 개수 가져오기
  useEffect(() => {
    const fetchGiftCount = async () => {
      if (!isAuthenticated()) {
        setGiftCount(0)
        return
      }

      try {
        const response = await giftAPI.getAll()
        if (response.data.success) {
          setGiftCount(response.data.data?.length || 0)
        }
      } catch (error) {
        console.error('Failed to fetch gift count:', error)
        setGiftCount(0)
      }
    }

    fetchGiftCount()
  }, [])
  
  // DB에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isAuthenticated()) {
        // 로그인하지 않은 경우 기본값 사용
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setMyInfo(JSON.parse(savedInfo));
        } else {
          setMyInfo({
            name: "박상무",
            position: "상무",
            company: "한국프로축구연맹 영업본부",
            phone: "010-1234-5678",
            email: "park.sangmu@company.com",
            memo: "",
          });
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await userAPI.getProfile();
        if (response.data.success) {
          const userData = response.data.data;
          // DB에서 가져온 정보로 설정
          const savedInfo = localStorage.getItem('my-info');
          const localInfo = savedInfo ? JSON.parse(savedInfo) : {};
          
          setMyInfo({
            name: userData.name || localInfo.name || '',
            position: userData.position || localInfo.position || '',
            company: userData.company || localInfo.company || '',
            phone: userData.phone || localInfo.phone || '',
            email: userData.email || localInfo.email || '',
            memo: localInfo.memo || '',
          });
          
          // DB에서 디자인 정보 가져오기
          if (userData.cardDesign) {
            setMyCardDesign(userData.cardDesign);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 에러 발생 시 localStorage에서 가져오기
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setMyInfo(JSON.parse(savedInfo));
        }
        const savedDesign = localStorage.getItem('my-card-design');
        if (savedDesign) {
          setMyCardDesign(savedDesign);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [])

  // 디자인 변경 감지 (DB 업데이트 후)
  useEffect(() => {
    const handleDesignChange = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile();
          if (response.data.success && response.data.data.cardDesign) {
            setMyCardDesign(response.data.data.cardDesign);
          }
        } catch (error) {
          console.error('Failed to fetch card design:', error);
        }
      }
    };
    
    window.addEventListener('myCardDesignChanged', handleDesignChange);
    window.addEventListener('myInfoUpdated', handleDesignChange);
    
    return () => {
      window.removeEventListener('myCardDesignChanged', handleDesignChange);
      window.removeEventListener('myInfoUpdated', handleDesignChange);
    };
  }, [])

  // 내 정보 업데이트 감지
  useEffect(() => {
    const handleMyInfoUpdate = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile();
          if (response.data.success) {
            const userData = response.data.data;
            const savedInfo = localStorage.getItem('my-info');
            const localInfo = savedInfo ? JSON.parse(savedInfo) : {};
            
            setMyInfo({
              name: userData.name || localInfo.name || '',
              position: userData.position || localInfo.position || '',
              company: userData.company || localInfo.company || '',
              phone: userData.phone || localInfo.phone || '',
              email: userData.email || localInfo.email || '',
              memo: localInfo.memo || '',
            });
            
            // DB에서 디자인 정보 가져오기
            if (userData.cardDesign) {
              setMyCardDesign(userData.cardDesign);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    }
    window.addEventListener('myInfoUpdated', handleMyInfoUpdate)
    // 페이지 포커스 시에도 업데이트
    window.addEventListener('focus', handleMyInfoUpdate)
    return () => {
      window.removeEventListener('myInfoUpdated', handleMyInfoUpdate)
      window.removeEventListener('focus', handleMyInfoUpdate)
    }
  }, [])

  const handleBack = () => {
    navigate('/my')
  }

  const handleCustomize = () => {
    // 내 명함 정보를 BusinessCard 형태로 만들어서 CardCustomize로 전달
    const myCard = {
      id: 'my-card',
      name: myInfo.name || '',
      position: myInfo.position || '',
      company: myInfo.company || '',
      phone: myInfo.phone || '',
      email: myInfo.email || '',
      design: myCardDesign
    }
    navigate('/customize', { state: { card: myCard } })
  }

  const handleCall = () => {
    window.location.href = `tel:${myInfo.phone}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${myInfo.email}`
  }

  const handleBusinessCards = () => {
    navigate('/business-cards')
  }

  const handleGiftHistory = () => {
    navigate('/my/gift-history')
  }

  const handleEditMyInfo = () => {
    navigate('/my/edit')
  }

  if (isLoading) {
    return (
      <div className="my-detail-page">
        <div className="my-detail-background" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
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
            <p className="profile-phone">{myInfo.phone}</p>
            <p className="profile-email">{myInfo.email}</p>
          </div>

          <div className="profile-header">
            <div className="profile-image-wrapper">
              <img src={imgImageWithFallback} alt="프로필" className="profile-image" />
              <div className="profile-image-overlay">
                <img src={imgVector} alt="" />
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{myInfo.name}</h2>
            </div>
          </div>
          
          {/* 하단 소속/직급 정보 */}
          <div className="profile-details">
            <p className="profile-company">{myInfo.company}</p>
            <p className="profile-position">{myInfo.position}</p>
          </div>

          {/* 내 정보 수정하기 버튼 */}
          <button className="edit-my-info-button" onClick={handleEditMyInfo}>
            내 정보 수정하기
          </button>
        </div>


        {/* 통계 카드 */}
        <div className="stats-section">
          <div className="stat-card" onClick={handleBusinessCards} style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label-row">
                  <svg className="stat-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H13C13.5523 3 14 3.44772 14 4V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4C2 3.44772 2.44772 3 3 3Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 6H11" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 9H9" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
                  <svg className="stat-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2L3 5V11C3 11.5523 3.44772 12 4 12H12C12.5523 12 13 11.5523 13 11V5L8 2Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 5L8 8L13 5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="stat-label">선물 이력</span>
                </div>
                <p className="stat-value">{giftCount}회</p>
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
                <p className="info-value">{myInfo.phone}</p>
              </div>
            </div>
            <div className="info-row">
              <img src={imgIcon5} alt="이메일" className="info-icon" />
              <div className="info-content">
                <p className="info-label">이메일</p>
                <p className="info-value">{myInfo.email}</p>
              </div>
            </div>
            <div className="info-row">
              <img src={imgIcon3} alt="소속" className="info-icon" />
              <div className="info-content">
                <p className="info-label">소속 / 직급</p>
                <p className="info-value">{myInfo.company} / {myInfo.position}</p>
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


