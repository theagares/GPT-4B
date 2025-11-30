import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './LLMPage.css'

const imgGpt4B1 = "https://www.figma.com/api/mcp/asset/c2072de6-f1a8-4f36-a042-2df786f153b1"

function LLMPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showLLMModal, setShowLLMModal] = useState(false)
  const [selectedLLM, setSelectedLLM] = useState(null)
  const plusButtonRef = useRef(null)

  useEffect(() => {
    // 채팅방 입장할 때마다 안내 표시
    setShowTutorial(true)
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      // 메시지 전송 로직
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handlePlusClick = (e) => {
    e.stopPropagation()
    if (showTutorial) {
      setShowTutorial(false)
    }
    setShowLLMModal(true)
  }

  const handleLLMSelect = (llm) => {
    setSelectedLLM(llm)
    setShowLLMModal(false)
    console.log('Selected LLM:', llm)
  }

  const handleCloseModal = () => {
    setShowLLMModal(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`llm-page ${showTutorial ? 'tutorial-active' : ''}`}>
      <div className="llm-container">
        {/* Header */}
        <div className="llm-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}></div>
          <button 
            className="header-title-button"
            onClick={() => navigate('/chat-history')}
          >
            <h2 className="header-title">대화내역</h2>
          </button>
        </div>

        {/* Main Content */}
        <div className="llm-content">
          <div className="logo-section">
            <img src={imgGpt4B1} alt="GPT-4b Logo" className="llm-logo" />
          </div>
          <div className="greeting-section">
            <h1 className="greeting-text">안녕하세요</h1>
            <p className="subtitle-text">GPT-4b에게 마음껏 질문하세요!</p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="input-bar">
          <button 
            ref={plusButtonRef}
            className="input-bar-icon" 
            onClick={handlePlusClick}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            type="text"
            className="message-input"
            placeholder="메시지를 입력하세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-content">
            <div className="tutorial-bubble" onClick={(e) => e.stopPropagation()}>
              <button 
                className="tutorial-close-button"
                onClick={() => setShowTutorial(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <p>하단의 "+" 버튼을 누르면<br />LLM 종류를 선택할 수 있어요.</p>
              <div className="bubble-arrow"></div>
            </div>
          </div>
        </div>
      )}

      {/* LLM Selection Modal */}
      {showLLMModal && (
        <div className="llm-modal-overlay" onClick={handleCloseModal}>
          <div className="llm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="llm-modal-header">
              <h3 className="llm-modal-title">LLM 선택</h3>
              <button className="llm-modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="llm-options">
              <button 
                className={`llm-option ${selectedLLM === 'claude' ? 'selected' : ''}`}
                onClick={() => handleLLMSelect('claude')}
              >
                <span className="llm-option-emoji">🧠</span>
                <span className="llm-option-name">Claude</span>
              </button>
              <button 
                className={`llm-option ${selectedLLM === 'gpt' ? 'selected' : ''}`}
                onClick={() => handleLLMSelect('gpt')}
              >
                <span className="llm-option-emoji">🤖</span>
                <span className="llm-option-name">GPT</span>
              </button>
              <button 
                className={`llm-option ${selectedLLM === 'gemini' ? 'selected' : ''}`}
                onClick={() => handleLLMSelect('gemini')}
              >
                <span className="llm-option-emoji">✨</span>
                <span className="llm-option-name">Gemini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LLMPage
