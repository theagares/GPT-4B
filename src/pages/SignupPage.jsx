import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './SignupPage.css'

// 체크 아이콘 SVG 컴포넌트
function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { username: savedUsername, password: savedPassword } = location.state || {}

  const [userId, setUserId] = useState(savedUsername || '')
  const [password, setPassword] = useState(savedPassword || '')
  const [confirmPassword, setConfirmPassword] = useState(savedPassword || '')
  const [userIdError, setUserIdError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isUserIdValid, setIsUserIdValid] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const checkUsernameTimeoutRef = useRef(null)

  // 아이디 유효성 검사 및 중복 체크
  useEffect(() => {
    // 기존 타이머 취소
    if (checkUsernameTimeoutRef.current) {
      clearTimeout(checkUsernameTimeoutRef.current)
    }

    if (userId.length === 0) {
      setIsUserIdValid(false)
      setUserIdError('')
      setIsCheckingUsername(false)
      return
    }

    // 아이디 규칙: 4자 이상, 영문 또는 영문+숫자 조합
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/
    
    // 형식 검증
    if (userId.length < 4) {
      setIsUserIdValid(false)
      setUserIdError('아이디는 4자 이상이어야 합니다')
      setIsCheckingUsername(false)
      return
    }
    
    if (!usernameRegex.test(userId)) {
      setIsUserIdValid(false)
      setUserIdError('아이디는 영문으로 시작하며 영문 또는 영문+숫자 조합이어야 합니다')
      setIsCheckingUsername(false)
      return
    }

    // 형식이 올바르면 서버에 중복 체크 요청 (debounce)
    setIsCheckingUsername(true)
    checkUsernameTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await authAPI.checkUsername(userId)
        
        if (response.data.success) {
          if (response.data.available) {
            setIsUserIdValid(true)
            setUserIdError('')
          } else {
            setIsUserIdValid(false)
            setUserIdError(response.data.message || '이미 사용 중인 아이디입니다')
          }
        } else {
          setIsUserIdValid(false)
          setUserIdError(response.data.message || '아이디 확인 중 오류가 발생했습니다')
        }
      } catch (error) {
        console.error('Username check error:', error)
        // 네트워크 에러 등은 일단 통과시키고, 회원가입 시 다시 체크
        setIsUserIdValid(true)
        setUserIdError('')
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500) // 500ms debounce

    // cleanup 함수
    return () => {
      if (checkUsernameTimeoutRef.current) {
        clearTimeout(checkUsernameTimeoutRef.current)
      }
    }
  }, [userId])

  // 비밀번호 유효성 검사
  useEffect(() => {
    if (password.length === 0) {
      setIsPasswordValid(false)
      setPasswordError('')
      return
    }

    if (password.length < 6) {
      setIsPasswordValid(false)
      setPasswordError('비밀번호는 6자 이상이어야 합니다')
    } else {
      setIsPasswordValid(true)
      setPasswordError('')
    }
  }, [password])

  // 비밀번호 확인 검사
  useEffect(() => {
    if (confirmPassword.length === 0) {
      setIsConfirmPasswordValid(false)
      setConfirmPasswordError('')
      return
    }

    if (password === confirmPassword && password.length > 0) {
      setIsConfirmPasswordValid(true)
      setConfirmPasswordError('')
    } else {
      setIsConfirmPasswordValid(false)
      if (confirmPassword.length > 0) {
        setConfirmPasswordError('비밀번호가 일치하지 않습니다')
      }
    }
  }, [password, confirmPassword])

  const handleContinue = (e) => {
    e.preventDefault()
    if (isUserIdValid && isPasswordValid && isConfirmPasswordValid) {
      // 아이디와 비밀번호를 다음 페이지로 전달
      navigate('/signup/info', { 
        state: { 
          username: userId,
          password: password 
        } 
      })
    }
  }

  const isFormValid = isUserIdValid && isPasswordValid && isConfirmPasswordValid

  const handleBack = () => {
    navigate('/login')
  }

  return (
    <div className="signup-screen">
      <div className="signup-header">
        <button className="signup-back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="signup-header-content">
          <h1 className="signup-header-title">회원가입</h1>
        </div>
      </div>
      <div className="signup-container">
        <form onSubmit={handleContinue} className="signup-form">
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`signup-input ${userIdError ? 'input-error' : ''} ${isUserIdValid ? 'input-valid' : ''}`}
                placeholder="아이디"
                disabled={isCheckingUsername}
              />
              {isCheckingUsername && (
                <div className="input-check-icon input-loading">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32" opacity="0.5">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>
              )}
              {isUserIdValid && !isCheckingUsername && (
                <div className="input-check-icon">
                  <CheckIcon />
                </div>
              )}
            </div>
            <p className={userIdError ? 'error-message' : 'input-hint'}>
              {isCheckingUsername ? '아이디 확인 중...' : (userIdError || '아이디는 4자 이상의 영문 또는 영문+숫자 조합이어야 합니다')}
            </p>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`signup-input ${passwordError ? 'input-error' : ''} ${isPasswordValid ? 'input-valid' : ''}`}
                placeholder="비밀번호"
              />
              {isPasswordValid && (
                <div className="input-check-icon">
                  <CheckIcon />
                </div>
              )}
            </div>
            <p className={passwordError ? 'error-message' : 'input-hint'}>
              {passwordError || '비밀번호는 6자 이상이어야 합니다'}
            </p>
          </div>

          <div className="input-group input-group-password-confirm">
            <div className="input-wrapper">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`signup-input ${confirmPasswordError ? 'input-error' : ''} ${isConfirmPasswordValid ? 'input-valid' : ''}`}
                placeholder="비밀번호 확인"
              />
              {isConfirmPasswordValid && (
                <div className="input-check-icon">
                  <CheckIcon />
                </div>
              )}
            </div>
            <p className={confirmPasswordError ? 'error-message' : 'input-hint'}>
              {confirmPasswordError || ''}
            </p>
          </div>

          <button 
            type="submit" 
            className={`continue-button ${isFormValid ? 'continue-button-active' : 'continue-button-disabled'}`}
            disabled={!isFormValid}
          >
            계속하기 &gt;
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
