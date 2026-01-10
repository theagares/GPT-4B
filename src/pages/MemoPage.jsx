import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { memoAPI } from '../utils/api'
import { isAuthenticated, getUser } from '../utils/auth'
import { useCardStore } from '../store/cardStore'
import './MemoPage.css'

// 명함 디자인별 배경색 맵 (CardCustomize.tsx와 동일한 그라데이션 사용)
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(244, 90, 170, 1) 0%, rgba(230, 55, 135, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

// 뒤로가기 아이콘 SVG 컴포넌트
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 돋보기 아이콘 SVG 컴포넌트
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 19L14.65 14.65" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MemoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const businessCardId = searchParams.get('businessCardId') || searchParams.get('cardId')
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [content, setContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const user = getUser()
  const fetchCards = useCardStore((state) => state.fetchCards)
  const card = businessCardId ? useCardStore((state) => state.getCardById(businessCardId)) : null

  // Memo 목록 가져오기
  const fetchMemos = async () => {
    if (!isAuthenticated() || !user?.id) {
      return
    }

    if (!businessCardId) {
      setError('명함 ID가 필요합니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await memoAPI.getByBusinessCardId(businessCardId)
      if (response.data.success) {
        setMemos(response.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch memos:', err)
      setError(err.response?.data?.message || err.message || '메모를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!businessCardId) {
      setError('명함 ID가 필요합니다.')
      return
    }

    // 카드 목록을 먼저 가져와서 명함 정보를 표시할 수 있도록 함
    const loadData = async () => {
      await fetchCards()
      await fetchMemos()
    }
    loadData()
  }, [businessCardId, user?.id, fetchCards])

  // 메모 생성
  const handleCreate = async () => {
    if (!content.trim()) {
      // eslint-disable-next-line no-alert
      alert('메모 내용을 입력해주세요.')
      return
    }

    if (!isAuthenticated() || !user?.id) {
      // eslint-disable-next-line no-alert
      alert('로그인이 필요합니다.')
      return
    }

    if (!businessCardId) {
      // eslint-disable-next-line no-alert
      alert('명함 ID가 필요합니다.')
      return
    }

    setIsCreating(true)
    try {
      const response = await memoAPI.create({
        user_id: user.id,
        business_card_id: businessCardId,
        content: content.trim(),
      })

      if (response.data.success) {
        setContent('')
        await fetchMemos()
      }
    } catch (err) {
      console.error('Failed to create memo:', err)
      // eslint-disable-next-line no-alert
      alert('메모 생성에 실패했습니다: ' + (err.response?.data?.message || err.message))
    } finally {
      setIsCreating(false)
    }
  }

  // 메모 수정 시작
  const handleEditStart = (memo) => {
    setEditingId(memo.id)
    setEditContent(memo.content)
  }

  // 메모 수정 취소
  const handleEditCancel = () => {
    setEditingId(null)
    setEditContent('')
  }

  // 메모 수정 저장
  const handleEditSave = async (id) => {
    if (!editContent.trim()) {
      // eslint-disable-next-line no-alert
      alert('메모 내용을 입력해주세요.')
      return
    }

    try {
      const response = await memoAPI.update(id, editContent.trim())

      if (response.data.success) {
        setEditingId(null)
        setEditContent('')
        await fetchMemos()
      }
    } catch (err) {
      console.error('Failed to update memo:', err)
      // eslint-disable-next-line no-alert
      alert('메모 수정에 실패했습니다: ' + (err.response?.data?.message || err.message))
    }
  }

  // 메모 삭제 확인 모달 열기
  const handleDelete = (id) => {
    setDeleteConfirmId(id)
  }

  // 삭제 확인 모달 닫기
  const handleDeleteCancel = () => {
    setDeleteConfirmId(null)
  }

  // 메모 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      const response = await memoAPI.delete(deleteConfirmId)

      if (response.data.success) {
        setDeleteConfirmId(null)
        await fetchMemos()
      }
    } catch (err) {
      console.error('Failed to delete memo:', err)
      // eslint-disable-next-line no-alert
      alert('메모 삭제에 실패했습니다: ' + (err.response?.data?.message || err.message))
      setDeleteConfirmId(null)
    }
  }

  // 날짜 포맷팅 (UTC+9, 9시간 추가)
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    // 9시간(9 * 60 * 60 * 1000 밀리초) 추가
    const adjustedDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    const year = adjustedDate.getFullYear()
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0')
    const day = String(adjustedDate.getDate()).padStart(2, '0')
    const hours = String(adjustedDate.getHours()).padStart(2, '0')
    const minutes = String(adjustedDate.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // 뒤로 가기 핸들러
  const handleBack = () => {
    navigate(-1)
  }

  // 명함 디자인에 따른 헤더 배경색 가져오기
  const getHeaderBackground = () => {
    if (!card || !card.design) return 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)'
    return cardDesigns[card.design] || cardDesigns['design-1']
  }

  // 검색어로 메모 필터링
  const filteredMemos = searchQuery.trim()
    ? memos.filter((memo) =>
        memo.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : memos

  return (
    <div className="memo-page">
      {/* 헤더 영역 */}
      <div 
        className="memo-header" 
        style={{ background: getHeaderBackground() }}
      >
        <button className="memo-back-button" onClick={handleBack}>
          <BackIcon />
        </button>
        {businessCardId && card && (
          <div className="memo-header-info">
            <p className="memo-card-name">{card.name || '이름 없음'}</p>
            {(card.position || card.company) && (
              <div className="memo-header-details">
                {card.company && <p className="memo-card-company">{card.company}</p>}
                {card.company && card.position && <span className="memo-header-separator">·</span>}
                {card.position && <p className="memo-card-position">{card.position}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="memo-container">
        {!businessCardId && (
          <div className="memo-error" style={{ marginBottom: '16px' }}>
            명함 ID가 필요합니다. 명함 상세 페이지에서 접근해주세요.
          </div>
        )}
        <div className="memo-input-section">
          <textarea
            className="memo-input"
            placeholder={card && card.name ? `${card.name}님에 대한 메모를 입력하세요` : '메모를 입력하세요...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <button
            className={`memo-create-btn ${content.trim() && !isCreating ? 'active' : ''}`}
            onClick={handleCreate}
            disabled={!content.trim() || isCreating}
          >
            {isCreating ? '생성 중...' : '메모 추가'}
          </button>
        </div>

        <div className="memo-list-section">
          <div className="memo-list-header">
            <h2 className="memo-list-title">메모 목록</h2>
            <div className="memo-search-wrapper">
              <div className="memo-search-icon">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="memo-search-input"
                placeholder="메모 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="memo-list-content">
            {loading ? (
              <div className="memo-loading">메모를 불러오는 중...</div>
            ) : error ? (
              <div className="memo-error">{error}</div>
            ) : filteredMemos.length > 0 ? (
              <div className="memo-list">
                {filteredMemos.map((memo) => (
                <div key={memo.id} className="memo-item">
                  {editingId === memo.id ? (
                    <div className="memo-edit-mode">
                      <textarea
                        className="memo-edit-input"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="memo-edit-actions">
                        <button
                          className="memo-save-btn"
                          onClick={() => handleEditSave(memo.id)}
                        >
                          저장
                        </button>
                        <button
                          className="memo-cancel-btn"
                          onClick={handleEditCancel}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="memo-footer">
                        <div className="memo-date">{formatDate(memo.updated_at)}</div>
                        <div className="memo-actions">
                          <button
                            className="memo-edit-btn"
                            onClick={() => handleEditStart(memo)}
                          >
                            수정
                          </button>
                          <button
                            className="memo-delete-btn"
                            onClick={() => handleDelete(memo.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="memo-content">{memo.content}</div>
                      {deleteConfirmId === memo.id && (
                        <div className="memo-delete-overlay" onClick={handleDeleteCancel}>
                          <div className="memo-delete-modal" onClick={(e) => e.stopPropagation()}>
                            <p className="memo-delete-text">
                              이 메모를 삭제하시겠습니까?
                            </p>
                            <div className="memo-delete-buttons">
                              <button className="memo-delete-yes-btn" onClick={handleDeleteConfirm}>
                                예
                              </button>
                              <button className="memo-delete-no-btn" onClick={handleDeleteCancel}>
                                아니오
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="memo-empty">검색 결과가 없습니다.</div>
            ) : (
              <div className="memo-empty">등록된 메모가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default MemoPage
