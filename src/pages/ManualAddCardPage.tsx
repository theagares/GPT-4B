import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardForm from "../components/CardForm/CardForm";
import MemoPromptModal from "../components/MemoPromptModal/MemoPromptModal";
import { BusinessCard, useCardStore } from "../store/cardStore";
import "./ManualAddCardPage.css";

const ManualAddCardPage = () => {
  const navigate = useNavigate();
  const addCard = useCardStore((state) => state.addCard);
  const [showMemoPrompt, setShowMemoPrompt] = useState(false);
  const [savedCard, setSavedCard] = useState<BusinessCard | null>(null);

  const handleSubmit = async (card: BusinessCard) => {
    try {
      // 새 명함 추가 (DB에 저장)
      const saved = await addCard(card);
      setSavedCard(saved);
      setShowMemoPrompt(true);
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('명함 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCloseModal = () => {
    setShowMemoPrompt(false);
    if (savedCard) {
      navigate("/business-cards", { state: { openCardId: savedCard.id } });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="manual-add-card-page">
      <div className="manual-add-card-container">
        <button
          className="manual-add-card-back-button"
          onClick={handleBack}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="manual-add-card-header">
          <h1 className="manual-add-card-title">수동 명함 등록</h1>
          <p className="manual-add-card-subtitle">
            상대방의 정보를 직접 입력해서 명함을 등록할 수 있어요.
          </p>
        </div>

        <CardForm onSubmit={handleSubmit} hideMemo={true} />
      </div>
      {showMemoPrompt && savedCard && (
        <MemoPromptModal
          cardName={savedCard.name}
          cardId={savedCard.id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ManualAddCardPage;

