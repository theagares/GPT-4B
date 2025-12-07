import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { userAPI, giftAPI } from '../utils/api'
import { isAuthenticated, logout } from '../utils/auth'
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
      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2126 21.3522 21.3992C21.1472 21.5858 20.9053 21.7262 20.6419 21.8115C20.3785 21.8968 20.0996 21.9252 19.82 21.895C16.7428 21.4596 13.787 20.4711 11.19 18.995C8.77382 17.6547 6.72533 15.7567 5.20997 13.459C3.59049 10.9908 2.52934 8.17462 2.10997 5.22499C2.07771 4.94689 2.10487 4.66575 2.18966 4.39977C2.27444 4.13379 2.41485 3.88913 2.60231 3.68157C2.78977 3.474 3.02001 3.30809 3.27868 3.19402C3.53735 3.07994 3.81883 3.02026 4.10497 2.99899H7.10497C7.58779 2.95399 8.06281 3.12411 8.40997 3.46499C8.75713 3.80587 9.02487 4.28133 9.16497 4.82499C9.30507 5.36865 9.30756 5.94767 9.17197 6.49299C9.03638 7.03831 8.77135 7.51676 8.42497 7.86199L7.09497 9.19199C8.51369 11.8842 10.6158 13.9863 13.308 15.405L14.638 14.075C14.9832 13.7286 15.4617 13.4636 16.007 13.328C16.5523 13.1924 17.1313 13.1949 17.675 13.335C18.2186 13.4751 18.6941 13.7428 19.035 14.09C19.3759 14.4372 19.546 14.9122 19.501 15.395L19.501 15.395Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 이메일 아이콘 SVG 컴포넌트
function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 건물/소속 아이콘 SVG 컴포넌트
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 21V7L13 2V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 21V11H13V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9V9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12V12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 15V15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  const handleLogout = () => {
    if (window.confirm('정말로 로그아웃을 하시겠습니까?')) {
      logout()
    }
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
          <button className="logout-button-top" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {/* 상단 텍스트 */}
        <div className="my-detail-title-section">
          <h1 className="my-detail-title">내 정보</h1>
          <p className="my-detail-subtitle">나의 세부 정보를 확인할 수 있어요.</p>
        </div>

        {/* 명함 위 버튼 영역 */}
        <div className="card-actions-section">
          <button className="customize-button" onClick={handleCustomize}>
            명함 커스텀하기
          </button>
        </div>

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
            내 정보 수정
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
                  <span className="stat-label">총 명함 개수</span>
                </div>
                <p className="stat-value">{cards.length}개</p>
              </div>
              <ArrowRightIcon />
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
              <ArrowRightIcon />
            </div>
          </div>
        </div>

        {/* 명함 정보 섹션 */}
        <div className="info-section">
          <h3 className="info-section-title">명함 정보</h3>
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


