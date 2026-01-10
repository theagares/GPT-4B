import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { memoAPI } from '../utils/api'
import { isAuthenticated, getUser } from '../utils/auth'
import { useCardStore } from '../store/cardStore'
import './MemoPage.css'

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
  const user = getUser()
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

    fetchMemos()
  }, [businessCardId, user?.id])

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

  // 메모 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await memoAPI.delete(id)

      if (response.data.success) {
        await fetchMemos()
      }
    } catch (err) {
      console.error('Failed to delete memo:', err)
      // eslint-disable-next-line no-alert
      alert('메모 삭제에 실패했습니다: ' + (err.response?.data?.message || err.message))
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  return (
    <div className="memo-page">
      <div className="logo-header">
        <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="memo-logo" />
      </div>

      <div className="memo-container">
        {!businessCardId && (
          <div className="memo-error" style={{ marginBottom: '16px' }}>
            명함 ID가 필요합니다. 명함 상세 페이지에서 접근해주세요.
          </div>
        )}
        {businessCardId && card && (
          <div className="memo-card-info">
            <h3 className="memo-card-title">현재 명함</h3>
            <p className="memo-card-name">{card.name || '이름 없음'}</p>
            {card.company && <p className="memo-card-company">{card.company}</p>}
          </div>
        )}
        <div className="memo-input-section">
          <textarea
            className="memo-input"
            placeholder="메모를 입력하세요..."
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
          <h2 className="memo-list-title">메모 목록</h2>
          {loading ? (
            <div className="memo-loading">메모를 불러오는 중...</div>
          ) : error ? (
            <div className="memo-error">{error}</div>
          ) : memos.length > 0 ? (
            <div className="memo-list">
              {memos.map((memo) => (
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
                      <div className="memo-content">{memo.content}</div>
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
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="memo-empty">등록된 메모가 없습니다.</div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default MemoPage
