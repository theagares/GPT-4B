import { Routes, Route } from 'react-router-dom'
import WelcomeScreen from './pages/WelcomeScreen'
import LoginScreen from './pages/LoginScreen'
import SignupPage from './pages/SignupPage'
import SignupInfoPage from './pages/SignupInfoPage'
import SignupFormPage from './pages/SignupFormPage'
import WelcomePage from './pages/WelcomePage'
import TutorialPage from './pages/TutorialPage'
import LLMPage from './pages/LLMPage'
import ChatHistoryPage from './pages/ChatHistoryPage'
import ChatDetailPage from './pages/ChatDetailPage'
import LandingPage from './pages/LandingPage'
import BusinessCardWallet from './pages/BusinessCardWallet'
import CalendarPage from './pages/CalendarPage'
import EventDetailPage from './pages/EventDetailPage'
import AddEventPage from './pages/AddEventPage'
import MyPage from './pages/MyPage'
import MyDetailPage from './pages/MyDetailPage'
import GiftHistoryPage from './pages/GiftHistoryPage'
import PersonalGiftHistoryPage from './pages/PersonalGiftHistoryPage'
import CardGiftHistoryPage from './pages/CardGiftHistoryPage'
import BusinessCardGiftHistoryPage from './pages/BusinessCardGiftHistoryPage'
import PopularGiftsPage from './pages/PopularGiftsPage'
import GiftDetailPage from './pages/GiftDetailPage'
import GiftRecommendPage from './pages/GiftRecommendPage'
import GiftRecommendResultPage from './pages/GiftRecommendResultPage'
import FilterPage from './pages/FilterPage'
import AICardSelectPage from './pages/AICardSelectPage'
import OCR from './pages/OCR'
import Confirm from './pages/Confirm'
import AddInfo from './pages/AddInfo'
import ManualAddCardPage from './pages/ManualAddCardPage'
import CardDetail from './pages/CardDetail'
import Cardbook from './pages/Cardbook'
import CardCustomize from './pages/CardCustomize'
import UpgradePage from './pages/UpgradePage'
import EditMyInfoPage from './pages/EditMyInfoPage'
import NotFoundPage from './pages/NotFoundPage'
import MemoPage from './pages/MemoPage'
import RelationshipGraphPage from './pages/RelationshipGraphPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/forgot-password" element={<NotFoundPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/info" element={<SignupInfoPage />} />
        <Route path="/signup/form" element={<SignupFormPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/llm" element={<LLMPage />} />
        <Route path="/ai-card-select" element={<AICardSelectPage />} />
        <Route path="/chat-history" element={<ChatHistoryPage />} />
        <Route path="/chat-history/:id" element={<ChatDetailPage />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/business-cards" element={<BusinessCardWallet />} />
        <Route path="/ocr" element={<OCR />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/add" element={<AddInfo />} />
        <Route path="/add-info" element={<AddInfo />} />
        <Route path="/manual-add" element={<ManualAddCardPage />} />
        <Route path="/customize" element={<CardCustomize />} />
        <Route path="/cards" element={<Cardbook />} />
        <Route path="/cards/:id" element={<CardDetail />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/event/:eventId" element={<EventDetailPage />} />
        <Route path="/calendar/add" element={<AddEventPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/detail" element={<MyDetailPage />} />
        <Route path="/my/edit" element={<EditMyInfoPage />} />
        <Route path="/my/gift-history" element={<PersonalGiftHistoryPage />} />
        <Route path="/memo" element={<MemoPage />} />
        <Route path="/card/gift-history" element={<CardGiftHistoryPage />} />
        <Route path="/business-card/gift-history" element={<BusinessCardGiftHistoryPage />} />
        <Route path="/gift-recommend" element={<GiftRecommendPage />} />
        <Route path="/gift-recommend/result" element={<GiftRecommendResultPage />} />
        <Route path="/popular-gifts" element={<PopularGiftsPage />} />
        <Route path="/popular-gifts/:giftId" element={<GiftDetailPage />} />
        <Route path="/popular-gifts/filter" element={<FilterPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/relationship-graph" element={<RelationshipGraphPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App

