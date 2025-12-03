import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './WelcomeScreen.css'

function WelcomeScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    // 2초 후 로그인 화면으로 이동
    const timer = setTimeout(() => {
      navigate('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="logo-container">
          <img src="/assets/gpt_4b_logo_white.png" alt="GPT-4b Logo" className="logo" />
        </div>
        <div className="welcome-text">
          <p>GPT-4b가</p>
          <p>댱신을 환영합니다</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

