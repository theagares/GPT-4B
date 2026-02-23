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

function hexToRgbLocal(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 109, g: 48, b: 223 }
}

function resolveCardDesign(designId) {
  if (designId && designId.startsWith('custom-')) {
    const hex = designId.replace('custom-', '')
    const { r, g, b } = hexToRgbLocal(hex)
    const dr = Math.round(Math.max(0, r * 0.85))
    const dg = Math.round(Math.max(0, g * 0.85))
    const db = Math.round(Math.max(0, b * 0.85))
    return `linear-gradient(147.99deg, rgba(${r},${g},${b},1) 0%, rgba(${dr},${dg},${db},1) 100%)`
  }
  return cardDesigns[designId] || cardDesigns['design-1']
}

function getCardTextColorsLocal(designId) {
  if (designId && designId.startsWith('custom-')) {
    const hex = designId.replace('custom-', '')
    const { r, g, b } = hexToRgbLocal(hex)
    const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
    return {
      main: light ? '#1f2937' : 'white',
      sub: light ? 'rgba(31,41,55,0.6)' : 'rgba(255,255,255,0.7)',
      contact: light ? 'rgba(31,41,55,0.5)' : 'rgba(255,255,255,0.6)',
    }
  }
  return { main: 'white', sub: 'rgba(255,255,255,0.7)', contact: 'rgba(255,255,255,0.6)' }
}

function resolvePageBackground(designId) {
  if (designId && designId.startsWith('custom-')) {
    const hex = designId.replace('custom-', '')
    const { r, g, b } = hexToRgbLocal(hex)
    const lr = Math.min(255, Math.round(r + (255 - r) * 0.4))
    const lg = Math.min(255, Math.round(g + (255 - g) * 0.4))
    const lb = Math.min(255, Math.round(b + (255 - b) * 0.4))
    return `linear-gradient(180deg, rgba(${lr},${lg},${lb},1) 0%, rgba(${r},${g},${b},1) 100%)`
  }
  return pageBackgroundDesigns[designId] || pageBackgroundDesigns['design-1']
}


// 화살표 아이콘 SVG 컴포넌트
function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 전화 아이콘 SVG 컴포넌트
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 이메일 아이콘 SVG 컴포넌트
function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 건물/소속 아이콘 SVG 컴포넌트
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 프로필 이미지 오버레이 카메라 아이콘 SVG 컴포넌트
function ProfileCameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 3H15L17 6H21A2 2 0 0 1 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17A3 3 0 1 0 12 11A3 3 0 0 0 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

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
    navigate('/business-cards', { state: { isGridView: true } })
  }

  const handleGiftHistory = () => {
    navigate('/my/gift-history')
  }

  const handleEditMyInfo = () => {
    navigate('/my/edit')
  }

  const handleSettings = () => {
    navigate('/my/settings')
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
        background: resolvePageBackground(myCardDesign)
      }}
    >
      <div className="my-detail-background">
        {/* 헤더 */}
        <div className="detail-header">
          <button className="settings-icon-button" onClick={handleSettings} aria-label="설정">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 상단 텍스트 (프로필 텍스트 색상에 맞춤) */}
        <div className="my-detail-title-section">
          <h1 className="my-detail-title" style={{ color: getCardTextColorsLocal(myCardDesign).main }}>
            {myInfo.name}님의 정보
          </h1>
        </div>

        {/* 명함 위 버튼 영역 */}
        <div className="card-actions-section">
          <button className="customize-button" onClick={handleCustomize}>
            색상 커스텀
          </button>
        </div>

        {/* 프로필 카드 */}
        <div 
          className="profile-card"
          style={{
            background: resolveCardDesign(myCardDesign)
          }}
        >
          {(() => { const tc = getCardTextColorsLocal(myCardDesign); return (<>
          {/* 우측 상단 연락처 정보 */}
          <div className="profile-contact">
            <p className="profile-phone" style={{ color: tc.contact }}>{myInfo.phone}</p>
            <p className="profile-email" style={{ color: tc.contact }}>{myInfo.email}</p>
          </div>

          <div className="profile-header">
            <div className="profile-info">
              <h2 className="profile-name" style={{ color: tc.main }}>{myInfo.name}</h2>
            </div>
          </div>
          
          {/* 하단 소속/직급 정보 */}
          <div className="profile-details">
            <p className="profile-company" style={{ color: tc.sub }}>{myInfo.company}</p>
            <p className="profile-position" style={{ color: tc.sub }}>{myInfo.position}</p>
          </div>

          {/* 내 정보 수정하기 버튼 */}
          <button className="edit-my-info-button" onClick={handleEditMyInfo}>
            내 정보 수정
          </button>
          </>); })()}
        </div>


        {/* 통계 카드 */}
        <div className="stats-section">
          <div className="stat-card" onClick={handleBusinessCards} style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label-row">
                  <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8.5" cy="10.5" r="2.5" stroke="#0a0a0a" strokeWidth="1.8"/>
                    <path d="M5 17C5 15.3431 6.34315 14 8 14H9C10.6569 14 12 15.3431 12 17" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M15 9H20" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M15 13H20" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <span className="stat-label">총 프로필 개수</span>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{cards.length}개</p>
                  <ArrowRightIcon />
                </div>
              </div>
            </div>
          </div>
          <div className="stat-card" onClick={handleGiftHistory} style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label-row">
                  <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="12" width="18" height="9" rx="1.5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12V21" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                    <rect x="5" y="8" width="14" height="4" rx="1" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8C12 8 9 8 7.5 6.5C6.5 5.5 6.5 4 7.5 3.5C8.5 3 10 3.5 11 5C11.5 6 12 8 12 8Z" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8C12 8 15 8 16.5 6.5C17.5 5.5 17.5 4 16.5 3.5C15.5 3 14 3.5 13 5C12.5 6 12 8 12 8Z" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="stat-label">전체 선물 이력</span>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{giftCount}회</p>
                  <ArrowRightIcon />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-row">
              <PhoneIcon />
              <div className="info-content">
                <p className="info-label">전화번호</p>
                <p className="info-value">{myInfo.phone}</p>
              </div>
            </div>
            <div className="info-row">
              <EmailIcon />
              <div className="info-content">
                <p className="info-label">이메일</p>
                <p className="info-value">{myInfo.email}</p>
              </div>
            </div>
            <div className="info-row">
              <BuildingIcon />
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


