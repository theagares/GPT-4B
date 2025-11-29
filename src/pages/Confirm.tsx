import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardConfirm from "../components/CardConfirm/CardConfirm";
import { BusinessCard, useCardStore } from "../store/cardStore";

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
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow-lg">
        <p className="text-sm text-slate-500">
          확인할 OCR 결과가 없습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate("/ocr")}
          className="mt-4 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          OCR 촬영으로 이동
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    addCard(pendingCard);
    setPendingCard(null);
    navigate("/cards");
  };

  const handleEdit = () => {
    navigate("/add", { state: { draft: pendingCard } });
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Step 2.</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          OCR 결과를 확인하세요
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          정보가 잘 인식되었는지 확인 후, 수정이 필요하면 직접 편집하세요.
        </p>
      </div>
      <CardConfirm
        card={pendingCard}
        onConfirm={handleConfirm}
        onEdit={handleEdit}
      />
    </section>
  );
};

export default Confirm;

