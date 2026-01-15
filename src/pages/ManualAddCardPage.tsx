import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CardForm from "../components/CardForm/CardForm";
import MemoPromptModal from "../components/MemoPromptModal/MemoPromptModal";
import { BusinessCard, useCardStore } from "../store/cardStore";
import "./ManualAddCardPage.css";

const ManualAddCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      // 스케줄 종료 팝업에서 온 경우 팝업으로 돌아가기
      if (location.state?.returnToEndedPopup && location.state?.popupState) {
        const popupState = location.state.popupState;
        // 새로 등록된 명함 정보를 팝업 상태에 추가
        const updatedPopupState = {
          ...popupState,
          savedCardId: savedCard.id,
          savedCardName: savedCard.name
        };
        navigate("/dashboard", {
          state: {
            returnToEndedPopup: true,
            popupState: updatedPopupState
          }
        });
      } else if (location.state?.returnToEventDetail && location.state?.eventId) {
        // 일정 상세에서 온 경우 명함집으로 이동하되, 일정 상세로 돌아갈 수 있도록 state 전달
        navigate("/business-cards", { 
          state: { 
            openCardId: savedCard.id,
            returnToEventDetail: true,
            eventId: location.state.eventId
          } 
        });
      } else {
        // 일반적인 경우 명함집으로 이동
        navigate("/business-cards", { state: { openCardId: savedCard.id } });
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="manual-add-card-page">
      {/* Fixed Header */}
      <div className="manual-add-card-header">
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
        <div className="manual-add-card-header-content">
          <h1 className="manual-add-card-title">수동 명함 등록</h1>
          <p className="manual-add-card-subtitle">
            상대방의 정보를 직접 입력해서 명함을 등록할 수 있어요.
          </p>
        </div>
        <div style={{ width: '24px' }}></div> {/* Placeholder for right alignment */}
      </div>

      <div className="manual-add-card-container">

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

