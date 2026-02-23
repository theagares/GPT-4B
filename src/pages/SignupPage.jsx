import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './SignupPage.css'

// 눈 아이콘 SVG 컴포넌트 (로그인 창과 동일)
function EyeIcon({ isOpen }) {
  if (isOpen) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  } else {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
}

// 규칙 표시 컴포넌트: status = 'neutral' | 'invalid' | 'valid'
function RuleItem({ text, status }) {
  return (
    <span className={`input-rule input-rule-${status}`}>
      <span className="rule-icon">
        {status === 'invalid' ? '✕' : '✓'}
      </span>
      {' '}{text}
    </span>
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      return
    }

    // 아이디 규칙: 4자 이상, 영문 또는 영문+숫자 조합
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/
    
    // 형식 검증
    if (userId.length < 4) {
      setIsUserIdValid(false)
      setUserIdError('아이디는 4자 이상이어야 합니다')
      return
    }
    
    if (!usernameRegex.test(userId)) {
      setIsUserIdValid(false)
      setUserIdError('아이디는 영문으로 시작하며 영문 또는 영문+숫자 조합이어야 합니다')
      return
    }

    // 형식이 올바르면 서버에 중복 체크 요청 (debounce, 백그라운드)
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
      }
    }, 300) // 300ms debounce

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
            <label className="input-label">아이디</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`signup-input ${userIdError ? 'input-error' : ''} ${isUserIdValid ? 'input-valid' : ''}`}
                placeholder="아이디를 입력해주세요"
              />
            </div>
            <p className="input-hint input-rules">
              <>
                <RuleItem
                  text="4자 이상"
                  status={
                    userId.length === 0
                      ? 'neutral'
                      : userId.length >= 4
                        ? 'valid'
                        : 'invalid'
                  }
                />
                <br />
                <RuleItem
                  text="영문 또는 영문+숫자 조합"
                  status={
                    userId.length === 0 || userId.length < 4
                      ? 'neutral'
                      : /^[a-zA-Z][a-zA-Z0-9]*$/.test(userId)
                        ? 'valid'
                        : 'invalid'
                  }
                />
                  {userIdError && !['아이디는 4자 이상이어야 합니다', '아이디는 영문으로 시작하며 영문 또는 영문+숫자 조합이어야 합니다'].includes(userIdError) && (
                    <>
                      <br />
                      <span className="rule-error-text">{userIdError}</span>
                    </>
                  )}
                </>
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">비밀번호</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`signup-input signup-input-password ${passwordError ? 'input-error' : ''} ${isPasswordValid ? 'input-valid' : ''}`}
                placeholder="비밀번호를 입력해주세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="signup-password-toggle"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <EyeIcon isOpen={showPassword} />
              </button>
            </div>
            <p className="input-hint input-rules">
              <RuleItem
                text="6자 이상"
                status={
                  password.length === 0
                    ? 'neutral'
                    : password.length >= 6
                      ? 'valid'
                      : 'invalid'
                }
              />
              {passwordError && passwordError !== '비밀번호는 6자 이상이어야 합니다' && (
                <>
                  <br />
                  <span className="rule-error-text">{passwordError}</span>
                </>
              )}
            </p>
          </div>

          <div className="input-group input-group-password-confirm">
            <label className="input-label">비밀번호 확인</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`signup-input signup-input-password ${confirmPasswordError ? 'input-error' : ''} ${isConfirmPasswordValid ? 'input-valid' : ''}`}
                placeholder="한 번 더 입력해주세요"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="signup-password-toggle"
                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <EyeIcon isOpen={showConfirmPassword} />
              </button>
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
            계속하기
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
