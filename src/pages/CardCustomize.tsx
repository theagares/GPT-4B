import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BusinessCard, useCardStore } from "../store/cardStore";
import { userAPI } from "../utils/api";
import "./CardCustomize.css";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 109, g: 48, b: 223 };
}

function darkenColor(r: number, g: number, b: number, amount = 0.15) {
  return {
    r: Math.round(Math.max(0, r * (1 - amount))),
    g: Math.round(Math.max(0, g * (1 - amount))),
    b: Math.round(Math.max(0, b * (1 - amount))),
  };
}

function generateCardGradient(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const dark = darkenColor(r, g, b);
  return `linear-gradient(147.99deg, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${dark.r}, ${dark.g}, ${dark.b}, 1) 100%)`;
}

function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

const CardCustomize = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const card = (location.state as { card?: BusinessCard } | undefined)?.card;
  const updateCard = useCardStore((state) => state.updateCard);

  const initialDesign = card?.design || "custom-#6d30df";
  const initialHex = initialDesign.startsWith("custom-")
    ? initialDesign.replace("custom-", "")
    : "#6d30df";

  const [customColor, setCustomColor] = useState<string>(initialHex);
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

  const currentGradient = useMemo(() => {
    return generateCardGradient(customColor);
  }, [customColor]);

  const light = isLightColor(customColor);
  const textMain = light ? '#1f2937' : 'white';
  const textSub = light ? 'rgba(31,41,55,0.6)' : 'rgba(255,255,255,0.7)';
  const textContact = light ? 'rgba(31,41,55,0.5)' : 'rgba(255,255,255,0.6)';

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleBack = () => {
    // 내 명함인 경우 My 상세 페이지로 이동
    if (card.id === 'my-card') {
      navigate('/my/detail');
    } else {
      // 일반 명함인 경우 명함집 페이지로 이동하고 상세 모달 열기
      navigate('/business-cards', { state: { openCardId: card.id } });
    }
  };

  const handleApply = async () => {
    // 내 명함인 경우 DB에 저장
    if (card.id === 'my-card') {
      setIsSaving(true);
      try {
        // DB에 디자인 저장
        await userAPI.updateProfile({ cardDesign: `custom-${customColor}` });
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
      setIsSaving(true);
      try {
        await updateCard(card.id, { design: `custom-${customColor}` });
        navigate('/business-cards', { state: { openCardId: card.id } });
      } catch (error) {
        console.error('Failed to save card design:', error);
        alert('디자인 저장에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="card-customize-page">
      {/* Fixed Header */}
      <div className="card-customize-header">
        <button
          className="card-customize-back-button"
          onClick={handleBack}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="card-customize-header-content">
          <p className="card-customize-title">프로필 카드 색상 선택</p>
          <p className="card-customize-subtitle">
            하단의 색상 박스를 누르세요
          </p>
        </div>
      </div>

      <div className="card-customize-container">

        <div className="card-customize-custom-section">
          <div className="card-customize-custom-picker-row">
            <label className="card-customize-color-picker-wrapper">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="card-customize-color-input"
              />
              <div
                className="card-customize-color-preview selected"
                style={{ background: generateCardGradient(customColor) }}
              />
            </label>
            <div className="card-customize-color-info">
              <span className="card-customize-color-hex">{customColor.toUpperCase()}</span>
              <span className="card-customize-color-rgb">
                RGB({hexToRgb(customColor).r}, {hexToRgb(customColor).g}, {hexToRgb(customColor).b})
              </span>
            </div>
          </div>
        </div>

        <div className="card-customize-preview-section">
          <div className="card-customize-preview-label">미리보기</div>
          <div
            className="card-customize-preview-card"
            style={{ background: currentGradient }}
          >
            <div className="card-customize-preview-content">
              {card.company && (
                <p className="card-customize-preview-company" style={{ color: textSub }}>{card.company}</p>
              )}
              <div className="card-customize-preview-info">
                <div>
                  <h3 className="card-customize-preview-name" style={{ color: textMain }}>{card.name}</h3>
                  {card.position && (
                    <p className="card-customize-preview-position" style={{ color: textSub }}>{card.position}</p>
                  )}
                </div>
                <div className="card-customize-preview-contact">
                  {card.phone && (
                    <p className="card-customize-preview-phone" style={{ color: textContact }}>{card.phone}</p>
                  )}
                  {card.email && (
                    <p className="card-customize-preview-email" style={{ color: textContact }}>{card.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          className="card-customize-apply-button"
          onClick={handleApply}
          type="button"
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '색상 적용하기'}
        </button>
      </div>
    </div>
  );
};

export default CardCustomize;
