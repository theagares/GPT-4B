import { useNavigate, useParams } from "react-router-dom";
import { useCardStore } from "../store/cardStore";

const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const card = useCardStore((state) =>
    id ? state.getCardById(id) : undefined,
  );

  if (!card) {
    return (
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow-lg">
        <p className="text-sm text-slate-500">명함을 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate("/cards")}
          className="mt-4 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          목록으로 이동
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-glass">
        <p className="text-sm text-white/70">{card.company}</p>
        <p className="mt-6 text-3xl font-semibold">{card.name}</p>
        <p className="text-sm text-white/70">{card.position}</p>
        <div className="mt-6 text-sm text-white/70">
          <p>{card.phone}</p>
          <p>{card.email}</p>
        </div>
      </div>
      <section className="space-y-3 rounded-3xl bg-white p-6 shadow-lg">
        <InfoRow label="회사" value={card.company} />
        <InfoRow label="직함" value={card.position} />
        <InfoRow label="전화" value={card.phone} />
        <InfoRow label="이메일" value={card.email} />
        <button
          type="button"
          onClick={() => navigate(`/memo?businessCardId=${card.id}`)}
          className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          메모 페이지로 이동
        </button>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/add", { state: { draft: card } })}
          className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
        >
          편집하기
        </button>
        <button
          type="button"
          onClick={() => navigate("/ocr")}
          className="rounded-2xl bg-primary py-3 text-sm font-semibold text-white"
        >
          새 명함 추가
        </button>
      </div>
    </section>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
};

export default CardDetail;

