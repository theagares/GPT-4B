import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './FindIdPage.css'

// 이메일 아이콘 SVG 컴포넌트
function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="L22 6L12 13L2 6" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FindIdPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: 이메일 입력, 2: 코드 입력, 3: 결과
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.findUsernameSendCode(email)
      if (response.data.success) {
        setStep(2)
      } else {
        setError(response.data.message || '인증 코드 발송에 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!code || code.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.findUsernameVerifyCode(email, code)
      if (response.data.success) {
        setUsername(response.data.fullUsername || response.data.username)
        setStep(3)
      } else {
        setError(response.data.message || '인증 코드가 일치하지 않습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드 검증에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="find-id-screen">
      <div className="find-id-container">
        <div className="logo-section">
          <img src="/assets/gpt_4b_logo_blueberry.png" alt="GPT-4b Logo" className="find-id-logo" />
        </div>

        <h1 className="find-id-title">아이디 찾기</h1>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="find-id-form">
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="find-id-input"
                />
                <div className="input-icon-right">
                  <EmailIcon />
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="find-id-button" disabled={loading}>
              {loading ? '발송 중...' : '인증 코드 발송'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="find-id-form">
            <div className="info-message">
              {email}로 인증 코드를 발송했습니다.
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="인증 코드 6자리 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="find-id-input"
                  maxLength={6}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="find-id-button" disabled={loading || code.length !== 6}>
              {loading ? '확인 중...' : '확인'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1)
                setCode('')
                setError('')
              }}
              className="back-button"
            >
              이전으로
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="result-section">
            <div className="success-message">
              아이디를 찾았습니다.
            </div>
            <div className="username-result">
              {username}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="find-id-button"
            >
              로그인하기
            </button>
          </div>
        )}

        <div className="find-id-links">
          <Link to="/login" className="back-link">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FindIdPage
