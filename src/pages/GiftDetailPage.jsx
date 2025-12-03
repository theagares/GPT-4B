import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './GiftDetailPage.css'

// SVG Icon Component
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 선물 데이터 (PopularGiftsPage와 동일한 데이터)
const allGifts = [
  {
    id: 1,
    rank: '#1',
    image: "https://www.figma.com/api/mcp/asset/4b1421cd-2596-45d3-8139-9dcc9a7eb9f4",
    category: '주류',
    categoryColor: '#584cdc',
    name: '프리미엄 와인 세트',
    price: '102,448원',
    popularity: '인기 95%',
    description: '특별한 날을 위한 최고급 프리미엄 와인 선물 세트입니다.',
    features: ['프리미엄 품질 보증', '고급 포장 서비스 제공']
  },
  {
    id: 2,
    rank: '#2',
    image: "https://www.figma.com/api/mcp/asset/50bcc4a5-6947-447b-acf5-712e3e638c4b",
    category: '고급 선물',
    categoryColor: '#584cdc',
    name: '명품 선물 세트',
    price: '117,232원',
    popularity: '인기 95%',
    description: '특별한 날을 위한 명품 브랜드 선물 세트입니다.',
    features: ['프리미엄 품질 보증', '고급 포장 서비스 제공']
  },
  {
    id: 3,
    rank: '#3',
    image: "https://www.figma.com/api/mcp/asset/873df59d-ef1b-4164-9ec2-dc12ea7cc30a",
    category: '식음료',
    categoryColor: '#584cdc',
    name: '스페셜티 커피 세트',
    price: '260,724원',
    popularity: '인기 94%',
    description: '세계 각국의 최고급 원두로 구성된 스페셜티 커피 세트입니다.',
    details: '다양한 원산지의 프리미엄 커피 원두가 포함되어 있습니다.'
  },
  {
    id: 4,
    rank: '#4',
    image: "https://www.figma.com/api/mcp/asset/7f9cd4ef-8192-4282-8fdc-38a645494f85",
    category: '건강식품',
    categoryColor: '#584cdc',
    name: '비즈니스 선물 세트',
    price: '110,203원',
    popularity: '인기 94%',
    description: '비즈니스 관계에 적합한 고급 건강식품 세트입니다.',
    details: '고급 건강식품으로 구성된 선물 세트입니다.'
  },
  {
    id: 5,
    rank: '#5',
    image: "https://www.figma.com/api/mcp/asset/b6524582-3000-40b8-a596-90b4445e73b6",
    category: '과일',
    categoryColor: '#9810fa',
    name: '프리미엄 홍삼 세트',
    price: '66,421원',
    popularity: '인기 93%',
    description: '최고급 홍삼으로 만든 프리미엄 건강 선물 세트입니다.',
    details: '6년근 홍삼으로 제조된 프리미엄 제품입니다.'
  },
  {
    id: 6,
    rank: '#6',
    image: "https://www.figma.com/api/mcp/asset/684ef33d-ef31-444f-aec5-0992fa07cf9b",
    category: '차/티',
    categoryColor: '#9810fa',
    name: '제철 과일 선물 세트',
    price: '290,328원',
    popularity: '인기 93%',
    description: '제철 과일로 구성된 프리미엄 선물 세트입니다.',
    details: '신선한 제철 과일이 포함되어 있습니다.'
  },
  {
    id: 7,
    rank: '#7',
    image: "https://www.figma.com/api/mcp/asset/e3a18e2b-144f-49b7-b74f-0895116675a0",
    category: '간식',
    categoryColor: '#9810fa',
    name: '프리미엄 티 컬렉션',
    price: '215,087원',
    popularity: '인기 92%',
    description: '세계 각국의 프리미엄 티 컬렉션 세트입니다.',
    details: '다양한 종류의 고급차가 포함되어 있습니다.'
  },
  {
    id: 8,
    rank: '#8',
    image: "https://www.figma.com/api/mcp/asset/3bb8aa71-ab6b-4714-9a37-8fa65b2067b0",
    category: '생활용품',
    categoryColor: '#9810fa',
    name: '수제 과자 세트',
    price: '81,604원',
    popularity: '인기 92%',
    description: '수제로 만든 고급 과자 세트입니다.',
    details: '전통 방식으로 제조된 프리미엄 과자입니다.'
  },
  {
    id: 9,
    rank: '#9',
    image: "https://www.figma.com/api/mcp/asset/4b1421cd-2596-45d3-8139-9dcc9a7eb9f4",
    category: '화장품',
    categoryColor: '#9810fa',
    name: '디퓨저 세트',
    price: '71,926원',
    popularity: '인기 91%',
    description: '고급 아로마 디퓨저 세트입니다.',
    details: '프리미엄 에센셜 오일이 포함되어 있습니다.'
  },
  {
    id: 10,
    rank: '#10',
    image: "https://www.figma.com/api/mcp/asset/50bcc4a5-6947-447b-acf5-712e3e638c4b",
    category: '문구',
    categoryColor: '#9810fa',
    name: '스킨케어 세트',
    price: '97,155원',
    popularity: '인기 91%',
    description: '프리미엄 스킨케어 제품 세트입니다.',
    details: '천연 성분으로 만든 고급 스킨케어 제품입니다.'
  },
  {
    id: 11,
    rank: '#11',
    image: "https://www.figma.com/api/mcp/asset/4b1421cd-2596-45d3-8139-9dcc9a7eb9f4",
    category: '주방용품',
    categoryColor: '#9810fa',
    name: '프리미엄 와인 세트',
    price: '70,526원',
    popularity: '인기 90%',
    description: '프리미엄 와인으로 구성된 선물 세트입니다.',
    details: '고급 와인이 포함된 세트입니다.'
  },
  {
    id: 12,
    rank: '#12',
    image: "https://www.figma.com/api/mcp/asset/50bcc4a5-6947-447b-acf5-712e3e638c4b",
    category: '주류',
    categoryColor: '#9810fa',
    name: '명품 선물 세트',
    price: '236,115원',
    popularity: '인기 90%',
    description: '명품으로 구성된 프리미엄 선물 세트입니다.',
    details: '고급 패키징의 명품 선물 세트입니다.'
  }
]

function GiftDetailPage() {
  const navigate = useNavigate()
  const { giftId } = useParams()
  const [gift, setGift] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(3600)

  useEffect(() => {
    // 선물 데이터 찾기
    const foundGift = allGifts.find(g => g.id === parseInt(giftId))
    if (foundGift) {
      // features가 없는 경우 기본값 설정
      const giftWithFeatures = {
        ...foundGift,
        features: foundGift.features || ['프리미엄 품질 보증', '고급 포장 서비스 제공']
      }
      setGift(giftWithFeatures)
    } else {
      // 기본 선물 데이터 (giftId가 없거나 찾을 수 없는 경우)
      setGift({
        id: parseInt(giftId) || 1,
        rank: '#1',
        image: "https://www.figma.com/api/mcp/asset/4b1421cd-2596-45d3-8139-9dcc9a7eb9f4",
        category: '주류',
        categoryColor: '#584cdc',
        name: '프리미엄 와인 세트',
        price: '102,448원',
        popularity: '인기 95%',
        description: '특별한 날을 위한 최고급 프리미엄 와인 선물 세트입니다.',
        features: ['프리미엄 품질 보증', '고급 포장 서비스 제공']
      })
    }
    setLoading(false)
  }, [giftId])

  const handleBack = () => {
    navigate(-1)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  if (loading) {
    return (
      <div className="gift-detail-page">
        <div className="loading">상품 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!gift) {
    return (
      <div className="gift-detail-page">
        <div className="error">상품을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="gift-detail-page">
      {/* Header */}
      <div className="gift-detail-header">
        <button className="back-button" onClick={handleBack}>
          <div className="back-icon">
            <BackIcon />
          </div>
        </button>
        <h1 className="page-title">상품 상세</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Product Image */}
      <div className="product-image-section">
        <img src={gift.image} alt={gift.name} className="product-image" />
        {gift.rank && <div className="rank-badge">인기 {gift.rank}</div>}
      </div>

      {/* Product Info */}
      <div className="product-info-section">
        <div className="product-header-row">
          <div 
            className="category-badge" 
            style={{ 
              backgroundColor: gift.categoryColor === '#584cdc' ? '#f2f1ff' : '#faf5ff',
              borderColor: gift.categoryColor,
              color: gift.categoryColor
            }}
          >
            {gift.category}
          </div>
          <button className="like-button" onClick={handleLike}>
            <span className="like-count">{likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}</span>
            <span className={`heart-icon ${isLiked ? 'liked' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#0a0a0a" strokeWidth="1.5" fill={isLiked ? '#0a0a0a' : 'none'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
        <h2 className="product-name">{gift.name}</h2>
        <div className="product-price" style={{ color: gift.categoryColor }}>
          {gift.price}
        </div>
      </div>

      {/* Product Description */}
      <div className="product-description-section">
        <h3 className="section-title">상품 설명</h3>
        <p className="description-text">{gift.description}</p>
      </div>

      {/* Key Features */}
      <div className="key-features-section">
        <h3 className="section-title">주요 특징</h3>
        <ul className="features-list">
          {(gift.features || []).map((feature, index) => (
            <li key={index} className="feature-item">
              <span className="feature-bullet" style={{ color: gift.categoryColor }}>•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default GiftDetailPage

