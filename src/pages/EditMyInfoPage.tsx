import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../utils/api";
import { isAuthenticated } from "../utils/auth";
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
];

function EditMyInfoPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formValues, setFormValues] = useState({
    name: "",
    position: "",
    company: "",
    phone: "",
    email: "",
    memo: "",
  });

  // DB에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isAuthenticated()) {
        // 로그인하지 않은 경우 localStorage에서 가져오기
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setFormValues(JSON.parse(savedInfo));
        } else {
          setFormValues({
            name: "박상무",
            position: "상무",
            company: "한국프로축구연맹 영업본부",
            phone: "010-1234-5678",
            email: "park.sangmu@company.com",
            memo: "",
          });
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await userAPI.getProfile();
        if (response.data.success) {
          const userData = response.data.data;
          const savedInfo = localStorage.getItem('my-info');
          const localInfo = savedInfo ? JSON.parse(savedInfo) : {};
          
          setFormValues({
            name: userData.name || localInfo.name || "",
            position: userData.position || localInfo.position || "",
            company: userData.company || localInfo.company || "",
            phone: userData.phone || localInfo.phone || "",
            email: userData.email || localInfo.email || "",
            memo: localInfo.memo || "",
          });
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 에러 발생 시 localStorage에서 가져오기
        const savedInfo = localStorage.getItem('my-info');
        if (savedInfo) {
          setFormValues(JSON.parse(savedInfo));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
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

    setIsSubmitting(true);
    
    try {
      if (isAuthenticated()) {
        // DB에 업데이트
        const response = await userAPI.updateProfile({
          name: formValues.name,
          position: formValues.position,
          company: formValues.company,
          phone: formValues.phone,
          email: formValues.email,
        });
        
        if (response.data.success) {
          // localStorage에도 저장 (memo는 DB에 없으므로)
          localStorage.setItem('my-info', JSON.stringify(formValues));
          // 커스텀 이벤트 발생시켜서 다른 페이지가 업데이트되도록
          window.dispatchEvent(new Event('myInfoUpdated'));
          navigate("/my/detail");
        } else {
          alert('정보 업데이트에 실패했습니다.');
        }
      } else {
        // 로그인하지 않은 경우 localStorage에만 저장
        localStorage.setItem('my-info', JSON.stringify(formValues));
        window.dispatchEvent(new Event('myInfoUpdated'));
        navigate("/my/detail");
      }
    } catch (error) {
      console.error('Failed to update user info:', error);
      const errorMessage = error.response?.data?.message || '정보 업데이트에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-my-info-page">
        <div className="edit-my-info-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

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
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditMyInfoPage;

