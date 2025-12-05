import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { chatAPI } from '../utils/api'
import './GiftRecommendResultPage.css'
import { giftAPI, chatAPI } from '../utils/api.js'

// 기본 선물 데이터 (API 응답이 없을 경우 폴백)
const fallbackGifts = [
  {
    id: 'fallback-1',
    name: '추천 선물을 찾지 못했습니다',
    price: '0',
    image: '',
    url: '#',
    category: '없음',
    brand: '',
    source: 'fallback'
  }
]

function GiftRecommendResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 기본 정보
  const card = location.state?.card
  const additionalInfo = location.state?.additionalInfo || ''
  const memos = location.state?.memos || []
  
  // API 응답 데이터
  const recommendedGifts = location.state?.recommendedGifts || []
  const rationaleCards = location.state?.rationaleCards || []
  const personaString = location.state?.personaString || ''
  
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showRationale, setShowRationale] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  // 실제 표시할 선물 데이터 (API 응답 또는 폴백)
  const giftsToShow = recommendedGifts.length > 0 ? recommendedGifts : fallbackGifts

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

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim()
      setMessage('')
      setIsLoading(true)
      
      // 사용자 메시지 추가
      setMessages(prev => [...prev, { type: 'user', text: userMessage }])
      
      try {
        // 실제 Chat API 호출
        const response = await chatAPI.sendMessage(userMessage, 'gpt', null)
        
        if (response.data && response.data.success) {
          const chat = response.data.data
          
          if (chat && chat.messages) {
            let chatMessages = chat.messages
            if (typeof chatMessages === 'string') {
              chatMessages = JSON.parse(chatMessages)
            }
            
            if (Array.isArray(chatMessages)) {
              const assistantMessages = chatMessages.filter(msg => msg && msg.role === 'assistant')
              if (assistantMessages.length > 0) {
                const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
                setMessages(prev => [...prev, { 
                  type: 'ai', 
                  text: lastAssistantMessage.content || '응답을 받지 못했습니다.' 
                }])
              }
            }
          }
        } else {
          throw new Error('응답을 받지 못했습니다.')
        }
      } catch (error) {
        console.error('Chat API Error:', error)
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' 
        }])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSelectGift = async (gift, index) => {
    if (selectedGiftIndex !== null || isSavingGift) return // 이미 선택되었거나 저장 중이면 무시
    
    if (!card?.id) {
      alert('명함 정보가 없어 선물을 저장할 수 없습니다.')
      return
    }
    
    setIsSavingGift(true)
    setSelectedGiftIndex(index)

    try {
      const metadata = gift.metadata || {}
      const giftName = metadata.name || metadata.product_name || '이름 없음'
      const giftPrice = metadata.price ? parseInt(metadata.price) : null
      const giftImage = metadata.image || ''
      const giftCategory = metadata.category || '카테고리 없음'
      
      // 선물 정보를 DB에 저장
      await giftAPI.create({
        cardId: card.id,
        giftName: giftName,
        giftDescription: `${giftCategory} 카테고리의 선물`,
        giftImage: giftImage,
        price: giftPrice,
        category: giftCategory,
        notes: `선물 추천에서 선택된 선물: ${giftName}`
      })

      // 전체 대화 내역 저장
      await saveChatHistory(gift, giftName, giftPrice, giftImage, giftCategory)
    } catch (error) {
      console.error('Error saving gift:', error)
      alert(error.response?.data?.message || '선물 저장 중 오류가 발생했습니다.')
      setSelectedGiftIndex(null) // 에러 시 선택 취소
    } finally {
      setIsSavingGift(false)
    }
  }

  const saveChatHistory = async (selectedGift, giftName, giftPrice, giftImage, giftCategory) => {
    if (isSavingChat) return // 이미 저장 중이면 무시
    
    setIsSavingChat(true)

    try {
      // 대화 내역 구성
      const chatMessages = [
        {
          role: 'assistant',
          content: `안녕하세요! 👋\n${userName}님을 위한 맞춤 선물을 추천해드릴게요.`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `다음은 ${userName}님의 정보예요:\n- 이름: ${userName}\n${userPosition ? `- 직급: ${userPosition}\n` : ''}${userCompany ? `- 회사: ${userCompany}\n` : ''}- 관심사: ${interests}`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `${userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:\n\n${recommendedGifts.map((gift, idx) => {
            const meta = gift.metadata || {};
            const name = meta.name || meta.product_name || `선물 ${idx + 1}`;
            const price = meta.price ? `₩${parseInt(meta.price).toLocaleString()}` : '가격 정보 없음';
            return `${idx + 1}. ${name} (${price})`;
          }).join('\n')}`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'user',
          content: `선택한 선물: ${giftName} (${giftCategory}, ${giftPrice ? `₩${giftPrice.toLocaleString()}` : '가격 정보 없음'})`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `선택하신 "${giftName}" 선물이 저장되었습니다.`,
          timestamp: new Date().toISOString()
        }
      ]

      // Chat 생성
      await chatAPI.createHistory(
        chatMessages,
        `${userName}님을 위한 선물 추천`,
        'gpt'
      )
    } catch (error) {
      console.error('Error saving chat history:', error)
      // 채팅 저장 실패는 사용자에게 알리지 않음 (선물 저장은 성공했으므로)
    } finally {
      setIsSavingChat(false)
    }
  }

  // 사용자 정보 추출
  const userName = card?.name || '이름 없음'
  const userPosition = card?.position || ''
  const userCompany = card?.company || ''
  const headerTitle = userPosition && userCompany 
    ? `${userName} ${userCompany} ${userPosition}`
    : `${userName}님을 위한 선물추천`

  // 추천 rationale 데이터 (API 응답 또는 기본값)
  const rationaleData = rationaleCards.length > 0 
    ? rationaleCards.map((card, index) => ({
        id: card.id || index + 1,
        title: card.title || '추천 이유',
        icon: getIconForCategory(card.title),
        description: card.description || ''
      }))
    : [
        {
          id: 1,
          title: '맞춤 추천',
          icon: '🎁',
          description: '입력하신 정보를 바탕으로 선물을 추천해드립니다.'
        }
      ]
  
  // 카테고리에 따른 아이콘 매핑
  function getIconForCategory(title) {
    if (!title) return '🎁'
    const iconMap = {
      '스포츠': '⛳',
      '레저': '🏃',
      '골프': '⛳',
      '와인': '🍷',
      '주류': '🍾',
      '식품': '🍽️',
      '뷰티': '💄',
      '패션': '👔',
      '전자': '📱',
      '가전': '🏠',
      '도서': '📚',
      '문화': '🎭',
      '여행': '✈️',
      '비즈니스': '💼',
      '생일': '🎂',
      '기념일': '💝'
    }
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (title.includes(key)) return icon
    }
    return '🎁'
  }

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
                  {(rationaleCards.length > 0 ? rationaleCards : [{
                    id: 0,
                    title: '추천 근거',
                    description: personaString || '사용자 입력 기반 추천입니다.',
                  }]).map((item) => (
                    <div key={item.id} className="rationale-card">
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
            {giftsToShow.length > 0 && giftsToShow[0].id !== 'fallback-1' ? (
              <div className="gift-recommendations">
                {giftsToShow.map((gift) => (
                  <div key={gift.id} className="gift-recommendation-card">
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
                      <h3 className="gift-card-title">{gift.name}</h3>
                      <p className="gift-card-category">
                        {gift.category}
                        {gift.brand && ` · ${gift.brand}`}
                      </p>
                      <div className="gift-card-bottom">
                        <span className="gift-card-price">
                          ₩{Number(gift.price).toLocaleString()}
                        </span>
                        {gift.url && gift.url !== '#' ? (
                          <a 
                            href={gift.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="gift-card-detail-link"
                          >
                            상세 보기
                          </a>
                        ) : (
                          <span className="gift-card-source">
                            {gift.source === 'naver' ? '네이버 쇼핑' : 'GPT-4b 추천'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-gifts-message">
                <p>😢 조건에 맞는 선물을 찾지 못했습니다.</p>
                <p>검색 조건을 변경해서 다시 시도해보세요.</p>
              </div>
            )}
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
          {isLoading && (
            <div className="message-bubble ai-message">
              <p>답변을 생성하고 있습니다...</p>
            </div>
          )}
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
            disabled={!message.trim() || isLoading}
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

