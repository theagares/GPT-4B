import { Routes, Route } from 'react-router-dom'
import WelcomeScreen from './pages/WelcomeScreen'
import LoginScreen from './pages/LoginScreen'
import SignupPage from './pages/SignupPage'
import SignupInfoPage from './pages/SignupInfoPage'
import SignupFormPage from './pages/SignupFormPage'
import WelcomePage from './pages/WelcomePage'
import LLMPage from './pages/LLMPage'
import ChatHistoryPage from './pages/ChatHistoryPage'
import LandingPage from './pages/LandingPage'
import BusinessCardWallet from './pages/BusinessCardWallet'
import CalendarPage from './pages/CalendarPage'
import EventDetailPage from './pages/EventDetailPage'
import AddEventPage from './pages/AddEventPage'
import MyPage from './pages/MyPage'
import MyDetailPage from './pages/MyDetailPage'
import GiftHistoryPage from './pages/GiftHistoryPage'
import CardGiftHistoryPage from './pages/CardGiftHistoryPage'
import PopularGiftsPage from './pages/PopularGiftsPage'
import GiftDetailPage from './pages/GiftDetailPage'
import GiftRecommendPage from './pages/GiftRecommendPage'
import GiftRecommendResultPage from './pages/GiftRecommendResultPage'
import FilterPage from './pages/FilterPage'
import OCR from './pages/OCR'
import Confirm from './pages/Confirm'
import AddInfo from './pages/AddInfo'
import CardDetail from './pages/CardDetail'
import Cardbook from './pages/Cardbook'
import CardCustomize from './pages/CardCustomize'
import UpgradePage from './pages/UpgradePage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/info" element={<SignupInfoPage />} />
        <Route path="/signup/form" element={<SignupFormPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/llm" element={<LLMPage />} />
        <Route path="/chat-history" element={<ChatHistoryPage />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/business-cards" element={<BusinessCardWallet />} />
        <Route path="/ocr" element={<OCR />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/add" element={<AddInfo />} />
        <Route path="/customize" element={<CardCustomize />} />
        <Route path="/cards" element={<Cardbook />} />
        <Route path="/cards/:id" element={<CardDetail />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/event/:eventId" element={<EventDetailPage />} />
        <Route path="/calendar/add" element={<AddEventPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/detail" element={<MyDetailPage />} />
        <Route path="/my/gift-history" element={<GiftHistoryPage />} />
        <Route path="/card/gift-history" element={<CardGiftHistoryPage />} />
        <Route path="/gift-recommend" element={<GiftRecommendPage />} />
        <Route path="/gift-recommend/result" element={<GiftRecommendResultPage />} />
        <Route path="/popular-gifts" element={<PopularGiftsPage />} />
        <Route path="/popular-gifts/:giftId" element={<GiftDetailPage />} />
        <Route path="/popular-gifts/filter" element={<FilterPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
      </Routes>
    </div>
  )
}

export default App

