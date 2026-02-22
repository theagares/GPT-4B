import { useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <div className="not-found-header">
        <button 
          className="not-found-back-button"
          onClick={() => navigate(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="not-found-container">
        <div className="not-found-logo-section">
          <img 
            src="/assets/mars_logo_blueberry.png" 
            alt="Mars Logo" 
            className="not-found-logo" 
          />
        </div>
        <p className="not-found-message">아직 개발중입니다</p>
      </div>
    </div>
  )
}

export default NotFoundPage

