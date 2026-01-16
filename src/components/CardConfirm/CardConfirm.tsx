import { BusinessCard } from "../../store/cardStore";
import "./CardConfirm.css";

type CardConfirmProps = {
  card: BusinessCard;
  onEdit: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
  isEditMode?: boolean;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onBack?: () => void;
  onFieldChange?: (field: keyof BusinessCard, value: string) => void;
};

const infoRows: Array<keyof BusinessCard> = [
  "company",
  "position",
  "phone",
  "email",
];

const CardConfirm = ({
  card,
  onEdit,
  onConfirm,
  isSaving = false,
  isEditMode = false,
  onSaveEdit,
  onCancelEdit,
  onBack,
  onFieldChange,
}: CardConfirmProps) => {
  return (
    <div className="card-confirm-container">
      <section className="card-confirm-section">
        <p className="card-confirm-label">OCR 결과 요약</p>
        <div className="card-confirm-name-section">
          <p className="card-confirm-name-label">이름 <span className="card-confirm-required">*</span></p>
          {isEditMode ? (
            <input
              type="text"
              value={card.name || ""}
              onChange={(e) => onFieldChange?.("name", e.target.value)}
              className="card-confirm-input"
              placeholder="이름을 입력하세요"
              required
            />
          ) : (
            <p className="card-confirm-name">{card.name || ""}</p>
          )}
        </div>
        <div className="card-confirm-info-list">
          {infoRows.map((key) => {
            // 편집 모드가 아니고 값이 없으면 표시하지 않음
            if (!isEditMode && !card[key]) return null;
            
            return (
              <div key={key} className="card-confirm-info-item">
                <dt className="card-confirm-info-label">{labelMap[key]}</dt>
                {isEditMode ? (
                  <input
                    type="text"
                    value={card[key] || ""}
                    onChange={(e) => onFieldChange?.(key, e.target.value)}
                    className="card-confirm-input"
                    placeholder={placeholderMap[key]}
                  />
                ) : (
                  <dd className="card-confirm-info-value">{card[key]}</dd>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <div className="card-confirm-actions">
        {isEditMode ? (
          <>
            <button
              type="button"
              onClick={onBack}
              className="card-confirm-edit-button"
            >
              뒤로가기
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              className="card-confirm-save-button"
            >
              등록하기
            </button>
          </>
        ) : (
          <>
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
              {isSaving ? "저장 중..." : "등록하기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const labelMap: Record<keyof BusinessCard, string> = {
  id: "ID",
  name: "이름",
  position: "직급",
  company: "소속",
  phone: "전화",
  email: "이메일",
  memo: "메모",
  image: "이미지",
};

const placeholderMap: Record<keyof BusinessCard, string> = {
  id: "ID를 입력하세요",
  name: "이름을 입력하세요",
  position: "직급을 입력하세요",
  company: "소속을 입력하세요",
  phone: "전화번호를 입력하세요",
  email: "이메일을 입력하세요",
  memo: "메모를 입력하세요",
  image: "이미지를 입력하세요",
};

export default CardConfirm;

