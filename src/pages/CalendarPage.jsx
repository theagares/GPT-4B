import BottomNavigation from '../components/BottomNavigation'
import './CalendarPage.css'

function CalendarPage() {
  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <h1 className="calendar-title">캘린더</h1>
        <div className="calendar-placeholder">
          <p>캘린더 기능이 곧 추가될 예정입니다.</p>
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}

export default CalendarPage

