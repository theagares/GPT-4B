import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
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

// 이미지 URL
const imgGpt4B2 = "https://www.figma.com/api/mcp/asset/cd29f31a-6dd1-4564-9d37-1a87e76147bd"
const imgVector = "https://www.figma.com/api/mcp/asset/711cfff5-444e-4151-9308-a5686c4411d8"
const imgVector4 = "https://www.figma.com/api/mcp/asset/9f59a389-f83e-4f13-b23f-43517aa98dce"

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

  // 최소 스와이프 거리 (픽셀)
  const minSwipeDistance = 300

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
              <img src={imgVector4} alt="뒤로" style={{ filter: 'brightness(0) invert(1)' }} />
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
                  <img src={imgGpt4B2} alt="GPT-4b Logo" />
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
              <img src={imgVector} alt="위로" />
            </div>
            <div className="arrow-up">
              <img src={imgVector} alt="위로" />
            </div>
          </div>
          <p className="swipe-text">위로 밀어서 상세정보 확인하기</p>
        </button>
      </div>
    </div>
  )
}

export default MyPage

