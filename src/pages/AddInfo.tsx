import { useLocation, useNavigate } from "react-router-dom";
import CardForm from "../components/CardForm/CardForm";
import { BusinessCard, useCardStore } from "../store/cardStore";
import "./AddInfo.css";

const AddInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addCard = useCardStore((state) => state.addCard);
  const updateCard = useCardStore((state) => state.updateCard);
  const setPendingCard = useCardStore((state) => state.setPendingCard);
  const draft = (location.state as { draft?: BusinessCard } | undefined)
    ?.draft;

  const handleSubmit = (card: BusinessCard) => {
    // 기존 명함 수정인 경우 (id가 있고 이미 존재하는 경우)
    if (card.id && draft?.id) {
      updateCard(card.id, card);
    } else {
      // 새 명함 추가인 경우
      addCard(card);
    }
    setPendingCard(null);
    navigate("/business-cards");
  };

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
          <p className="add-info-step">Step 3.</p>
          <h1 className="add-info-title">필요한 정보를 입력하세요</h1>
          <p className="add-info-subtitle">
            Figma 폼을 기준으로 필수/선택 항목이 나뉘어 있습니다.
          </p>
        </div>
        <CardForm initialValues={draft} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddInfo;

