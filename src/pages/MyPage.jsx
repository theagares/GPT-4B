import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyPage.css'

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(255, 255, 255, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(255, 255, 255, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(255, 255, 255, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(255, 255, 255, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(255, 255, 255, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(255, 255, 255, 1) 100%)',
}

// 명함 디자인별 배경색 맵
const backgroundColors = {
  'design-1': 'linear-gradient(180deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(180deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(180deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(180deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)',
  'design-5': 'linear-gradient(180deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(180deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

// 뒤로가기 아이콘 SVG 컴포넌트
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 위로 화살표 아이콘 SVG 컴포넌트
function ArrowUpIcon() {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L6 5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MyPage() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [myCardDesign, setMyCardDesign] = useState('design-1')
  
  // 내 정보 상태
  const loadMyInfo = () => {
    const savedInfo = localStorage.getItem('my-info');
    if (savedInfo) {
      return JSON.parse(savedInfo);
    }
    // 기본값
    return {
      name: "박상무",
      position: "상무",
      company: "한국프로축구연맹 영업본부",
      phone: "010-1234-5678",
      email: "sangmu.park@example.com",
      memo: "",
    };
  };

  const [myInfo, setMyInfo] = useState(loadMyInfo())

  // 최소 스와이프 거리 (픽셀)
  const minSwipeDistance = 300

  // localStorage에서 내 명함 디자인 불러오기
  useEffect(() => {
    const savedDesign = localStorage.getItem('my-card-design')
    if (savedDesign) {
      setMyCardDesign(savedDesign)
    }
  }, [])

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDesign = localStorage.getItem('my-card-design')
      if (savedDesign) {
        setMyCardDesign(savedDesign)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    // 같은 탭에서의 변경도 감지하기 위해 커스텀 이벤트 사용
    window.addEventListener('myCardDesignChanged', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('myCardDesignChanged', handleStorageChange)
    }
  }, [])

  // 내 정보 업데이트 감지
  useEffect(() => {
    const handleMyInfoUpdate = () => {
      setMyInfo(loadMyInfo())
    }
    window.addEventListener('myInfoUpdated', handleMyInfoUpdate)
    // 페이지 포커스 시에도 업데이트
    const handleFocus = () => {
      setMyInfo(loadMyInfo())
    }
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('myInfoUpdated', handleMyInfoUpdate)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleSwipeUp = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const card = cardRef.current
    if (card) {
      // 명함 카드가 위로 사라지는 애니메이션 (더 천천히)
      card.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out'
      card.style.transform = 'translateY(-100vh) rotate(90deg)'
      card.style.opacity = '0'
      
      // 애니메이션 완료 후 상세 페이지로 이동
      setTimeout(() => {
        navigate('/my/detail')
      }, 1200)
    }
  }

  // 카드 드래그 시작 (마우스)
  const onCardMouseDown = (e) => {
    if (isAnimating) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragCurrent({ x: e.clientX, y: e.clientY })
  }

  // 카드 드래그 중 (마우스)
  const onCardMouseMove = (e) => {
    if (!isDragging || isAnimating) return
    
    const newY = e.clientY
    const deltaY = dragStart.y - newY
    
    if (deltaY > 0) {
      setDragCurrent({ x: e.clientX, y: newY })
      const card = cardRef.current
      if (card) {
        card.style.transition = 'none'
        card.style.transform = `translateY(${-deltaY}px) rotate(90deg)`
        card.style.opacity = Math.max(0, 1 - deltaY / 200)
      }
    }
  }

  // 카드 드래그 종료 (마우스)
  const onCardMouseUp = (e) => {
    if (!isDragging || isAnimating) return
    
    const deltaY = dragStart.y - dragCurrent.y
    
    if (deltaY > minSwipeDistance) {
      handleSwipeUp()
    } else {
      // 드래그 거리가 부족하면 원래 위치로 복귀
      const card = cardRef.current
      if (card) {
        card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
        card.style.transform = 'translateY(0) rotate(90deg)'
        card.style.opacity = '1'
      }
    }
    
    setIsDragging(false)
    setDragStart({ x: 0, y: 0 })
    setDragCurrent({ x: 0, y: 0 })
  }

  // 카드 터치 시작
  const onCardTouchStart = (e) => {
    if (isAnimating) return
    setTouchEnd(null)
    setTouchStart(e.touches[0].clientY)
    setIsDragging(true)
  }

  // 카드 터치 이동
  const onCardTouchMove = (e) => {
    if (!isDragging || isAnimating) return
    
    const currentY = e.touches[0].clientY
    setTouchEnd(currentY)
    
    if (touchStart !== null) {
      const deltaY = touchStart - currentY
      
      if (deltaY > 0) {
        const card = cardRef.current
        if (card) {
          card.style.transition = 'none'
          card.style.transform = `translateY(${-deltaY}px) rotate(90deg)`
          card.style.opacity = Math.max(0, 1 - deltaY / 200)
        }
      }
    }
  }

  // 카드 터치 종료
  const onCardTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return
    
    const distance = touchStart - touchEnd
    const isUpSwipe = distance > minSwipeDistance

    if (isUpSwipe) {
      handleSwipeUp()
    } else {
      // 드래그 거리가 부족하면 원래 위치로 복귀
      const card = cardRef.current
      if (card) {
        card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
        card.style.transform = 'translateY(0) rotate(90deg)'
        card.style.opacity = '1'
      }
    }
    
    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return
    
    const handleMouseMove = (e) => {
      if (!isDragging || isAnimating) return
      
      const newY = e.clientY
      const deltaY = dragStart.y - newY
      
      if (deltaY > 0) {
        setDragCurrent({ x: e.clientX, y: newY })
        const card = cardRef.current
        if (card) {
          card.style.transition = 'none'
          card.style.transform = `translateY(${-deltaY}px) rotate(90deg)`
          card.style.opacity = Math.max(0, 1 - deltaY / 200)
        }
      }
    }
    
    const handleMouseUp = (e) => {
      if (!isDragging || isAnimating) return
      
      const deltaY = dragStart.y - dragCurrent.y
      
      if (deltaY > minSwipeDistance) {
        handleSwipeUp()
      } else {
        // 드래그 거리가 부족하면 원래 위치로 복귀
        const card = cardRef.current
        if (card) {
          card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
          card.style.transform = 'translateY(0) rotate(90deg)'
          card.style.opacity = '1'
        }
      }
      
      setIsDragging(false)
      setDragStart({ x: 0, y: 0 })
      setDragCurrent({ x: 0, y: 0 })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, dragCurrent, isAnimating, minSwipeDistance])

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div 
      className="my-page"
      ref={containerRef}
    >
      <div 
        className="my-page-background"
        style={{
          background: backgroundColors[myCardDesign] || backgroundColors['design-1']
        }}
      >
        {/* 뒤로 가기 버튼 */}
        <div className="my-page-header">
          <button className="back-button" onClick={handleBack}>
            <div className="back-icon">
              <BackIcon />
            </div>
          </button>
        </div>

        {/* 개인 명함 카드 */}
        <div className="business-card-container">
          <div 
            className="business-card" 
            ref={cardRef}
            onMouseDown={onCardMouseDown}
            onTouchStart={onCardTouchStart}
            onTouchMove={onCardTouchMove}
            onTouchEnd={onCardTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          >
            <div 
              className="card-content"
              style={{
                background: cardDesigns[myCardDesign] || cardDesigns['design-1']
              }}
            >
              {/* 우측 상단 연락처 정보 */}
              <div className="card-contact">
                <p className="card-phone">{myInfo.phone}</p>
                <p className="card-email">{myInfo.email}</p>
              </div>
              
              <div className="card-header">
                <div className="card-logo">
                  <img src="/assets/gpt_4b_logo_white.png" alt="GPT-4b Logo" />
                </div>
                <div className="card-info">
                  <h2 className="card-name">{myInfo.name}</h2>
                </div>
              </div>
              
              {/* 하단 소속/직급 정보 */}
              <div className="card-details">
                <p className="card-company">{myInfo.company}</p>
                <p className="card-position">{myInfo.position}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 스와이프 업 안내 버튼 */}
        <button className="swipe-up-button" onClick={handleSwipeUp} disabled={isAnimating}>
          <div className="swipe-arrows">
            <div className="arrow-up">
              <ArrowUpIcon />
            </div>
            <div className="arrow-up">
              <ArrowUpIcon />
            </div>
          </div>
          <p className="swipe-text">위로 밀어서 상세정보 확인하기</p>
        </button>
      </div>
    </div>
  )
}

export default MyPage

