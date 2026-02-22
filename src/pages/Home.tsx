import { useNavigate } from "react-router-dom";
import CardSlider from "../components/CardSlider/CardSlider";
import { useCardStore } from "../store/cardStore";

const Home = () => {
  const navigate = useNavigate();
  const cards = useCardStore((state) => state.cards);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white px-6 py-5 shadow-glass">
        <p className="text-sm text-slate-500">오늘의 프로필</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          빠르게 스캔하고 정리하세요
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          OCR로 정보를 채우고, 필요한 부분만 수정하면 저장까지 끝!
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/ocr")}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30"
          >
            OCR 촬영
          </button>
          <button
            type="button"
            onClick={() => navigate("/manual-add")}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            직접 입력
          </button>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            최근 프로필
          </h3>
          <button
            type="button"
            onClick={() => navigate("/cards")}
            className="text-sm font-medium text-primary"
          >
            전체 보기
          </button>
        </div>
        <CardSlider
          cards={cards}
          onCardClick={(card) => navigate(`/cards/${card.id}`)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.href)}
            className="rounded-3xl bg-white p-4 text-left shadow-lg shadow-slate-200 transition hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase text-slate-400">{action.kicker}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {action.label}
            </p>
            <p className="mt-2 text-sm text-slate-500">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

const quickActions = [
  {
    kicker: "FLOW",
    label: "OCR 확인",
    description: "인식 결과 검토",
    href: "/confirm",
  },
  {
    kicker: "CARD",
    label: "Cardbook",
    description: "그리드로 정리",
    href: "/cards",
  },
];

export default Home;

