import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BusinessCard, useCardStore } from "../store/cardStore";
import { userAPI } from "../utils/api";
import "./CardCustomize.css";

type CardDesign = {
  id: string;
  name: string;
  gradient: string;
  preview: string;
};

const cardDesigns: CardDesign[] = [
  {
    id: "design-1",
    name: "클래식 퍼플",
    gradient: "linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)",
    preview: "classic-purple",
  },
  {
    id: "design-2",
    name: "딥 블루",
    gradient: "linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)",
    preview: "deep-blue",
  },
  {
    id: "design-3",
    name: "에메랄드",
    gradient: "linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)",
    preview: "emerald",
  },
  {
    id: "design-4",
    name: "로즈",
    gradient: "linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)",
    preview: "rose",
  },
  {
    id: "design-5",
    name: "오렌지",
    gradient: "linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)",
    preview: "orange",
  },
  {
    id: "design-6",
    name: "인디고",
    gradient: "linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)",
    preview: "indigo",
  },
];

const CardCustomize = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const card = (location.state as { card?: BusinessCard } | undefined)?.card;
  const updateCard = useCardStore((state) => state.updateCard);
  const [selectedDesign, setSelectedDesign] = useState<string>(() => {
    if (card?.id === 'my-card') {
      // 내 명함인 경우 card.design에서 불러오기 (DB에서 가져온 값)
      return card?.design || "design-1";
    }
    return card?.design || "design-1";
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!card) {
    return (
      <div className="card-customize-page">
        <div className="card-customize-container">
          <div className="card-customize-empty">
            <p>명함 정보가 없습니다.</p>
            <button onClick={() => navigate(-1)}>돌아가기</button>
          </div>
        </div>
      </div>
    );
  }

  const selectedDesignData = cardDesigns.find((d) => d.id === selectedDesign) || cardDesigns[0];

  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId);
  };

  const handleApply = async () => {
    // 내 명함인 경우 DB에 저장
    if (card.id === 'my-card') {
      setIsSaving(true);
      try {
        // DB에 디자인 저장
        await userAPI.updateProfile({ cardDesign: selectedDesign });
        // 같은 탭에서 변경 감지를 위한 커스텀 이벤트 발생
        window.dispatchEvent(new Event('myCardDesignChanged'));
        window.dispatchEvent(new Event('myInfoUpdated'));
        navigate('/my/detail');
      } catch (error) {
        console.error('Failed to save card design:', error);
        alert('디자인 저장에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // 일반 명함인 경우 store에 저장
      updateCard(card.id, { design: selectedDesign });
      navigate('/business-cards', { state: { selectCardId: card.id } });
    }
  };

  return (
    <div className="card-customize-page">
      <div className="card-customize-container">
        <button
          className="card-customize-back-button"
          onClick={() => navigate(-1)}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="card-customize-header">
          <h1 className="card-customize-title">명함 디자인 선택</h1>
          <p className="card-customize-subtitle">
            원하는 디자인을 선택해주세요
          </p>
        </div>

        <div className="card-customize-preview-section">
          <div className="card-customize-preview-label">미리보기</div>
          <div
            className="card-customize-preview-card"
            style={{ background: selectedDesignData.gradient }}
          >
            <div className="card-customize-preview-content">
              {card.company && (
                <p className="card-customize-preview-company">{card.company}</p>
              )}
              <div className="card-customize-preview-info">
                <div>
                  <h3 className="card-customize-preview-name">{card.name}</h3>
                  {card.position && (
                    <p className="card-customize-preview-position">{card.position}</p>
                  )}
                </div>
                <div className="card-customize-preview-contact">
                  {card.phone && (
                    <p className="card-customize-preview-phone">{card.phone}</p>
                  )}
                  {card.email && (
                    <p className="card-customize-preview-email">{card.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-customize-designs-section">
          <div className="card-customize-designs-label">디자인 선택</div>
          <div className="card-customize-designs-grid">
            {cardDesigns.map((design) => (
              <button
                key={design.id}
                className={`card-customize-design-item ${
                  selectedDesign === design.id ? "selected" : ""
                }`}
                onClick={() => handleDesignSelect(design.id)}
                type="button"
              >
                <div
                  className="card-customize-design-preview"
                  style={{ background: design.gradient }}
                />
                <span className="card-customize-design-name">{design.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="card-customize-apply-button"
          onClick={handleApply}
          type="button"
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '디자인 적용하기'}
        </button>
      </div>
    </div>
  );
};

export default CardCustomize;
