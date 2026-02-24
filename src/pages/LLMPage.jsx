import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatAPI } from '../utils/api'
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
  const [selectedLLM, setSelectedLLM] = useState('gpt')
  const [chatId, setChatId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
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
    navigate('/dashboard')
  }

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim()
      setMessage('')
      setIsLoading(true)
      
      // 사용자 메시지 추가
      setMessages(prev => [...prev, { type: 'user', text: userMessage }])
      
      try {
        // API 호출
        const response = await chatAPI.sendMessage(
          userMessage,
          selectedLLM || 'gpt',
          chatId
        )
        
        console.log('Chat API Response:', response.data)
        console.log('Full response:', JSON.stringify(response.data, null, 2))
        
        if (response.data && response.data.success) {
          const chat = response.data.data
          
          console.log('Chat object:', chat)
          console.log('Chat messages:', chat?.messages)
          console.log('Messages type:', typeof chat?.messages)
          console.log('Is array:', Array.isArray(chat?.messages))
          
          // chatId 저장 (새 채팅인 경우)
          if (!chatId && chat && chat.id) {
            setChatId(chat.id)
          }
          
          // 마지막 assistant 메시지 가져오기
          if (chat && chat.messages) {
            // messages가 문자열인 경우 파싱
            let messages = chat.messages
            if (typeof messages === 'string') {
              try {
                messages = JSON.parse(messages)
              } catch (parseError) {
                console.error('Failed to parse messages:', parseError)
                throw new Error('메시지 데이터를 파싱할 수 없습니다.')
              }
            }
            
            if (Array.isArray(messages)) {
              console.log('Messages array length:', messages.length)
              console.log('All messages:', messages)
              
              const assistantMessages = messages.filter(msg => msg && msg.role === 'assistant')
              console.log('Assistant messages:', assistantMessages)
              
              if (assistantMessages.length > 0) {
                const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
                console.log('Last assistant message:', lastAssistantMessage)
                
                setMessages(prev => [...prev, { 
                  type: 'ai', 
                  text: lastAssistantMessage.content || '응답을 받지 못했습니다.' 
                }])
              } else {
                // assistant 메시지가 없으면 모든 메시지를 확인
                console.warn('No assistant messages found. All messages:', messages)
                console.warn('Message roles:', messages.map(m => m?.role))
                console.warn('Full chat object:', chat)
                
                // 사용자에게 에러 메시지 표시하되, 실제로 받은 데이터도 표시
                const errorMsg = messages.length > 0 
                  ? `AI 응답을 받지 못했습니다. (받은 메시지 수: ${messages.length})`
                  : 'AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.'
                
                setMessages(prev => [...prev, { 
                  type: 'ai', 
                  text: errorMsg 
                }])
                return // 에러를 throw하지 않고 메시지만 표시
              }
            } else {
              console.error('Messages is not an array:', messages)
              console.error('Messages type:', typeof messages)
              console.error('Messages value:', messages)
              setMessages(prev => [...prev, { 
                type: 'ai', 
                text: '서버 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.' 
              }])
              return
            }
          } else {
            console.error('Chat or messages missing:', { chat, hasMessages: !!chat?.messages })
            console.error('Full response data:', response.data)
            setMessages(prev => [...prev, { 
              type: 'ai', 
              text: '채팅 데이터를 받지 못했습니다. 잠시 후 다시 시도해주세요.' 
            }])
            return
          }
        } else {
          throw new Error(response.data?.message || '응답을 받지 못했습니다')
        }
      } catch (error) {
        console.error('Chat API Error:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          responseText: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data',
          fullError: error
        })
        
        // response.data의 전체 내용 출력
        if (error.response?.data) {
          console.error('Response data:', error.response.data)
        }
        
        let errorMessage = '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
        
        // JSON 파싱 오류인 경우
        if (error.message && error.message.includes('JSON')) {
          errorMessage = '서버 응답을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data) {
          // 응답 데이터가 있지만 형식이 다른 경우
          try {
            const data = typeof error.response.data === 'string' 
              ? JSON.parse(error.response.data) 
              : error.response.data
            errorMessage = data.message || errorMessage
          } catch (parseError) {
            errorMessage = error.response.data || errorMessage
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: errorMessage 
        }])
      } finally {
        setIsLoading(false)
      }
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
    // LLM을 변경하면 새로운 채팅 시작
    setChatId(null)
    setMessages([])
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
            onClick={() => navigate('/my/gift-history')}
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
              {isLoading && (
                <div className="message-bubble ai-message">
                  <p>답변을 생성하고 있습니다...</p>
                </div>
              )}
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
            disabled={!message.trim() || isLoading}
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
