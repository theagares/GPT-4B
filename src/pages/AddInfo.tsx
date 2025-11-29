import { useLocation, useNavigate } from "react-router-dom";
import CardForm from "../components/CardForm/CardForm";
import { BusinessCard, useCardStore } from "../store/cardStore";

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

  // 디버깅: draft 데이터 확인
  console.log('AddInfo - draft:', draft);
  console.log('AddInfo - location.state:', location.state);

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      padding: '0',
      margin: '0',
      display: 'block',
      visibility: 'visible',
      opacity: 1
    }}>
      <section style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        width: '100%',
        padding: '0'
      }}>
        <div>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0', fontFamily: 'Inter, Noto Sans KR, sans-serif' }}>Step 3.</p>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0', fontFamily: 'Inter, Noto Sans KR, sans-serif' }}>
            필요한 정보를 입력하세요
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0', fontFamily: 'Inter, Noto Sans KR, sans-serif' }}>
            Figma 폼을 기준으로 필수/선택 항목이 나뉘어 있습니다.
          </p>
        </div>
        <CardForm initialValues={draft} onSubmit={handleSubmit} />
      </section>
    </div>
  );
};

export default AddInfo;

