import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './FilterPage.css'

const imgVector = "https://www.figma.com/api/mcp/asset/c52eba95-e375-469d-8423-31aeaf519d2d"

const imgCloseVector1 = "https://www.figma.com/api/mcp/asset/ebf55ca3-03b8-4ecd-aa16-69b3841d2705"

const imgCloseVector2 = "https://www.figma.com/api/mcp/asset/22fe3212-d886-4b6d-92be-3d2893dd159b"

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

  const handleBack = () => {
    navigate(-1)
  }

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
          <button className="back-button" onClick={handleBack}>
            <div className="back-icon">
              <img src={imgVector} alt="뒤로 가기" />
            </div>
          </button>
          <h1 className="page-title">인기 선물</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Filter Sheet */}
      <div className="filter-sheet">
        {/* Filter Header */}
        <div className="filter-sheet-header">
          <h2 className="filter-title">필터</h2>
          <button className="filter-close-button" onClick={handleClose}>
            <div className="filter-close-icon">
              <div className="close-icon-line">
                <img src={imgCloseVector1} alt="" />
              </div>
              <div className="close-icon-line">
                <img src={imgCloseVector2} alt="" />
              </div>
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

