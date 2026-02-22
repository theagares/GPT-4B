import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'

function WelcomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    // 2초 후 튜토리얼 페이지로 이동
    const timer = setTimeout(() => {
      navigate('/tutorial')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>환영합니다!</h1>
      </div>
    </div>
  )
}

export default WelcomePage

