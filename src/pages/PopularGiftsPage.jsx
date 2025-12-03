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

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  const [appliedCategory, setAppliedCategory] = useState('전체')
  const [appliedPriceRange, setAppliedPriceRange] = useState('전체')

  // 필터 페이지에서 돌아올 때 필터 상태 적용
  useEffect(() => {
    if (location.state) {
      if (location.state.category) {
        setAppliedCategory(location.state.category)
      }
      if (location.state.priceRange) {
        setAppliedPriceRange(location.state.priceRange)
      }
    }
  }, [location.state])

  const handleBack = () => {
    navigate(-1)
  }

  // 가격 범위를 숫자로 변환하는 함수
  const getPriceRange = (priceRange) => {
    const priceStr = priceRange.replace(/[원,]/g, '')
    return parseInt(priceStr) || 0
  }

  // 필터링된 선물 목록
  const filteredGifts = gifts.filter((gift) => {
    // 카테고리 필터
    if (appliedCategory !== '전체' && gift.category !== appliedCategory) {
      return false
    }

    // 가격대 필터
    if (appliedPriceRange !== '전체') {
      const price = getPriceRange(gift.price)
      switch (appliedPriceRange) {
        case '5만원 이하':
          if (price > 50000) return false
          break
        case '5만원 - 10만원':
          if (price <= 50000 || price > 100000) return false
          break
        case '10만원 - 20만원':
          if (price <= 100000 || price > 200000) return false
          break
        case '20만원 이상':
          if (price <= 200000) return false
          break
        default:
          break
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
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Sort and Filter Bar */}
      <div className="sort-filter-bar">
        <button className="sort-button">
          <span className="sort-text">인기순</span>
          <span className="sort-icon"><SortIcon /></span>
        </button>
        <Link 
          to="/popular-gifts/filter" 
          className="filter-button"
          state={{ 
            category: appliedCategory,
            priceRange: appliedPriceRange
          }}
        >
          <span className="filter-icon"><FilterIcon /></span>
          <span className="filter-text">필터</span>
        </Link>
      </div>

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
                  <div className="gift-popularity">{gift.popularity}</div>
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

