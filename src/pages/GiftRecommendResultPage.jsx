import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './GiftRecommendResultPage.css'

// 샘플 선물 데이터 (실제로는 API에서 가져와야 함)
const sampleGifts = [
  {
    id: 1,
    name: '프리미엄 골프 클럽 세트',
    description: '최신 기술이 적용된 고급 골프 클럽',
    price: '₩850,000',
    image: 'https://www.figma.com/api/mcp/asset/e61c2b5d-68eb-409e-9b25-a90abd759a96',
    category: '스포츠'
  },
  {
    id: 2,
    name: '프랑스 프리미엄 와인 세트',
    description: '엄선된 보르도 와인 컬렉션',
    price: '₩450,000',
    image: 'https://www.figma.com/api/mcp/asset/2fbadc50-65b5-4cb8-8a55-788f604b6dd8',
    category: '주류'
  },
  {
    id: 3,
    name: '명품 골프백 세트',
    description: '프리미엄 소재의 고급 골프백',
    price: '₩320,000',
    image: 'https://www.figma.com/api/mcp/asset/a166d192-abaa-4496-bc6a-bd5336537959',
    category: '스포츠'
  }
]

function GiftRecommendResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const card = location.state?.card
  const additionalInfo = location.state?.additionalInfo || ''
  const memos = location.state?.memos || []
  
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showRationale, setShowRationale] = useState(false)
  const messagesEndRef = useRef(null)

  const handleBack = () => {
    navigate(-1)
  }

  const handleViewDetails = () => {
    setShowRationale(!showRationale)
  }

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      // 사용자 메시지 추가
      setMessages([...messages, { type: 'user', text: message.trim() }])
      setMessage('')
      
      // TODO: AI 응답 받기 (실제로는 API 호출)
      // 임시로 AI 응답 추가
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'ai', text: '감사합니다. 추가로 도움이 필요하시면 말씀해주세요.' }])
      }, 500)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 사용자 정보 추출
  const userName = card?.name || '이름 없음'
  const userPosition = card?.position || ''
  const userCompany = card?.company || ''
  const headerTitle = userPosition && userCompany 
    ? `${userName} ${userCompany} ${userPosition}`
    : `${userName}님을 위한 선물추천`

  // 추천 rationale 데이터
  const rationaleData = [
    {
      id: 1,
      title: '와인 애호가',
      icon: '🍷',
      description: '평소 고급 와인에 관심이 많으시며, 주말마다 와인 모임에 참석하십니다.'
    },
    {
      id: 2,
      title: '특별한 날',
      icon: '🎂',
      description: '생일을 맞이하여 프리미엄 선물이 적합합니다.'
    },
    {
      id: 3,
      title: '비즈니스 선물',
      icon: '💼',
      description: '거래처 관계자로 고급스러운 선물이 필요합니다.'
    }
  ]

  // 관심사 추출 (메모나 추가 정보에서)
  const interests = memos.length > 0 
    ? memos.join(', ')
    : additionalInfo || '없음'

  return (
    <div className="gift-recommend-result-page">
      <div className="gift-recommend-result-container">
        {/* Header */}
        <div className="gift-result-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="header-title">{headerTitle}</h2>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {/* Greeting Message */}
          <div className="message-bubble ai-message">
            <p>안녕하세요! 👋</p>
            <p>{userName}님을 위한 맞춤 선물을 추천해드릴게요.</p>
          </div>

          {/* User Info Card */}
          <div className="message-bubble ai-message">
            <p>다음은 {userName}님의 정보예요:</p>
            <div className="user-info-card">
              <div className="user-info-avatar">
                <span>{userName.charAt(0)}</span>
              </div>
              <div className="user-info-details">
                <div className="user-info-name">{userName}</div>
                {userPosition && <div className="user-info-item">직급: {userPosition}</div>}
                {userCompany && <div className="user-info-item">회사: {userCompany}</div>}
                <div className="user-info-item">연령대: 30대 중반</div>
                <div className="user-info-item">관심사: {interests}</div>
              </div>
            </div>
            <button className="view-details-link" onClick={handleViewDetails}>
              자세히 보기
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: showRationale ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
              >
                <path d="M6 12L10 8L6 4" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Rationale Section - Inside the message bubble */}
            {showRationale && (
              <div className="rationale-section">
                <div className="rationale-header">
                  <div className="rationale-header-content">
                    <img 
                      src="https://www.figma.com/api/mcp/asset/c2072de6-f1a8-4f36-a042-2df786f153b1" 
                      alt="GPT-4b Logo" 
                      className="rationale-logo"
                    />
                    <h3 className="rationale-title">GPT-4b 추천 분석</h3>
                  </div>
                </div>
                <div className="rationale-cards">
                  {rationaleData.map((item) => (
                    <div key={item.id} className="rationale-card">
                      <div className="rationale-card-icon">{item.icon}</div>
                      <div className="rationale-card-content">
                        <h4 className="rationale-card-title">{item.title}</h4>
                        <p className="rationale-card-description">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gift Recommendations */}
          <div className="message-bubble ai-message">
            <p>{userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:</p>
            <div className="gift-recommendations">
              {sampleGifts.map((gift, index) => (
                <div key={gift.id} className="gift-recommendation-card">
                  <div className="gift-card-image">
                    <img src={gift.image} alt={gift.name} />
                  </div>
                  <div className="gift-card-content">
                    <h3 className="gift-card-title">{gift.name}</h3>
                    <p className="gift-card-description">{gift.description}</p>
                    <div className="gift-card-bottom">
                      <span className="gift-card-price">{gift.price}</span>
                      <button className="gift-card-detail-link">상세 보기</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Question */}
          <div className="message-bubble ai-message">
            <p>혹시 추가 요청 사항이 있으신가요?</p>
          </div>

          {/* User Messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="input-bar">
          <button className="input-bar-icon">
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
    </div>
  )
}

export default GiftRecommendResultPage

