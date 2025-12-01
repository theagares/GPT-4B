import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditMyInfoPage.css";

const fields: Array<{
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}> = [
  { name: "name", label: "이름", placeholder: "홍길동", required: true },
  { name: "position", label: "직함", placeholder: "Product Manager", required: true },
  { name: "company", label: "회사", placeholder: "Cursor Studio", required: true },
  { name: "phone", label: "전화", placeholder: "010-1234-5678", required: true },
  { name: "email", label: "이메일", placeholder: "hello@cursor.ai", required: true },
  {
    name: "memo",
    label: "메모",
    placeholder: "만난 계기, 추억 등",
    multiline: true,
  },
];

function EditMyInfoPage() {
  const navigate = useNavigate();
  
  // localStorage에서 기존 정보 불러오기
  const loadMyInfo = () => {
    const savedInfo = localStorage.getItem('my-info');
    if (savedInfo) {
      return JSON.parse(savedInfo);
    }
    // 기본값
    return {
      name: "박상무",
      position: "상무",
      company: "한국프로축구연맹 영업본부",
      phone: "010-1234-5678",
      email: "park.sangmu@company.com",
      memo: "",
    };
  };

  const [formValues, setFormValues] = useState(loadMyInfo());

  // 컴포넌트 마운트 시 localStorage에서 불러오기
  useEffect(() => {
    setFormValues(loadMyInfo());
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!formValues.name) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!formValues.position) {
      alert("직함을 입력해주세요.");
      return;
    }
    if (!formValues.company) {
      alert("회사를 입력해주세요.");
      return;
    }
    if (!formValues.phone) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    if (!formValues.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    // localStorage에 저장
    localStorage.setItem('my-info', JSON.stringify(formValues));
    // 커스텀 이벤트 발생시켜서 MyDetailPage가 업데이트되도록
    window.dispatchEvent(new Event('myInfoUpdated'));
    navigate("/my/detail");
  };

  return (
    <div className="edit-my-info-page">
      <div className="edit-my-info-container">
        <button
          className="edit-my-info-back-button"
          onClick={() => navigate(-1)}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="edit-my-info-header">
          <h1 className="edit-my-info-title">내 명함 정보 수정</h1>
        </div>
        <form className="edit-my-info-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className="edit-my-info-field">
              <label className="edit-my-info-label">
                {field.label}
                {field.required && (
                  <span className="edit-my-info-label-required">*</span>
                )}
              </label>
              {field.multiline ? (
                <textarea
                  value={formValues[field.name as keyof typeof formValues] || ""}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      [field.name]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  className="edit-my-info-textarea"
                />
              ) : (
                <input
                  type="text"
                  value={formValues[field.name as keyof typeof formValues] || ""}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      [field.name]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  className="edit-my-info-input"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="edit-my-info-submit-button"
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditMyInfoPage;

