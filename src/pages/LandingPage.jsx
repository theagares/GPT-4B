import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import { userAPI, calendarAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './LandingPage.css'

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

function LandingPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const cards = useCardStore((state) => state.cards)

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

  const [alerts, setAlerts] = useState([])

  // 알림 시간 계산 함수
  const calculateNotificationTime = (eventStartDate, notificationSetting) => {
    if (!notificationSetting || notificationSetting === '없음') return null

    const startDate = new Date(eventStartDate)
    let notificationTime = new Date(startDate)

    // 알림 설정에 따라 시간 계산
    if (notificationSetting.includes('분 전')) {
      const minutes = parseInt(notificationSetting.replace('분 전', ''))
      notificationTime.setMinutes(notificationTime.getMinutes() - minutes)
    } else if (notificationSetting.includes('시간 전')) {
      const hours = parseInt(notificationSetting.replace('시간 전', ''))
      notificationTime.setHours(notificationTime.getHours() - hours)
    } else if (notificationSetting.includes('일 전')) {
      const days = parseInt(notificationSetting.replace('일 전', ''))
      notificationTime.setDate(notificationTime.getDate() - days)
    } else if (notificationSetting.includes('주 전')) {
      const weeks = parseInt(notificationSetting.replace('주 전', ''))
      notificationTime.setDate(notificationTime.getDate() - (weeks * 7))
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
      } else {
        // 여러 명일 때: "김승준, 장서진 님과의" 형식
        const names = participantsList.slice(0, -1).join(', ')
        const lastName = participantsList[participantsList.length - 1]
        participantText = `${names}, ${lastName} 님과의`
      }
    } else {
      participantText = '일정'
    }

    // 이벤트 시작 시간에서 현재 시간까지 남은 시간 계산
    const startDate = new Date(event.startDate)
    const diffTime = startDate - now
    
    // 이미 지난 일정인 경우
    if (diffTime <= 0) {
      return `${participantText} ${event.title} 일정이 지났습니다.`
    }

    // 남은 시간 계산
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)

    let timeText = ''
    
    // 주 단위로 표시 (7일 이상)
    if (diffWeeks > 0) {
      timeText = `${diffWeeks}주 전입니다`
    }
    // 일 단위로 표시 (24시간 이상)
    else if (diffDays > 0) {
      timeText = `${diffDays}일 전입니다`
    }
    // 시간 단위로 표시 (60분 이상)
    else if (diffHours > 0) {
      timeText = `${diffHours}시간 전입니다`
    }
    // 분 단위로 표시
    else if (diffMinutes > 0) {
      timeText = `${diffMinutes}분 전입니다`
    }
    // 지금
    else {
      timeText = '지금입니다'
    }

    return `${participantText} ${event.title} 일정이 ${timeText}.`
  }

  // 알림 아이콘 결정 함수
  const getAlertIcon = (event) => {
    const category = event.category
    if (category === '미팅') return '🤝'
    if (category === '업무') return '💼'
    if (category === '개인') return '🎁'
    return '📅'
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

            // 알림 시간이 현재 시간 이전이거나 같고, 일정 시작 시간 이전인 경우
            const eventStart = new Date(event.startDate)
            // 알림 시간이 지났고, 일정 시작 시간이 아직 지나지 않은 경우
            // 알림 시간과 현재 시간의 차이가 24시간 이내인 경우만 표시 (너무 오래된 알림 제외)
            const timeSinceNotification = now - notificationTime
            const hoursSinceNotification = timeSinceNotification / (1000 * 60 * 60)
            
            return notificationTime <= now && now < eventStart && hoursSinceNotification <= 24
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
            type: 'calendar'
          }))

          setAlerts(alertList)
        }
      } catch (error) {
        console.error('Failed to fetch calendar alerts:', error)
        setAlerts([])
      }
    }

    fetchAlerts()
    
    // 1분마다 알림 업데이트 (실시간 반영)
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* AI Gift Recommendation Banner */}
        <div className="ai-banner">
        {/* Header */}
        <div className="landing-header">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="header-logo" />
          {userName && (
            <span className="welcome-message">{userName}님 환영합니다!</span>
          )}
        </div>
          <div className="banner-content">
            <div className="banner-text">
              <p className="banner-subtitle">AI 맞춤형 비즈니스 선물 추천 서비스 GPT-4b</p>
              <p className="banner-title">상대방의 정보를 기반으로 최적의 선물을 찾아드립니다</p>
            </div>
          </div>
        </div>

        {/* Popular Gifts Section */}
        <div className="popular-gifts-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">인기 선물</h2>
            </div>
          </div>

          <div className="gift-cards-container">
            {popularGifts.map((gift) => (
              <a 
                key={gift.id} 
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gift-card"
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="gift-card-image">
                  <img src={gift.image} alt={gift.name} />
                  <div className="rank-badge">{gift.rank}</div>
                </div>
                <div className="gift-card-content">
                  <div className="category-badge">{gift.category}</div>
                  <h3 className="gift-card-title">{gift.name}</h3>
                  <div className="gift-card-price">
                    <span className="price">{gift.price}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <button className="view-all-button" onClick={() => navigate('/popular-gifts')}>전체보기</button>
        </div>

        {/* Important Alerts Section */}
        <div className="alerts-section">
          <h2 className="alerts-title">중요 알림</h2>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="alert-card">
                  <p className="alert-text">{alert.text}</p>
                  <button 
                    className="alert-button"
                    onClick={() => handleViewAlert(alert)}
                  >
                    보기
                  </button>
                </div>
              ))
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
    </div>
  )
}

export default LandingPage

