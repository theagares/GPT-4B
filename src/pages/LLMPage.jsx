import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './LLMPage.css'

// LLM 아이콘 이미지 경로
const claudeIcon = "/assets/claude-icon.svg"
const gptIcon = "/assets/gpt-icon.svg"
const geminiIcon = "/assets/gemini-icon.svg"

function LLMPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showTutorial, setShowTutorial] = useState(false)
  const [showLLMModal, setShowLLMModal] = useState(false)
  const [selectedLLM, setSelectedLLM] = useState(null)
  const plusButtonRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // AI 추천 탭 최초 입장 시에만 안내 표시
    const hasSeenTutorial = localStorage.getItem('llm-tutorial-shown')
    if (!hasSeenTutorial) {
    setShowTutorial(true)
    }
  }, [])

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleBack = () => {
    navigate(-1)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      // 사용자 메시지 추가
      setMessages([...messages, { type: 'user', text: message.trim() }])
      setMessage('')
      
      // TODO: AI 응답 받기 (실제로는 API 호출)
      // 임시로 AI 응답 추가
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: '안녕하세요! GPT-4b입니다. 무엇을 도와드릴까요?' 
        }])
      }, 500)
    }
  }

  const handlePlusClick = (e) => {
    e.stopPropagation()
    if (showTutorial) {
      setShowTutorial(false)
      localStorage.setItem('llm-tutorial-shown', 'true')
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
    <div className={`llm-page ${showTutorial ? 'tutorial-active' : ''} ${showLLMModal ? 'modal-active' : ''}`}>
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
            className="chat-history-button"
            onClick={() => navigate('/chat-history')}
          >
            대화내역
          </button>
        </div>

        {/* Main Content */}
        <div className="llm-content">
          {messages.length === 0 ? (
            <>
              <div className="logo-section">
                <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="llm-logo" />
              </div>
              <div className="greeting-section">
                <h1 className="greeting-text">안녕하세요</h1>
                <p className="subtitle-text">GPT-4b에게 마음껏 질문하세요!</p>
              </div>
            </>
          ) : (
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
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
        <div className="tutorial-overlay" onClick={() => {
          setShowTutorial(false)
          localStorage.setItem('llm-tutorial-shown', 'true')
        }}>
          <div className="tutorial-content">
            <div className="tutorial-bubble" onClick={(e) => e.stopPropagation()}>
              <button 
                className="tutorial-close-button"
                onClick={() => {
                  setShowTutorial(false)
                  localStorage.setItem('llm-tutorial-shown', 'true')
                }}
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
                <div className="llm-option-icon-wrapper">
                  <img 
                    src={claudeIcon} 
                    alt="Claude" 
                    className="llm-option-icon"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'inline'
                    }}
                  />
                  <span className="llm-option-emoji" style={{ display: 'none' }}>🧠</span>
                </div>
                <span className="llm-option-name">Claude</span>
              </button>
              <button 
                className={`llm-option ${selectedLLM === 'gpt' ? 'selected' : ''}`}
                onClick={() => handleLLMSelect('gpt')}
              >
                <div className="llm-option-icon-wrapper">
                  <img 
                    src={gptIcon} 
                    alt="GPT" 
                    className="llm-option-icon"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'inline'
                    }}
                  />
                  <span className="llm-option-emoji" style={{ display: 'none' }}>🤖</span>
                </div>
                <span className="llm-option-name">GPT</span>
              </button>
              <button 
                className={`llm-option ${selectedLLM === 'gemini' ? 'selected' : ''}`}
                onClick={() => handleLLMSelect('gemini')}
              >
                <div className="llm-option-icon-wrapper">
                  <img 
                    src={geminiIcon} 
                    alt="Gemini" 
                    className="llm-option-icon"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'inline'
                    }}
                  />
                  <span className="llm-option-emoji" style={{ display: 'none' }}>✨</span>
                </div>
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
