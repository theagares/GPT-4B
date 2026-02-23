import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { setToken, setUser } from '../utils/auth'
import './LoginScreen.css'

// 사용자 아이콘 SVG 컴포넌트
function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 눈 아이콘 SVG 컴포넌트
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


function LoginScreen() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.')
      return
    }

    try {
      const response = await authAPI.login(username, password)
      
      if (response.data.success) {
        setToken(response.data.token)
        setUser(response.data.user)
        navigate('/dashboard')
      } else {
        alert('로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || '로그인에 실패했습니다.'
      alert(message)
    }
  }


  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="logo-section">
          <img src="/assets/mars_logo_blueberry.png" alt="M Logo" className="login-logo" />
        </div>
        <p className="login-tagline">Mars로 메모 기반 인맥 관리하기</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
              />
              <div className="input-icon-right">
                <UserIcon />
              </div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon isOpen={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="login-links">
          <div className="login-links-left">
            <Link to="/find-id" className="forgot-link">
              아이디 찾기
            </Link>
            <Link to="/forgot-password" className="forgot-link">
              비밀번호 찾기
            </Link>
          </div>
          <Link to="/signup" className="signup-link">
            신규 가입하기
          </Link>
        </div>

      </div>
    </div>
  )
}

export default LoginScreen
