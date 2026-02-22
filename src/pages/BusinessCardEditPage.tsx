import { useLocation, useNavigate } from "react-router-dom";
import BusinessCardEditForm from "../components/BusinessCardEditForm/BusinessCardEditForm";
import { BusinessCard, useCardStore } from "../store/cardStore";
import "./BusinessCardEditPage.css";

const BusinessCardEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const updateCard = useCardStore((state) => state.updateCard);
  
  // location.state에서 card 정보 가져오기
  const card = (location.state as { card?: BusinessCard } | undefined)?.card;

  const handleSubmit = async (updatedCard: BusinessCard) => {
    if (!card?.id) {
      // card 정보가 없으면 프로필 목록으로 이동
      navigate("/business-cards");
      return;
    }
    
    try {
      // 프로필 정보 업데이트 (await로 완료 대기)
      await updateCard(card.id, updatedCard);
      // 업데이트 완료 후 프로필 목록으로 이동
      navigate("/business-cards", { state: { refresh: true } });
    } catch (error) {
      console.error('Failed to update card:', error);
      alert('프로필 수정 중 오류가 발생했습니다.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="business-card-edit-page">
      <div className="business-card-edit-container">
        <button
          className="business-card-edit-back-button"
          onClick={handleBack}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="business-card-edit-header">
          <h1 className="business-card-edit-title">프로필 정보 수정</h1>
        </div>
        {card ? (
          <BusinessCardEditForm initialValues={card} onSubmit={handleSubmit} />
        ) : (
          <div className="business-card-edit-error">
            <p>프로필 정보를 불러올 수 없습니다.</p>
            <button 
              className="business-card-edit-error-button"
              onClick={() => navigate("/business-cards")}
            >
              프로필 목록으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCardEditPage;

