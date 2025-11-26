import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './LoginScreen.css'

const imgGpt4B1 = "https://www.figma.com/api/mcp/asset/c2072de6-f1a8-4f36-a042-2df786f153b1"
const imgVector = "https://www.figma.com/api/mcp/asset/840581ca-bd27-48fa-89dd-92262c2a45f3"
const imgVector1 = "https://www.figma.com/api/mcp/asset/76d065ec-d5bb-4285-b826-58b0359e201b"
const imgIcOutlineEmail = "https://www.figma.com/api/mcp/asset/b9bbe3d1-1d33-4914-ad5a-3bd8bf32a0ed"
const imgLine1 = "https://www.figma.com/api/mcp/asset/e0a77bd2-7e41-4dbe-a2d5-c7c68a733db6"
const imgApple = "https://www.figma.com/api/mcp/asset/05066b17-b82b-4d45-b469-7ad77994a1c4"

function GoogleIcon() {
  return (
    <div className="google-icon">
      <div className="google-icon-vector">
        <img src={imgVector} alt="" />
      </div>
      <div className="google-icon-vector-2">
        <img src={imgVector1} alt="" />
      </div>
    </div>
  )
}

function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    // 로그인 로직 (임시로 대시보드로 이동)
    navigate('/dashboard')
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
              <img src={imgIcOutlineEmail} alt="email" className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
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
              >
                <span className="eye-icon">👁</span>
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

        <div className="divider">
          <img src={imgLine1} alt="divider" />
        </div>

        <div className="social-login">
          <button className="social-button apple-button">
            <div className="apple-icon">
              <img src={imgApple} alt="Apple" />
            </div>
            <span>Sign in with Apple</span>
          </button>

          <button className="social-button google-button">
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen

