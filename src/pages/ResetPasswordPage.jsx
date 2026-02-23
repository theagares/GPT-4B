import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './ResetPasswordPage.css'

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

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 링크입니다.')
    }
  }, [token])

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.resetPasswordConfirm(token, password)
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(response.data.message || '비밀번호 재설정에 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="reset-password-screen">
        <div className="reset-password-container">
          <div className="logo-section">
            <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="reset-password-logo" />
          </div>
          <div className="success-message">
            비밀번호가 성공적으로 변경되었습니다.
            <br />
            잠시 후 로그인 페이지로 이동합니다.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-screen">
      <div className="reset-password-container">
        <div className="logo-section">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="reset-password-logo" />
        </div>

        <h1 className="reset-password-title">비밀번호 재설정</h1>

        <form onSubmit={handleReset} className="reset-password-form">
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="reset-password-input"
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

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="reset-password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon isOpen={showConfirmPassword} />
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="reset-password-button" disabled={loading || !token}>
            {loading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>

        <div className="reset-password-links">
          <Link to="/login" className="back-link">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
