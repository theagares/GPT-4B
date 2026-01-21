import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
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
  const location = useLocation()
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
  const [isListening, setIsListening] = useState(false)
  const [isListeningEdit, setIsListeningEdit] = useState(false)
  const [isSTTSupported, setIsSTTSupported] = useState(false)
  const recognitionRef = useRef(null)
  const recognitionEditRef = useRef(null)
  const processedFinalRef = useRef('')
  const processedFinalEditRef = useRef('')
  const user = getUser()
  const fetchCards = useCardStore((state) => state.fetchCards)
  
  // 초기 검색어 설정 (다른 페이지에서 넘어온 경우)
  useEffect(() => {
    if (location.state?.initialSearchQuery) {
      setSearchQuery(location.state.initialSearchQuery)
      // state 초기화는 하지 않음 (뒤로가기 등의 동작을 위해 유지하거나, 필요시 location state clear)
    }
  }, [location.state])
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

  // STT 지원 여부 확인 및 초기화 (메모 작성용)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSTTSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = 'ko-KR'
      recognition.continuous = false
      recognition.interimResults = true
      
      recognition.onstart = () => {
        setIsListening(true)
        processedFinalRef.current = '' // 초기화
      }
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        
        // 최종 결과만 수집
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        // 최종 결과가 있고 아직 처리하지 않은 경우에만 추가
        if (finalTranscript && finalTranscript !== processedFinalRef.current) {
          setIsListening(false)
          processedFinalRef.current = finalTranscript // 처리된 결과 저장
          setContent(prev => {
            // 기존 텍스트에 최종 결과만 한 번 추가
            return prev ? `${prev} ${finalTranscript}` : finalTranscript
          })
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          alert('음성이 감지되지 않았습니다. 다시 시도해주세요.')
        } else if (event.error === 'not-allowed') {
          alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        }
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // STT 지원 여부 확인 및 초기화 (메모 수정용)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'ko-KR'
      recognition.continuous = false
      recognition.interimResults = true
      
      recognition.onstart = () => {
        setIsListeningEdit(true)
        processedFinalEditRef.current = '' // 초기화
      }
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        
        // 최종 결과만 수집
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        // 최종 결과가 있고 아직 처리하지 않은 경우에만 추가
        if (finalTranscript && finalTranscript !== processedFinalEditRef.current) {
          setIsListeningEdit(false)
          processedFinalEditRef.current = finalTranscript // 처리된 결과 저장
          setEditContent(prev => {
            // 기존 텍스트에 최종 결과만 한 번 추가
            return prev ? `${prev} ${finalTranscript}` : finalTranscript
          })
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error (edit):', event.error)
        setIsListeningEdit(false)
        if (event.error === 'no-speech') {
          alert('음성이 감지되지 않았습니다. 다시 시도해주세요.')
        } else if (event.error === 'not-allowed') {
          alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        }
      }
      
      recognition.onend = () => {
        setIsListeningEdit(false)
      }
      
      recognitionEditRef.current = recognition
    }
    
    return () => {
      if (recognitionEditRef.current) {
        recognitionEditRef.current.stop()
      }
    }
  }, [])

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

  // STT 시작/중지 (메모 작성용)
  const toggleListening = () => {
    if (!isSTTSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }
    
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        alert('음성 인식을 시작할 수 없습니다.')
      }
    }
  }

  // STT 시작/중지 (메모 수정용)
  const toggleListeningEdit = () => {
    if (!isSTTSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }
    
    if (isListeningEdit) {
      recognitionEditRef.current?.stop()
      setIsListeningEdit(false)
    } else {
      try {
        recognitionEditRef.current?.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        alert('음성 인식을 시작할 수 없습니다.')
      }
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
    // 스케줄 종료 팝업에서 온 경우, dashboard로 돌아가면서 팝업 복원
    if (location.state?.returnToEndedPopup && location.state?.popupState) {
      navigate('/dashboard', { 
        state: { 
          returnToEndedPopup: true,
          popupState: location.state.popupState
        } 
      })
    } else if (location.state?.returnToDashboard && location.state?.popupState) {
      // dashboard에서 팝업을 보고 온 경우, dashboard로 돌아가면서 팝업 복원
      navigate('/dashboard', { 
        state: { 
          returnToDashboard: true,
          popupState: location.state.popupState
        } 
      })
    } else if (location.state?.returnToModal && location.state?.cardId) {
      // 명함 상세 모달에서 온 경우, 명함 상세 모달로 복귀
      navigate('/business-cards', { 
        state: { 
          openCardId: location.state.cardId 
        } 
      })
    } else {
      // 일반적인 경우: 브라우저 히스토리로 뒤로가기
      navigate(-1)
    }
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
          <div className="memo-input-wrapper">
            <textarea
              className="memo-input"
              placeholder={card && card.name ? `${card.name}님에 대한 메모를 입력하세요` : '메모를 입력하세요...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              disabled={isListening}
            />
            {isSTTSupported && (
              <button
                className={`memo-mic-button ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={isCreating}
                title={isListening ? '음성 인식 중...' : '음성으로 입력'}
              >
                {isListening ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}
          </div>
          <button
            className={`memo-create-btn ${content.trim() && !isCreating ? 'active' : ''}`}
            onClick={handleCreate}
            disabled={!content.trim() || isCreating || isListening}
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
                      <div className="memo-edit-input-wrapper">
                        <textarea
                          className="memo-edit-input"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          disabled={isListeningEdit}
                        />
                        {isSTTSupported && (
                          <button
                            className={`memo-mic-button memo-mic-button-edit ${isListeningEdit ? 'listening' : ''}`}
                            onClick={toggleListeningEdit}
                            title={isListeningEdit ? '음성 인식 중...' : '음성으로 입력'}
                          >
                            {isListeningEdit ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="memo-edit-actions">
                        <button
                          className="memo-save-btn"
                          onClick={() => handleEditSave(memo.id)}
                          disabled={isListeningEdit}
                        >
                          저장
                        </button>
                        <button
                          className="memo-cancel-btn"
                          onClick={handleEditCancel}
                          disabled={isListeningEdit}
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
