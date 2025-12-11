import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userIdError, setUserIdError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isUserIdValid, setIsUserIdValid] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false)

  // 이미 존재하는 아이디 목록 (실제로는 서버에서 확인)
  const existingUserIds = ['hci2025']

  // 아이디 유효성 검사
  useEffect(() => {
    if (userId.length === 0) {
      setIsUserIdValid(false)
      setUserIdError('')
      return
    }

    // 아이디 규칙: 4자 이상, 영문 또는 영문+숫자 조합
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/
    
    if (userId.length < 4) {
      setIsUserIdValid(false)
      setUserIdError('아이디는 4자 이상이어야 합니다')
    } else if (!usernameRegex.test(userId)) {
      setIsUserIdValid(false)
      setUserIdError('아이디는 영문으로 시작하며 영문 또는 영문+숫자 조합이어야 합니다')
    } else if (existingUserIds.includes(userId)) {
      setIsUserIdValid(false)
      setUserIdError('이미 존재하는 아이디입니다')
    } else {
      setIsUserIdValid(true)
      setUserIdError('')
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
      </div>
      <div className="signup-container">
        <div className="logo-section">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="signup-logo" />
        </div>

        <div className="signup-text-section">
          <p className="signup-text-main">아이디와 비밀번호를 입력해주세요.</p>
          <p className="signup-text-sub">회원가입에 필요한 정보를 입력하세요</p>
        </div>

        <form onSubmit={handleContinue} className="signup-form">
          <div className="input-group">
            <label className="input-label">아이디</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`signup-input ${userIdError ? 'input-error' : ''} ${isUserIdValid ? 'input-valid' : ''}`}
                placeholder="아이디를 입력하세요"
              />
              {isUserIdValid && (
                <div className="input-check-icon">
                  <CheckIcon />
                </div>
              )}
            </div>
            <p className={userIdError ? 'error-message' : 'input-hint'}>
              {userIdError || '아이디는 4자 이상의 영문 또는 영문+숫자 조합이어야 합니다'}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">비밀번호</label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`signup-input ${passwordError ? 'input-error' : ''} ${isPasswordValid ? 'input-valid' : ''}`}
                placeholder="비밀번호를 입력하세요"
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

          <div className="input-group">
            <label className="input-label">비밀번호 확인</label>
            <div className="input-wrapper">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`signup-input ${confirmPasswordError ? 'input-error' : ''} ${isConfirmPasswordValid ? 'input-valid' : ''}`}
                placeholder="비밀번호를 다시 입력하세요"
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
