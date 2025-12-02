import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BusinessCard, useCardStore } from "../store/cardStore";
import CardForm from "../components/CardForm/CardForm";
import "./AddInfo.css";

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

const AddInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addCard = useCardStore((state) => state.addCard);
  const updateCard = useCardStore((state) => state.updateCard);
  const setPendingCard = useCardStore((state) => state.setPendingCard);
  const getCardById = useCardStore((state) => state.getCardById);
  const pendingCard = useCardStore((state) => state.pendingCard);
  
  // location.state에서 card 정보 가져오기
  const cardFromState = (location.state as { card?: BusinessCard; fromOCR?: boolean } | undefined)?.card;
  const fromOCR = (location.state as { fromOCR?: boolean } | undefined)?.fromOCR;
  const draft = (location.state as { draft?: BusinessCard } | undefined)?.draft;

  // OCR에서 온 경우 pendingCard 사용, 아니면 state의 card 또는 draft 사용
  const card = fromOCR ? pendingCard : (cardFromState || draft);
  
  // draft가 있고 fromOCR가 아닌 경우 = 수정하기 버튼으로 온 경우
  const isEditMode = draft && !fromOCR;

  const [memo, setMemo] = useState(card?.memo || '');

  // 명함 디자인 색상 가져오기
  const cardDesign = card?.design || 'design-1';
  const cardBackground = cardDesigns[cardDesign as keyof typeof cardDesigns] || cardDesigns['design-1'];

  // 수정 폼 제출 핸들러 (CardForm에서 사용)
  const handleFormSubmit = (updatedCard: BusinessCard) => {
    // draft가 pendingCard인 경우 (Confirm에서 수정하기로 온 경우)
    if (draft?.id && draft.id === pendingCard?.id) {
      // pendingCard 업데이트
      setPendingCard(updatedCard);
      navigate("/confirm");
      return;
    }
    
    // 기존 명함 수정인 경우 (id가 있고 이미 저장된 명함인 경우)
    if (updatedCard.id && getCardById(updatedCard.id)) {
      updateCard(updatedCard.id, updatedCard);
      navigate("/business-cards");
    } else {
      // 새 명함 추가인 경우
      addCard(updatedCard);
      navigate("/business-cards");
    }
    setPendingCard(null);
  };

  const handleComplete = () => {
    if (!card) return;

    // 메모 업데이트
    const updatedCard: BusinessCard = {
      ...card,
      memo: memo.trim() || undefined,
    };

    // 명함 저장
    if (fromOCR && pendingCard) {
      // OCR에서 온 경우 새 명함 추가
      addCard(updatedCard);
      const savedCardId = updatedCard.id;
      setPendingCard(null);
      navigate("/business-cards", { state: { openCardId: savedCardId } });
    } else if (card.id && getCardById(card.id)) {
      // 기존 명함 수정인 경우
      updateCard(card.id, updatedCard);
      navigate("/business-cards");
    } else {
      // 새 명함 추가인 경우
      addCard(updatedCard);
      navigate("/business-cards");
    }
  };

  const handleBack = () => {
    if (fromOCR) {
      navigate("/confirm");
    } else {
      navigate(-1);
    }
  };

  // 수정 모드인 경우 CardForm 사용
  if (isEditMode) {
    return (
      <div className="add-info-page">
        <div className="add-info-container">
          <button
            className="add-info-back-button"
            onClick={() => navigate(-1)}
            type="button"
            aria-label="뒤로가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="add-info-header">
            <h1 className="add-info-title">명함 정보 수정</h1>
            <p className="add-info-subtitle">
              잘못된 정보가 있다면 올바르게 수정할 수 있어요.
            </p>
          </div>
          <CardForm initialValues={draft} onSubmit={handleFormSubmit} />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="add-info-page">
        <div className="add-info-container">
          <p>명함 정보가 없습니다.</p>
          <button onClick={() => navigate(-1)}>뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-info-page">
      <div className="add-info-container">
        <button
          className="add-info-back-button"
          onClick={handleBack}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="add-info-header">
          <p className="add-info-step">Step 3.</p>
          <h1 className="add-info-title">알고 있는 정보를 더 알려주세요!</h1>
        </div>

        {/* Contact Info Card */}
        <div 
          className="add-info-contact-card"
          style={{ background: cardBackground }}
        >
          {card.company && (
            <div className="add-info-contact-item company">{card.company}</div>
          )}
          <div className="add-info-contact-item name">{card.name}</div>
          {card.position && (
            <div className="add-info-contact-item position">{card.position}</div>
          )}
          {card.phone && (
            <div className="add-info-contact-item phone">{card.phone}</div>
          )}
          {card.email && (
            <div className="add-info-contact-item email">{card.email}</div>
          )}
        </div>

        {/* Memo Section */}
        <div className="add-info-memo-section">
          <h2 className="add-info-memo-title">메모</h2>
          <textarea
            className="add-info-memo-textarea"
            placeholder="혹시 추가로 메모하고 싶은 내용이 있나요?"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <p className="add-info-memo-example">
            예: 박상무님과의 첫 만남, 영업부장님 소개로 만남
          </p>
        </div>

        {/* Complete Button */}
        <div className="add-info-complete-section">
          <p className="add-info-complete-text">
            곧 {card.name}님의 명함이 완성됩니다!
          </p>
          <button
            className="add-info-complete-button"
            onClick={handleComplete}
            type="button"
          >
            명함 완성하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInfo;
