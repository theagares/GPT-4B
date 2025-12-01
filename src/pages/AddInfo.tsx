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
  const getCardById = useCardStore((state) => state.getCardById);
  const pendingCard = useCardStore((state) => state.pendingCard);
  const draft = (location.state as { draft?: BusinessCard } | undefined)
    ?.draft;

  const handleSubmit = (card: BusinessCard) => {
    // draft가 pendingCard인 경우 (Confirm에서 수정하기로 온 경우)
    if (draft?.id && draft.id === pendingCard?.id) {
      // pendingCard 업데이트
      setPendingCard(card);
      navigate("/confirm");
      return;
    }
    
    // 기존 명함 수정인 경우 (id가 있고 이미 저장된 명함인 경우)
    if (card.id && draft?.id && getCardById(card.id)) {
      updateCard(card.id, card);
      navigate("/business-cards");
    } else {
      // 새 명함 추가인 경우
      addCard(card);
      navigate("/business-cards");
    }
    setPendingCard(null);
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
          <h1 className="add-info-title">명함 정보 수정</h1>
          <p className="add-info-subtitle">
            잘못된 정보가 있다면 올바르게 수정할 수 있어요.
          </p>
        </div>
        <CardForm initialValues={draft} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddInfo;

