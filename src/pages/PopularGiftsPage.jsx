import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import './PopularGiftsPage.css'

// SVG Icon Components
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12L12 3L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V16C9 15.4696 9.21071 14.9609 9.58579 14.5858C9.96086 14.2107 10.4696 14 11 14H13C13.5304 14 14.0391 14.2107 14.4142 14.5858C14.7893 14.9609 15 15.4696 15 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4H14M4 8H12M6 12H10" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/4b1421cd-2596-45d3-8139-9dcc9a7eb9f4"

const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/50bcc4a5-6947-447b-acf5-712e3e638c4b"

const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/873df59d-ef1b-4164-9ec2-dc12ea7cc30a"

const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/7f9cd4ef-8192-4282-8fdc-38a645494f85"

const imgImageWithFallback4 = "https://www.figma.com/api/mcp/asset/b6524582-3000-40b8-a596-90b4445e73b6"

const imgImageWithFallback5 = "https://www.figma.com/api/mcp/asset/684ef33d-ef31-444f-aec5-0992fa07cf9b"

const imgImageWithFallback6 = "https://www.figma.com/api/mcp/asset/e3a18e2b-144f-49b7-b74f-0895116675a0"

const imgImageWithFallback7 = "https://www.figma.com/api/mcp/asset/3bb8aa71-ab6b-4714-9a37-8fa65b2067b0"

// 선물 데이터
const gifts = [
  {
    id: 1,
    rank: '#1',
    image: imgImageWithFallback,
    category: '주류',
    categoryColor: '#584cdc',
    name: '프리미엄 와인 세트',
    price: '102,448원',
    popularity: '인기 95%'
  },
  {
    id: 2,
    rank: '#2',
    image: imgImageWithFallback1,
    category: '고급 선물',
    categoryColor: '#584cdc',
    name: '명품 선물 세트',
    price: '245,247원',
    popularity: '인기 95%'
  },
  {
    id: 3,
    rank: '#3',
    image: imgImageWithFallback2,
    category: '식음료',
    categoryColor: '#584cdc',
    name: '스페셜티 커피 세트',
    price: '260,724원',
    popularity: '인기 94%'
  },
  {
    id: 4,
    rank: '#4',
    image: imgImageWithFallback3,
    category: '건강식품',
    categoryColor: '#584cdc',
    name: '비즈니스 선물 세트',
    price: '110,203원',
    popularity: '인기 94%'
  },
  {
    id: 5,
    rank: '#5',
    image: imgImageWithFallback4,
    category: '과일',
    categoryColor: '#9810fa',
    name: '프리미엄 홍삼 세트',
    price: '66,421원',
    popularity: '인기 93%'
  },
  {
    id: 6,
    rank: '#6',
    image: imgImageWithFallback5,
    category: '차/티',
    categoryColor: '#9810fa',
    name: '제철 과일 선물 세트',
    price: '290,328원',
    popularity: '인기 93%'
  },
  {
    id: 7,
    rank: '#7',
    image: imgImageWithFallback6,
    category: '간식',
    categoryColor: '#9810fa',
    name: '프리미엄 티 컬렉션',
    price: '215,087원',
    popularity: '인기 92%'
  },
  {
    id: 8,
    rank: '#8',
    image: imgImageWithFallback7,
    category: '생활용품',
    categoryColor: '#9810fa',
    name: '수제 과자 세트',
    price: '81,604원',
    popularity: '인기 92%'
  },
  {
    id: 9,
    rank: '#9',
    image: imgImageWithFallback,
    category: '화장품',
    categoryColor: '#9810fa',
    name: '디퓨저 세트',
    price: '71,926원',
    popularity: '인기 91%'
  },
  {
    id: 10,
    rank: '#10',
    image: imgImageWithFallback1,
    category: '문구',
    categoryColor: '#9810fa',
    name: '스킨케어 세트',
    price: '97,155원',
    popularity: '인기 91%'
  },
  {
    id: 11,
    rank: '#11',
    image: imgImageWithFallback,
    category: '주방용품',
    categoryColor: '#9810fa',
    name: '프리미엄 와인 세트',
    price: '70,526원',
    popularity: '인기 90%'
  },
  {
    id: 12,
    rank: '#12',
    image: imgImageWithFallback1,
    category: '주류',
    categoryColor: '#9810fa',
    name: '명품 선물 세트',
    price: '236,115원',
    popularity: '인기 90%'
  }
]

function PopularGiftsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [appliedCategories, setAppliedCategories] = useState([])
  const [appliedPriceRanges, setAppliedPriceRanges] = useState([])

  // 필터 페이지에서 돌아올 때 필터 상태 적용
  useEffect(() => {
    if (location.state) {
      if (location.state.category !== undefined) {
        if (Array.isArray(location.state.category)) {
          setAppliedCategories(location.state.category)
        } else {
          setAppliedCategories(location.state.category === '전체' ? [] : [location.state.category])
        }
      }
      if (location.state.priceRange !== undefined) {
        if (Array.isArray(location.state.priceRange)) {
          setAppliedPriceRanges(location.state.priceRange)
        } else {
          setAppliedPriceRanges(location.state.priceRange === '전체' ? [] : [location.state.priceRange])
        }
      }
    }
  }, [location.state])

  const handleBack = () => {
    navigate(-1)
  }

  const handleHome = () => {
    navigate('/dashboard')
  }

  const handleRemoveCategory = (categoryToRemove) => {
    setAppliedCategories(prev => prev.filter(c => c !== categoryToRemove))
  }

  const handleRemovePriceRange = (rangeToRemove) => {
    setAppliedPriceRanges(prev => prev.filter(r => r !== rangeToRemove))
  }

  // 가격 범위를 숫자로 변환하는 함수
  const getPriceRange = (priceRange) => {
    const priceStr = priceRange.replace(/[원,]/g, '')
    return parseInt(priceStr) || 0
  }

  // 가격 범위가 해당 범위에 포함되는지 확인하는 함수
  const isPriceInRange = (price, range) => {
    switch (range) {
      case '5만원 이하':
        return price <= 50000
      case '5만원 - 10만원':
        return price > 50000 && price <= 100000
      case '10만원 - 20만원':
        return price > 100000 && price <= 200000
      case '20만원 이상':
        return price > 200000
      default:
        return false
    }
  }

  // 필터링된 선물 목록
  const filteredGifts = gifts.filter((gift) => {
    // 카테고리 필터 (여러 개 선택 가능)
    if (appliedCategories.length > 0) {
      if (!appliedCategories.includes(gift.category)) {
        return false
      }
    }

    // 가격대 필터 (여러 개 선택 가능)
    if (appliedPriceRanges.length > 0) {
      const price = getPriceRange(gift.price)
      const matchesAnyRange = appliedPriceRanges.some(range => isPriceInRange(price, range))
      if (!matchesAnyRange) {
        return false
      }
    }

    return true
  })

  return (
    <div className="popular-gifts-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBack}>
            <div className="back-icon">
              <BackIcon />
            </div>
          </button>
          <h1 className="page-title">인기 선물</h1>
          <button className="home-button" onClick={handleHome}>
            <HomeIcon />
            <span className="home-button-text">홈으로</span>
          </button>
        </div>
      </div>

      {/* Filter Guide Text */}
      <div className="filter-guide">
        <p className="filter-guide-text">필터를 적용해서 원하는 선물을 구경해보아요</p>
      </div>

      {/* Filter Bar */}
      <div className="sort-filter-bar">
        <Link 
          to="/popular-gifts/filter" 
          className="filter-button"
          state={{ 
            category: appliedCategories,
            priceRange: appliedPriceRanges
          }}
        >
          <span className="filter-icon"><FilterIcon /></span>
          <span className="filter-text">필터</span>
        </Link>
      </div>

      {/* Applied Filters */}
      {(appliedCategories.length > 0 || appliedPriceRanges.length > 0) && (
        <div className="applied-filters">
          {appliedCategories.map((category) => (
            <div key={category} className="applied-filter-tag">
              <span className="filter-tag-label">카테고리</span>
              <span className="filter-tag-value">{category}</span>
              <button 
                className="filter-tag-remove"
                onClick={() => handleRemoveCategory(category)}
                aria-label={`${category} 필터 제거`}
              >
                <CloseIcon />
              </button>
            </div>
          ))}
          {appliedPriceRanges.map((range) => (
            <div key={range} className="applied-filter-tag">
              <span className="filter-tag-label">가격대</span>
              <span className="filter-tag-value">{range}</span>
              <button 
                className="filter-tag-remove"
                onClick={() => handleRemovePriceRange(range)}
                aria-label={`${range} 필터 제거`}
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Gifts Grid */}
      <div className="gifts-container">
        <div className="gifts-grid">
          {filteredGifts.map((gift) => (
            <Link 
              key={gift.id} 
              to={`/popular-gifts/${gift.id}`}
              className="gift-item-link"
            >
              <div className="gift-item">
                <div className="gift-image-wrapper">
                  <img src={gift.image} alt={gift.name} className="gift-image" />
                  <div className="rank-badge">{gift.rank}</div>
                </div>
                <div className="gift-info">
                  <div className="gift-header">
                    <div 
                      className="category-badge" 
                      style={{ 
                        backgroundColor: '#f2f1ff',
                        borderColor: '#584cdc',
                        color: '#584cdc'
                      }}
                    >
                      {gift.category}
                    </div>
                    <h3 className="gift-name">{gift.name}</h3>
                  </div>
                  <div className="gift-price" style={{ color: '#584cdc' }}>
                    {gift.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PopularGiftsPage


