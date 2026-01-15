import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './ChatHistoryPage.css'

// 날짜 포맷팅 함수
const formatChatTime = (dateString) => {
  if (!dateString) return ''
  
  try {
    let date = new Date(dateString)
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return ''
    }
    
    // 서버에서 UTC 시간으로 보내는 경우를 대비해 한국 시간(UTC+9)으로 변환
    // MySQL DATETIME은 시간대 정보가 없으므로 UTC로 가정하고 변환
    // 시간대 정보가 없는 경우 (예: "2024-01-15 10:30:00")
    if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
      // UTC로 파싱된 시간을 한국 시간으로 변환 (9시간 추가)
      const utcTime = date.getTime()
      const koreaOffset = 9 * 60 * 60 * 1000 // 9시간을 밀리초로
      date = new Date(utcTime + koreaOffset)
    }
    // 시간대 정보가 있는 경우 (예: "2024-01-15T10:30:00Z" 또는 "2024-01-15T10:30:00+09:00")
    // new Date()가 자동으로 로컬 시간으로 변환하므로 그대로 사용
    
    const now = new Date()
    
    // 로컬 시간대 기준으로 날짜만 비교 (시간 제외)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const chatDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // 밀리초를 일로 변환
    const diffTime = todayStart.getTime() - chatDateStart.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // 시간 포맷팅
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours < 12 ? '오전' : '오후'
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
    const timeString = `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`
    
    if (diffDays === 0) {
      // 오늘인 경우 시간만 표시
      return timeString
    } else if (diffDays === 1) {
      // 어제인 경우 날짜와 시간 표시
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${timeString}`
    } else if (diffDays < 7) {
      // 일주일 이내인 경우 날짜와 시간 표시
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${timeString}`
    } else {
      // 일주일 이상 지난 경우 날짜와 시간 표시
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${timeString}`
    }
  } catch (error) {
    console.error('Error formatting chat time:', error, dateString)
    return ''
  }
}

function ChatHistoryPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [chatList, setChatList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate('/ai-card-select')
  }

  // DB에서 채팅 내역 가져오기
  useEffect(() => {
    const fetchChats = async () => {
      if (!isAuthenticated()) {
        setIsLoading(false)
        return
      }

      try {
        const response = await chatAPI.getAll()
        if (response.data.success) {
          setChatList(response.data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error)
        setChatList([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [])

  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) {
      return chatList
    }
    return chatList.filter(chat =>
      (chat.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [chatList, searchQuery])

  return (
    <div className="chat-history-page">
      <div className="chat-history-container">
        <div className="chat-history-header">
          <button
            onClick={handleBack}
            className="back-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="chat-history-title">추천 내역</h1>
          <div className="search-bar">
            <div className="search-icon-wrapper">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 19L14.65 14.65" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              placeholder="지난 추천 내역 검색"
            />
          </div>
        </div>

        <div className="chat-list">
          {isLoading ? (
            <div className="chat-loading">로딩 중...</div>
          ) : filteredChatList.length === 0 ? (
            <div className="chat-empty">대화 내역이 없습니다.</div>
          ) : (
            filteredChatList.map((chat) => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => navigate(`/chat-history/${chat.id}`)}
              >
                <div className="chat-item-content">
                  <div className="chat-item-text chat-name">{chat.title || '제목 없음'}</div>
                  <div className="chat-time">{formatChatTime(chat.updatedAt || chat.createdAt)}</div>
                </div>
                <svg
                  className="chat-arrow"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatHistoryPage

