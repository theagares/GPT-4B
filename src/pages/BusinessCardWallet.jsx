import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { giftAPI, userAPI, preferenceAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './BusinessCardWallet.css'

// 돋보기 아이콘 SVG 컴포넌트
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 19L14.65 14.65" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 연필 아이콘 SVG 컴포넌트 (수동 명함 등록)
function PenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 카메라 아이콘 SVG 컴포넌트 (OCR로 명함 추가)
function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 하트 아이콘 SVG 컴포넌트
function HeartIcon({ filled = false }) {
  if (filled) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 전체 선물 이력 데이터 (실제로는 store나 API에서 가져와야 함)..
const allGiftHistory = [
  {
    id: 1,
    cardId: 'card-park-sangmu',
    cardName: '박상무',
    giftName: '프리미엄 와인 세트',
    year: '2025'
  },
  {
    id: 2,
    cardId: 'card-1',
    cardName: '안연주',
    giftName: '명품 선물 세트',
    year: '2025'
  },
  {
    id: 3,
    cardId: 'card-2',
    cardName: '이부장',
    giftName: '꽃다발 선물',
    year: '2025'
  },
  {
    id: 4,
    cardId: 'card-3',
    cardName: '최대리',
    giftName: '초콜릿 선물 세트',
    year: '2025'
  },
  {
    id: 5,
    cardId: 'card-1',
    cardName: '안연주',
    giftName: '선물 배송 상자',
    year: '2024'
  },
  {
    id: 6,
    cardId: 'card-2',
    cardName: '이부장',
    giftName: '고급 와인 세트',
    year: '2024'
  }
]

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%), linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%), linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%), linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%), linear-gradient(147.99deg, rgba(244, 90, 170, 1) 0%, rgba(230, 55, 135, 1) 100%)',
  'design-5': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%), linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%), linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

// 페이지 배경색 맵 (명함 색상에 맞춘 연한 배경)
const pageBackgroundDesigns = {
  'design-1': 'linear-gradient(180deg, rgba(200, 195, 245, 1) 0%, rgba(168, 162, 242, 1) 50%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(180deg, rgba(191, 219, 254, 1) 0%, rgba(147, 197, 253, 1) 50%, rgba(59, 130, 246, 1) 100%)',
  'design-3': 'linear-gradient(180deg, rgba(167, 243, 208, 1) 0%, rgba(110, 231, 183, 1) 50%, rgba(16, 185, 129, 1) 100%)',
  'design-4': 'linear-gradient(180deg, rgba(252, 231, 243, 1) 0%, rgba(251, 182, 206, 1) 50%, rgba(236, 72, 153, 1) 100%)',
  'design-5': 'linear-gradient(180deg, rgba(255, 237, 213, 1) 0%, rgba(254, 215, 170, 1) 50%, rgba(249, 115, 22, 1) 100%)',
  'design-6': 'linear-gradient(180deg, rgba(221, 214, 254, 1) 0%, rgba(196, 181, 253, 1) 50%, rgba(99, 102, 241, 1) 100%)',
}

function BusinessCardWallet() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [flippingCardId, setFlippingCardId] = useState(null)
  const [isGridView, setIsGridView] = useState(location.state?.isGridView || false)
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [userName, setUserName] = useState('')
  const cards = useCardStore((state) => state.cards)
  const fetchCards = useCardStore((state) => state.fetchCards)
  const updateCard = useCardStore((state) => state.updateCard)
  const isLoading = useCardStore((state) => state.isLoading)
  
  // 터치 스와이프 관련 상태
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const minSwipeDistance = 50
  
  // DB에서 로그인한 유저의 이름 가져오기
  useEffect(() => {
    const fetchUserName = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile()
          if (response.data.success && response.data.data.name) {
            setUserName(response.data.data.name)
          }
        } catch (error) {
          console.error('Failed to fetch user name:', error)
          // 에러 발생 시 localStorage에서 가져오기 (fallback)
          const name = localStorage.getItem('userName')
          if (name) {
            setUserName(name)
          }
        }
      } else {
        // 로그인하지 않은 경우 localStorage에서 가져오기
        const name = localStorage.getItem('userName')
        if (name) {
          setUserName(name)
        }
      }
    }

    fetchUserName()
  }, [])

  // location.state에서 isGridView 확인 및 설정, refresh 확인
  useEffect(() => {
    if (location.state?.isGridView) {
      setIsGridView(true)
      // state 초기화 (뒤로가기 시 다시 열리지 않도록)
      navigate(location.pathname, { replace: true, state: {} })
    }
    
    // 명함 수정 후 새로고침
    if (location.state?.refresh && isAuthenticated()) {
      fetchCards()
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate, fetchCards])
  
  // 명함 목록 가져오기 (검색어가 변경될 때마다)
  useEffect(() => {
    if (isAuthenticated()) {
      // 검색어가 변경되면 서버에서 검색된 결과를 가져옴
      const timeoutId = setTimeout(() => {
        fetchCards(searchQuery);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [fetchCards, searchQuery])
  
  // 초기 로드 (페이지 진입 시 한 번만)
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCards();
    }
  }, []) // 빈 배열로 한 번만 실행
  
  // 페이지 포커스 시 카드 목록 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated()) {
        fetchCards();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCards])

  // 명함 정렬 함수 (하트 우선 → 가나다순)
  const sortCards = (cards) => {
    const isKorean = (char) => {
      if (!char) return false
      const code = char.charCodeAt(0)
      return code >= 0xAC00 && code <= 0xD7A3 // 한글 유니코드 범위
    }

    const isEnglish = (char) => {
      if (!char) return false
      const code = char.charCodeAt(0)
      return (code >= 0x0041 && code <= 0x005A) || // A-Z
             (code >= 0x0061 && code <= 0x007A)    // a-z
    }

    const getLanguageType = (name) => {
      if (!name || name.length === 0) return 'other'
      const firstChar = name.charAt(0)
      if (isKorean(firstChar)) return 'korean'
      if (isEnglish(firstChar)) return 'english'
      return 'other'
    }

    return [...cards].sort((a, b) => {
      // 하트 우선 정렬
      const favoriteA = a.isFavorite ? 1 : 0
      const favoriteB = b.isFavorite ? 1 : 0
      if (favoriteA !== favoriteB) {
        return favoriteB - favoriteA // 하트가 있는 것이 앞에
      }

      // 같은 하트 상태일 때만 가나다순 정렬
      const nameA = a.name || ''
      const nameB = b.name || ''
      
      if (!nameA && !nameB) return 0
      if (!nameA) return 1
      if (!nameB) return -1

      const langA = getLanguageType(nameA)
      const langB = getLanguageType(nameB)

      // 한글과 영어 구분: 한글이 먼저, 그 다음 영어, 마지막 기타
      if (langA === 'korean' && langB !== 'korean') return -1
      if (langA !== 'korean' && langB === 'korean') return 1

      if (langA === 'english' && langB !== 'english' && langB !== 'korean') return -1
      if (langA !== 'english' && langA !== 'korean' && langB === 'english') return 1

      // 둘 다 한글일 때
      if (langA === 'korean' && langB === 'korean') {
        return nameA.localeCompare(nameB, 'ko')
      }
      
      // 둘 다 영어일 때 (대소문자 무시)
      if (langA === 'english' && langB === 'english') {
        return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' })
      }

      // 기타 경우 (숫자, 특수문자 등)
      return nameA.localeCompare(nameB, 'ko')
    })
  }

  // 검색 필터링 (서버 측 검색을 사용하므로 클라이언트 측 필터링은 선택적)
  // 서버에서 이미 검색된 결과를 받으므로 필터링 불필요
  // 정렬만 적용
  const filteredCards = useMemo(() => sortCards(cards), [cards])

  const currentCard = filteredCards[currentIndex] || filteredCards[0]
  
  // 선택된 카드 찾기
  const selectedCard = selectedCardId 
    ? filteredCards.find(card => card.id === selectedCardId) || currentCard
    : currentCard

  // location.state에서 openCardId, selectCardId, refresh, refreshCards를 확인하고 처리
  useEffect(() => {
    const openCardId = location.state?.openCardId
    const selectCardId = location.state?.selectCardId
    const refreshCards = location.state?.refreshCards
    const refresh = location.state?.refresh
    
    // refresh 또는 refreshCards가 있으면 카드 목록 새로고침
    if (refresh || refreshCards) {
      if (isAuthenticated()) {
        fetchCards();
      }
    }
    
    if (filteredCards.length > 0) {
      // openCardId가 있으면 모달 열기 (refresh 후에도 처리)
      if (openCardId) {
        // refresh가 있으면 카드 새로고침 후 약간의 지연을 두고 처리
        const delay = (refresh || refreshCards) ? 300 : 0;
        setTimeout(() => {
          const cardIndex = filteredCards.findIndex(card => card.id === openCardId)
          if (cardIndex !== -1) {
            setCurrentIndex(cardIndex)
            setSelectedCardId(openCardId)
            // 부드러운 모달 열기 애니메이션
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setShowDetailModal(true)
              })
            })
          }
          // state 초기화 (뒤로가기 시 다시 열리지 않도록)
          navigate(location.pathname, { replace: true, state: {} })
        }, delay)
      }
      // selectCardId가 있으면 해당 명함으로 인덱스만 변경
      else if (selectCardId) {
        // refresh가 있으면 카드 새로고침 후 약간의 지연을 두고 처리
        const delay = (refresh || refreshCards) ? 300 : 0;
        setTimeout(() => {
          const cardIndex = filteredCards.findIndex(card => card.id === selectCardId)
          if (cardIndex !== -1) {
            setCurrentIndex(cardIndex)
            setSelectedCardId(selectCardId)
          }
          // state 초기화
          navigate(location.pathname, { replace: true, state: {} })
        }, delay)
      }
      // refresh만 있고 openCardId나 selectCardId가 없으면 state만 초기화
      else if (refresh || refreshCards) {
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [location.state, filteredCards, navigate, location.pathname, fetchCards, isAuthenticated])

  // currentIndex가 변경될 때마다 드래그 상태를 초기화하여 블러가 확실히 해제되도록 함
  useEffect(() => {
    setIsDragging(false)
    setDragOffset(0)
  }, [currentIndex])

  const handlePrev = () => {
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1))
    }
  }

  const handleNext = () => {
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1))
    }
  }

  // 터치 시작
  const onTouchStart = (e) => {
    if (isGridView) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
    setDragOffset(0)
  }

  // 터치 이동
  const onTouchMove = (e) => {
    if (isGridView || !touchStart) return
    e.preventDefault() // 스크롤 방지
    const currentX = e.targetTouches[0].clientX
    setTouchEnd(currentX)
    // 왼쪽으로 드래그하면 음수 (다음 카드 보임), 오른쪽으로 드래그하면 양수 (이전 카드 보임)
    const distance = touchStart - currentX
    setDragOffset(distance)
  }

  // 터치 종료
  const onTouchEnd = () => {
    // 상태를 먼저 초기화하여 블러가 즉시 해제되도록 함
    setIsDragging(false)
    setDragOffset(0)
    
    if (isGridView || !touchStart || !touchEnd) {
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    
    // 왼쪽으로 스와이프하면 다음 카드, 오른쪽으로 스와이프하면 이전 카드
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // 마우스 드래그 지원 (데스크톱)
  const onMouseDown = (e) => {
    if (isGridView) return
    e.preventDefault()
    setTouchStart(e.clientX)
    setIsDragging(true)
    setDragOffset(0)
  }

  const onMouseMove = (e) => {
    if (isGridView || !touchStart || !isDragging) return
    e.preventDefault()
    const currentX = e.clientX
    setTouchEnd(currentX)
    // 왼쪽으로 드래그하면 음수 (다음 카드 보임), 오른쪽으로 드래그하면 양수 (이전 카드 보임)
    const distance = touchStart - currentX
    setDragOffset(distance)
  }

  const onMouseUp = () => {
    // 상태를 먼저 초기화하여 블러가 즉시 해제되도록 함
    setIsDragging(false)
    setDragOffset(0)
    
    if (isGridView || !touchStart || !touchEnd) {
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    
    // 왼쪽으로 스와이프하면 다음 카드, 오른쪽으로 스와이프하면 이전 카드
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // 전역 마우스 이벤트 리스너 (드래그 중 마우스가 요소 밖으로 나갔을 때)
  useEffect(() => {
    if (isDragging && touchStart !== null) {
      const handleGlobalMouseMove = (e) => {
        if (isGridView || !touchStart) return
        const currentX = e.clientX
        setTouchEnd(currentX)
        // 왼쪽으로 드래그하면 음수 (다음 카드 보임), 오른쪽으로 드래그하면 양수 (이전 카드 보임)
        const distance = touchStart - currentX
        setDragOffset(distance)
      }

      const handleGlobalMouseUp = () => {
        onMouseUp()
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, touchStart, isGridView])

  const handleConfirmCard = () => {
    if (currentCard) {
      handleCardClick(currentCard.id)
    }
  }

  const handleCardClick = (cardId) => {
    // 클릭한 카드의 인덱스 찾기
    const clickedCardIndex = filteredCards.findIndex(card => card.id === cardId)
    
    // 슬라이드 뷰일 때, 클릭한 카드가 현재 활성화된 카드가 아니라면 먼저 해당 카드로 이동
    if (!isGridView && clickedCardIndex !== -1 && clickedCardIndex !== currentIndex) {
      setCurrentIndex(clickedCardIndex)
      // 슬라이드 이동 후 약간의 지연을 두고 모달 열기
      setTimeout(() => {
        setSelectedCardId(cardId)
        setFlippingCardId(cardId)
        setIsFlipping(true)
        
        // 뒤집기 애니메이션 후 모달 표시
        setTimeout(() => {
          setShowDetailModal(true)
          setIsFlipping(false)
        }, 600) // 애니메이션 시간과 맞춤
      }, 400) // 슬라이드 이동 애니메이션 시간
    } else {
      // 이미 활성화된 카드를 클릭했거나 그리드 뷰인 경우
      setSelectedCardId(cardId)
      setFlippingCardId(cardId)
      setIsFlipping(true)
      
      // 뒤집기 애니메이션 후 모달 표시
      setTimeout(() => {
        setShowDetailModal(true)
        setIsFlipping(false)
      }, 600) // 애니메이션 시간과 맞춤
    }
  }

  const handleCloseModal = () => {
    // 모달 닫기 애니메이션을 위해 약간의 지연
    const modalElement = document.querySelector('.card-detail-modal')
    if (modalElement) {
      modalElement.style.animation = 'slideDownModal 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      const overlayElement = document.querySelector('.card-detail-modal-overlay')
      if (overlayElement) {
        overlayElement.style.animation = 'fadeOutOverlay 0.3s ease-out forwards'
      }
      setTimeout(() => {
        setShowDetailModal(false)
        setFlippingCardId(null)
        setSelectedCardId(null)
      }, 300)
    } else {
      setShowDetailModal(false)
      setFlippingCardId(null)
      setSelectedCardId(null)
    }
  }

  const handleEditInfo = () => {
    if (selectedCard) {
      // Navigate to add page with card as draft for editing
      navigate('/add', { state: { draft: selectedCard } })
    }
  }

  const handleToggleFavorite = async (e, cardId) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    
    const card = cards.find(c => c.id === cardId || String(c.id) === String(cardId))
    if (!card) return
    
    const newFavoriteStatus = !card.isFavorite
    
    try {
      await updateCard(cardId, { isFavorite: newFavoriteStatus })
      // 카드 목록 새로고침하여 정렬 반영
      if (isAuthenticated()) {
        await fetchCards(searchQuery)
      }
      
      // 그리드 뷰가 아닌 경우에만 해당 명함으로 이동
      if (!isGridView) {
        // 새로고침 후 해당 명함이 보이도록 인덱스 설정
        // filteredCards가 업데이트될 시간을 주기 위해 약간의 지연
        setTimeout(() => {
          const updatedCards = useCardStore.getState().cards
          // 정렬된 카드 목록에서 인덱스 찾기
          const sortedCards = sortCards(updatedCards)
          const cardIndex = sortedCards.findIndex(c => c.id === cardId || String(c.id) === String(cardId))
          if (cardIndex !== -1) {
            setCurrentIndex(cardIndex)
          }
        }, 200) // 카드 목록 업데이트 후 인덱스 설정
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  return (
    <div className="business-card-wallet">
      {/* Fixed Header */}
      <div className="wallet-page-header">
        <div className="wallet-page-header-content">
          <p className="wallet-page-header-title">{userName ? `${userName}님의 명함집` : '명함집'}</p>
          <p className="wallet-page-header-subtitle">명함을 등록하거나 세부 내용을 수정할 수 있어요</p>
        </div>
      </div>

      <div className="wallet-container">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <div className="search-icon">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="회사명, 직급 등을 검색"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentIndex(0)
              }}
              className="search-input"
            />
          </div>
        </div>

        {/* Action Buttons and View Toggle */}
        <div className="action-buttons-section">
          <div className="header-actions">
            <button 
              className="header-action-btn"
              onClick={() => navigate('/manual-add')}
            >
              <span className="action-icon">
                <PenIcon />
              </span>
              <span className="action-label">수동 명함 등록</span>
            </button>
            <button 
              className="header-action-btn"
              onClick={() => navigate('/ocr')}
            >
              <span className="action-icon">
                <CameraIcon />
              </span>
              <span className="action-label">OCR로 명함 추가</span>
            </button>
          </div>
          {filteredCards.length > 0 && (
            <div className="view-all-section">
              <button 
                className="view-all-btn"
                onClick={() => setIsGridView(!isGridView)}
              >
                {isGridView ? '슬라이드로 보기' : '전체 펼쳐보기'}
              </button>
            </div>
          )}
        </div>

        {/* Usage Count and Guide - Below action buttons */}
        {!isGridView && (
          <div className="usage-and-guide-container">
            <div className="card-guide">
              <p className="card-guide-text">명함을 눌러 상세 정보 확인</p>
            </div>
            <div className="usage-indicator-top">
              <span className="usage-count-carousel">
                {filteredCards.length > 0 ? (
                  <>
                    <span className="usage-count-number-carousel">{currentIndex + 1}</span> / 200
                  </>
                ) : (
                  <>
                    <span className="usage-count-number-carousel">0</span> / 200
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Business Card Display */}
        {isLoading ? (
          <div className="empty-state">
            <p className="empty-message">로딩 중...</p>
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="card-carousel-section">
            {!isGridView ? (
              <>
                <div className="carousel-container">
                  <button 
                    className="carousel-nav-btn carousel-nav-prev"
                    onClick={handlePrev}
                    aria-label="Previous card"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div 
                    className="carousel-wrapper"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    style={{ touchAction: 'pan-y', userSelect: 'none' }}
                  >
                    <div className="carousel-track">
                      {filteredCards.map((card, index) => {
                        const offset = index - currentIndex
                        const isActive = index === currentIndex
                        const isVisible = Math.abs(offset) <= 1
                        
                        if (!isVisible) return null
                        
                        // 드래그 중일 때는 실시간 오프셋 적용
                        let dragTransform = 0
                        if (isDragging && isActive && dragOffset !== 0) {
                          // 드래그 거리를 퍼센트로 변환 (카드 너비의 85% 기준)
                          // 왼쪽으로 드래그하면 (dragOffset > 0) 다음 카드가 보이도록 현재 카드는 왼쪽으로 이동 (음수)
                          // 오른쪽으로 드래그하면 (dragOffset < 0) 이전 카드가 보이도록 현재 카드는 오른쪽으로 이동 (양수)
                          const cardWidthPercent = 85
                          dragTransform = -(dragOffset / (window.innerWidth * 0.85)) * cardWidthPercent
                        }
                        
                        // 블러 처리 로직
                        // - 활성화된 카드(isActive): 무조건 블러 없음
                        // - 비활성화된 카드: 항상 블러
                        let blurValue = isActive ? 'blur(0)' : 'blur(3px)'
                        
                        return (
                          <div 
                            key={card.id} 
                            className={`carousel-card ${isActive ? 'active' : ''} ${flippingCardId === card.id && isFlipping ? 'flipping' : ''} ${isDragging && isActive ? 'dragging' : ''}`}
                            style={{
                              transform: `translateX(calc(${offset * 85}% + ${dragTransform}%)) scale(${isActive ? 1 : 0.7})`,
                              opacity: isActive ? Math.max(0.3, 1 - Math.abs(dragOffset) / 200) : 0.3,
                              filter: blurValue,
                              zIndex: isActive ? 10 : 5 - Math.abs(offset),
                              transition: isDragging && isActive ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, filter 0.4s ease'
                            }}
                            onClick={(e) => {
                              // 드래그 중이 아닐 때만 클릭 처리
                              if (!isDragging && Math.abs(dragOffset) < 10) {
                                handleCardClick(card.id)
                              }
                            }}
                          >
                            <div 
                              className="business-card-display"
                              style={{
                                background: card.design && cardDesigns[card.design] 
                                  ? cardDesigns[card.design] 
                                  : cardDesigns['design-1']
                              }}
                            >
                              <div className="card-display-content">
                                <div className="card-top-section">
                                  {card.company && <p className="card-company">{card.company}</p>}
                                  <button
                                    className="card-heart-button"
                                    onClick={(e) => handleToggleFavorite(e, card.id)}
                                    aria-label={card.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                  >
                                    <HeartIcon filled={card.isFavorite || false} />
                                  </button>
                                </div>
                                <div className="card-info-section">
                                  <div>
                                    {card.position && <p className="card-position">{card.position}</p>}
                                    <h3 className="card-name">{card.name}</h3>
                                  </div>
                                </div>
                                <div className="card-bottom-section">
                                  <div className="card-contact">
                                    {card.phone && <p className="card-phone">{card.phone}</p>}
                                    {card.email && <p className="card-email">{card.email}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <button 
                    className="carousel-nav-btn carousel-nav-next"
                    onClick={handleNext}
                    aria-label="Next card"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="cards-grid">
                  {filteredCards.map((card) => (
                    <div
                      key={card.id}
                      className="grid-card-item"
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div 
                        className="grid-business-card"
                        style={{
                          background: card.design && cardDesigns[card.design] 
                            ? cardDesigns[card.design] 
                            : cardDesigns['design-1']
                        }}
                      >
                        <div className="grid-card-content">
                          <div className="grid-card-top">
                            {card.company && <p className="grid-card-company">{card.company}</p>}
                            <button
                              className="grid-card-heart-button"
                              onClick={(e) => handleToggleFavorite(e, card.id)}
                              aria-label={card.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                            >
                              <HeartIcon filled={card.isFavorite || false} />
                            </button>
                          </div>
                          {card.position && <p className="grid-card-position">{card.position}</p>}
                          <div className="grid-card-info">
                            <div>
                              <h3 className="grid-card-name">{card.name}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Usage Count - Below grid for grid view */}
                <div className="usage-indicator-bottom">
                  <span className="usage-count-grid">
                    <span className="usage-count-number-grid">{cards.length}</span> / 200
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-message">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Footer Message */}
        <div className={`wallet-footer ${isGridView ? 'grid-view-footer' : ''}`}>
          <p className="footer-text">더 많은 명함을 관리할 수 있어요</p>
          <a 
            href="#" 
            className="upgrade-link"
            onClick={(e) => {
              e.preventDefault()
              navigate('/upgrade')
            }}
          >
            gpt-4b+ 살펴보기
          </a>
        </div>
      </div>

      <BottomNavigation />

      {/* Card Detail Modal */}
      {showDetailModal && selectedCard && (
        <CardDetailModal 
          card={selectedCard} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

// Card Detail Modal Component
function CardDetailModal({ card, onClose }) {
  const [giftHistoryCount, setGiftHistoryCount] = useState(0)
  const [isLoadingGifts, setIsLoadingGifts] = useState(false)
  const [preferences, setPreferences] = useState({ likes: [], dislikes: [], uncertain: [] })
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [expandedEvidence, setExpandedEvidence] = useState({})
  const [activeTab, setActiveTab] = useState('info') // 'info' or 'preferences'
  const navigate = useNavigate()
  const deleteCard = useCardStore((state) => state.deleteCard)
  
  // null이나 빈 값을 "-"로 표시하는 헬퍼 함수
  const displayValue = (value) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
      return '-'
    }
    return value
  }
  
  useEffect(() => {
    if (!card) {
      setGiftHistoryCount(0)
      return
    }
    
    const loadGiftHistoryCount = async () => {
      if (!isAuthenticated()) {
        setGiftHistoryCount(0)
        return
      }

      setIsLoadingGifts(true)
      try {
        // card.id를 숫자로 변환 (DB의 cardId는 INT 타입)
        let cardId = card.id
        if (typeof cardId === 'string') {
          cardId = parseInt(cardId, 10)
          if (isNaN(cardId)) {
            throw new Error('Invalid card ID format')
          }
        }

        // DB에서 해당 명함의 모든 선물 이력 가져오기
        const response = await giftAPI.getAll({ cardId: String(cardId) })
        
        if (response.data && response.data.success) {
          const giftsData = Array.isArray(response.data.data) ? response.data.data : []
          setGiftHistoryCount(giftsData.length)
        } else {
          setGiftHistoryCount(0)
        }
      } catch (error) {
        console.error('Failed to load gift history count:', error)
        setGiftHistoryCount(0)
      } finally {
        setIsLoadingGifts(false)
      }
    }
    
    loadGiftHistoryCount()
    loadPreferences()
  }, [card])

  // Load preferences
  const loadPreferences = async () => {
    if (!card || !isAuthenticated()) {
      setPreferences({ likes: [], dislikes: [], uncertain: [] })
      return
    }

    setIsLoadingPreferences(true)
    try {
      const cardId = typeof card.id === 'string' ? parseInt(card.id, 10) : card.id
      if (isNaN(cardId)) {
        setPreferences({ likes: [], dislikes: [], uncertain: [] })
        return
      }

      const response = await preferenceAPI.getPreferences(cardId)
      if (response.data && response.data.success) {
        setPreferences(response.data.data || { likes: [], dislikes: [], uncertain: [] })
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      setPreferences({ likes: [], dislikes: [], uncertain: [] })
    } finally {
      setIsLoadingPreferences(false)
    }
  }

  // Rebuild preferences
  const handleRebuildPreferences = async () => {
    if (!card || !isAuthenticated() || isRebuilding) return

    setIsRebuilding(true)
    try {
      const cardId = typeof card.id === 'string' ? parseInt(card.id, 10) : card.id
      if (isNaN(cardId)) {
        alert('Invalid card ID')
        return
      }

      const response = await preferenceAPI.rebuildPreferences(cardId, 50)
      if (response.data && response.data.success) {
        setPreferences(response.data.data || { likes: [], dislikes: [], uncertain: [] })
      }
    } catch (error) {
      console.error('Failed to rebuild preferences:', error)
      alert('프로필 갱신에 실패했습니다: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsRebuilding(false)
    }
  }

  // Toggle evidence expansion
  const toggleEvidence = (category, index) => {
    const key = `${category}-${index}`
    setExpandedEvidence(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleCustomize = () => {
    navigate('/customize', { state: { card } })
  }

  const handleDelete = () => {
    if (window.confirm(`${card.name}님의 명함을 삭제하시겠습니까?`)) {
      deleteCard(card.id)
      onClose()
    }
  }

  const handleCall = () => {
    if (card.phone) {
      window.location.href = `tel:${card.phone.replace(/-/g, '')}`
    }
  }

  const handleEmail = () => {
    if (card.email) {
      window.location.href = `mailto:${card.email}`
    }
  }

  const handleGiftRecommend = () => {
    // 선물 추천 받기 페이지로 이동
    navigate('/gift-recommend', { state: { card } })
  }

  const handleGiftHistory = () => {
    // 해당 명함의 선물 히스토리 페이지로 이동 (새로운 독립적인 페이지)
    navigate('/business-card/gift-history', { state: { card } })
  }

  const handleEditInfo = () => {
    if (card) {
      // Navigate to add page with card as draft for editing
      navigate('/add', { state: { draft: card } })
    }
  }

  // 모달 배경색 (명함 디자인에 맞춤)
  const modalBackground = card?.design 
    ? pageBackgroundDesigns[card.design] || pageBackgroundDesigns['design-1']
    : pageBackgroundDesigns['design-1']

  // 프로필 카드 배경색 (명함 디자인에 맞춤)
  const profileCardBackground = card?.design 
    ? cardDesigns[card.design] || cardDesigns['design-1']
    : cardDesigns['design-1']

  return (
    <div className="card-detail-modal-overlay" onClick={onClose}>
      <div 
        className="card-detail-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: modalBackground
        }}
      >
        {/* Top Navigation */}
        <div className="modal-top-nav">
          <button className="modal-back-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 삭제 버튼 및 커스텀 버튼 - 명함 위 */}
        <div className="modal-delete-section-top">
          <button className="modal-delete-button-top" onClick={handleDelete}>
            명함 삭제하기
          </button>
          <button className="modal-customize-button" onClick={handleCustomize}>
            명함 커스텀하기
          </button>
        </div>

        {/* Main Card Info */}
        <div 
          className="modal-main-card"
          style={{
            background: profileCardBackground
          }}
        >
          {/* 우측 상단 연락처 정보 */}
          <div className="modal-profile-contact">
            {displayValue(card.phone) !== '-' && <p className="modal-profile-phone">{displayValue(card.phone)}</p>}
            {displayValue(card.email) !== '-' && <p className="modal-profile-email">{displayValue(card.email)}</p>}
          </div>

          {/* 상단 소속 정보 */}
          {displayValue(card.company) !== '-' && <p className="modal-profile-company">{displayValue(card.company)}</p>}

          <div className="modal-profile-section">
            <div className="modal-profile-left">
              <div className="modal-profile-info">
                {displayValue(card.position) !== '-' && <p className="modal-profile-position">{displayValue(card.position)}</p>}
                <h2 className="modal-profile-name">
                  {card.name}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Edit Button - Bottom right of card */}
          <button className="modal-edit-button" onClick={handleEditInfo}>
            정보 수정
          </button>
        </div>

        {/* Action Buttons */}
        <div className="modal-action-buttons">
          <button className="modal-gift-card-button" onClick={handleGiftHistory}>
            <div className="gift-card-content-wrapper">
              <div className="gift-card-info">
                <div className="gift-card-label-row">
                  <svg className="gift-card-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="10" height="8" rx="0.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 8L8 11L13 8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 11V14" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 4.5L5.5 8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.5 4.5L10.5 8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 4.5L8 2.5L10.5 4.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8" cy="5.5" r="0.8" fill="#0a0a0a"/>
                  </svg>
                  <span className="gift-card-label">선물 이력</span>
                </div>
                <p className="gift-card-value gift-card-value-left">{giftHistoryCount}회</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-card-arrow">
                <path d="M9 18L15 12L9 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/memo?businessCardId=${card.id}`)}
            className="action-btn action-btn-primary modal-memo-button"
          >
            <svg className="memo-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H13C13.5523 3 14 3.44772 14 4V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4C2 3.44772 2.44772 3 3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            메모
          </button>
        </div>

        {/* Tab Selection */}
        <div className="modal-tab-container">
          <div className="modal-tab-wrapper">
            <button
              type="button"
              className={`modal-tab-button ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              명함 정보
            </button>
            <button
              type="button"
              className={`modal-tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              선호도 프로필
            </button>
          </div>
        </div>

        {/* Business Card Information Section */}
        {activeTab === 'info' && (
        <div className="modal-info-section">
          <div className="modal-info-card">
            {/* Phone Number */}
            <div className="modal-info-row">
              <span className="info-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6667 11.28V13.28C14.6667 13.68 14.3467 14 13.9467 14C6.26667 14 0 7.73333 0 0.0533333C0 -0.346667 0.32 -0.666667 0.72 -0.666667H2.72C3.12 -0.666667 3.44 -0.346667 3.44 0.0533333C3.44 0.72 3.52 1.36 3.65333 1.97333C3.76 2.26667 3.73333 2.61333 3.52 2.85333L2.42667 3.94667C3.22667 5.70667 4.29333 6.77333 6.05333 7.57333L7.14667 6.48C7.38667 6.26667 7.73333 6.24 8.02667 6.34667C8.64 6.48 9.28 6.56 9.94667 6.56C10.3467 6.56 10.6667 6.88 10.6667 7.28V9.28C10.6667 9.68 10.3467 10 9.94667 10H14.6667Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="info-content">
                <span className="info-label">전화번호</span>
                <span className="info-value">{displayValue(card.phone)}</span>
              </div>
              {displayValue(card.phone) !== '-' && <button className="info-action-button" onClick={handleCall}>전화</button>}
            </div>
            <div className="info-divider"></div>

            {/* Email */}
            <div className="modal-info-row">
              <span className="info-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.66667 2.66667H13.3333C14.0667 2.66667 14.6667 3.26667 14.6667 4V12C14.6667 12.7333 14.0667 13.3333 13.3333 13.3333H2.66667C1.93333 13.3333 1.33333 12.7333 1.33333 12V4C1.33333 3.26667 1.93333 2.66667 2.66667 2.66667Z" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.6667 4L8 8.66667L1.33333 4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="info-content">
                <span className="info-label">이메일</span>
                <span className="info-value">{displayValue(card.email)}</span>
              </div>
              {displayValue(card.email) !== '-' && <button className="info-action-button" onClick={handleEmail}>메일</button>}
            </div>
            <div className="info-divider"></div>

            {/* Gender/Position/Department */}
            <div className="modal-info-row">
              <span className="info-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="5" r="2.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 14C3 11 5 10 8 10C11 10 13 11 13 14" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="info-content">
                <span className="info-label">성별 / 소속 / 직급</span>
                <span className="info-value">
                  {(() => {
                    const genderDisplay = card.gender === '남성' ? 'M' : card.gender === '여성' ? 'F' : '-';
                    const parts = [genderDisplay];
                    parts.push(displayValue(card.company));
                    parts.push(displayValue(card.position));
                    return parts.join(' / ');
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Preferences Section */}
        {activeTab === 'preferences' && (
        <div className="modal-preferences-section">
          <div className="modal-preferences-header">
            <button
              type="button"
              onClick={handleRebuildPreferences}
              disabled={isRebuilding}
              className="modal-rebuild-button"
            >
              {isRebuilding ? '갱신 중...' : '프로필 갱신'}
            </button>
          </div>

          {isLoadingPreferences ? (
            <div className="modal-preferences-loading">선호도를 불러오는 중...</div>
          ) : (
            <div className="modal-preferences-content">
              {/* Likes */}
              {preferences.likes && preferences.likes.length > 0 && (
                <div className="modal-preferences-category">
                  <h4 className="modal-preferences-category-title">
                    <span className="preference-like-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="7" cy="8" r="1" fill="#0a0a0a"/>
                        <circle cx="13" cy="8" r="1" fill="#0a0a0a"/>
                        <path d="M6 13C6 13 7.5 15 10 15C12.5 15 14 13 14 13" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span> 좋아함
                  </h4>
                  <div className="modal-preferences-chips">
                    {preferences.likes.map((item, index) => (
                      <div key={`like-${index}`} className="preference-chip preference-chip-like">
                        <span className="preference-chip-item">{item.item}</span>
                        {item.evidence && item.evidence.length > 0 && (
                          <div className="preference-chip-evidence-wrapper">
                            <button
                              type="button"
                              className="preference-chip-evidence-toggle"
                              title="증거 보기"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 5V6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 8V11" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="preference-chip-evidence">
                              {item.evidence.map((ev, evIndex) => (
                                <div key={evIndex} className="preference-evidence-item">
                                  "{ev}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dislikes */}
              {preferences.dislikes && preferences.dislikes.length > 0 && (
                <div className="modal-preferences-category">
                  <h4 className="modal-preferences-category-title">
                    <span className="preference-dislike-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="7" cy="8" r="1" fill="#0a0a0a"/>
                        <circle cx="13" cy="8" r="1" fill="#0a0a0a"/>
                        <path d="M6 13C6 13 7.5 11 10 11C12.5 11 14 13 14 13" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span> 싫어함
                  </h4>
                  <div className="modal-preferences-chips">
                    {preferences.dislikes.map((item, index) => (
                      <div key={`dislike-${index}`} className="preference-chip preference-chip-dislike">
                        <span className="preference-chip-item">{item.item}</span>
                        {item.evidence && item.evidence.length > 0 && (
                          <div className="preference-chip-evidence-wrapper">
                            <button
                              type="button"
                              className="preference-chip-evidence-toggle"
                              title="증거 보기"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 5V6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 8V11" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="preference-chip-evidence">
                              {item.evidence.map((ev, evIndex) => (
                                <div key={evIndex} className="preference-evidence-item">
                                  "{ev}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uncertain */}
              {preferences.uncertain && preferences.uncertain.length > 0 && (
                <div className="modal-preferences-category">
                  <h4 className="modal-preferences-category-title">
                    <span className="preference-uncertain-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3.5C7 2.5 7.5 1.5 8.5 1.5C9.5 1.5 10 2 10 3C10 4 9.5 4.5 9 5C8.5 5.5 8 6 8 7V8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="12" r="1" fill="#0a0a0a"/>
                      </svg>
                    </span> 불확실
                  </h4>
                  <div className="modal-preferences-chips">
                    {preferences.uncertain.map((item, index) => (
                      <div key={`uncertain-${index}`} className="preference-chip preference-chip-uncertain">
                        <span className="preference-chip-item">{item.item}</span>
                        {item.evidence && item.evidence.length > 0 && (
                          <div className="preference-chip-evidence-wrapper">
                            <button
                              type="button"
                              className="preference-chip-evidence-toggle"
                              title="증거 보기"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 5V6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 8V11" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="preference-chip-evidence">
                              {item.evidence.map((ev, evIndex) => (
                                <div key={evIndex} className="preference-evidence-item">
                                  "{ev}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!preferences.likes || preferences.likes.length === 0) &&
               (!preferences.dislikes || preferences.dislikes.length === 0) &&
               (!preferences.uncertain || preferences.uncertain.length === 0) && (
                <div className="modal-preferences-empty">
                  선호도 정보가 없습니다. 메모를 작성한 후 "프로필 갱신" 버튼을 눌러주세요.
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

export default BusinessCardWallet

