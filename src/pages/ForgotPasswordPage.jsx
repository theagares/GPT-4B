import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './ForgotPasswordPage.css'

// 사용자 아이콘 SVG 컴포넌트
function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 이메일 아이콘 SVG 컴포넌트
function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="L22 6L12 13L2 6" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: 입력, 2: 완료
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequest = async (e) => {
    e.preventDefault()
    setError('')

    if (!username && !email) {
      setError('아이디 또는 이메일을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.resetPasswordRequest(username || null, email || null)
      if (response.data.success) {
        setStep(2)
      } else {
        setError(response.data.message || '비밀번호 재설정 요청에 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-screen">
      <div className="forgot-password-container">
        <div className="logo-section">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="forgot-password-logo" />
        </div>

        <h1 className="forgot-password-title">비밀번호 찾기</h1>

        {step === 1 && (
          <form onSubmit={handleRequest} className="forgot-password-form">
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="forgot-password-input"
                />
                <div className="input-icon-right">
                  <UserIcon />
                </div>
              </div>
            </div>

            <div className="divider">
              <span>또는</span>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="forgot-password-input"
                />
                <div className="input-icon-right">
                  <EmailIcon />
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="forgot-password-button" disabled={loading}>
              {loading ? '요청 중...' : '비밀번호 재설정 링크 발송'}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="result-section">
            <div className="success-message">
              비밀번호 재설정 링크가 이메일로 발송되었습니다.
              <br />
              이메일을 확인해주세요.
            </div>
            <button
              onClick={() => navigate('/login')}
              className="forgot-password-button"
            >
              로그인으로 돌아가기
            </button>
          </div>
        )}

        <div className="forgot-password-links">
          <Link to="/login" className="back-link">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
