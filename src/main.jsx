import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// iOS Safari viewport fix: viewport height 계산 및 CSS 변수 설정
// iOS Safari에서 주소창/툴바로 인해 100vh가 변동되는 문제를 해결하기 위해
// 실제 viewport height를 계산하여 CSS 변수로 설정
function setViewportHeight() {
  // 실제 viewport height 계산
  const vh = window.innerHeight * 0.01
  // CSS 변수로 설정 (구형 브라우저 fallback용)
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// 초기 설정
setViewportHeight()

// 리사이즈 및 orientationchange 이벤트 시 재계산
// iOS Safari에서 주소창 표시/숨김, 화면 회전 시 viewport height가 변경됨
window.addEventListener('resize', setViewportHeight)
window.addEventListener('orientationchange', () => {
  // orientationchange 후 약간의 지연을 두고 재계산 (iOS Safari 버그 대응)
  setTimeout(setViewportHeight, 100)
})

// iOS Safari에서 스크롤 시 주소창이 숨겨지면서 viewport height가 변경되는 경우 대응
let lastHeight = window.innerHeight
window.addEventListener('scroll', () => {
  const currentHeight = window.innerHeight
  // 높이 변화가 감지되면 재계산
  if (Math.abs(currentHeight - lastHeight) > 50) {
    setViewportHeight()
    lastHeight = currentHeight
  }
}, { passive: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

