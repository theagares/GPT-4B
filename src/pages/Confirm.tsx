import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardConfirm from "../components/CardConfirm/CardConfirm";
import { BusinessCard, useCardStore } from "../store/cardStore";
import { isAuthenticated } from "../utils/auth";
import "./Confirm.css";

const Confirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackCard = (
    location.state as { fallbackCard?: BusinessCard } | null
  )?.fallbackCard;
  const pendingCard = useCardStore((state) => state.pendingCard);
  const setPendingCard = useCardStore((state) => state.setPendingCard);
  const [isEditMode, setIsEditMode] = useState(true); // OCR 후 바로 편집 모드로 진입
  const [editedCard, setEditedCard] = useState<BusinessCard | null>(null);

  useEffect(() => {
    if (!pendingCard && fallbackCard) {
      setPendingCard(fallbackCard);
    }
  }, [fallbackCard, pendingCard, setPendingCard]);

  useEffect(() => {
    if (pendingCard) {
      setEditedCard({ ...pendingCard });
    }
  }, [pendingCard]);

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
    // 명함 추가정보 입력 페이지로 이동
    navigate("/add-info", { state: { fromOCR: true, card: pendingCard } });
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (editedCard) {
      setPendingCard(editedCard);
      // 저장 완료 후 명함 추가정보 입력 페이지로 이동
      navigate("/add-info", { state: { fromOCR: true, card: editedCard } });
    }
  };

  const handleBack = () => {
    // 뒤로가기: OCR 페이지로 돌아가기
    navigate("/ocr");
  };

  const handleFieldChange = (field: keyof BusinessCard, value: string) => {
    if (editedCard) {
      setEditedCard({
        ...editedCard,
        [field]: value,
      });
    }
  };

  return (
    <div className="confirm-page">
      <div className="confirm-container">
        <div className="confirm-header">
          <p className="confirm-step">Step 2.</p>
          <h1 className="confirm-title">OCR 결과를 확인하세요</h1>
          <p className="confirm-subtitle">
            정보가 잘 인식되었는지 확인 후,<br />
            수정이 필요하면 직접 편집하세요.
          </p>
        </div>
        <CardConfirm
          card={editedCard || pendingCard}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
          isEditMode={isEditMode}
          onSaveEdit={handleSaveEdit}
          onBack={handleBack}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  );
};

export default Confirm;

