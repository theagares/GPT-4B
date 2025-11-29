import { BusinessCard } from "../../store/cardStore";

type CardConfirmProps = {
  card: BusinessCard;
  onEdit: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
};

const infoRows: Array<keyof BusinessCard> = [
  "position",
  "company",
  "phone",
  "email",
  "memo",
];

const CardConfirm = ({
  card,
  onEdit,
  onConfirm,
  isSaving = false,
}: CardConfirmProps) => {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-lg shadow-primary/5">
        <p className="text-sm text-slate-500">OCR 결과 요약</p>
        <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">이름</p>
          <p className="text-2xl font-semibold text-slate-900">{card.name}</p>
        </div>
        <dl className="mt-4 space-y-3">
          {infoRows.map((key) => {
            if (!card[key]) return null;
            return (
              <div
                key={key}
                className="flex items-start justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <dt className="text-sm text-slate-500">{labelMap[key]}</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {card[key]}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
        >
          수정하기
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onConfirm}
          className="rounded-2xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 disabled:opacity-60"
        >
          {isSaving ? "저장 중..." : "저장 완료"}
        </button>
      </div>
    </div>
  );
};

const labelMap: Record<keyof BusinessCard, string> = {
  id: "ID",
  name: "이름",
  position: "직함",
  company: "회사",
  phone: "전화",
  email: "이메일",
  memo: "메모",
  image: "이미지",
};

export default CardConfirm;

