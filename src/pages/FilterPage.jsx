import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './FilterPage.css'

// SVG Icon Components
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FilterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 이전 페이지에서 전달된 필터 상태 또는 기본값
  const [selectedCategory, setSelectedCategory] = useState(
    location.state?.category || '전체'
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    location.state?.priceRange || '전체'
  )

  const handleClose = () => {
    navigate(-1)
  }

  const handleReset = () => {
    setSelectedCategory('전체')
    setSelectedPriceRange('전체')
  }

  const handleApply = () => {
    // 필터를 적용하고 이전 페이지로 돌아가기
    // 상태는 나중에 전역 상태 관리나 URL 파라미터로 전달
    navigate('/popular-gifts', { 
      state: { 
        category: selectedCategory,
        priceRange: selectedPriceRange
      }
    })
  }

  const categories = ['전체', '주류', '고급 선물', '식음료', '건강식품', '과일', '차/티', '간식', '생활용품', '화장품', '문구', '주방용품']
  const priceRanges = ['전체', '5만원 이하', '5만원 - 10만원', '10만원 - 20만원', '20만원 이상']

  return (
    <div className="filter-page">
      {/* Header */}
      <div className="filter-page-header">
        <div className="header-content">
          <h1 className="page-title">인기 선물</h1>
        </div>
      </div>

      {/* Filter Sheet */}
      <div className="filter-sheet">
        {/* Filter Header */}
        <div className="filter-sheet-header">
          <h2 className="filter-title">필터</h2>
          <button className="filter-close-button" onClick={handleClose}>
            <div className="filter-close-icon">
              <CloseIcon />
            </div>
          </button>
        </div>

        {/* Filter Content */}
        <div className="filter-content">
          {/* Category Section */}
          <div className="filter-section">
            <h3 className="filter-section-title">카테고리</h3>
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="filter-section">
            <h3 className="filter-section-title">가격대</h3>
            <div className="price-range-buttons">
              {priceRanges.map((range) => (
                <button
                  key={range}
                  className={`price-range-button ${selectedPriceRange === range ? 'selected' : ''}`}
                  onClick={() => setSelectedPriceRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Footer */}
        <div className="filter-footer">
          <button className="reset-button" onClick={handleReset}>
            초기화
          </button>
          <button className="apply-button" onClick={handleApply}>
            적용하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterPage

