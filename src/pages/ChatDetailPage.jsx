import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chatAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './ChatDetailPage.css'

function ChatDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 메시지가 변경될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 채팅 내역 가져오기
  useEffect(() => {
    const fetchChat = async () => {
      if (!id || !isAuthenticated()) {
        setIsLoading(false)
        return
      }

      try {
        const response = await chatAPI.getById(id)
        if (response.data && response.data.success) {
          const chatData = response.data.data
          setChat(chatData)

          // 메시지 파싱
          let chatMessages = chatData.messages || []
          if (typeof chatMessages === 'string') {
            try {
              chatMessages = JSON.parse(chatMessages)
            } catch (parseError) {
              console.error('Failed to parse messages:', parseError)
              chatMessages = []
            }
          }

          // 메시지를 표시 형식으로 변환
          if (Array.isArray(chatMessages)) {
            const formattedMessages = chatMessages.map(msg => ({
              type: msg.role === 'user' ? 'user' : 'ai',
              text: msg.content || ''
            }))
            setMessages(formattedMessages)
          } else {
            setMessages([])
          }
        } else {
          console.error('Failed to fetch chat:', response.data)
          setMessages([])
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchChat()
  }, [id])

  const handleBack = () => {
    navigate('/chat-history')
  }

  return (
    <div className="chat-detail-page">
      <div className="chat-detail-container">
        {/* Header */}
        <div className="chat-detail-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="header-title">{chat?.title || '대화 내역'}</h2>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {isLoading ? (
            <div className="loading-message">로딩 중...</div>
          ) : messages.length === 0 ? (
            <div className="empty-message">대화 내역이 없습니다.</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

export default ChatDetailPage

