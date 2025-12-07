import { useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <div className="not-found-header">
        <button 
          className="not-found-button"
          onClick={() => navigate(-1)}
        >
          &lt;
        </button>
      </div>
      <div className="not-found-content">
        <p className="not-found-text">404 Not Found</p>
      </div>
    </div>
  )
}

export default NotFoundPage

