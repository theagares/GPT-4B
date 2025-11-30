import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardConfirm from "../components/CardConfirm/CardConfirm";
import { BusinessCard, useCardStore } from "../store/cardStore";
import "./Confirm.css";

const Confirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackCard = (
    location.state as { fallbackCard?: BusinessCard } | null
  )?.fallbackCard;
  const pendingCard = useCardStore((state) => state.pendingCard);
  const addCard = useCardStore((state) => state.addCard);
  const setPendingCard = useCardStore((state) => state.setPendingCard);

  useEffect(() => {
    if (!pendingCard && fallbackCard) {
      setPendingCard(fallbackCard);
    }
  }, [fallbackCard, pendingCard, setPendingCard]);

  if (!pendingCard) {
    return (
      <div className="confirm-page">
        <div className="confirm-container">
          <div className="confirm-empty-state">
            <p className="confirm-empty-message">
              확인할 OCR 결과가 없습니다.
            </p>
            <button
              type="button"
              onClick={() => navigate("/ocr")}
              className="confirm-empty-button"
            >
              OCR 촬영으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    addCard(pendingCard);
    setPendingCard(null);
    navigate("/business-cards");
  };

  const handleEdit = () => {
    navigate("/add", { state: { draft: pendingCard } });
  };

  return (
    <div className="confirm-page">
      <div className="confirm-container">
        <div className="confirm-header">
          <p className="confirm-step">Step 2.</p>
          <h1 className="confirm-title">OCR 결과를 확인하세요</h1>
          <p className="confirm-subtitle">
            정보가 잘 인식되었는지 확인 후, 수정이 필요하면 직접 편집하세요.
          </p>
        </div>
        <CardConfirm
          card={pendingCard}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default Confirm;

