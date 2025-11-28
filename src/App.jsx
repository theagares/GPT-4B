import { Routes, Route } from 'react-router-dom'
import WelcomeScreen from './pages/WelcomeScreen'
import LoginScreen from './pages/LoginScreen'
import LandingPage from './pages/LandingPage'
import BusinessCardWallet from './pages/BusinessCardWallet'
import CalendarPage from './pages/CalendarPage'
import EventDetailPage from './pages/EventDetailPage'
import AddEventPage from './pages/AddEventPage'
import MyPage from './pages/MyPage'
import MyDetailPage from './pages/MyDetailPage'
import GiftHistoryPage from './pages/GiftHistoryPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/business-cards" element={<BusinessCardWallet />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/event/:eventId" element={<EventDetailPage />} />
        <Route path="/calendar/add" element={<AddEventPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/detail" element={<MyDetailPage />} />
        <Route path="/my/gift-history" element={<GiftHistoryPage />} />
      </Routes>
    </div>
  )
}

export default App

