import { FormEvent, useEffect, useState } from "react";
import { BusinessCard } from "../../store/cardStore";
import "./CardForm.css";

const fields: Array<{
  name: keyof BusinessCard;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}> = [
  { name: "name", label: "이름", placeholder: "홍길동", required: true },
  { name: "position", label: "직함", placeholder: "Product Manager" },
  { name: "company", label: "회사", placeholder: "Cursor Studio" },
  { name: "phone", label: "전화", placeholder: "010-1234-5678" },
  { name: "email", label: "이메일", placeholder: "hello@cursor.ai" },
  {
    name: "memo",
    label: "메모",
    placeholder: "만난 계기, 추억 등",
    multiline: true,
  },
];

type CardFormProps = {
  initialValues?: Partial<BusinessCard>;
  onSubmit: (values: BusinessCard) => void;
  isSubmitting?: boolean;
};

const CardForm = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
}: CardFormProps) => {
  const [formValues, setFormValues] = useState<Partial<BusinessCard>>(
    initialValues ?? {},
  );

  useEffect(() => {
    setFormValues(initialValues ?? {});
  }, [initialValues]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!formValues.name) {
      alert("이름을 입력해주세요.");
      return;
    }
    onSubmit({
      id: formValues.id ?? crypto.randomUUID(),
      name: formValues.name,
      position: formValues.position,
      company: formValues.company,
      phone: formValues.phone,
      email: formValues.email,
      memo: formValues.memo,
      image: formValues.image,
    });
  };

  return (
    <div className="card-form-container">
      <form className="card-form" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name as string} className="card-form-field">
            <label className="card-form-label">
              {field.label}
              {field.required && (
                <span className="card-form-label-required">*</span>
              )}
            </label>
            {field.multiline ? (
              <textarea
                value={formValues[field.name] ?? ""}
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
            ) : (
              <input
                type="text"
                value={formValues[field.name] ?? ""}
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
          {isSubmitting ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
};

export default CardForm;

