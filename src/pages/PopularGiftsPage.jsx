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
      <path d="M2 12L12 3L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V16C9 15.4696 9.21071 14.9609 9.58579 14.5858C9.96086 14.2107 10.4696 14 11 14H13C13.5304 14 14.0391 14.2107 14.4142 14.5858C14.7893 14.9609 15 15.4696 15 16V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const imgImageWithFallback = "https://shop-phinf.pstatic.net/20241026_151/17299254937003uih3_JPEG/6412801823777166_1731722875.jpg?type=m450"

const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/50bcc4a5-6947-447b-acf5-712e3e638c4b"

const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/873df59d-ef1b-4164-9ec2-dc12ea7cc30a"

const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/7f9cd4ef-8192-4282-8fdc-38a645494f85"

const imgImageWithFallback4 = "https://www.figma.com/api/mcp/asset/b6524582-3000-40b8-a596-90b4445e73b6"

const imgImageWithFallback5 = "https://www.figma.com/api/mcp/asset/684ef33d-ef31-444f-aec5-0992fa07cf9b"

const imgImageWithFallback6 = "https://www.figma.com/api/mcp/asset/e3a18e2b-144f-49b7-b74f-0895116675a0"

const imgImageWithFallback7 = "https://www.figma.com/api/mcp/asset/3bb8aa71-ab6b-4714-9a37-8fa65b2067b0"

// 선물 데이터 포맷:
// {
//   id: number,                    // 고유 ID
//   rank: string,                  // 순위 (예: '#1')
//   image: string,                 // 이미지 URL
//   category: string,              // 카테고리 (예: '건강식품', '과일' 등)
//   categoryColor: string,         // 카테고리 색상 (예: '#584cdc')
//   name: string,                 // 상품명
//   price: string,                // 가격 (예: '102,448원')
//   popularity: string,           // 인기도 (예: '인기 95%')
//   url: string                   // 상품 URL (외부 링크)
// }

// 선물 데이터
const gifts = [
  {
    id: 1,
    rank: '#1',
    image: "https://shop-phinf.pstatic.net/20241026_151/17299254937003uih3_JPEG/6412801823777166_1731722875.jpg?type=m450",
    category: '캔들디퓨저',
    categoryColor: '#584cdc',
    name: '명품 고급 호텔 대형 백화점 대용량 실내 디퓨저 거실 현관 사무실 방향제 집들이 선물세트',
    price: '42000원',
    popularity: '인기 95%',
    url: 'https://m.shopping.naver.com/gift/products/4856091300'
  },
  {
    id: 2,
    rank: '#2',
    image: "https://shop-phinf.pstatic.net/20250806_115/1754462546764Npyyg_JPEG/86041343686824065_896651263.jpg?type=m450",
    category: '한우',
    categoryColor: '#584cdc',
    name: '[선물세트] 1++ 프리미엄 등급 한우 선물세트 / 등심600g + 부채살200g + 살치100g / 스킨포장 선물포장 명절 추석 설날 [원산지:국산]',
    price: '110,000원',
    popularity: '인기 95%',
    url: 'https://shopping.naver.com/gift/products/12210479933'
  },
  {
    id: 3,
    rank: '#3',
    image: "https://shop-phinf.pstatic.net/20250723_284/1753258518569xPQGb_JPEG/91339375597969581_1547240416.jpg?type=m450",
    category: '건강식품',
    categoryColor: '#584cdc',
    name: '고려은단 퓨어 밀크씨슬 180정, 1개 (6개월분) [원산지:상품 상세페이지 참조]',
    price: '24,900원',
    popularity: '인기 94%',
    url: 'https://shopping.naver.com/gift/products/11243018665'
  },
  {
    id: 4,
    rank: '#4',
    image: "https://shop-phinf.pstatic.net/20250328_105/1743139211350t11HM_PNG/33910072260525099_1890313163.png?type=m450",
    category: '과일',
    categoryColor: '#584cdc',
    name: '과일바구니 명절 추석선물세트 이바지 예단 상견례 승진축하 수원 분당 용인 [원산지:국산]',
    price: '56,000원',
    popularity: '인기 94%',
    url: 'https://shopping.naver.com/gift/products/11648536781'
  },
  {
    id: 5,
    rank: '#5',
    image: "https://shop-phinf.pstatic.net/20251114_240/1763101191530LmtpF_JPEG/17276444317271649_441517793.jpg?type=m450",
    category: '디지털가전',
    categoryColor: '#584cdc',
    name: '돌체구스토 네오 카페 캡슐 커피머신 + 네오 캡슐보관함 + 스타벅스 시그니처 데비 텀블러 473ml 증정',
    price: '119,000원',
    popularity: '인기 93%',
    url: 'https://m.shopping.naver.com/gift/products/12179079303'
  },
  {
    id: 6,
    rank: '#6',
    image: "https://shop-phinf.pstatic.net/20230119_47/1674111558304qqR0n_JPEG/75247457015103059_77735274.jpg?type=m450",
    category: '음향기기',
    categoryColor: '#9810fa',
    name: '[최다상품평] 브리츠 오픈형 골전도 블루투스 이어폰 운동 런닝 스포츠 헤드셋',
    price: '56,900원',
    popularity: '인기 93%',
    url: 'https://m.shopping.naver.com/gift/products/6684309238'
  },
  {
    id: 7,
    rank: '#7',
    image: "https://shop-phinf.pstatic.net/20241213_117/1734076313354p9m8d_JPEG/7767483454986497_227997381.jpg?type=m450",
    category: '레저자동차',
    categoryColor: '#9810fa',
    name: '벤딕트 차량용 청소기 에어건 자동차 무선 휴대용 강력 진공 실버 라이닝 퓨어 기본 패키지',
    price: '84,900원',
    popularity: '인기 92%',
    url: 'https://m.shopping.naver.com/gift/products/11200977471'
  },
  {
    id: 8,
    rank: '#8',
    image: "https://shop-phinf.pstatic.net/20250922_268/17585361690853nnGa_PNG/74761483913672527_1901241473.png?type=m450",
    category: '캔들디퓨저',
    categoryColor: '#9810fa',
    name: '헤트라스 데이지 스폐셜 기프트 에디션 (디퓨저 + 멀티스프레이 + 핸드크림 + 샤쉐)',
    price: '33,800원',
    popularity: '인기 92%',
    url: 'https://m.shopping.naver.com/gift/products/12444712685'
  },
  {
    id: 9,
    rank: '#9',
    image: "https://shop-phinf.pstatic.net/20250802_186/1754129749182lFqMw_JPEG/24656604022154122_1337111811.jpg?type=m450",
    category: '꽃배달',
    categoryColor: '#9810fa',
    name: '꽃바구니 꽃배달 생화 축하 기념일 승진',
    price: '62,000원',
    popularity: '인기 91%',
    url: 'https://shopping.naver.com/gift/products/12192547166'
  },
  {
    id: 10,
    rank: '#10',
    image: "https://shop-phinf.pstatic.net/20250409_247/1744187908641PPg39_JPEG/77005172543257430_1266592123.jpg?type=m450",
    category: 'e쿠폰',
    categoryColor: '#9810fa',
    name: '신세계 상품권 100,000원(10만원) [신세계백화점교환]',
    price: '100,000원',
    popularity: '인기 91%',
    url: 'https://shopping.naver.com/gift/products/11783851059'
  },
  {
    id: 11,
    rank: '#11',
    image: "https://shop-phinf.pstatic.net/20241005_29/1728120365916ng0wA_JPEG/11752739719423557_122627157.jpg?type=m450",
    category: '과일',
    categoryColor: '#9810fa',
    name: '고당도 상주 포도 거봉 캠벨포도 샤인머스켓 제철과일 [원산지:국산(경상북도 상주시)]',
    price: '20,900원',
    popularity: '인기 90%',
    url: 'https://shopping.naver.com/gift/products/5829571407'
  },
  {
    id: 12,
    rank: '#12',
    image: "https://shop-phinf.pstatic.net/20251203_300/1764720450679Jj8ex_PNG/98197001714380648_1945778379.png?type=m450",
    category: '건강식품',
    categoryColor: '#9810fa',
    name: '뉴트리원 프리미엄 알부민 골드 마시는 고함량 난백 실크 14개입, 6개 [원산지:상세설명에 표시]',
    price: '126,000원',
    popularity: '인기 90%',
    url: 'https://shopping.naver.com/gift/products/12427109598'
  }
]

// 카테고리 순서 정의
const categoryOrder = ['건강식품', '과일', '꽃배달', '도서', '디지털가전', '레저자동차', '리빙생활', '바디케어', '뷰티', '식품', '음향기기', '이벤트파티', '유아동', '패션', '한우', '캔들디퓨저', '카페디저트', 'e쿠폰']

// 가격대 순서 정의
const priceRangeOrder = ['5만원 이하', '5만원 - 10만원', '10만원 - 20만원', '20만원 이상']

function PopularGiftsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [appliedCategories, setAppliedCategories] = useState([])
  const [appliedPriceRanges, setAppliedPriceRanges] = useState([])
  
  // 카테고리를 지정된 순서로 정렬
  const sortedAppliedCategories = [...appliedCategories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
  
  // 가격대를 가격 순서로 정렬
  const sortedAppliedPriceRanges = [...appliedPriceRanges].sort((a, b) => {
    const indexA = priceRangeOrder.indexOf(a)
    const indexB = priceRangeOrder.indexOf(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

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
      {/* Fixed Header */}
      <div className="page-header">
        <div className="header-top">
          <button className="home-button" onClick={handleHome}>
            <HomeIcon />
            <span className="home-button-text">홈으로</span>
          </button>
          <div className="header-title-section">
            <h1 className="page-title">인기 선물</h1>
            <p className="page-subtitle">필터를 적용해서 원하는 선물을 구경해보세요</p>
          </div>
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
      </div>

      {/* Content Container */}
      <div className="page-content">
        {/* Applied Filters */}
        {(appliedCategories.length > 0 || appliedPriceRanges.length > 0) && (
          <div className="applied-filters">
          {/* 카테고리 필터들 - 첫 번째 줄 */}
          {appliedCategories.length > 0 && (
            <div className="filter-row">
              <div className="applied-filter-tag category-filter-tag">
                <span className="filter-tag-label">카테고리</span>
              </div>
              <div className="filter-items-scroll">
                {sortedAppliedCategories.map((category) => (
                  <div key={category} className="applied-filter-tag category-item-tag">
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
              </div>
            </div>
          )}
          {/* 가격대 필터들 - 두 번째 줄 */}
          {appliedPriceRanges.length > 0 && (
            <div className="filter-row">
              <div className="applied-filter-tag price-filter-tag">
                <span className="filter-tag-label">가격대</span>
              </div>
              <div className="filter-items-scroll">
                {sortedAppliedPriceRanges.map((range) => (
                  <div key={range} className="applied-filter-tag price-item-tag">
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
            </div>
          )}
          </div>
        )}

        {/* Gifts Grid */}
        <div className="gifts-container">
        <div className="gifts-grid">
          {filteredGifts.map((gift) => (
            <a 
              key={gift.id} 
              href={gift.url}
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default PopularGiftsPage


