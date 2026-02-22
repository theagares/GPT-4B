import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { logout } from '../utils/auth'
import './MySettingsPage.css'

function MySettingsPage() {
  const navigate = useNavigate()
  const [showThemeOverlay, setShowThemeOverlay] = useState(false)

  const handleBack = () => {
    navigate(-1)
  }

  const handleLogout = () => {
    if (window.confirm('정말로 로그아웃을 하시겠습니까?')) {
      logout()
    }
  }

  const handleThemeClick = () => {
    setShowThemeOverlay(true)
  }

  const handleThemeOverlayClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowThemeOverlay(false)
    }
  }

  return (
    <div className="my-settings-page">
      <div className="my-settings-background">
        {/* 헤더 */}
        <div className="my-settings-header">
          <button className="my-settings-back-button" onClick={handleBack}>
            <span className="my-settings-back-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <div className="my-settings-header-content">
            <h1 className="my-settings-title">설정</h1>
          </div>
          <div className="my-settings-header-spacer" />
        </div>

        {/* 세로 나열 목록 */}
        <div className="my-settings-list">
          <div className="my-settings-section">
            <h3 className="my-settings-section-title">계정</h3>
            <div className="my-settings-section-content">
              <p className="my-settings-item">계정 관리</p>
            </div>
          </div>
          <div className="my-settings-section">
            <h3 className="my-settings-section-title">일반</h3>
            <div className="my-settings-section-content">
              <div className="my-settings-item-row">
                <p className="my-settings-item">버전</p>
                <span className="my-settings-item-value">0.1.0</span>
              </div>
              <div className="my-settings-item-row">
                <p className="my-settings-item">테마</p>
                <div className="my-settings-theme-value">
                  <span className="my-settings-theme-label">라이트 모드</span>
                  <button
                    type="button"
                    className="my-settings-theme-arrow-btn"
                    onClick={handleThemeClick}
                    aria-label="테마 선택"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="my-settings-section">
            <h3 className="my-settings-section-title">기타</h3>
            <div className="my-settings-section-content">
              <p className="my-settings-item">이용 약관</p>
              <button className="my-settings-logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />

      {/* 테마 선택 오버레이 */}
      {showThemeOverlay && (
        <div
          className="my-settings-theme-overlay"
          onClick={handleThemeOverlayClose}
        >
          <div className="my-settings-theme-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="my-settings-theme-modal-close"
              onClick={() => setShowThemeOverlay(false)}
              aria-label="닫기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3 className="my-settings-theme-modal-title">테마 선택</h3>
            <p className="my-settings-theme-modal-content">곧 개발될 예정입니다</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MySettingsPage
