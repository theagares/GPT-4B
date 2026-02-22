import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './MyPage.css'

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(200, 195, 245, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(191, 219, 254, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(167, 243, 208, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(252, 231, 243, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(255, 237, 213, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(221, 214, 254, 1) 100%)',
}

// 명함 디자인별 배경색 맵 (명함 색상보다 약간 더 밝게)
const backgroundColors = {
  'design-1': 'linear-gradient(180deg, rgba(180, 170, 245, 1) 0%, rgba(140, 125, 235, 1) 100%)',
  'design-2': 'linear-gradient(180deg, rgba(147, 197, 253, 1) 0%, rgba(96, 165, 250, 1) 100%)',
  'design-3': 'linear-gradient(180deg, rgba(167, 243, 208, 1) 0%, rgba(110, 231, 183, 1) 100%)',
  'design-4': 'linear-gradient(180deg, rgba(251, 207, 232, 1) 0%, rgba(244, 114, 182, 1) 100%)',
  'design-5': 'linear-gradient(180deg, rgba(254, 215, 170, 1) 0%, rgba(253, 186, 116, 1) 100%)',
  'design-6': 'linear-gradient(180deg, rgba(221, 214, 254, 1) 0%, rgba(165, 180, 252, 1) 100%)',
}

function hexToRgbLocal(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 109, g: 48, b: 223 }
}

function resolveCardDesign(designId) {
  if (designId && designId.startsWith('custom-')) {
    const hex = designId.replace('custom-', '')
    const { r, g, b } = hexToRgbLocal(hex)
    const dr = Math.round(Math.max(0, r * 0.85))
    const dg = Math.round(Math.max(0, g * 0.85))
    const db = Math.round(Math.max(0, b * 0.85))
    return `linear-gradient(147.99deg, rgba(${r},${g},${b},1) 0%, rgba(${dr},${dg},${db},1) 100%)`
  }
  return cardDesigns[designId] || cardDesigns['design-1']
}

function getCardTextColorsLocal(designId) {
  if (designId && designId.startsWith('custom-')) {
    const hex = designId.replace('custom-', '')
    const { r, g, b } = hexToRgbLocal(hex)
    const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
    return {
      main: light ? '#1f2937' : 'white',
      sub: light ? 'rgba(31,41,55,0.6)' : 'rgba(255,255,255,0.7)',
      contact: light ? 'rgba(31,41,55,0.5)' : 'rgba(255,255,255,0.6)',
    }
  }
  return { main: 'white', sub: 'rgba(255,255,255,0.7)', contact: 'rgba(255,255,255,0.6)' }
}

function resolveBackgroundColor(designId) {
  if (designId && designId.startsWith('custom-')) {
    const hex = designId.replace('custom-', '')
    const { r, g, b } = hexToRgbLocal(hex)
    // 명함 색상보다 약간 더 밝은 배경 (흰색과 블렌드)
    const lr = Math.min(255, Math.round(r + (255 - r) * 0.4))
    const lg = Math.min(255, Math.round(g + (255 - g) * 0.4))
    const lb = Math.min(255, Math.round(b + (255 - b) * 0.4))
    const mr = Math.min(255, Math.round(r + (255 - r) * 0.2))
    const mg = Math.min(255, Math.round(g + (255 - g) * 0.2))
    const mb = Math.min(255, Math.round(b + (255 - b) * 0.2))
    return `linear-gradient(180deg, rgba(${lr},${lg},${lb},1) 0%, rgba(${mr},${mg},${mb},1) 100%)`
  }
  return backgroundColors[designId] || backgroundColors['design-1']
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, time: 0 })
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [touchStartTime, setTouchStartTime] = useState(null)
  const [myCardDesign, setMyCardDesign] = useState('design-1')
  const [myInfo, setMyInfo] = useState({
    name: '',
    position: '',
    company: '',
    phone: '',
    email: '',
    memo: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // DB에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isAuthenticated()) {
        // 로그인하지 않은 경우 localStorage에서 가져오기
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setMyInfo(JSON.parse(savedInfo));
        } else {
          setMyInfo({
            name: "박상무",
            position: "상무",
            company: "한국프로축구연맹 영업본부",
            phone: "010-1234-5678",
            email: "sangmu.park@example.com",
            memo: "",
          });
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await userAPI.getProfile();
        if (response.data.success) {
          const userData = response.data.data;
          const savedInfo = localStorage.getItem('my-info');
          const localInfo = savedInfo ? JSON.parse(savedInfo) : {};
          
          setMyInfo({
            name: userData.name || localInfo.name || '',
            position: userData.position || localInfo.position || '',
            company: userData.company || localInfo.company || '',
            phone: userData.phone || localInfo.phone || '',
            email: userData.email || localInfo.email || '',
            memo: localInfo.memo || '',
          });
          
          // DB에서 디자인 정보 가져오기
          if (userData.cardDesign) {
            setMyCardDesign(userData.cardDesign);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 에러 발생 시 localStorage에서 가져오기
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setMyInfo(JSON.parse(savedInfo));
        }
        const savedDesign = localStorage.getItem('my-card-design');
        if (savedDesign) {
          setMyCardDesign(savedDesign);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [])

  // 최소 스와이프 거리 (픽셀) - 적당히 스와이프하면 완료되도록 낮춤
  const minSwipeDistance = 100
  // 빠른 스와이프를 위한 최소 거리 (속도 고려)
  const minFastSwipeDistance = 50

  // 디자인 변경 감지 (DB 업데이트 후)
  useEffect(() => {
    const handleDesignChange = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile();
          if (response.data.success && response.data.data.cardDesign) {
            setMyCardDesign(response.data.data.cardDesign);
          }
        } catch (error) {
          console.error('Failed to fetch card design:', error);
        }
      }
    };
    
    window.addEventListener('myCardDesignChanged', handleDesignChange);
    window.addEventListener('myInfoUpdated', handleDesignChange);
    
    return () => {
      window.removeEventListener('myCardDesignChanged', handleDesignChange);
      window.removeEventListener('myInfoUpdated', handleDesignChange);
    };
  }, [])

  // 내 정보 업데이트 감지
  useEffect(() => {
    const handleMyInfoUpdate = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile();
          if (response.data.success) {
            const userData = response.data.data;
            const savedInfo = localStorage.getItem('my-info');
            const localInfo = savedInfo ? JSON.parse(savedInfo) : {};
            
            setMyInfo({
              name: userData.name || localInfo.name || '',
              position: userData.position || localInfo.position || '',
              company: userData.company || localInfo.company || '',
              phone: userData.phone || localInfo.phone || '',
              email: userData.email || localInfo.email || '',
              memo: localInfo.memo || '',
            });
          }
        } catch (error) {
          console.error('Failed to refresh user info:', error);
        }
      } else {
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setMyInfo(JSON.parse(savedInfo));
        }
      }
    }
    window.addEventListener('myInfoUpdated', handleMyInfoUpdate)
    // 페이지 포커스 시에도 업데이트
    const handleFocus = async () => {
      if (isAuthenticated()) {
        try {
          const response = await userAPI.getProfile();
          if (response.data.success) {
            const userData = response.data.data;
            const savedInfo = localStorage.getItem('my-info');
            const localInfo = savedInfo ? JSON.parse(savedInfo) : {};
            
            setMyInfo({
              name: userData.name || localInfo.name || '',
              position: userData.position || localInfo.position || '',
              company: userData.company || localInfo.company || '',
              phone: userData.phone || localInfo.phone || '',
              email: userData.email || localInfo.email || '',
              memo: localInfo.memo || '',
            });
          }
        } catch (error) {
          console.error('Failed to refresh user info:', error);
        }
      } else {
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setMyInfo(JSON.parse(savedInfo));
        }
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('myInfoUpdated', handleMyInfoUpdate)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleCardClick = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const card = cardRef.current
    if (card) {
      // 명함 카드가 위로 자연스럽게 올라가는 애니메이션
      card.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out'
      card.style.transform = 'translateY(-80vh) rotate(0deg) scale(0.9)'
      card.style.opacity = '0'
      
      // 애니메이션 완료 후 상세 페이지로 이동
      setTimeout(() => {
        navigate('/my/detail')
      }, 1000)
    }
  }

  const handleSwipeUp = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const card = cardRef.current
    if (card) {
      // 명함 카드가 위로 자연스럽게 올라가는 애니메이션
      card.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out'
      card.style.transform = 'translateY(-80vh) rotate(0deg) scale(0.9)'
      card.style.opacity = '0'
      
      // 애니메이션 완료 후 상세 페이지로 이동
      setTimeout(() => {
        navigate('/my/detail')
      }, 1000)
    }
  }

  // 카드 클릭 처리
  const handleCardClickEvent = (e) => {
    // 드래그가 발생하지 않았고 애니메이션 중이 아닐 때만 클릭 처리
    const dragDistance = Math.abs(dragStart.x - dragCurrent.x) + Math.abs(dragStart.y - dragCurrent.y)
    if (dragDistance < 5 && !isAnimating) {
      handleCardClick()
    }
  }

  // 카드 드래그 시작 (마우스)
  const onCardMouseDown = (e) => {
    if (isAnimating) return
    e.preventDefault() // 기본 동작 방지
    e.stopPropagation() // 클릭 이벤트 전파 방지
    setIsDragging(false) // 초기값을 false로 설정
    setDragStart({ x: e.clientX, y: e.clientY, time: Date.now() })
    setDragCurrent({ x: e.clientX, y: e.clientY })
  }

  // 카드 드래그 종료 (마우스)
  const onCardMouseUp = (e) => {
    if (isAnimating) return
    e.stopPropagation() // 클릭 이벤트 전파 방지
    
    const deltaY = dragStart.y - dragCurrent.y
    const timeElapsed = dragStart.time ? Date.now() - dragStart.time : 0
    const velocity = timeElapsed > 0 ? Math.abs(deltaY) / timeElapsed : 0 // px/ms
    
    if (isDragging) {
      // 빠른 스와이프인 경우 (속도가 0.5px/ms 이상) 더 적은 거리로도 완료
      const isFastSwipe = velocity > 0.5
      const requiredDistance = isFastSwipe ? minFastSwipeDistance : minSwipeDistance
      
      if (deltaY > requiredDistance) {
        handleSwipeUp()
      } else {
        // 드래그 거리가 부족하면 원래 위치로 복귀
        const card = cardRef.current
        if (card) {
          card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
          card.style.transform = 'translateY(0) rotate(0deg)'
          card.style.opacity = '1'
        }
      }
    }
    
    setIsDragging(false)
    setDragStart({ x: 0, y: 0, time: 0 })
    setDragCurrent({ x: 0, y: 0 })
  }

  // 카드 터치 시작
  const onCardTouchStart = (e) => {
    if (isAnimating) return
    setTouchEnd(null)
    setTouchStart(e.touches[0].clientY)
    setTouchStartTime(Date.now())
    setIsDragging(false) // 초기값을 false로 설정
  }

  // 카드 터치 이동
  const onCardTouchMove = (e) => {
    if (isAnimating) return
    
    const currentY = e.touches[0].clientY
    setTouchEnd(currentY)
    
    if (touchStart !== null) {
      const deltaY = Math.abs(touchStart - currentY)
      
      // 드래그가 시작되었는지 확인 (5px 이상 이동)
      if (deltaY > 5) {
        setIsDragging(true)
      }
      
      if (isDragging) {
        const moveY = touchStart - currentY
        
        if (moveY > 0) {
          const card = cardRef.current
          if (card) {
            card.style.transition = 'none'
            card.style.transform = `translateY(${-moveY}px) rotate(0deg)`
            card.style.opacity = Math.max(0, 1 - moveY / 200)
            
            // 일정 거리 이상 이동하면 자동으로 완료 (150px 이상)
            if (moveY > 150) {
              handleSwipeUp()
              setIsDragging(false)
              setTouchStart(null)
              setTouchEnd(null)
              setTouchStartTime(null)
            }
          }
        }
      }
    }
  }

  // 카드 터치 종료
  const onCardTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return
    
    const distance = touchStart - touchEnd
    const timeElapsed = touchStartTime ? Date.now() - touchStartTime : 0
    const velocity = timeElapsed > 0 ? Math.abs(distance) / timeElapsed : 0 // px/ms
    
    // 빠른 스와이프인 경우 (속도가 0.5px/ms 이상) 더 적은 거리로도 완료
    const isFastSwipe = velocity > 0.5
    const requiredDistance = isFastSwipe ? minFastSwipeDistance : minSwipeDistance
    const isUpSwipe = distance > requiredDistance

    if (isUpSwipe) {
      handleSwipeUp()
    } else {
      // 드래그 거리가 부족하면 원래 위치로 복귀
      const card = cardRef.current
      if (card) {
        card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
        card.style.transform = 'translateY(0) rotate(0deg)'
        card.style.opacity = '1'
      }
    }
    
    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
    setTouchStartTime(null)
  }

  // 전역 마우스 이벤트 리스너 (드래그 중 마우스가 요소 밖으로 나갔을 때)
  useEffect(() => {
    if (!dragStart || dragStart.x === 0 && dragStart.y === 0) return
    
    const handleMouseMove = (e) => {
      if (isAnimating) return
      
      const newY = e.clientY
      const newX = e.clientX
      const deltaY = Math.abs(dragStart.y - newY)
      const deltaX = Math.abs(dragStart.x - newX)
      
      // 드래그가 시작되었는지 확인 (5px 이상 이동)
      if (deltaY > 5 || deltaX > 5) {
        setIsDragging(true)
      }
      
      if (isDragging) {
        const moveY = dragStart.y - newY
        
        if (moveY > 0) {
          setDragCurrent({ x: newX, y: newY })
          const card = cardRef.current
          if (card) {
            card.style.transition = 'none'
            card.style.transform = `translateY(${-moveY}px) rotate(0deg)`
            card.style.opacity = Math.max(0, 1 - moveY / 200)
            
            // 일정 거리 이상 이동하면 자동으로 완료 (150px 이상)
            if (moveY > 150) {
              handleSwipeUp()
              setIsDragging(false)
              setDragStart({ x: 0, y: 0, time: 0 })
              setDragCurrent({ x: 0, y: 0 })
            }
          }
        }
      }
    }
    
    const handleMouseUp = (e) => {
      if (isAnimating) return
      
      const deltaY = dragStart.y - dragCurrent.y
      const timeElapsed = dragStart.time ? Date.now() - dragStart.time : 0
      const velocity = timeElapsed > 0 ? Math.abs(deltaY) / timeElapsed : 0 // px/ms
      
      if (isDragging) {
        // 빠른 스와이프인 경우 (속도가 0.5px/ms 이상) 더 적은 거리로도 완료
        const isFastSwipe = velocity > 0.5
        const requiredDistance = isFastSwipe ? minFastSwipeDistance : minSwipeDistance
        
        if (deltaY > requiredDistance) {
          handleSwipeUp()
        } else {
          // 드래그 거리가 부족하면 원래 위치로 복귀
          const card = cardRef.current
          if (card) {
            card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
            card.style.transform = 'translateY(0) rotate(0deg)'
            card.style.opacity = '1'
          }
        }
      }
      
      setIsDragging(false)
      setDragStart({ x: 0, y: 0, time: 0 })
      setDragCurrent({ x: 0, y: 0 })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragStart, dragCurrent, isDragging, isAnimating, minSwipeDistance, minFastSwipeDistance])

  const handleBack = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="my-page">
        <div className="my-page-background" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p style={{ color: 'white' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="my-page"
      ref={containerRef}
      style={{ background: resolveBackgroundColor(myCardDesign) }}
    >
      <div 
        className="my-page-background"
        style={{
          background: resolveBackgroundColor(myCardDesign)
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
            onClick={handleCardClickEvent}
            onMouseDown={onCardMouseDown}
            onTouchStart={onCardTouchStart}
            onTouchMove={onCardTouchMove}
            onTouchEnd={onCardTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer', userSelect: 'none', touchAction: 'pan-y' }}
          >
            <div 
              className="card-content"
              style={{
                background: resolveCardDesign(myCardDesign)
              }}
            >
              {(() => { const tc = getCardTextColorsLocal(myCardDesign); return (<>
              {/* 우측 상단 연락처 정보 */}
              <div className="card-contact">
                <p className="card-phone" style={{ color: tc.contact }}>{myInfo.phone}</p>
                <p className="card-email" style={{ color: tc.contact }}>{myInfo.email}</p>
              </div>
              
              <div className="card-header">
                <div className="card-logo">
                  <img src="/assets/mars_logo_white.png" alt="M Logo" />
                </div>
                <div className="card-info">
                  <h2 className="card-name" style={{ color: tc.main }}>{myInfo.name}</h2>
                </div>
              </div>
              
              {/* 하단 소속/직급 정보 */}
              <div className="card-details">
                <p className="card-company" style={{ color: tc.sub }}>{myInfo.company}</p>
                <p className="card-position" style={{ color: tc.sub }}>{myInfo.position}</p>
              </div>
              </>); })()}
            </div>
          </div>
        </div>

        {/* 스와이프 업 안내 버튼 */}
        <div className="swipe-up-button" style={{ pointerEvents: 'none' }}>
          <div className="swipe-arrows">
            <div className="arrow-up">
              <ArrowUpIcon />
            </div>
            <div className="arrow-up">
              <ArrowUpIcon />
            </div>
          </div>
          <p className="swipe-text">내 프로필 카드를 눌러 상세정보 확인</p>
        </div>
      </div>
    </div>
  )
}

export default MyPage

