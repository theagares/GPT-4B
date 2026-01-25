import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { userAPI, calendarAPI, cardAPI, searchAPI } from '../utils/api'
import { isAuthenticated, getUser } from '../utils/auth'
import api from '../utils/api'
import './LandingPage.css'

// 명함 디자인별 배경색 맵 (MemoPage.jsx와 동일한 그라데이션 사용)
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(244, 90, 170, 1) 0%, rgba(230, 55, 135, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

// 인기 선물 데이터 (PopularGiftsPage와 동일한 데이터, 상위 5개만 표시)
const popularGifts = [
  {
    id: 1,
    rank: '#1',
    image: "https://shop-phinf.pstatic.net/20241026_151/17299254937003uih3_JPEG/6412801823777166_1731722875.jpg?type=m450",
    category: '캔들디퓨저',
    categoryColor: '#584cdc',
    name: '명품 고급 호텔 대형 백화점 대용량 실내 디퓨저 거실 현관 사무실 방향제 집들이 선물세트',
    price: '42000원',
    popularity: '인기 95%',
    url: 'https://m.shopping.naver.com/gift/products/4856091300'
  },
  {
    id: 2,
    rank: '#2',
    image: "https://shop-phinf.pstatic.net/20250806_115/1754462546764Npyyg_JPEG/86041343686824065_896651263.jpg?type=m450",
    category: '한우',
    categoryColor: '#584cdc',
    name: '[선물세트] 1++ 프리미엄 등급 한우 선물세트 / 등심600g + 부채살200g + 살치100g / 스킨포장 선물포장 명절 추석 설날 [원산지:국산]',
    price: '110,000원',
    popularity: '인기 95%',
    url: 'https://shopping.naver.com/gift/products/12210479933'
  },
  {
    id: 3,
    rank: '#3',
    image: "https://shop-phinf.pstatic.net/20250723_284/1753258518569xPQGb_JPEG/91339375597969581_1547240416.jpg?type=m450",
    category: '건강식품',
    categoryColor: '#584cdc',
    name: '고려은단 퓨어 밀크씨슬 180정, 1개 (6개월분) [원산지:상품 상세페이지 참조]',
    price: '24,900원',
    popularity: '인기 94%',
    url: 'https://shopping.naver.com/gift/products/11243018665'
  },
  {
    id: 4,
    rank: '#4',
    image: "https://shop-phinf.pstatic.net/20250328_105/1743139211350t11HM_PNG/33910072260525099_1890313163.png?type=m450",
    category: '과일',
    categoryColor: '#584cdc',
    name: '과일바구니 명절 추석선물세트 이바지 예단 상견례 승진축하 수원 분당 용인 [원산지:국산]',
    price: '56,000원',
    popularity: '인기 94%',
    url: 'https://shopping.naver.com/gift/products/11648536781'
  },
  {
    id: 5,
    rank: '#5',
    image: "https://shop-phinf.pstatic.net/20251114_240/1763101191530LmtpF_JPEG/17276444317271649_441517793.jpg?type=m450",
    category: '디지털가전',
    categoryColor: '#584cdc',
    name: '돌체구스토 네오 카페 캡슐 커피머신 + 네오 캡슐보관함 + 스타벅스 시그니처 데비 텀블러 473ml 증정',
    price: '119,000원',
    popularity: '인기 93%',
    url: 'https://m.shopping.naver.com/gift/products/12179079303'
  }
]

// 웃는 표정 아이콘 SVG 컴포넌트
function SmileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
    </svg>
  )
}

// 싫은 표정 아이콘 SVG 컴포넌트
function FrownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
    </svg>
  )
}

// 명함 아이콘 SVG 컴포넌트
function BusinessCardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* 왼쪽: 사람 아이콘 */}
      <circle cx="8" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M5 17C5 15.5 6.5 14 8 14C9.5 14 11 15.5 11 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* 오른쪽: 가로줄 두 줄 */}
      <path d="M16 12.5H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 15.5H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// 펜과 종이 아이콘 SVG 컴포넌트
function PenPaperIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 15L11 17L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 물음표 아이콘 SVG 컴포넌트
function QuestionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')
  const [showCardCompleteModal, setShowCardCompleteModal] = useState(false)
  const cards = useCardStore((state) => state.cards)
  
  // 검색 관련 state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSTTSupported, setIsSTTSupported] = useState(false)
  const recognitionRef = useRef(null)
  const handleSearchRef = useRef(null)
  
  // 광고 슬라이드 관련 state
  // 인덱스 구조: 0=마지막 복제본, 1~n=실제 이미지, n+1=첫 번째 복제본
  const [currentAdIndex, setCurrentAdIndex] = useState(1) // 실제 첫 번째 이미지부터 시작
  const adImages = [
    '/assets/명함관리 기능홍보.png',
    '/assets/선물추천 기능홍보.png',
    '/assets/캘린더 기능홍보.png'
  ]

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

  // Welcome 페이지에서 온 경우 팝업 표시
  useEffect(() => {
    if (location.state?.showCardCompleteModal) {
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} })
      // 약간의 지연 후 팝업 표시
      setTimeout(() => {
        setShowCardCompleteModal(true)
      }, 300)
    }
  }, [location.state, navigate, location.pathname])

  // 메모 페이지 또는 명함 등록 페이지에서 돌아온 경우 스케줄 종료 팝업 복원
  useEffect(() => {
    if (location.state?.returnToEndedPopup && location.state?.popupState) {
      const popupState = location.state.popupState
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} })
      
      // 약간의 지연 후 팝업 복원 및 명함 정보 업데이트
      setTimeout(async () => {
        let updatedEventInfo = popupState.endedEventInfo
        
        // 새로 등록된 명함이 있는 경우 참여자별 명함 정보 업데이트
        if (popupState.savedCardId && popupState.savedCardName) {
          const participantCardMap = new Map(popupState.endedEventInfo.participantCardMap || [])
          // 새로 등록된 명함 추가
          participantCardMap.set(popupState.savedCardName.trim(), popupState.savedCardId)
          
          updatedEventInfo = {
            ...popupState.endedEventInfo,
            participantCardMap: participantCardMap,
            hasLinkedCard: updatedEventInfo.participantsList?.every(name => 
              participantCardMap.has(name.trim())
            ) || false
          }
        } else {
          // 명함 등록이 아닌 경우 (메모 작성에서 돌아온 경우) 명함 정보 다시 불러오기
          try {
            const participantsList = updatedEventInfo.participantsList || []
            const participantCardMap = new Map()
            
            // 모든 명함 검색하여 참여자 이름으로 매칭
            const allCardsResponse = await cardAPI.getAll({})
            if (allCardsResponse.data.success && allCardsResponse.data.data) {
              const allCards = allCardsResponse.data.data || []
              
              for (const participantName of participantsList) {
                const trimmedName = participantName.trim()
                const matchingCard = allCards.find(card => 
                  card.name && card.name.trim() === trimmedName
                )
                if (matchingCard) {
                  participantCardMap.set(trimmedName, matchingCard.id)
                }
              }
            }
            
            updatedEventInfo = {
              ...updatedEventInfo,
              participantCardMap: participantCardMap,
              hasLinkedCard: participantsList.every(name => 
                participantCardMap.has(name.trim())
              )
            }
          } catch (err) {
            console.error('Failed to refresh card info:', err)
          }
        }
        
        setEndedEventInfo(updatedEventInfo)
        setShowEndedEventPopup(true)
      }, 300)
    }
  }, [location.state, navigate, location.pathname])

  // 메모 페이지에서 돌아온 경우 팝업 복원
  useEffect(() => {
    if (location.state?.returnToDashboard && location.state?.popupState) {
      const popupState = location.state.popupState
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} })
      // 약간의 지연 후 팝업 복원
      setTimeout(() => {
        setCardInfoList(popupState.cardInfoList || [])
        setCurrentCardIndex(popupState.currentCardIndex || 0)
        setSelectedCardInfo(popupState.cardInfoList?.[popupState.currentCardIndex || 0] || null)
        setShowCardInfoModal(true)
      }, 300)
    }
  }, [location.state, navigate, location.pathname])

  const handleGoToMy = () => {
    setShowCardCompleteModal(false)
    navigate('/my')
  }

  const handleCloseModal = () => {
    setShowCardCompleteModal(false)
  }

  const [alerts, setAlerts] = useState([])
  
  // 5분 전 알람 관련 state
  const [upcomingAlerts, setUpcomingAlerts] = useState([])
  const [showUpcomingAlertPopup, setShowUpcomingAlertPopup] = useState(false)
  const [currentUpcomingAlert, setCurrentUpcomingAlert] = useState(null)
  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => {
    // localStorage에서 닫힌 팝업 ID 목록 불러오기
    try {
      const saved = localStorage.getItem('dismissedUpcomingAlertIds')
      if (saved) {
        const ids = JSON.parse(saved)
        return new Set(ids)
      }
    } catch (err) {
      console.error('Failed to load dismissed alert ids:', err)
    }
    return new Set()
  })
  
  // 명함 정보 모달 관련 state
  const [showCardInfoModal, setShowCardInfoModal] = useState(false)
  const [selectedCardInfo, setSelectedCardInfo] = useState(null)
  const [cardInfoList, setCardInfoList] = useState([]) // 여러 명의 명함 정보 배열
  const [currentCardIndex, setCurrentCardIndex] = useState(0) // 현재 보여지는 명함 인덱스
  const [loadingCardInfo, setLoadingCardInfo] = useState(false)
  
  // 스케줄 종료 팝업 관련 state
  const [showEndedEventPopup, setShowEndedEventPopup] = useState(false)
  const [endedEventInfo, setEndedEventInfo] = useState(null)
  
  // localStorage에서 처리된 이벤트 목록 불러오기
  const loadProcessedEvents = () => {
    try {
      const saved = localStorage.getItem('processedEndedEvents')
      if (saved) {
        const eventIds = JSON.parse(saved)
        return new Set(eventIds)
      }
    } catch (err) {
      console.error('Failed to load processed events:', err)
    }
    return new Set()
  }
  
  // 처리된 이벤트 목록을 localStorage에 저장
  const saveProcessedEvents = (eventsSet) => {
    try {
      const eventIds = Array.from(eventsSet)
      localStorage.setItem('processedEndedEvents', JSON.stringify(eventIds))
    } catch (err) {
      console.error('Failed to save processed events:', err)
    }
  }
  
  const [processedEndedEvents, setProcessedEndedEvents] = useState(() => loadProcessedEvents())

  // 알림 시간 계산 함수
  const calculateNotificationTime = (eventStartDate, notificationSetting) => {
    if (!notificationSetting || notificationSetting === '없음') return null

    const startDate = new Date(eventStartDate)
    let notificationTime = new Date(startDate)

    // 알림 설정에 따라 시간 계산 (밀리초 단위로 정확하게 계산)
    if (notificationSetting.includes('분 전')) {
      const minutes = parseInt(notificationSetting.replace('분 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (minutes * 60 * 1000))
    } else if (notificationSetting.includes('시간 전')) {
      const hours = parseInt(notificationSetting.replace('시간 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (hours * 60 * 60 * 1000))
    } else if (notificationSetting.includes('일 전')) {
      const days = parseInt(notificationSetting.replace('일 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (days * 24 * 60 * 60 * 1000))
    } else if (notificationSetting.includes('주 전')) {
      const weeks = parseInt(notificationSetting.replace('주 전', ''))
      notificationTime.setTime(notificationTime.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000))
    }

    return notificationTime
  }

  // 알림 텍스트 생성 함수
  const generateAlertText = (event) => {
    const now = new Date()
    
    // 알림 시간 계산
    const notificationTime = calculateNotificationTime(event.startDate, event.notification)
    
    // participants가 문자열인 경우 배열로 변환
    let participantsList = event.participants
    if (typeof participantsList === 'string' && participantsList.trim() !== '') {
      participantsList = participantsList.split(',').map(p => p.trim()).filter(p => p)
    } else if (!Array.isArray(participantsList)) {
      participantsList = []
    }

    // 참가자 이름 형식화 (모든 참가자 표시)
    let participantText = ''
    if (participantsList && participantsList.length > 0) {
      if (participantsList.length === 1) {
        participantText = `${participantsList[0]} 님과의`
      } else if (participantsList.length === 2) {
        // 2명일 때: "김승준, 장서진 님과의" 형식
        const names = participantsList.slice(0, -1).join(', ')
        const lastName = participantsList[participantsList.length - 1]
        participantText = `${names}, ${lastName} 님과의`
      } else {
        // 3명 이상일 때: "OO님, OO님 외 n명과의" 형식
        const firstTwo = participantsList.slice(0, 2).join('님, ') + '님'
        const remainingCount = participantsList.length - 2
        participantText = `${firstTwo} 외 ${remainingCount}명과의`
      }
    }

    // 이벤트 시작 시간에서 현재 시간까지 남은 시간 계산
    const startDate = new Date(event.startDate)
    const diffTime = startDate - now
    
    // 이미 지난 일정인 경우
    if (diffTime <= 0) {
      if (participantText) {
        return `${participantText} ${event.title} 일정이 지났습니다.`
      } else {
        return `${event.title} 일정이 지났습니다.`
      }
    }

    // 남은 시간 계산
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const remainingHours = diffHours - (diffDays * 24) // 일수를 제외한 남은 시간
    const remainingMinutes = diffMinutes - (diffHours * 60) // 시간을 제외한 남은 분
    const diffWeeks = Math.floor(diffDays / 7)

    let timeText = ''
    
    // 주 단위로 표시 (7일 이상)
    if (diffWeeks > 0) {
      const remainingDays = diffDays - (diffWeeks * 7)
      if (remainingDays > 0) {
        timeText = `${diffWeeks}주 ${remainingDays}일 전입니다`
      } else {
        timeText = `${diffWeeks}주 전입니다`
      }
    }
    // 일과 시간을 함께 표시 (24시간 이상)
    else if (diffDays > 0) {
      if (remainingHours > 0) {
        timeText = `${diffDays}일 ${remainingHours}시간 전입니다`
      } else {
        timeText = `${diffDays}일 전입니다`
      }
    }
    // 0일 남았을 때 시간과 분을 함께 표시
    else if (diffHours > 0) {
      if (remainingMinutes > 0) {
        timeText = `${diffHours}시간 ${remainingMinutes}분 전입니다`
      } else {
        timeText = `${diffHours}시간 전입니다`
      }
    }
    // 분 단위로 표시
    else if (diffMinutes > 0) {
      timeText = `${diffMinutes}분 전입니다`
    }
    // 지금
    else {
      timeText = '지금입니다'
    }

    if (participantText) {
      return `${participantText} ${event.title} 일정이 ${timeText}.`
    } else {
      return `${event.title} 일정이 ${timeText}.`
    }
  }

  // 알림 아이콘 결정 함수
  const getAlertIcon = (event) => {
    const category = event.category
    if (category === '미팅') return '🤝'
    if (category === '업무') return '💼'
    if (category === '개인') return '🎁'
    return '📅'
  }

  // 알림 배경색 결정 함수 (일정 태그 색상의 파스텔톤)
  const getAlertBackgroundColor = (event) => {
    const category = event.category || '기타'
    // 일정 태그 색상의 파스텔톤 버전 (새로운 색상에 맞춰 조정, 더 진하게)
    const pastelColors = {
      '미팅': '#f0eff8', // #8f85e7의 파스텔톤 (보라색 톤)
      '업무': '#95b8ff', // #5b99f9의 파스텔톤 (조금 더 진하게)
      '개인': '#95d4a8', // #81bf99의 파스텔톤 (조금 더 진하게)
      '기타': '#b8bcc5'  // #9da3af의 파스텔톤 (더 진하게)
    }
    return pastelColors[category] || pastelColors['기타']
  }

  // 캘린더 이벤트에서 알림 가져오기
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!isAuthenticated()) {
        setAlerts([])
        return
      }

      try {
        const now = new Date()
        // 오늘부터 7일 후까지의 일정 가져오기
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 7)

        const response = await calendarAPI.getEvents(
          now.toISOString(),
          endDate.toISOString()
        )

        if (response.data && response.data.success) {
          const events = response.data.data || []
          
          // 알림이 설정된 일정만 필터링
          const eventsWithNotifications = events.filter(event => {
            if (!event.notification || event.notification === '없음') return false
            
            const notificationTime = calculateNotificationTime(event.startDate, event.notification)
            if (!notificationTime) return false

            const eventStart = new Date(event.startDate)
            
            // 알림 시간이 현재 시간과 같거나 지났고, 일정 시작 시간이 아직 지나지 않은 경우
            // 알림 시간이 정확히 되었을 때부터 일정 시작 시간까지 표시
            const isNotificationTimeReached = notificationTime <= now
            const isEventNotStarted = now < eventStart
            
            // 알림 시간과 현재 시간의 차이 계산
            const timeSinceNotification = now - notificationTime
            const hoursSinceNotification = timeSinceNotification / (1000 * 60 * 60)
            
            // 일정 시작 시간까지의 남은 시간 계산
            const timeUntilEvent = eventStart - now
            const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60)
            
            // 알림 시간이 지났고, 일정이 아직 시작하지 않았으며
            // 알림이 일정 시작 시간 이전에 설정된 경우 표시
            // (예: "2일 전" 알림은 일정 시작 2일 전부터 일정 시작 시간까지 표시)
            // 단, 일정 시작 시간이 7일 이내인 경우만 표시 (너무 먼 미래 일정 제외)
            return isNotificationTimeReached && isEventNotStarted && hoursUntilEvent <= 168 // 7일 = 168시간
          })
          
          // 알림 시간 순으로 정렬 (가장 가까운 일정이 먼저)
          eventsWithNotifications.sort((a, b) => {
            const aStart = new Date(a.startDate)
            const bStart = new Date(b.startDate)
            return aStart - bStart
          })

          // 알림 생성
          const alertList = eventsWithNotifications.map(event => ({
            id: event.id,
            icon: getAlertIcon(event),
            text: generateAlertText(event),
            event: event,
            type: 'calendar',
            backgroundColor: getAlertBackgroundColor(event),
            category: event.category || '기타'
          }))

          setAlerts(alertList)
        }
      } catch (error) {
        console.error('Failed to fetch calendar alerts:', error)
        setAlerts([])
      }
    }

    fetchAlerts()
    
    // 30초마다 알림 업데이트 (알림 시간에 정확히 맞춰 표시하기 위해 더 자주 체크)
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // 광고 슬라이드 자동 전환 (3초마다) - 무한 루프 구현
  const [isTransitioning, setIsTransitioning] = useState(true)
  const wrapperRef = useRef(null)
  
  useEffect(() => {
    if (adImages.length <= 1) return // 이미지가 1개 이하면 자동 전환 불필요
    
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        // 실제 이미지 인덱스 (1부터 시작, 복제본 제외)
        const realIndex = prevIndex >= 1 ? prevIndex : 1
        const nextRealIndex = realIndex + 1
        
        // 마지막 실제 이미지를 넘어가면 복제본으로 이동 (왼쪽으로 슬라이드)
        if (nextRealIndex > adImages.length) {
          return adImages.length + 1 // 첫 번째 이미지 복제본 인덱스
        }
        return nextRealIndex
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [adImages.length])

  // 복제본에 도달했을 때 실제 첫 번째 이미지로 부드럽게 이동
  useEffect(() => {
    if (currentAdIndex === adImages.length + 1 && wrapperRef.current) {
      // transition 없이 실제 첫 번째 이미지로 이동
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentAdIndex(1) // 실제 첫 번째 이미지 인덱스
        // 다음 프레임에서 transition 다시 활성화
        setTimeout(() => {
          setIsTransitioning(true)
        }, 50)
      }, 500) // 슬라이드 애니메이션 완료 후
    }
  }, [currentAdIndex, adImages.length])

  // 곧 시작하는 일정의 시간 텍스트 생성 함수
  const generateUpcomingTimeText = (eventStartDate) => {
    const now = new Date()
    const startDate = new Date(eventStartDate)
    const diffTime = startDate - now
    
    // 이미 지난 일정인 경우
    if (diffTime <= 0) {
      return '지금 시작됩니다!'
    }

    // 남은 시간 계산
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const remainingMinutes = diffMinutes - (diffHours * 60)

    let timeText = ''
    
    // 시간과 분을 함께 표시
    if (diffHours > 0) {
      if (remainingMinutes > 0) {
        timeText = `${diffHours}시간 ${remainingMinutes}분 후에 시작됩니다!`
      } else {
        timeText = `${diffHours}시간 후에 시작됩니다!`
      }
    }
    // 분 단위로 표시
    else if (diffMinutes > 0) {
      timeText = `${diffMinutes}분 후에 시작됩니다!`
    }
    // 지금
    else {
      timeText = '지금 시작됩니다!'
    }

    return timeText
  }

  // 5분 전 알람 체크 (알림 설정 여부와 상관없이)
  useEffect(() => {
    const checkUpcomingEvents = async () => {
      if (!isAuthenticated()) {
        setUpcomingAlerts([])
        return
      }

      try {
        const now = new Date()
        // 5분 후까지의 시간 범위
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000)

        const response = await calendarAPI.getEvents(
          now.toISOString(),
          fiveMinutesLater.toISOString()
        )

        if (response.data && response.data.success) {
          const events = response.data.data || []
          
          // 5분 이내에 시작하고, linkedCardIds가 있는 이벤트만 필터링
          const upcomingEvents = events.filter(event => {
            const eventStart = new Date(event.startDate)
            const diffMinutes = (eventStart - now) / (1000 * 60)
            
            // linkedCardIds 배열이 있고 비어있지 않은 경우
            const hasLinkedCard = event.linkedCardIds && event.linkedCardIds.length > 0
            
            return diffMinutes > 0 && diffMinutes <= 5 && hasLinkedCard
          })

          // 알림 생성 (실시간 시간 텍스트 포함)
          const upcomingAlertList = upcomingEvents.map(event => ({
            id: `upcoming-${event.id}`,
            eventId: event.id,
            icon: '⏰',
            text: `${event.title} 일정이 ${generateUpcomingTimeText(event.startDate)}`,
            event: event,
            type: 'upcoming',
            backgroundColor: '#584cdc',
            category: event.category || '기타',
            participants: event.participants,
            linkedCardIds: event.linkedCardIds,
            startDate: event.startDate // 시간 계산을 위해 저장
          }))

          setUpcomingAlerts(upcomingAlertList)
        }
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error)
        setUpcomingAlerts([])
      }
    }

    checkUpcomingEvents()
    
    // 30초마다 체크
    const interval = setInterval(checkUpcomingEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  // dismissedAlertIds를 localStorage에 저장
  const saveDismissedAlertIds = (idsSet) => {
    try {
      const ids = Array.from(idsSet)
      localStorage.setItem('dismissedUpcomingAlertIds', JSON.stringify(ids))
    } catch (err) {
      console.error('Failed to save dismissed alert ids:', err)
    }
  }

  // upcomingAlerts가 변경될 때 팝업 표시 (한 번 닫힌 팝업은 다시 표시하지 않음)
  useEffect(() => {
    if (upcomingAlerts.length > 0 && !showUpcomingAlertPopup) {
      // 닫히지 않은 알림 찾기
      const undismissedAlert = upcomingAlerts.find(alert => !dismissedAlertIds.has(alert.id))
      
      if (undismissedAlert) {
        // 새로운 알림이 나타났고 팝업이 열려있지 않으면 팝업 표시
        setCurrentUpcomingAlert(undismissedAlert)
        setShowUpcomingAlertPopup(true)
      }
    }
  }, [upcomingAlerts, showUpcomingAlertPopup, dismissedAlertIds])

  // 곧 시작하는 일정의 시간 텍스트를 실시간으로 업데이트
  useEffect(() => {
    if (upcomingAlerts.length === 0) {
      // 알림이 없으면 팝업 닫기
      if (showUpcomingAlertPopup) {
        setShowUpcomingAlertPopup(false)
        setCurrentUpcomingAlert(null)
      }
      return
    }

    const updateUpcomingTimes = () => {
      setUpcomingAlerts(prevAlerts => {
        // 현재 알림이 있는 경우, 업데이트 시에도 유지되도록 처리
        const currentAlertId = currentUpcomingAlert?.id
        
        const updated = prevAlerts.map(alert => {
          if (!alert.startDate) return alert
          
          const newTimeText = generateUpcomingTimeText(alert.startDate)
          return {
            ...alert,
            text: `${alert.event.title} 일정이 ${newTimeText}`
          }
        }).filter(alert => {
          // 시작 시간이 지난 알림은 제거 (단, 현재 팝업에 표시된 알림은 제외)
          const now = new Date()
          const startDate = new Date(alert.startDate)
          const diffMinutes = (startDate - now) / (1000 * 60)
          
          // 현재 팝업에 표시된 알림은 시간이 지나도 유지 (사용자가 수동으로 닫을 때까지)
          if (alert.id === currentAlertId && showUpcomingAlertPopup) {
            return true // 시간 제한 없이 항상 유지
          }
          
          return diffMinutes > 0 && diffMinutes <= 5
        })
        
        // 현재 팝업에 표시된 알림도 업데이트 (팝업이 열려있을 때만)
        if (showUpcomingAlertPopup && currentUpcomingAlert) {
          // updated 배열에서 찾거나, 없으면 기존 알림을 업데이트
          const currentAlert = updated.find(a => a.id === currentUpcomingAlert.id)
          
          if (currentAlert) {
            // 시간 텍스트만 업데이트
            setCurrentUpcomingAlert(currentAlert)
          } else {
            // updated에 없어도 (시간이 지났어도) 기존 알림을 업데이트하여 유지
            const now = new Date()
            const startDate = new Date(currentUpcomingAlert.startDate)
            const newTimeText = generateUpcomingTimeText(startDate)
            setCurrentUpcomingAlert({
              ...currentUpcomingAlert,
              text: `${currentUpcomingAlert.event.title} 일정이 ${newTimeText}`
            })
          }
        }
        
        return updated
      })
    }

    // 약간의 지연 후 업데이트 (팝업이 먼저 표시되도록)
    const timeoutId = setTimeout(updateUpcomingTimes, 500)

    // 1분마다 업데이트 (시간이 바뀔 때마다)
    const interval = setInterval(updateUpcomingTimes, 60000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [upcomingAlerts.length, showUpcomingAlertPopup, currentUpcomingAlert])

  // 참여자의 명함 정보 조회
  const fetchParticipantCardInfo = async (participantName) => {
    if (!participantName || !isAuthenticated()) return null
    
    try {
      // 명함 검색
      const response = await cardAPI.getAll({ search: participantName, limit: 1 })
      if (response.data.success && response.data.data.length > 0) {
        const card = response.data.data[0]
        
        // 메모 조회
        let memos = []
        try {
          const memoResponse = await api.get(`/memo/business-card/${card.id}`)
          if (memoResponse.data && memoResponse.data.success) {
            memos = memoResponse.data.data || []
          }
        } catch (e) {
          console.log('No memos found')
        }
        
        // 선호도 프로필 조회
        let preferenceProfile = null
        try {
          const prefResponse = await api.get(`/profile/${card.id}/preferences`)
          if (prefResponse.data.success) {
            preferenceProfile = prefResponse.data.data
          }
        } catch (e) {
          console.log('No preference profile found')
        }
        
        return {
          ...card,
          memos,
          preferenceProfile
        }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch card info:', error)
      return null
    }
  }

  // 스케줄 종료 시점 체크 (참여자별 명함 여부 확인)
  useEffect(() => {
    const checkEndedEvents = async () => {
      if (!isAuthenticated()) return

      try {
        const now = new Date()
        // 최근 5분 이내에 끝난 이벤트 확인
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

        const response = await calendarAPI.getEvents(
          fiveMinutesAgo.toISOString(),
          now.toISOString()
        )

        if (response.data && response.data.success) {
          const events = response.data.data || []
          
          // 이미 끝난 이벤트 중 아직 처리하지 않은 것
          for (const event of events) {
            const eventEnd = new Date(event.endDate)
            
            // 이벤트가 끝났고, 아직 팝업을 보여주지 않은 경우
            if (eventEnd <= now && !processedEndedEvents.has(event.id)) {
              // participants 파싱
              let participantsList = event.participants || []
              if (typeof participantsList === 'string' && participantsList.trim() !== '') {
                participantsList = participantsList.split(',').map(p => p.trim()).filter(p => p)
              } else if (!Array.isArray(participantsList)) {
                participantsList = []
              }
              
              // 참여자가 없으면 팝업 표시 안 함
              if (participantsList.length === 0) {
                setProcessedEndedEvents(prev => {
                  const newSet = new Set([...prev, event.id])
                  saveProcessedEvents(newSet)
                  return newSet
                })
                continue
              }
              
              // 각 참여자별로 명함 검색
              const participantCardMap = new Map()
              let hasAllCards = true
              
              // linkedCardIds에 있는 명함 정보 먼저 확인
              if (event.linkedCardIds && event.linkedCardIds.length > 0) {
                try {
                  const cardPromises = event.linkedCardIds.map(cardId => 
                    cardAPI.getById(cardId).catch(() => null)
                  )
                  const cardResponses = await Promise.all(cardPromises)
                  
                  cardResponses.forEach((response) => {
                    if (response && response.data && response.data.success && response.data.data) {
                      const card = response.data.data
                      if (card.name) {
                        participantCardMap.set(card.name.trim(), card.id)
                      }
                    }
                  })
                } catch (err) {
                  console.error('Failed to fetch linked cards:', err)
                }
              }
              
              // 모든 명함 검색하여 참여자 이름으로 매칭
              try {
                const allCardsResponse = await cardAPI.getAll({})
                if (allCardsResponse.data.success && allCardsResponse.data.data) {
                  const allCards = allCardsResponse.data.data || []
                  
                  // 각 참여자별로 명함이 있는지 확인
                  for (const participantName of participantsList) {
                    const trimmedName = participantName.trim()
                    if (!participantCardMap.has(trimmedName)) {
                      // 전체 명함 목록에서 검색
                      const matchingCard = allCards.find(card => 
                        card.name && card.name.trim() === trimmedName
                      )
                      if (matchingCard) {
                        participantCardMap.set(trimmedName, matchingCard.id)
                      } else {
                        hasAllCards = false
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('Failed to search all cards:', err)
              }
              
              // linkedCardIds가 있지만 참여자 중 명함이 없는 사람이 있는 경우
              // 또는 linkedCardIds가 없고 모든 참여자가 명함이 없는 경우
              const hasAnyLinkedCard = event.linkedCardIds && event.linkedCardIds.length > 0
              
              // 첫 번째 명함 ID (명함이 있는 경우)
              let firstCardId = null
              if (participantCardMap.size > 0) {
                firstCardId = Array.from(participantCardMap.values())[0]
              }
              
              setEndedEventInfo({
                ...event,
                hasLinkedCard: hasAllCards, // 모든 참여자에게 명함이 있으면 true
                linkedCardId: firstCardId,
                participantsList: participantsList,
                participantCardMap: participantCardMap
              })
              setShowEndedEventPopup(true)
              
              // 팝업 표시 후에는 break (한 번에 하나만)
              break
            }
          }
        }
      } catch (error) {
        console.error('Failed to check ended events:', error)
      }
    }

    checkEndedEvents()
    
    // 30초마다 체크
    const interval = setInterval(checkEndedEvents, 30000)
    return () => clearInterval(interval)
  }, [processedEndedEvents])

  // 명함 등록하기 - 참여자 클릭
  const handleRegisterCard = (participantName) => {
    // 팝업 상태 저장
    const popupState = {
      endedEventInfo: endedEventInfo,
      showEndedEventPopup: true
    }
    
    setShowEndedEventPopup(false)
    navigate('/manual-add', {
      state: {
        participantName: participantName,
        returnToEventDetail: false,
        returnToEndedPopup: true,
        popupState: popupState
      }
    })
  }

  // 메모 작성하기 - 참여자 클릭
  const handleWriteMemo = (participantName) => {
    if (!endedEventInfo?.participantCardMap) return
    
    const cardId = endedEventInfo.participantCardMap.get(participantName.trim())
    if (cardId) {
      // 팝업 상태 저장
      const popupState = {
        endedEventInfo: endedEventInfo,
        showEndedEventPopup: true
      }
      
      setShowEndedEventPopup(false)
      navigate(`/memo?businessCardId=${cardId}`, {
        state: {
          returnToEndedPopup: true,
          popupState: popupState
        }
      })
    }
  }

  // 스케줄 종료 팝업 - "다음에 할게요" 버튼 클릭
  const handleEndedEventNo = () => {
    if (endedEventInfo?.id) {
      // 처리 완료 표시 (다시 안 뜨도록) - localStorage에 저장
      setProcessedEndedEvents(prev => {
        const newSet = new Set([...prev, endedEventInfo.id])
        saveProcessedEvents(newSet)
        return newSet
      })
    }
    setShowEndedEventPopup(false)
  }

  // 명함 정보 보기 버튼 클릭 - 선호도 프로필 팝업 표시
  const handleShowCardInfo = async (alert) => {
    setLoadingCardInfo(true)
    setShowCardInfoModal(true)
    setCurrentCardIndex(0)
    
    // linkedCardIds가 있으면 직접 사용 (배열)
    const linkedCardIds = alert.linkedCardIds || alert.event?.linkedCardIds
    
    // linkedCardIds가 배열이고 비어있지 않은 경우
    const hasLinkedCards = Array.isArray(linkedCardIds) && linkedCardIds.length > 0
    
    // 참여자 이름 정보 가져오기
    let participants = alert.event?.participants || alert.participants
    if (typeof participants === 'string') {
      participants = participants.split(',').map(p => p.trim()).filter(p => p)
    }
    
    if (participants && participants.length > 0) {
      // 모든 참여자 처리 - linkedCardIds가 있는 경우만 명함 조회
      const cardInfoPromises = participants.map(async (participantName) => {
        // linkedCardIds가 없으면 명함이 없는 것으로 처리
        if (!hasLinkedCards) {
          return {
            name: participantName,
            notFound: true,
            eventTitle: alert.event?.title
          }
        }
        
        // linkedCardIds에서 해당 참여자 이름과 일치하는 명함 찾기
        let matchedCard = null
        
        // linkedCardIds로 명함 정보 가져오기 시도
        for (const cardId of linkedCardIds) {
          if (!cardId) continue
          
          try {
            const cardResponse = await cardAPI.getById(cardId)
            if (cardResponse.data.success && cardResponse.data.data) {
              const card = cardResponse.data.data
              // 명함 이름과 참여자 이름이 일치하는지 확인
              if (card.name === participantName) {
                matchedCard = card
                break
              }
            }
          } catch (e) {
            // 무시하고 계속
          }
        }
        
        // 명함을 찾은 경우
        if (matchedCard && matchedCard.id) {
          // 메모 조회
          let memos = matchedCard.memos || []
          if (!memos || memos.length === 0) {
            try {
              const memoResponse = await api.get(`/memo/business-card/${matchedCard.id}`)
              if (memoResponse.data && memoResponse.data.success) {
                memos = memoResponse.data.data || []
              }
            } catch (e) {
              console.log('No memos found')
            }
          }
          
          // 선호도 프로필 조회
          let preferenceProfile = matchedCard.preferenceProfile || null
          if (!preferenceProfile) {
            try {
              const prefResponse = await api.get(`/profile/${matchedCard.id}/preferences`)
              if (prefResponse.data.success) {
                preferenceProfile = prefResponse.data.data
              }
            } catch (e) {
              console.log('No preference profile found')
            }
          }
          
          return {
            ...matchedCard,
            memos,
            preferenceProfile,
            eventTitle: alert.event?.title
          }
        } else {
          // linkedCardIds에 해당 참여자의 명함이 없는 경우
          return {
            name: participantName,
            notFound: true,
            eventTitle: alert.event?.title
          }
        }
      })
      
      const cardInfos = await Promise.all(cardInfoPromises)
      setCardInfoList(cardInfos)
      setSelectedCardInfo(cardInfos[0] || null)
    } else {
      setCardInfoList([])
      setSelectedCardInfo({ noParticipants: true })
    }
    setLoadingCardInfo(false)
  }

  // 다음 명함으로 이동
  const handleNextCard = () => {
    if (currentCardIndex < cardInfoList.length - 1) {
      const nextIndex = currentCardIndex + 1
      setCurrentCardIndex(nextIndex)
      setSelectedCardInfo(cardInfoList[nextIndex])
    }
  }

  // 이전 명함으로 이동
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1
      setCurrentCardIndex(prevIndex)
      setSelectedCardInfo(cardInfoList[prevIndex])
    }
  }

  // 메모 보러가기 버튼 클릭 - 메모 페이지로 이동
  const handleGoToMemo = () => {
    if (selectedCardInfo?.id) {
      // 팝업 상태 저장 (뒤로가기 시 복원을 위해)
      const popupState = {
        showCardInfoModal: true,
        cardInfoList: cardInfoList,
        currentCardIndex: currentCardIndex,
        alertData: {
          linkedCardIds: cardInfoList.map(card => card.id).filter(id => id),
          participants: cardInfoList.map(card => card.name || (card.notFound ? card.name : '알 수 없음')),
          event: {
            title: cardInfoList[0]?.eventTitle || '',
            participants: cardInfoList.map(card => card.name || (card.notFound ? card.name : '알 수 없음'))
          }
        }
      }
      navigate(`/memo?businessCardId=${selectedCardInfo.id}`, { 
        state: { 
          returnToDashboard: true,
          popupState: popupState
        } 
      })
    }
  }

  // 알림 텍스트에서 이름 추출 함수
  const extractNameFromAlert = (alertText) => {
    // "최하늘 님과..." 또는 "강지민 님의..." 형식에서 이름 추출
    const match = alertText.match(/^([가-힣]+)\s+님/)
    return match ? match[1] : null
  }

  // "보기" 버튼 클릭 핸들러
  const handleViewAlert = (alert) => {
    if (alert.type === 'calendar' && alert.event) {
      // 캘린더 일정인 경우 일정 상세 페이지로 이동
      navigate(`/calendar/event/${alert.event.id}`)
    } else {
      // 기존 로직 (명함 관련 알림)
      const name = extractNameFromAlert(alert.text)
      if (name) {
        // 해당 이름의 명함 찾기
        const card = cards.find(c => c.name === name)
        if (card) {
          // 타인명함 상세 페이지로 이동 (모달 열기)
          navigate('/business-cards', { 
            state: { openCardId: card.id } 
          })
        } else {
          // 명함이 없으면 명함 목록으로 이동
          navigate('/business-cards')
        }
      } else {
        // 이름을 추출할 수 없으면 명함 목록으로 이동
        navigate('/business-cards')
      }
    }
  }

  // STT 지원 여부 확인 및 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSTTSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = 'ko-KR' // 한국어 설정
      recognition.continuous = false // 한 번만 인식
      recognition.interimResults = true // 중간 결과도 받기 (텍스트가 실시간으로 표시됨)
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onresult = (event) => {
        // 중간 결과와 최종 결과 모두 처리
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // 중간 결과가 있으면 실시간으로 표시
        if (interimTranscript) {
          console.log('🎤 음성 인식 중간 결과:', interimTranscript)
          setSearchQuery(finalTranscript + interimTranscript)
        }
        
        // 최종 결과가 있으면 텍스트 설정 후 자동 검색 실행
        if (finalTranscript) {
          console.log('1. STT 완료:', finalTranscript)
          setIsListening(false)
          
          // 최종 텍스트 설정
          setSearchQuery(finalTranscript)
          
          // 자동으로 검색 실행
          setTimeout(() => {
            console.log('2. 자동 검색 시작')
            handleSearch(finalTranscript)
          }, 100)
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          alert('음성이 감지되지 않았습니다. 다시 시도해주세요.')
        } else if (event.error === 'not-allowed') {
          alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        } else {
          alert('음성 인식 중 오류가 발생했습니다.')
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

  // STT 시작/중지
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
        console.log('0. STT 호출')
        recognitionRef.current?.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        alert('음성 인식을 시작할 수 없습니다.')
      }
    }
  }

  // 검색 실행 - 결과 페이지로 이동
  const handleSearch = useCallback(async (query = null) => {
    const searchText = query || searchQuery.trim()
    if (!searchText) {
      return
    }

    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    // 결과 페이지로 이동 (검색어 전달)
    navigate('/search-result', { 
      state: { 
        query: searchText 
      } 
    })
  }, [searchQuery, navigate])

  // handleSearch를 ref에 저장 (STT에서 사용하기 위해)
  useEffect(() => {
    handleSearchRef.current = handleSearch
  }, [handleSearch])

  // searchQuery 변경 감지 (디버깅용)
  useEffect(() => {
    console.log('📝 searchQuery 상태 변경:', searchQuery)
  }, [searchQuery])

  // 제안 쿼리 클릭
  const handleSuggestionClick = (suggestionText) => {
    setSearchQuery(suggestionText)
    // 검색 실행 로직 제거
  }

  // 명함 상세 페이지로 이동
  const handleCardClick = (cardId) => {
    navigate(`/cards/${cardId}`)
    handleCloseSearchResults()
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* AI Gift Recommendation Banner */}
        <div className="ai-banner">
        {/* Header */}
        <div className="landing-header">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="header-logo" />
        </div>
          <div className="banner-content">
            <div className="banner-text">
              <p className="banner-subtitle">AI 맞춤형 비즈니스 인맥 관리 어플리케이션 GPT-4b</p>
              <p className="banner-title">명함 관리와 선물 추천으로 인맥 관리를 도와드립니다</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          {userName && (
            <div className="search-greeting-name">{userName}님 안녕하세요.</div>
          )}
          <div className="search-greeting">
누구의 명함을 찾고 계신가요?
          </div>
          
          <div className="search-input-container">
            <textarea
              className="search-textarea"
              placeholder="상대가 무엇을 좋아하는지, 어떤 성격인지 등을 입력해주세요"
              rows={3}
              value={searchQuery}
              onChange={(e) => {
                console.log('✏️ 텍스트 입력:', e.target.value)
                setSearchQuery(e.target.value)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              disabled={isListening}
            />
            <div className="search-input-actions">
              <button 
                className="search-action-button search-send-button"
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`search-action-button search-mic-button ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={isSearching || !isSTTSupported}
                title={isListening ? '음성 인식 중...' : '음성으로 검색'}
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
            </div>
          </div>

          <div className="search-suggestions">
            <div 
              className="search-suggestion-item"
              onClick={() => handleSuggestionClick('축구를 좋아하는 분이 누구였지?')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>축구를 좋아하는 분이 누구였지?</span>
            </div>
            <div 
              className="search-suggestion-item"
              onClick={() => handleSuggestionClick('농산물 관련 일 같이 했던 분이 누구였지?')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>농산물 관련 일 같이 했던 분이 누구였지?</span>
            </div>
          </div>
        </div>
      </div>

      {/* 캘린더 기능 홍보 광고 Section - landing-container 밖으로 이동 */}
      <div className="ad-carousel-section">
        <div className="ad-carousel-container">
          <div 
            ref={wrapperRef}
            className="ad-carousel-wrapper"
            style={{
              transform: `translateX(-${currentAdIndex * 100}%)`,
              transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
            }}
          >
            {/* 마지막 이미지 복제본 (첫 번째 앞에) */}
            {adImages.length > 1 && (
              <div className="ad-carousel-slide">
                <img 
                  src={adImages[adImages.length - 1]} 
                  alt={`캘린더 기능 홍보 ${adImages.length}`}
                  className="ad-carousel-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
            {/* 실제 이미지들 */}
            {adImages.map((image, index) => (
              <div key={index} className="ad-carousel-slide">
                <img 
                  src={image} 
                  alt={`캘린더 기능 홍보 ${index + 1}`}
                  className="ad-carousel-image"
                  onError={(e) => {
                    // 이미지 로드 실패 시 빈 div로 대체
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            ))}
            {/* 첫 번째 이미지 복제본 (마지막 뒤에) */}
            {adImages.length > 1 && (
              <div className="ad-carousel-slide">
                <img 
                  src={adImages[0]} 
                  alt={`캘린더 기능 홍보 1`}
                  className="ad-carousel-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
          {/* 인디케이터 (이미지가 여러 개일 때만 표시) */}
          {adImages.length > 1 && (
            <div className="ad-carousel-indicators">
              {adImages.map((_, index) => {
                // 실제 인덱스로 변환 (1부터 시작하므로 -1)
                const realIndex = currentAdIndex > adImages.length ? 0 : currentAdIndex - 1
                const displayIndex = realIndex < 0 ? adImages.length - 1 : realIndex
                return (
                  <button
                    key={index}
                    className={`ad-carousel-indicator ${index === displayIndex ? 'active' : ''}`}
                    onClick={() => {
                      setIsTransitioning(true)
                      setCurrentAdIndex(index + 1) // 실제 이미지 인덱스 (1부터 시작)
                    }}
                    aria-label={`광고 ${index + 1}로 이동`}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="landing-container">
        {/* 5분 전 알림 Section */}
        {upcomingAlerts.length > 0 && (
          <div className="alerts-section">
            <h2 className="alerts-title">5분 전 알림</h2>
            <div className="alerts-list">
              {upcomingAlerts.map((alert) => {
                // 일정 카테고리별 원색 매핑
                const categoryColors = {
                  '미팅': '#584cdc',
                  '업무': '#3b82f6',
                  '개인': '#10b981',
                  '기타': '#6b7280'
                }
                // 일정 카테고리별 약간 옅은 색상 매핑
                const categoryLightColors = {
                  '미팅': '#7c6fe8',
                  '업무': '#5b9aff',
                  '개인': '#2dd4a0',
                  '기타': '#9ca3af'
                }
                const category = alert.category || '기타'
                const buttonColor = categoryColors[category] || categoryColors['기타']
                const cardColor = categoryLightColors[category] || categoryLightColors['기타']
                
                return (
                  <div 
                    key={alert.id} 
                    className="alert-card"
                    style={{ 
                      backgroundColor: cardColor
                    }}
                  >
                    <p 
                      className="alert-text"
                      style={{ color: 'white' }}
                    >
                      {alert.text}
                    </p>
                    <button 
                      className="alert-button upcoming-alert-button"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: 'white',
                        color: buttonColor
                      }}
                      onClick={() => handleShowCardInfo(alert)}
                    >
                      상대 정보 확인하기
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Important Alerts Section */}
        <div className="alerts-section schedule-alerts-section">
          <h2 className="alerts-title">일정 알림</h2>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const isMeeting = alert.category === '미팅'
                return (
                  <div 
                    key={alert.id} 
                    className="alert-card"
                    style={{ 
                      backgroundColor: isMeeting ? '#8e86e6' : alert.backgroundColor 
                    }}
                  >
                    <p 
                      className="alert-text"
                      style={{ color: 'white' }}
                    >
                      {alert.text}
                    </p>
                    <button 
                      className="alert-button"
                      onClick={() => handleViewAlert(alert)}
                    >
                      일정 보기
                    </button>
                  </div>
                )
              })
            ) : (
              <div className="no-alerts">
                <p className="no-alerts-text">아직 등록된 일정이 없어요.</p>
                <p className="no-alerts-text">'캘린더' 탭에서 일정을 등록해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />

      {/* Card Complete Modal */}
      {showCardCompleteModal && (
        <div className="card-complete-modal-overlay" onClick={handleCloseModal}>
          <div className="card-complete-modal" onClick={(e) => e.stopPropagation()}>
            <p className="card-complete-message">
              {userName}님의 명함이 완성됐어요.<br />
              확인하러 갈까요?
            </p>
            <div className="card-complete-buttons">
              <button 
                className="card-complete-btn card-complete-btn-primary"
                onClick={handleGoToMy}
              >
                확인하러 갈래요
              </button>
              <button 
                className="card-complete-btn card-complete-btn-secondary"
                onClick={handleCloseModal}
              >
                괜찮아요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5분 전 알림 팝업 */}
      {showUpcomingAlertPopup && currentUpcomingAlert && (() => {
        // 일정 카테고리별 색상 매핑
        const categoryColors = {
          '미팅': '#584cdc',
          '업무': '#3b82f6',
          '개인': '#10b981',
          '기타': '#6b7280'
        }
        const category = currentUpcomingAlert.category || '기타'
        const buttonColor = categoryColors[category] || categoryColors['기타']
        
        return (
          <div 
            className="upcoming-alert-popup-overlay" 
            onClick={() => {
              if (currentUpcomingAlert) {
                const newDismissedIds = new Set([...dismissedAlertIds, currentUpcomingAlert.id])
                setDismissedAlertIds(newDismissedIds)
                saveDismissedAlertIds(newDismissedIds)
              }
              setShowUpcomingAlertPopup(false)
              setCurrentUpcomingAlert(null)
            }}
          >
            <div 
              className="upcoming-alert-popup" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="upcoming-alert-popup-header">
                <button 
                  className="upcoming-alert-close"
                  onClick={() => {
                    if (currentUpcomingAlert) {
                      const newDismissedIds = new Set([...dismissedAlertIds, currentUpcomingAlert.id])
                      setDismissedAlertIds(newDismissedIds)
                      saveDismissedAlertIds(newDismissedIds)
                    }
                    setShowUpcomingAlertPopup(false)
                    setCurrentUpcomingAlert(null)
                  }}
                >
                  ✕
                </button>
              </div>
              <p className="upcoming-alert-text">
                {currentUpcomingAlert.text?.includes('일정이 ') 
                  ? currentUpcomingAlert.text.split('일정이 ').map((part, index) => 
                      index === 0 ? (
                        <span key={index}>{part}일정이<br /></span>
                      ) : (
                        <span key={index}>{part}</span>
                      )
                    )
                  : currentUpcomingAlert.text}
              </p>
              {currentUpcomingAlert.participants && (
                <button 
                  type="button"
                  className="upcoming-alert-action-button"
                  style={{ backgroundColor: buttonColor }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // 팝업을 먼저 닫고 나서 모달 열기
                    if (currentUpcomingAlert) {
                      const newDismissedIds = new Set([...dismissedAlertIds, currentUpcomingAlert.id])
                      setDismissedAlertIds(newDismissedIds)
                      saveDismissedAlertIds(newDismissedIds)
                    }
                    setShowUpcomingAlertPopup(false)
                    setCurrentUpcomingAlert(null)
                    // 팝업이 닫힌 후 모달 열기
                    setTimeout(() => {
                      handleShowCardInfo(currentUpcomingAlert)
                    }, 100)
                  }}
                >
                  상대방 정보 보기
                </button>
              )}
            </div>
          </div>
        )
      })()}

      {/* 선호도 프로필 팝업 모달 */}
      {showCardInfoModal && (
        <div className="card-info-modal-overlay" onClick={() => setShowCardInfoModal(false)}>
          <div className="card-info-modal preference-modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-info-header">
              <h3 className="card-info-title">상대방 선호도 프로필</h3>
              <button 
                className="card-info-close"
                onClick={() => setShowCardInfoModal(false)}
              >
                ✕
              </button>
            </div>
            
            {loadingCardInfo ? (
              <div className="card-info-loading">선호도 정보를 불러오는 중...</div>
            ) : selectedCardInfo?.noParticipants ? (
              <div className="card-info-empty">참여자 정보가 없습니다.</div>
            ) : selectedCardInfo?.notFound ? (
              <div className="card-info-content">
                <div 
                  className="card-info-person-header"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)',
                    border: '1px solid #000000',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <span className="card-info-name">{selectedCardInfo.name}</span>
                </div>
                <div className="no-memo-message">
                  <p className="no-memo-text">명함에 등록되지 않은 참여자입니다.</p>
                  <p className="no-memo-hint">
                    명함을 등록하고 메모를 남기면<br/>선호도 프로필을 확인할 수 있어요!
                  </p>
                </div>
              </div>
            ) : selectedCardInfo ? (
              <div className="card-info-content">
                {/* 참여자 기본 정보 */}
                <div 
                  className="card-info-person-header"
                  style={{
                    background: selectedCardInfo.design && cardDesigns[selectedCardInfo.design]
                      ? cardDesigns[selectedCardInfo.design]
                      : cardDesigns['design-1'],
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white'
                  }}
                >
                  <span className="card-info-name" style={{ color: 'white' }}>{selectedCardInfo.name}</span>
                  <span className="card-info-detail" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedCardInfo.company && selectedCardInfo.company}
                    {selectedCardInfo.position && ` · ${selectedCardInfo.position}`}
                  </span>
                </div>
                
                {/* 메모가 없는 경우 */}
                {(!selectedCardInfo.memos || selectedCardInfo.memos.length === 0) ? (
                  <div className="no-memo-message">
                    <p className="no-memo-text">아직 메모가 없어요.</p>
                    <p className="no-memo-hint">상대방에 대한 정보를 메모로 남겨보세요!</p>
                  </div>
                ) : (
                  /* 메모가 있는 경우 - 선호도 프로필 표시 */
                  selectedCardInfo.preferenceProfile ? (
                    <div className="preference-profile-main">
                    {/* 좋아하는 것 */}
                    {selectedCardInfo.preferenceProfile.likes && (
                      <div className="pref-section pref-likes">
                        <div className="pref-section-header">
                          <span className="pref-icon"><SmileIcon /></span>
                          <span className="pref-title">좋아하는 것</span>
                        </div>
                        <div className="pref-tags">
                          {(() => {
                            const rawLikes = selectedCardInfo.preferenceProfile.likes
                            let likes = rawLikes
                            // 문자열이면 파싱 시도
                            if (typeof rawLikes === 'string') {
                              try {
                                likes = JSON.parse(rawLikes)
                              } catch {
                                return <span className="pref-tag pref-tag-like">{rawLikes}</span>
                              }
                            }
                            // 배열이면 map
                            if (Array.isArray(likes)) {
                              return likes.map((item, idx) => (
                                <span key={idx} className="pref-tag pref-tag-like">
                                  {typeof item === 'object' && item !== null ? item.item : String(item)}
                                </span>
                              ))
                            }
                            return <span className="pref-tag pref-tag-like">{String(rawLikes)}</span>
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* 싫어하는 것 */}
                    {selectedCardInfo.preferenceProfile.dislikes && (
                      <div className="pref-section pref-dislikes">
                        <div className="pref-section-header">
                          <span className="pref-icon"><FrownIcon /></span>
                          <span className="pref-title">싫어하는 것</span>
                        </div>
                        <div className="pref-tags">
                          {(() => {
                            const rawDislikes = selectedCardInfo.preferenceProfile.dislikes
                            let dislikes = rawDislikes
                            if (typeof rawDislikes === 'string') {
                              try {
                                dislikes = JSON.parse(rawDislikes)
                              } catch {
                                return <span className="pref-tag pref-tag-dislike">{rawDislikes}</span>
                              }
                            }
                            if (Array.isArray(dislikes)) {
                              return dislikes.map((item, idx) => (
                                <span key={idx} className="pref-tag pref-tag-dislike">
                                  {typeof item === 'object' && item !== null ? item.item : String(item)}
                                </span>
                              ))
                            }
                            return <span className="pref-tag pref-tag-dislike">{String(rawDislikes)}</span>
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* 불확실한 것 */}
                    {selectedCardInfo.preferenceProfile.uncertain && (
                      <div className="pref-section pref-uncertain">
                        <div className="pref-section-header">
                          <span className="pref-icon"><QuestionIcon /></span>
                          <span className="pref-title">불확실한 것</span>
                        </div>
                        <div className="pref-tags">
                          {(() => {
                            const rawUncertain = selectedCardInfo.preferenceProfile.uncertain
                            let uncertain = rawUncertain
                            if (typeof rawUncertain === 'string') {
                              try {
                                uncertain = JSON.parse(rawUncertain)
                              } catch {
                                return <span className="pref-tag pref-tag-uncertain">{rawUncertain}</span>
                              }
                            }
                            if (Array.isArray(uncertain)) {
                              return uncertain.map((item, idx) => (
                                <span key={idx} className="pref-tag pref-tag-uncertain">
                                  {typeof item === 'object' && item !== null ? item.item : String(item)}
                                </span>
                              ))
                            }
                            return <span className="pref-tag pref-tag-uncertain">{String(rawUncertain)}</span>
                          })()}
                        </div>
                      </div>
                    )}
                    </div>
                  ) : (
                    <div className="no-preference-profile">
                      <p>아직 선호도 프로필이 없어요.</p>
                      <p className="no-pref-hint">대화 내용을 메모로 남기면<br/>AI가 선호도를 분석해드려요!</p>
                    </div>
                  )
                )}
              </div>
            ) : null}
            
            {/* 메모 보러가기/남기러가기 버튼 (명함이 있는 경우만) */}
            {selectedCardInfo?.id && !selectedCardInfo?.notFound && (
              <div className="card-info-memo-button-container">
                <button 
                  className="card-info-memo-button"
                  onClick={handleGoToMemo}
                >
                  {selectedCardInfo.memos && selectedCardInfo.memos.length > 0 
                    ? '메모 보러가기' 
                    : '메모 남기러가기'}
                </button>
              </div>
            )}
            
            {/* 명함이 없는 경우 명함 등록 안내 */}
            {selectedCardInfo?.notFound && (
              <div className="card-info-memo-button-container">
                <button 
                  className="card-info-memo-button"
                  onClick={() => {
                    setShowCardInfoModal(false)
                    navigate('/manual-add')
                  }}
                >
                  명함 등록하기
                </button>
              </div>
            )}
            
            {/* 하단 인디케이터 (여러 명일 때만 표시) */}
            {cardInfoList.length > 1 && (
              <div className="card-info-bottom-navigation">
                <button 
                  className="card-nav-button card-nav-prev"
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                >
                  ‹
                </button>
                <div className="card-info-indicator">
                  <span className="card-indicator-text">
                    {currentCardIndex + 1} / {cardInfoList.length}
                  </span>
                </div>
                <button 
                  className="card-nav-button card-nav-next"
                  onClick={handleNextCard}
                  disabled={currentCardIndex === cardInfoList.length - 1}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 스케줄 종료 팝업 */}
      {showEndedEventPopup && endedEventInfo && (
        <div className="ended-event-popup-overlay">
          <div className="ended-event-popup">
            <h3 className="ended-event-popup-title">
              {endedEventInfo.title}
            </h3>
            <p className="ended-event-popup-subtitle">일정이 종료되었어요</p>
            
            <div className="ended-event-popup-sections">
              {/* 명함 등록하기 섹션 */}
              <div className="ended-event-section">
                <div className="ended-event-section-header">
                  <div className="ended-event-section-icon">
                    <BusinessCardIcon />
                  </div>
                  <h4 className="ended-event-section-title">명함 등록하기</h4>
                </div>
                <p className="ended-event-section-description">
                  오늘 만난 분의 정보를<br />명함으로 등록해보세요
                </p>
                <div className="ended-event-participants-list">
                  {endedEventInfo.participantsList && endedEventInfo.participantsList
                    .filter(name => {
                      const trimmedName = name.trim()
                      return !endedEventInfo.participantCardMap?.has(trimmedName)
                    })
                    .map((name, index) => (
                      <button
                        key={index}
                        className="ended-event-participant-btn"
                        onClick={() => handleRegisterCard(name)}
                      >
                        {name}
                      </button>
                    ))}
                  {endedEventInfo.participantsList && endedEventInfo.participantsList
                    .filter(name => {
                      const trimmedName = name.trim()
                      return !endedEventInfo.participantCardMap?.has(trimmedName)
                    }).length === 0 && (
                    <p className="ended-event-no-participants">등록할 명함이 없어요</p>
                  )}
                </div>
              </div>

              {/* 메모 작성하기 섹션 */}
              <div className="ended-event-section">
                <div className="ended-event-section-header">
                  <div className="ended-event-section-icon">
                    <PenPaperIcon />
                  </div>
                  <h4 className="ended-event-section-title">메모 작성하기</h4>
                </div>
                <p className="ended-event-section-description">
                  상대방의 사소한 정보라도<br />메모로 남겨보세요
                </p>
                <div className="ended-event-participants-list">
                  {endedEventInfo.participantsList && endedEventInfo.participantsList
                    .filter(name => {
                      const trimmedName = name.trim()
                      return endedEventInfo.participantCardMap?.has(trimmedName)
                    })
                    .map((name, index) => (
                      <button
                        key={index}
                        className="ended-event-participant-btn"
                        onClick={() => handleWriteMemo(name)}
                      >
                        {name}
                      </button>
                    ))}
                  {endedEventInfo.participantsList && endedEventInfo.participantsList
                    .filter(name => {
                      const trimmedName = name.trim()
                      return endedEventInfo.participantCardMap?.has(trimmedName)
                    }).length === 0 && (
                    <p className="ended-event-no-participants">메모를 작성할 명함이 없어요</p>
                  )}
                </div>
              </div>
            </div>

            <div className="ended-event-popup-buttons">
              <button 
                className="ended-event-btn ended-event-btn-secondary"
                onClick={handleEndedEventNo}
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage

