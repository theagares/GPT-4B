import { Routes, Route } from 'react-router-dom'
import WelcomeScreen from './pages/WelcomeScreen'
import LoginScreen from './pages/LoginScreen'
import LandingPage from './pages/LandingPage'
import BusinessCardWallet from './pages/BusinessCardWallet'
import CalendarPage from './pages/CalendarPage'
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
      </Routes>
    </div>
  )
}

export default App

