import { useNavigate } from "react-router-dom";
import { useCardStore } from "../store/cardStore";

const Cardbook = () => {
  const navigate = useNavigate();
  const cards = useCardStore((state) => state.cards);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">전체 명함</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Cardbook
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/ocr")}
          className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          새 명함
        </button>
      </div>
      {cards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
          아직 저장된 명함이 없습니다. OCR로 첫 명함을 스캔해 보세요.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => navigate(`/cards/${card.id}`)}
              className="rounded-3xl bg-white p-4 text-left shadow-lg shadow-primary/5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs uppercase text-slate-400">{card.company}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {card.name}
              </p>
              <p className="text-sm text-slate-500">{card.position}</p>
              <p className="mt-3 text-xs text-slate-400">{card.email}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Cardbook;

