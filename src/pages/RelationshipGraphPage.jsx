import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import RelationshipGraph from '../components/RelationshipGraph/RelationshipGraph'
import './RelationshipGraphPage.css'

function RelationshipGraphPage() {
  const navigate = useNavigate()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true) // 기본값: 관심 있는 사람만

  return (
    <div className="relationship-graph-page">
      {/* Header - 고정 */}
      <div className="relationship-graph-header">
        <div className="relationship-graph-header-inner">
          <button 
            className="relationship-graph-back-button"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="relationship-graph-container">
        {/* Content */}
        <div className="relationship-graph-content">
          <div className="relationship-graph-description">
            <p className="relationship-graph-main-text">
              지금까지 맺은 관계를 확인해보세요
            </p>
            <p className="relationship-graph-sub-text">
              명함, 일정, 메모 등을 통해 형성된 관계를<br/>
              시각화하여 보여드립니다
            </p>
          </div>

          {/* 그래프 영역 */}
          <div className="relationship-graph-wrapper">
            {/* 그래프 컨트롤 및 안내 - 그래프 영역 내부 */}
            <div className="relationship-graph-controls">
              <div className="graph-hint-wrapper">
                <div className="graph-hint">
                  <p>💡 연결선을 클릭하면 관계 정보를 확인할 수 있습니다</p>
                </div>
              </div>
              <button
                className={`graph-favorite-filter ${showFavoritesOnly ? 'active' : ''}`}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                title={showFavoritesOnly ? '모든 사람 보기' : '관심 있는 사람만 보기'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={showFavoritesOnly ? '#ef4444' : 'none'}
                    stroke={showFavoritesOnly ? '#ef4444' : '#9ca3af'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <RelationshipGraph showFavoritesOnly={showFavoritesOnly} />
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default RelationshipGraphPage
