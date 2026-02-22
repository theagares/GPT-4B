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
          <img src="/assets/mars_logo_white.png" alt="M Logo" className="logo" />
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

