import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './ForgotPasswordPage.css'

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
        <h1 className="forgot-password-title">비밀번호 찾기</h1>

        {step === 1 && (
          <form onSubmit={handleRequest} className="forgot-password-form">
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="아이디 입력"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="forgot-password-input"
                />
              </div>
            </div>

            <div className="divider">
              <span>또는</span>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="이메일 입력"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="forgot-password-input"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="forgot-password-button forgot-password-send-button" disabled={loading}>
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
            <Link to="/login" className="back-link">
              로그인으로 돌아가기
            </Link>
          </div>
        )}

        {step === 1 && (
          <div className="forgot-password-links">
            <Link to="/login" className="back-link">
              로그인으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
