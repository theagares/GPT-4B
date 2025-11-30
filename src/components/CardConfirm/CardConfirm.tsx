import { BusinessCard } from "../../store/cardStore";
import "./CardConfirm.css";

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
    <div className="card-confirm-container">
      <section className="card-confirm-section">
        <p className="card-confirm-label">OCR 결과 요약</p>
        <div className="card-confirm-name-section">
          <p className="card-confirm-name-label">이름</p>
          <p className="card-confirm-name">{card.name}</p>
        </div>
        <div className="card-confirm-info-list">
          {infoRows.map((key) => {
            if (!card[key]) return null;
            return (
              <div key={key} className="card-confirm-info-item">
                <dt className="card-confirm-info-label">{labelMap[key]}</dt>
                <dd className="card-confirm-info-value">{card[key]}</dd>
              </div>
            );
          })}
        </div>
      </section>
      <div className="card-confirm-actions">
        <button
          type="button"
          onClick={onEdit}
          className="card-confirm-edit-button"
        >
          수정하기
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onConfirm}
          className="card-confirm-save-button"
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

