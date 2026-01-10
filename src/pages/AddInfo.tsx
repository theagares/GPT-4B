import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BusinessCard, useCardStore } from "../store/cardStore";
import CardForm from "../components/CardForm/CardForm";
import MemoPromptModal from "../components/MemoPromptModal/MemoPromptModal";
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
  const locationState = location.state as { card?: BusinessCard; fromOCR?: boolean; draft?: BusinessCard } | null | undefined;
  const cardFromState = locationState?.card;
  const fromOCR = locationState?.fromOCR;
  const draft = locationState?.draft;

  // card를 state로 관리하여 동적으로 업데이트
  const [currentCard, setCurrentCard] = useState<BusinessCard | null | undefined>(() => {
    // 초기값: state의 card 우선, 없으면 pendingCard 또는 draft
    return cardFromState || (fromOCR ? pendingCard : draft);
  });
  
  // draft가 있고 fromOCR가 아닌 경우 = 수정하기 버튼으로 온 경우
  const isEditMode = draft && !fromOCR;

  // card 정보 업데이트
  useEffect(() => {
    if (cardFromState) {
      setCurrentCard(cardFromState);
    } else if (!fromOCR && draft) {
      setCurrentCard(draft);
    } else if (fromOCR && pendingCard) {
      setCurrentCard(pendingCard);
    } else if (!fromOCR && !draft) {
      // OCR이 아니고 draft도 없으면 card가 없을 수 있음 (에러 페이지로)
      setCurrentCard(null);
    }
  }, [cardFromState, fromOCR, pendingCard, draft]);

  const card = currentCard;
  const [gender, setGender] = useState(card?.gender || '');
  const [showMemoPrompt, setShowMemoPrompt] = useState(false);
  const [savedCard, setSavedCard] = useState<BusinessCard | null>(null);

  // gender 상태를 card가 변경될 때 업데이트
  useEffect(() => {
    if (card?.gender) {
      setGender(card.gender);
    } else {
      setGender('');
    }
  }, [card?.gender]);

  // 명함 디자인 색상 가져오기
  const cardDesign = card?.design || 'design-1';
  const cardBackground = cardDesigns[cardDesign as keyof typeof cardDesigns] || cardDesigns['design-1'];

  // 수정 폼 제출 핸들러 (CardForm에서 사용)
  const handleFormSubmit = async (updatedCard: BusinessCard) => {
    try {
      // 메모 필드 제거 (AddInfo 페이지에서는 메모를 사용하지 않음)
      const cardWithoutMemo = { ...updatedCard };
      delete cardWithoutMemo.memo;

      // draft가 pendingCard인 경우 (Confirm에서 수정하기로 온 경우)
      if (draft?.id && draft.id === pendingCard?.id) {
        // pendingCard 업데이트
        setPendingCard(cardWithoutMemo);
        navigate("/confirm");
        return;
      }
      
      // 기존 명함 수정인 경우 (id가 있고 이미 저장된 명함인 경우)
      if (cardWithoutMemo.id && getCardById(cardWithoutMemo.id)) {
        // 빈 문자열을 null로 변환하는 헬퍼 함수
        const cleanField = (value: any): string | null => {
          if (value === undefined || value === null) return null;
          const trimmed = String(value).trim();
          return trimmed !== '' ? trimmed : null;
        };
        
        // 빈 문자열을 null로 변환하여 DB에 null로 저장되도록 함
        // 모든 필드를 명시적으로 처리하여 빈 값도 null로 저장되도록 함
        // undefined도 명시적으로 null로 변환하여 필드 삭제가 반영되도록 함
        // cleanField는 undefined나 빈 문자열을 null로 변환하므로, 항상 호출하여 null로 저장되도록 함
        const cleanCardData: any = {
          name: cardWithoutMemo.name,
          position: cleanField(cardWithoutMemo.position),
          company: cleanField(cardWithoutMemo.company),
          phone: cleanField(cardWithoutMemo.phone),
          email: cleanField(cardWithoutMemo.email),
          gender: cleanField(cardWithoutMemo.gender),
          image: cleanField(cardWithoutMemo.image),
          design: cardWithoutMemo.design || draft?.design || 'design-1',
          isFavorite: cardWithoutMemo.isFavorite || false,
        };
        
        await updateCard(cardWithoutMemo.id, cleanCardData);
        setPendingCard(null);
        navigate("/business-cards", { state: { refresh: true, openCardId: cardWithoutMemo.id } });
      } else {
        // 새 명함 추가인 경우 (DB에 저장)
        const saved = await addCard(cardWithoutMemo);
        setSavedCard(saved);
        setShowMemoPrompt(true);
        // 모달이 닫힌 후에 pendingCard를 초기화하도록 이동
      }
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('명함 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleComplete = async () => {
    if (!card) return;

    // 성별 업데이트 - 빈 문자열인 경우 명시적으로 처리
    const trimmedGender = gender.trim();
    
    // 메모 필드 제거
    const { memo, ...cardWithoutMemo } = card;
    
    const updatedCard: BusinessCard = {
      ...cardWithoutMemo,
      gender: trimmedGender !== '' ? trimmedGender : undefined,
    };

    try {
      // 명함 저장
      if (fromOCR && card) {
        // OCR에서 온 경우 새 명함 추가 (DB에 저장)
        const saved = await addCard(updatedCard);
        setSavedCard(saved);
        setShowMemoPrompt(true);
        // 모달이 닫힌 후에 pendingCard를 초기화하도록 이동
      } else if (card.id && getCardById(card.id)) {
        // 빈 문자열을 null로 변환하는 헬퍼 함수
        const cleanField = (value: any): string | null => {
          if (value === undefined || value === null) return null;
          const trimmed = String(value).trim();
          return trimmed !== '' ? trimmed : null;
        };
        
        // 기존 명함 수정인 경우 - 빈 문자열을 null로 변환하여 DB에 null로 저장되도록 함
        const cleanCardData: any = {
          name: updatedCard.name,
          position: cleanField(updatedCard.position),
          company: cleanField(updatedCard.company),
          phone: cleanField(updatedCard.phone),
          email: cleanField(updatedCard.email),
          gender: cleanField(trimmedGender),
          image: cleanField(updatedCard.image),
          design: updatedCard.design || card.design || 'design-1',
          isFavorite: updatedCard.isFavorite || false,
        };
        await updateCard(card.id, cleanCardData);
        navigate("/business-cards", { state: { refreshCards: true, openCardId: card.id } });
      } else {
        // 새 명함 추가인 경우
        const saved = await addCard(updatedCard);
        setSavedCard(saved);
        setShowMemoPrompt(true);
      }
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('명함 저장에 실패했습니다. 다시 시도해주세요.');
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
          <CardForm initialValues={draft} onSubmit={handleFormSubmit} hideMemo={true} />
        </div>
        {showMemoPrompt && savedCard && (
          <MemoPromptModal
            cardName={savedCard.name}
            cardId={savedCard.id}
            onClose={() => {
              setShowMemoPrompt(false);
              // 모달이 닫힐 때 pendingCard 초기화
              setPendingCard(null);
              navigate("/business-cards", { state: { openCardId: savedCard.id } });
            }}
          />
        )}
      </div>
    );
  }

  // card가 없을 때 처리
  useEffect(() => {
    if (!card) {
      if (fromOCR) {
        // OCR에서 온 경우 Confirm 페이지로 리다이렉트
        navigate("/confirm");
      } else if (!draft) {
        // draft도 없으면 뒤로가기
        navigate(-1);
      }
    }
  }, [card, fromOCR, draft, navigate]);

  if (!card) {
    return (
      <div className="add-info-page">
        <div className="add-info-container">
          <div className="add-info-loading" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            명함 정보를 불러오는 중...
          </div>
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

        {/* Gender Section */}
        <div className="add-info-gender-section">
          <label className="add-info-gender-label">성별</label>
          <select
            className="add-info-gender-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">선택 안 함</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>
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
      {showMemoPrompt && savedCard && (
        <MemoPromptModal
          cardName={savedCard.name}
          cardId={savedCard.id}
          onClose={() => {
            setShowMemoPrompt(false);
            // 모달이 닫힐 때 pendingCard 초기화
            setPendingCard(null);
            navigate("/business-cards", { state: { openCardId: savedCard.id } });
          }}
        />
      )}
    </div>
  );
};

export default AddInfo;
