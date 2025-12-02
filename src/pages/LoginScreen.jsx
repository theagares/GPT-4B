import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { setToken, setUser } from '../utils/auth'
import './LoginScreen.css'

const imgGpt4B1 = "https://www.figma.com/api/mcp/asset/c2072de6-f1a8-4f36-a042-2df786f153b1"
const imgIcOutlineEmail = "https://www.figma.com/api/mcp/asset/b9bbe3d1-1d33-4914-ad5a-3bd8bf32a0ed"
const imgApple = "https://www.figma.com/api/mcp/asset/05066b17-b82b-4d45-b469-7ad77994a1c4"

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

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
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

  const handleAppleLogin = async () => {
    try {
      // Apple 로그인 로직
      // 실제 구현 시 Apple Sign In SDK 사용 필요
      console.log('Apple login clicked')
      // navigate('/dashboard')
    } catch (error) {
      console.error('Apple login error:', error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Google 로그인 로직
      // 실제 구현 시 Google Sign In SDK 사용 필요
      console.log('Google login clicked')
      // navigate('/dashboard')
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="logo-section">
          <img src={imgGpt4B1} alt="GPT-4b Logo" className="login-logo" />
        </div>

        <h1 className="login-title">선물 추천을 위한 최고의 선택, GPT-4b</h1>

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
              <img src={imgIcOutlineEmail} alt="username" className="input-icon-right" />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
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
          <Link to="/forgot-password" className="forgot-link">
            아이디 / 비밀번호 찾기
          </Link>
          <Link to="/signup" className="signup-link">
            신규 가입하기
          </Link>
        </div>

        <div className="social-login">
          <button 
            className="social-button apple-button"
            onClick={handleAppleLogin}
          >
            <div className="apple-icon">
              <img src={imgApple} alt="Apple" />
            </div>
            <span>Sign in with Apple</span>
          </button>

          <button 
            className="social-button google-button"
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
