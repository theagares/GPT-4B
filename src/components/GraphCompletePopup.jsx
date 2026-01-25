import { useNavigate } from 'react-router-dom'
import { useGraphAnalysis } from '../contexts/GraphAnalysisContext'
import './GraphCompletePopup.css'

function GraphCompletePopup() {
  const navigate = useNavigate()
  const { showCompletePopup, closeCompletePopup } = useGraphAnalysis()

  if (!showCompletePopup) return null

  const handleGoToGraph = () => {
    closeCompletePopup()
    navigate('/relation-graph')
  }

  const handleClose = () => {
    closeCompletePopup()
  }

  return (
    <div className="graph-complete-overlay" onClick={handleClose}>
      <div className="graph-complete-popup" onClick={(e) => e.stopPropagation()}>
        <div className="graph-complete-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="graph-complete-title">분석 완료!</h3>
        <p className="graph-complete-message">
          관계 그래프가 완료되었습니다.<br/>
          지금 바로 확인해 보세요.
        </p>
        <div className="graph-complete-buttons">
          <button className="graph-complete-btn primary" onClick={handleGoToGraph}>
            관계 그래프 확인하기
          </button>
          <button className="graph-complete-btn secondary" onClick={handleClose}>
            나중에 볼게요
          </button>
        </div>
      </div>
    </div>
  )
}

export default GraphCompletePopup

