import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './SignupInfoPage.css'

function SignupInfoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // SignupPage에서 전달받은 state
  const signupData = location.state || {}

  useEffect(() => {
    // 2초 후 회원가입 폼으로 이동 (state 전달)
    const timer = setTimeout(() => {
      navigate('/signup/form', { state: signupData })
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate, signupData])

  return (
    <div className="signup-info-page">
      <div className="signup-info-content">
        <p className="signup-info-line1">명함 구성을 위해</p>
        <p className="signup-info-line2">5가지 정보만 더 물어볼게요.</p>
      </div>
    </div>
  )
}

export default SignupInfoPage

