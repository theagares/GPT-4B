import { Link, useLocation } from 'react-router-dom'
import './BottomNavigation.css'

const imgHouse = "https://www.figma.com/api/mcp/asset/12380d31-0ad3-4a32-8d90-ce87bd94f193"
const imgIcon = "https://www.figma.com/api/mcp/asset/d401482d-4975-4c6f-a86b-ad2969aa99ff"
const imgCalendarToday = "https://www.figma.com/api/mcp/asset/4134e053-9801-400d-a632-96e3e47002db"
const imgImage10 = "https://www.figma.com/api/mcp/asset/718710cb-5c8b-4c5f-9937-711e40a7523d"
const imgSpeakerNotes = "https://www.figma.com/api/mcp/asset/4afac431-8c41-4f4f-b520-825bd50b7d00"
const imgGpt4B4 = "https://www.figma.com/api/mcp/asset/4aef3389-774e-415a-b6d4-c3775374a44f"

function BottomNavigation() {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="bottom-navigation">
      <div className="nav-background"></div>
      <div className="home-indicator"></div>
      
      <Link 
        to="/dashboard" 
        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <img src={imgHouse} alt="대시보드" className="nav-icon" />
        <span className="nav-label">대시보드</span>
      </Link>

      <Link 
        to="/business-cards" 
        className={`nav-item ${isActive('/business-cards') ? 'active' : ''}`}
      >
        <img src={imgIcon} alt="명함집" className="nav-icon" />
        <span className="nav-label">명함집</span>
      </Link>

      <div className="nav-item ai-recommend">
        <div className="ai-icon-wrapper">
          <img src={imgSpeakerNotes} alt="AI" className="ai-background-icon" />
          <img src={imgGpt4B4} alt="GPT-4b" className="ai-logo" />
        </div>
        <span className="nav-label ai-label">AI 추천</span>
      </div>

      <Link 
        to="/calendar" 
        className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}
      >
        <img src={imgCalendarToday} alt="캘린더" className="nav-icon" />
        <span className="nav-label">캘린더</span>
      </Link>

      <Link 
        to="/my" 
        className={`nav-item ${isActive('/my') ? 'active' : ''}`}
      >
        <img src={imgImage10} alt="MY" className="nav-icon" />
        <span className="nav-label">MY</span>
      </Link>
    </div>
  )
}

export default BottomNavigation

