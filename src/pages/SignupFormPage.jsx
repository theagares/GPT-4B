import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { setToken, setUser } from '../utils/auth'
import './SignupFormPage.css'

function SignupFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [maxStepReached, setMaxStepReached] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // SignupPage에서 전달받은 username과 password
  const { username, password } = location.state || {}
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    affiliation: '',
    position: ''
  })
  const [isValid, setIsValid] = useState(false)
  
  // SignupPage에서 받은 정보가 없으면 돌아가기
  useEffect(() => {
    if (!username || !password) {
      alert('회원가입 정보가 누락되었습니다. 처음부터 다시 시도해주세요.')
      navigate('/signup')
    }
  }, [username, password, navigate])

  const steps = [
    { key: 'name', title: '이름을 입력해주세요', placeholder: '김길동' },
    { key: 'email', title: '메일주소를 입력해주세요', placeholder: 'example@email.com' },
    { key: 'phone', title: '전화번호를 입력해주세요', placeholder: '010-1234-5678' },
    { key: 'affiliation', title: '소속을 입력해주세요', placeholder: '삼성전자 US사업부' },
    { key: 'position', title: '직급을 입력해주세요', placeholder: '개발3팀장' }
  ]

  const currentStepData = steps[currentStep - 1]

  // 유효성 검사
  useEffect(() => {
    const value = formData[currentStepData.key]
    if (currentStep === 1) {
      // 이름: 최소 2글자
      setIsValid(value && value.length >= 2)
    } else if (currentStep === 2) {
      // 이메일: 이메일 형식
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setIsValid(emailRegex.test(value))
    } else if (currentStep === 3) {
      // 전화번호: 숫자와 하이픈 포함, 최소 10자
      const phoneRegex = /^[0-9-]+$/
      setIsValid(phoneRegex.test(value) && value.replace(/-/g, '').length >= 10)
    } else if (currentStep === 4) {
      // 소속: 최소 2글자
      setIsValid(value && value.length >= 2)
    } else if (currentStep === 5) {
      // 직급: 최소 1글자
      setIsValid(value && value.length >= 1)
    }
  }, [formData, currentStep, currentStepData.key])

  const handleInputChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      [currentStepData.key]: value
    }))
  }

  const handleContinue = async () => {
    if (isValid && currentStep < 5) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setMaxStepReached(prev => Math.max(prev, nextStep))
    } else if (isValid && currentStep === 5) {
      // 모든 단계 완료 - 회원가입 API 호출
      if (!username || !password) {
        alert('회원가입 정보가 누락되었습니다. 처음부터 다시 시도해주세요.')
        navigate('/signup')
        return
      }

      if (!formData.name || !formData.email) {
        alert('이름과 이메일을 입력해주세요.')
        return
      }

      setIsSubmitting(true)
      try {
        // 회원가입 API 호출 (username, email, password, name, phone, position, company)
        const response = await authAPI.register(
          username,
          formData.email,
          password,
          formData.name,
          formData.phone,
          formData.position,
          formData.affiliation // affiliation을 company로 사용
        )

        if (response.data.success) {
          // 토큰과 사용자 정보 저장
          setToken(response.data.token)
          setUser(response.data.user)
          
          // 이름을 localStorage에 저장 (기존 코드 호환성)
          if (formData.name) {
            localStorage.setItem('userName', formData.name)
          }
          
          // Welcome 화면으로 이동
          navigate('/welcome')
        } else {
          alert('회원가입에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'))
        }
      } catch (error) {
        console.error('Signup error:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        
        let errorMessage = '회원가입에 실패했습니다.'
        
        if (error.response?.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.errors && error.response.data.errors.length > 0) {
            // validation 에러 메시지 처리
            const validationErrors = error.response.data.errors.map(err => {
              if (err.msg) {
                // 한국어로 변환
                if (err.msg.includes('Username already exists') || err.msg.includes('이미 사용 중인 아이디')) {
                  return '이미 사용 중인 아이디입니다.'
                }
                if (err.msg.includes('Email already exists') || err.msg.includes('이미 사용 중인 이메일')) {
                  return '이미 사용 중인 이메일입니다.'
                }
                return err.msg
              }
              return err.message || '입력값을 확인해주세요.'
            })
            errorMessage = validationErrors.join(', ')
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        // username 중복 에러인 경우 회원가입 페이지로 돌아가기
        if (errorMessage.includes('아이디') || errorMessage.includes('Username')) {
          alert(errorMessage)
          navigate('/signup', { state: { username, password } })
        } else {
          alert(`회원가입 실패: ${errorMessage}`)
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleStepClick = (step) => {
    if (step <= maxStepReached) {
      setCurrentStep(step)
    }
  }

  const handleBack = () => {
    navigate('/signup', { state: { username, password } })
  }

  return (
    <div className="signup-form-screen has-back-header">
      <div className="signup-form-header">
        <button className="signup-form-back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="signup-form-header-content">
          <h1 className="signup-form-header-title">프로필 완성하기</h1>
        </div>
      </div>
      <div className="signup-form-container">
        {/* Progress Indicators */}
        <div className="progress-indicators">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="progress-indicator-wrapper">
              <button
                type="button"
                className={`progress-circle ${step <= maxStepReached ? 'active' : 'inactive'}`}
                onClick={() => handleStepClick(step)}
                disabled={step > maxStepReached}
              >
                {step}
              </button>
              {step === currentStep && <div className="progress-dot"></div>}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="form-content">
          <h1 className="form-title">{currentStepData.title}</h1>

          <div className="input-wrapper">
            <input
              type="text"
              value={formData[currentStepData.key]}
              onChange={handleInputChange}
              className="form-input"
              placeholder={currentStepData.placeholder}
            />
          </div>

          <button
            className={`continue-button ${isValid && !isSubmitting ? 'active' : 'disabled'}`}
            onClick={handleContinue}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? '처리 중...' : (currentStep === 5 ? '프로필 완성하기' : '입력 완료')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignupFormPage
