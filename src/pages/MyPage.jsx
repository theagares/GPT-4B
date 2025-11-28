import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyPage.css'

// 이미지 URL
const imgGpt4B2 = "https://www.figma.com/api/mcp/asset/cd29f31a-6dd1-4564-9d37-1a87e76147bd"
const imgVector = "https://www.figma.com/api/mcp/asset/711cfff5-444e-4151-9308-a5686c4411d8"

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

  // 최소 스와이프 거리 (픽셀)
  const minSwipeDistance = 300

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

  return (
    <div 
      className="my-page"
      ref={containerRef}
    >
      <div className="my-page-background">
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
            <div className="card-content">
              <div className="card-header">
                <div className="card-logo">
                  <img src={imgGpt4B2} alt="GPT-4b Logo" />
                </div>
                <div className="card-info">
                  <h2 className="card-name">박상무</h2>
                  <p className="card-position">상무</p>
                  <p className="card-department">영업본부</p>
                </div>
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

