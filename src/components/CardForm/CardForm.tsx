import { FormEvent, useEffect, useState } from "react";
import { BusinessCard } from "../../store/cardStore";
import { generateUUID } from "../../utils/uuid";
import "./CardForm.css";

const fields: Array<{
  name: keyof BusinessCard;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "select";
  options?: Array<{ value: string; label: string }>;
}> = [
  { name: "name", label: "이름", placeholder: "홍길동", required: true },
  { name: "company", label: "소속", placeholder: "Cursor Studio" },
  { name: "position", label: "직급", placeholder: "Product Manager" },
  { name: "phone", label: "전화", placeholder: "010-1234-5678" },
  { name: "email", label: "이메일", placeholder: "hello@cursor.ai" },
  {
    name: "gender",
    label: "성별",
    placeholder: "성별을 선택해주세요",
    type: "select",
    options: [
      { value: "", label: "선택 안 함" },
      { value: "남성", label: "남성" },
      { value: "여성", label: "여성" },
    ],
  },
  {
    name: "memo",
    label: "메모",
    placeholder: "상대방의 취미나 관심사, 이벤트 등 메모하기",
    multiline: true,
  },
];

type CardFormProps = {
  initialValues?: Partial<BusinessCard>;
  onSubmit: (values: BusinessCard) => void;
  isSubmitting?: boolean;
  hideMemo?: boolean;
};

const CardForm = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  hideMemo = false,
}: CardFormProps) => {
  const [formValues, setFormValues] = useState<Partial<BusinessCard>>(
    initialValues ?? {},
  );

  useEffect(() => {
    setFormValues(initialValues ?? {});
  }, [initialValues]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // 이름만 필수: 이름이 없거나 공백만 있으면 저장 불가
    if (!formValues.name || formValues.name.trim() === "") {
      alert("이름을 입력해주세요.");
      return;
    }
    
    // 빈 문자열을 null로 변환하는 헬퍼 함수 (삭제된 필드를 명시적으로 null로 표시)
    const cleanField = (value: any): string | null => {
      if (value === undefined || value === null) return null;
      const trimmed = String(value).trim();
      return trimmed !== '' ? trimmed : null;
    };
    
    onSubmit({
      id: formValues.id ?? generateUUID(),
      name: formValues.name,
      position: cleanField(formValues.position),
      company: cleanField(formValues.company),
      phone: cleanField(formValues.phone),
      email: cleanField(formValues.email),
      gender: cleanField(formValues.gender),
      memo: hideMemo ? null : cleanField(formValues.memo),
      image: cleanField(formValues.image),
      design: formValues.design || initialValues?.design || 'design-1',
      isFavorite: formValues.isFavorite || initialValues?.isFavorite || false,
    });
  };

  // hideMemo가 true이면 memo 필드를 제외한 필드만 표시
  const displayFields = hideMemo ? fields.filter((field) => field.name !== 'memo') : fields;

  return (
    <div className="card-form-container">
      <form className="card-form" onSubmit={handleSubmit}>
        {displayFields.map((field) => (
          <div key={field.name as string} className="card-form-field">
            <label className="card-form-label">
              {field.label}
              {field.required && (
                <span className="card-form-label-required">*</span>
              )}
            </label>
            {field.multiline ? (
              <textarea
                value={String(formValues[field.name] ?? "")}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                required={field.required}
                className="card-form-textarea"
              />
            ) : field.type === "select" ? (
              <select
                value={String(formValues[field.name] ?? "")}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
                className="card-form-select"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={String(formValues[field.name] ?? "")}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                required={field.required}
                className="card-form-input"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={isSubmitting}
          className="card-form-submit-button"
        >
          {isSubmitting ? "저장 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
};

export default CardForm;

