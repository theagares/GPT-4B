import { Link, useLocation } from 'react-router-dom'
import './BottomNavigation.css'

// MY(사용자) 아이콘 SVG 컴포넌트
function MyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 홈(집) 아이콘 SVG 컴포넌트
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12L12 3L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V16C9 15.4696 9.21071 14.9609 9.58579 14.5858C9.96086 14.2107 10.4696 14 11 14H13C13.5304 14 14.0391 14.2107 14.4142 14.5858C14.7893 14.9609 15 15.4696 15 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 명함집(카드) 아이콘 SVG 컴포넌트
function CardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8.5" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M5 17c0-1.657 1.343-3 3-3h1c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M15 9h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// 캘린더 아이콘 SVG 컴포넌트
function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BottomNavigation() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/my') {
      // MY 탭은 /my로 시작하는 모든 경로에서 활성화
      return location.pathname === path || location.pathname.startsWith('/my/')
    }
    if (path === '/ai-card-select') {
      return location.pathname === path ||
             location.pathname === '/gift-recommend' ||
             location.pathname.startsWith('/gift-recommend/')
    }
    return location.pathname === path
  }

  return (
    <div className="bottom-navigation">
      <Link 
        to="/dashboard" 
        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <HomeIcon />
        <span className="nav-label">홈</span>
      </Link>

      <Link 
        to="/business-cards" 
        className={`nav-item ${isActive('/business-cards') ? 'active' : ''}`}
      >
        <CardIcon />
        <span className="nav-label">프로필</span>
      </Link>

      <Link 
        to="/ai-card-select" 
        className={`nav-item ai-recommend ${isActive('/ai-card-select') ? 'active' : ''}`}
      >
        <div className="ai-icon-wrapper">
          <img src="/assets/mars_logo_white.png" alt="메모" className="ai-logo" />
        </div>
        <span className="nav-label ai-label">메모</span>
      </Link>

      <Link 
        to="/calendar" 
        className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}
      >
        <CalendarIcon />
        <span className="nav-label">캘린더</span>
      </Link>

      <Link 
        to="/my" 
        className={`nav-item ${isActive('/my') ? 'active' : ''}`}
      >
        <MyIcon />
        <span className="nav-label">MY</span>
      </Link>
    </div>
  )
}

export default BottomNavigation

