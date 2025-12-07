import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chatAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './ChatDetailPage.css'
import '../pages/GiftRecommendResultPage.css'

function ChatDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
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
        console.log('Fetching chat with id:', id)
        const response = await chatAPI.getById(id)
        console.log('Chat API response:', response)
        
        if (response.data && response.data.success) {
          const chatData = response.data.data
          console.log('Chat data:', chatData)
          setChat(chatData)

          // 메시지 파싱
          let chatMessages = chatData.messages || []
          console.log('Raw messages:', chatMessages, 'Type:', typeof chatMessages)
          
          if (typeof chatMessages === 'string') {
            try {
              chatMessages = JSON.parse(chatMessages)
              console.log('Parsed messages:', chatMessages)
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
            console.log('Formatted messages:', formattedMessages)
            setMessages(formattedMessages)
          } else {
            console.warn('Messages is not an array:', chatMessages)
            setMessages([])
          }
        } else {
          console.error('Failed to fetch chat - response:', response.data)
          setError('채팅 내역을 불러올 수 없습니다.')
          setMessages([])
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
        console.error('Error details:', error.response?.data || error.message)
        setError(error.response?.data?.message || '채팅 내역을 불러오는 중 오류가 발생했습니다.')
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

  // 메시지를 파싱하여 선물 추천 형식으로 변환
  const parseGiftRecommendationMessage = (text) => {
    if (!text) return null

    // 선물 추천 메시지 패턴 확인
    // 예: "1. 상품명\n카테고리\n₩가격\n이미지: URL\n추천 이유: 이유" 또는 "1. 상품명\n카테고리\n₩가격\n추천 이유: 이유"
    const giftPattern = /(\d+)\.\s*([^\n]+)\n([^\n]*)\n(₩[^\n]+)\n(?:이미지:\s*([^\n]+)\n)?추천 이유:\s*([^\n]+)/g
    
    const gifts = []
    let match
    
    while ((match = giftPattern.exec(text)) !== null) {
      gifts.push({
        number: match[1],
        name: match[2],
        category: match[3],
        price: match[4],
        image: match[5] || null, // 이미지 URL이 있으면 사용
        rationale: match[6]
      })
    }
    
    return gifts.length > 0 ? gifts : null
  }

  // 선택한 선물 메시지 파싱
  const parseSelectedGiftMessage = (text) => {
    if (!text || !text.includes('선택한 선물:')) return null
    
    // "선택한 선물: 상품명 (카테고리, ₩가격)" 형식 파싱
    const match = text.match(/선택한 선물:\s*([^(]+)\s*\(([^,]+),\s*(₩[^)]+)\)/)
    if (match) {
      return {
        name: match[1].trim(),
        category: match[2].trim(),
        price: match[3].trim()
      }
    }
    return null
  }

  // 저장 완료 메시지 파싱
  const parseSavedMessage = (text) => {
    if (!text || !text.includes('저장되었습니다')) return null
    
    // "선택하신 "상품명" 선물이 저장되었습니다." 형식 파싱
    const match = text.match(/선택하신\s*"([^"]+)"\s*선물이 저장되었습니다/)
    if (match) {
      return {
        name: match[1].trim()
      }
    }
    return null
  }

  // 사용자 정보 파싱
  const parseUserInfo = (text) => {
    if (!text) return null
    
    const info = {}
    const nameMatch = text.match(/이름:\s*([^\n]+)/)
    const companyMatch = text.match(/소속:\s*([^\n]+)/)
    const positionMatch = text.match(/직급:\s*([^\n]+)/)
    const memoMatch = text.match(/메모:\s*([^\n]+)/)
    const additionalInfoMatch = text.match(/추가 정보:\s*([^\n]+)/)
    
    if (nameMatch) info.name = nameMatch[1]
    if (companyMatch) info.company = companyMatch[1]
    if (positionMatch) info.position = positionMatch[1]
    if (memoMatch) info.memo = memoMatch[1]
    if (additionalInfoMatch) info.additionalInfo = additionalInfoMatch[1]
    
    return Object.keys(info).length > 0 ? info : null
  }

  // 선택된 선물 이름 찾기 (모든 메시지에서)
  const getSelectedGiftName = () => {
    for (const msg of messages) {
      if (msg.text.includes('선택한 선물:') && msg.type === 'user') {
        const match = msg.text.match(/선택한 선물:\s*([^(]+)\s*\(/)
        if (match) {
          return match[1].trim()
        }
      }
    }
    return null
  }

  // 메시지 렌더링
  const renderMessage = (msg, index) => {
    // 인사 메시지
    if (msg.text.includes('안녕하세요') && msg.text.includes('맞춤 선물을 추천해드릴게요')) {
      return (
        <div key={index} className="message-bubble ai-message">
          <p>안녕하세요! 👋</p>
          <p>{msg.text.split('\n')[1]}</p>
        </div>
      )
    }

    // 사용자 정보 카드
    const userInfo = parseUserInfo(msg.text)
    if (userInfo && msg.text.includes('다음은') && msg.text.includes('정보예요')) {
      return (
        <div key={index} className="message-bubble ai-message">
          <p>다음은 {userInfo.name || '사용자'}님의 정보예요:</p>
          <div className="user-info-card">
            <div className="user-info-avatar">
              <span>{(userInfo.name || '사용자').charAt(0)}</span>
            </div>
            <div className="user-info-details">
              <div className="user-info-name">{userInfo.name || '사용자'}</div>
              {userInfo.company && <div className="user-info-item">소속: {userInfo.company}</div>}
              {userInfo.position && <div className="user-info-item">직급: {userInfo.position}</div>}
              <div className="user-info-item">연령대: 30대 중반</div>
              {userInfo.memo && <div className="user-info-item">메모: {userInfo.memo}</div>}
              {userInfo.additionalInfo && <div className="user-info-item">추가 정보: {userInfo.additionalInfo}</div>}
            </div>
          </div>
        </div>
      )
    }

    // 선물 추천 메시지
    const gifts = parseGiftRecommendationMessage(msg.text)
    if (gifts && msg.text.includes('관심사를 고려하여 다음 선물들을 추천드립니다')) {
      const userName = userInfo?.name || '사용자'
      const selectedGiftName = getSelectedGiftName() // 선택된 선물 이름 가져오기
      return (
        <div key={index} className="message-bubble ai-message">
          <div className="gift-recommendation-header">
            <img 
              src="/assets/gpt_4b_logo_blueberry.png" 
              alt="GPT-4b Logo" 
              className="gift-recommendation-logo"
            />
            <p>GPT-4b의 선물 추천</p>
          </div>
          <p className="gift-recommendation-subtitle">{userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:</p>
          <div className={`gift-recommendations ${selectedGiftName ? 'has-selection' : ''}`}>
            {gifts.map((gift, giftIndex) => {
              const isSelected = selectedGiftName && gift.name.trim() === selectedGiftName.trim()
              return (
              <div key={giftIndex} className={`gift-item-wrapper ${isSelected ? 'selected-gift' : ''}`}>
                <div className="gift-recommendation-card">
                  <div className="gift-card-image">
                    {gift.image ? (
                      <img 
                        src={gift.image} 
                        alt={gift.name}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="gift-card-image-placeholder" style={{ display: gift.image ? 'none' : 'flex' }}>
                      🎁
                    </div>
                  </div>
                  <div className="gift-card-content">
                    <div className="gift-card-header">
                      <h3 className="gift-card-title">{gift.name}</h3>
                    </div>
                    <p className="gift-card-category">{gift.category}</p>
                    <div className="gift-card-bottom">
                      <span className="gift-card-price">{gift.price}</span>
                    </div>
                  </div>
                </div>
                <div className="gift-rationale-box">
                  <div className="rationale-card">
                    <div className="rationale-card-content">
                      <p className="rationale-card-description">{gift.rationale}</p>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      )
    }

    // 선택한 선물 메시지 (사용자 메시지) - "선택한 선물: 상품명" 형식
    if (msg.text.includes('선택한 선물:') && msg.type === 'user') {
      // "선택한 선물: 상품명 (카테고리, ₩가격)" 형식 파싱
      const match = msg.text.match(/선택한 선물:\s*([^(]+)\s*\(([^)]+)\)/)
      if (match) {
        const productName = match[1].trim()
        return (
          <div key={index} className="message-bubble user-message">
            <p style={{ whiteSpace: 'pre-wrap' }}>선택한 선물: {productName}</p>
          </div>
        )
      }
      // 파싱 실패 시 기본 표시
      return (
        <div key={index} className="message-bubble user-message">
          <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
        </div>
      )
    }

    // 저장 완료 메시지 - 숨김 처리
    if (msg.text.includes('저장되었습니다') && msg.type === 'ai') {
      return null
    }

    // 일반 메시지 (볼드체 처리)
    return (
      <div key={index} className={`message-bubble ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{formatMessageText(msg.text)}</p>
      </div>
    )
  }

  // 텍스트를 파싱하여 "추천 이유", 숫자, 상품 이름을 볼드체로 처리
  const formatMessageText = (text) => {
    if (!text) return text

    const parts = []
    let lastIndex = 0
    let keyCounter = 0
    
    // 저장 완료 메시지의 제품명 패턴 (예: "선택하신 "제품명" 선물이 저장되었습니다.")
    const savedGiftNamePattern = /선택하신\s*"([^"]+)"\s*선물이 저장되었습니다\.?/g
    
    // 저장 완료 메시지인지 확인
    const savedMatch = savedGiftNamePattern.exec(text)
    if (savedMatch) {
      const beforeText = text.substring(0, savedMatch.index)
      const afterText = text.substring(savedMatch.index + savedMatch[0].length)
      const productName = savedMatch[1]
      
      return (
        <>
          {beforeText}
          선택하신 "<strong>{productName}</strong>" 선물이 저장되었습니다.
          {afterText}
        </>
      )
    }
    
    // 숫자로 시작하는 패턴 (예: "1. 상품명") - 숫자와 상품명 모두 볼드
    const numberNamePattern = /(\d+\.\s*)([^\n]+)/g
    // "추천 이유:" 패턴
    const rationalePattern = /(추천 이유:)/g
    
    // 모든 매칭을 찾아서 인덱스 순으로 정렬
    const allMatches = []
    
    let match
    numberNamePattern.lastIndex = 0
    while ((match = numberNamePattern.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        end: match.index + match[0].length,
        type: 'number-name',
        number: match[1],
        name: match[2]
      })
    }
    
    rationalePattern.lastIndex = 0
    while ((match = rationalePattern.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        end: match.index + match[0].length,
        type: 'rationale'
      })
    }
    
    // 인덱스 순으로 정렬
    allMatches.sort((a, b) => a.index - b.index)
    
    // 텍스트를 파싱
    allMatches.forEach((match) => {
      // 이전 텍스트 추가
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        if (beforeText) {
          parts.push(beforeText)
        }
      }
      
      // 매칭된 부분 처리
      if (match.type === 'number-name') {
        parts.push(
          <strong key={`bold-${keyCounter++}`}>{match.number}</strong>,
          <strong key={`bold-${keyCounter++}`}>{match.name}</strong>
        )
      } else if (match.type === 'rationale') {
        parts.push(
          <strong key={`bold-${keyCounter++}`}>추천 이유:</strong>
        )
      }
      
      lastIndex = match.end
    })
    
    // 남은 텍스트 추가
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? parts : text
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
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : messages.length === 0 ? (
            <div className="empty-message">대화 내역이 없습니다.</div>
          ) : (
            messages.map((msg, index) => renderMessage(msg, index))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

export default ChatDetailPage

