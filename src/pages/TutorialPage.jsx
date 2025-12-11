import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './TutorialPage.css'

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: '환영합니다! 성공적인 비즈니스를 위한 첫걸음, 핵심 기능부터 알려드릴게요.',
    image: '/assets/tutorial/tutorial-1.png', // 첫 번째 튜토리얼 이미지 경로
    description: '인기선물 및 중요 알림을 확인할 수 있습니다.'
  },
  {
    step: 2,
    title: '홈 화면',
    image: '/assets/tutorial/tutorial-2.png',
    description: '인기선물부터 중요 일정 알림까지,\n핵심 정보를 한눈에 확인해보세요.'
  },
  {
    step: 3,
    title: '명함집',
    image: '/assets/tutorial/tutorial-3.png',
    description: '명함을 등록하고 관리해요.'
  },
  {
    step: 4,
    title: '선물 추천',
    image: '/assets/tutorial/tutorial-4.png',
    description: '선물을 보낼 상대방의 프로필을 선택해\nGPT-4b의 맞춤 추천을 받을 수 있습니다.'
  },
  {
    step: 5,
    title: '캘린더',
    image: '/assets/tutorial/tutorial-5.png',
    description: '중요한 일정을 기록하고 확인해요.'
  },
  {
    step: 6,
    title: 'MY 명함',
    image: '/assets/tutorial/tutorial-6.png',
    description: '등록된 내 상세 정보를 확인하고\n내용을 수정할 수 있어요.'
  }
]

function TutorialPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [showIntermediateImage, setShowIntermediateImage] = useState(false)
  const [showTutorial60, setShowTutorial60] = useState(false)

  const handleNext = () => {
    // step 4 (currentStep === 3)에서 다음을 누르면 중간 이미지 표시
    if (currentStep === 3) {
      setShowIntermediateImage(true)
      // 1초 후 자동으로 step 5로 이동
      setTimeout(() => {
        setShowIntermediateImage(false)
        setCurrentStep(4)
      }, 1000)
    } else if (currentStep === 4) {
      // step 5에서 다음을 누르면 step 6으로 이동하고 tutorial-6-0 표시
      setCurrentStep(5)
      setShowTutorial60(true)
    } else if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 마지막 단계에서 완료하면 대시보드로 이동
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (showTutorial60) {
      // tutorial-6-0 표시 중이면 step 5로 돌아감
      setShowTutorial60(false)
      setCurrentStep(4)
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // 튜토리얼 완료 상태를 localStorage에 저장 (선택사항)
    localStorage.setItem('tutorialCompleted', 'true')
    // 대시보드로 이동
    navigate('/dashboard', { state: { showCardCompleteModal: true } })
  }

  const currentTutorial = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1
  
  // 중간 이미지 표시 중일 때 사용할 이미지
  const intermediateImage = showIntermediateImage ? '/assets/tutorial/tutorial-4-1.png' : null
  
  // step 6에서 tutorial-6-0이 표시 중일 때 화면 클릭 시 tutorial-6으로 이동
  const handleScreenClick = () => {
    if (currentStep === 5 && showTutorial60) {
      // tutorial-6-0 표시 중이면 tutorial-6으로 이동
      setShowTutorial60(false)
    } else if (currentStep === 5 && !showTutorial60) {
      // tutorial-6 표시 중이면 완료
      handleComplete()
    }
  }

  // 키보드 이벤트 처리 (좌우 화살표 키)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        if (showIntermediateImage) {
          // 중간 이미지 표시 중이면 바로 step 5로 이동
          setShowIntermediateImage(false)
          setCurrentStep(4)
        } else if (currentStep === 3) {
          // step 4에서 다음을 누르면 중간 이미지 표시
          setShowIntermediateImage(true)
          setTimeout(() => {
            setShowIntermediateImage(false)
            setCurrentStep(4)
          }, 1000)
        } else if (currentStep === 4) {
          // step 5에서 다음을 누르면 step 6으로 이동하고 tutorial-6-0 표시
          setCurrentStep(5)
          setShowTutorial60(true)
        } else if (currentStep === 5) {
          // step 6에서 처리
          if (showTutorial60) {
            setShowTutorial60(false)
          } else {
            handleComplete()
          }
        } else if (currentStep < TUTORIAL_STEPS.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          handleComplete()
        }
      } else if (e.key === 'ArrowLeft') {
        if (showIntermediateImage) {
          // 중간 이미지 표시 중이면 step 4로 돌아감
          setShowIntermediateImage(false)
        } else if (showTutorial60) {
          // tutorial-6-0 표시 중이면 step 5로 돌아감
          setShowTutorial60(false)
          setCurrentStep(4)
        } else if (currentStep > 0) {
          setCurrentStep(currentStep - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, navigate, showIntermediateImage, showTutorial60])

  // 터치 스와이프 이벤트 처리
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    // step 6에서 tutorial-6-0 표시 중일 때만 화면 터치 시 처리
    if (currentStep === 5 && !showIntermediateImage && showTutorial60) {
      const touchDistance = Math.abs(touchStart - touchEnd)
      // 스와이프가 아닌 단순 터치인 경우 (거리가 작을 때)
      if (touchDistance < minSwipeDistance) {
        handleScreenClick()
        return
      }
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      if (showIntermediateImage) {
        // 중간 이미지 표시 중이면 바로 step 5로 이동
        setShowIntermediateImage(false)
        setCurrentStep(4)
      } else if (currentStep === 3) {
        // step 4에서 다음을 누르면 중간 이미지 표시
        setShowIntermediateImage(true)
        setTimeout(() => {
          setShowIntermediateImage(false)
          setCurrentStep(4)
        }, 1000)
      } else if (currentStep === 4) {
        // step 5에서 다음을 누르면 step 6으로 이동하고 tutorial-6-0 표시
        setCurrentStep(5)
        setShowTutorial60(true)
      } else if (currentStep === 5) {
        // step 6에서 처리
        if (showTutorial60) {
          setShowTutorial60(false)
        } else {
          handleComplete()
        }
      } else if (currentStep < TUTORIAL_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleComplete()
      }
    } else if (isRightSwipe) {
      if (showIntermediateImage) {
        // 중간 이미지 표시 중이면 step 4로 돌아감
        setShowIntermediateImage(false)
      } else if (showTutorial60) {
        // tutorial-6-0 표시 중이면 step 5로 돌아감
        setShowTutorial60(false)
        setCurrentStep(4)
      } else if (currentStep > 0) {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  return (
    <div 
      className="tutorial-page"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={currentStep === 5 && !showIntermediateImage ? handleScreenClick : undefined}
      style={currentStep === 5 && !showIntermediateImage ? { cursor: 'pointer' } : {}}
    >
      <div className="tutorial-container">
        {/* 상단 제목 및 설명 */}
        <div className="tutorial-welcome-section">
          {currentStep === 0 ? (
            <>
              <h1 className="tutorial-welcome-title tutorial-title-glow">환영합니다!</h1>
              <p className="tutorial-welcome-subtitle">
                성공적인 비즈니스를 위한 첫걸음,
                <br />
                핵심 기능부터 알려드릴게요.
              </p>
            </>
          ) : (
            <>
              <h1 className="tutorial-welcome-title tutorial-title-glow">{currentTutorial.title}</h1>
              <p className="tutorial-welcome-subtitle">
                {currentTutorial.description.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < currentTutorial.description.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </>
          )}
          
          {/* 단계 표시 */}
          <div className="tutorial-step-indicator">
            <div className="step-dots">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 - 이미지 */}
        <div 
          className="tutorial-content"
          onClick={(e) => {
            // step 6에서 화면 클릭 처리 (버튼 영역 제외)
            if (currentStep === 5 && !showIntermediateImage && !e.target.closest('.tutorial-navigation')) {
              e.stopPropagation()
              handleScreenClick()
            }
          }}
        >
          <div className="tutorial-image-container">
            <img 
              src={showTutorial60 ? '/assets/tutorial/tutorial-6-0.png' : (intermediateImage || currentTutorial.image)} 
              alt={`튜토리얼 ${showTutorial60 ? '6-0' : (showIntermediateImage ? '4-1' : currentStep + 1)}`}
              className="tutorial-image"
              onError={(e) => {
                // 이미지 로드 실패 시 플레이스홀더 표시
                e.target.style.display = 'none'
                e.target.nextSibling?.classList.remove('hidden')
              }}
            />
            <div className="tutorial-image-placeholder hidden">
              <p style={{ color: '#fff' }}>튜토리얼 이미지 {currentStep + 1}</p>
              <p className="placeholder-path" style={{ color: '#ccc' }}>{currentTutorial.image}</p>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        {!showIntermediateImage && !showTutorial60 && (
          <div className="tutorial-navigation" onClick={(e) => e.stopPropagation()}>
            <button
              className="nav-button prev-button"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              disabled={currentStep === 0}
            >
              이전
            </button>
            <button
              className="nav-button next-button"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            >
              {isLastStep ? '시작하기' : '다음'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TutorialPage

