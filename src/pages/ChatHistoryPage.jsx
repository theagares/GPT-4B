import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChatHistoryPage.css'

const mockChatList = [
  { id: 1, name: '김철수', time: '오전 10:30' },
  { id: 2, name: '이영희', time: '어제' },
  { id: 3, name: '박민수', time: '2024.01.15' },
  { id: 4, name: '정수진', time: '2024.01.14' },
  { id: 5, name: '최동욱', time: '2024.01.13' },
]

function ChatHistoryPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockChatList
    }
    return mockChatList.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="chat-history-page">
      <div className="chat-history-container">
        <div className="chat-history-header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="chat-history-title">대화내역</h1>
          <div></div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            placeholder="지난 대화내역 검색"
          />
        </div>

        <div className="chat-list">
          {filteredChatList.map((chat) => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => navigate(`/llm?chat=${chat.id}`)}
            >
              <div className="chat-item-content">
                <div className="chat-item-text chat-name">{chat.name}</div>
                <div className="chat-time">{chat.time}</div>
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatHistoryPage

