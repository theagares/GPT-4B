// pages/OCR.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OCRCamera from "../components/OCRCamera/OCRCamera";
import { runOCR } from "../utils/ocr";
import { useCardStore } from "../store/cardStore";
import { generateUUID } from "../utils/uuid";
import "./OCR.css";

const imgClose =
  "https://www.figma.com/api/mcp/asset/6648b9d4-a842-4e72-bb51-ca84e67e9f31";

// 모바일/웹 감지 함수
const isMobileDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
    (window.matchMedia &&
      window.matchMedia("(max-width: 768px)").matches)
  );
};

// 카메라 지원 여부 확인
const hasCameraSupport = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// 더미데이터 감지 함수
const isDummyData = (ocrResult: any): boolean => {
  if (!ocrResult) return false;
  
  // 백엔드 mockOCRResponse에서 반환하는 더미데이터 목록
  const dummyNames = ["박소윤", "이도현", "최하늘"];
  const dummyCompanies = ["Luna Collective", "Nova Labs", "Orbit Studio"];
  const dummyEmails = ["soyoon@luna.co", "dohyun@nova.ai", "ha-neul@orbit.studio"];
  const dummyPhones = ["010-1234-5678", "010-8765-4321", "010-2345-6789"];
  
  const isDummyName = ocrResult.name && dummyNames.includes(ocrResult.name);
  const isDummyCompany = ocrResult.company && dummyCompanies.includes(ocrResult.company);
  const isDummyEmail = ocrResult.email && dummyEmails.includes(ocrResult.email);
  const isDummyPhone = ocrResult.phone && dummyPhones.includes(ocrResult.phone);
  
  // 하나라도 더미데이터와 일치하면 더미데이터로 판단
  return isDummyName || isDummyCompany || isDummyEmail || isDummyPhone;
};

const OCR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setPendingCard = useCardStore(state => state.setPendingCard);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [cameraToggle, setCameraToggle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const mobile = isMobileDevice();
    const hasCamera = hasCameraSupport();
    setIsMobile(mobile);
    // 모바일이거나 카메라를 지원하는 경우 카메라 사용
    setUseCamera(mobile || hasCamera);
    setIsInitialized(true);
  }, []);

  const handleCapture = async (image: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // 이미지 유효성 검사
      if (!image || image.trim() === "") {
        throw new Error("이미지 데이터가 없습니다.");
      }

      const ocrResult = await runOCR(image);

      console.log("🎯 [OCR 페이지 - 캡처 결과 수신]");
      console.log("📊 OCR 결과:", ocrResult);

      // 더미데이터 감지
      const isDummy = isDummyData(ocrResult);
      if (isDummy) {
        console.warn("⚠️ 더미데이터 감지됨. 모든 필드를 빈 값으로 처리합니다.");
      }

      // OCR 결과 유효성 검사
      if (!ocrResult || (!ocrResult.name && !ocrResult.company && !ocrResult.email)) {
        console.warn("⚠️ OCR 결과가 불완전합니다:", ocrResult);
        console.warn("  - 이름:", ocrResult?.name || "없음");
        console.warn("  - 회사:", ocrResult?.company || "없음");
        console.warn("  - 이메일:", ocrResult?.email || "없음");
        // 경고만 표시하고 계속 진행 (사용자가 수정할 수 있도록)
      } else {
        console.log("✅ OCR 결과 유효성 검사 통과");
      }

      // 더미데이터인 경우 모든 필드를 빈 값으로 처리 (이름 포함)
      const pending = {
        id: generateUUID(),
        name: isDummy ? undefined : (ocrResult.name ?? undefined),
        position: isDummy ? undefined : (ocrResult.position ?? undefined),
        company: isDummy ? undefined : (ocrResult.company ?? undefined),
        phone: isDummy ? undefined : (ocrResult.phone ?? undefined),
        email: isDummy ? undefined : (ocrResult.email ?? undefined),
        memo: isDummy ? undefined : (ocrResult.memo ?? undefined),
        image,
      };

      setPendingCard(pending);
      navigate("/confirm");
    } catch (err) {
      console.error("OCR 처리 오류:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "OCR 분석에 실패했습니다. 다시 시도해 주세요.";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraError = (errorMessage: string) => {
    if (errorMessage.includes("권한") || errorMessage.includes("허용")) {
      setShowPermissionDialog(true);
    } else {
      setError(errorMessage);
      // 카메라 오류 시 파일 업로드로 전환
      setUseCamera(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF 등)");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const imageDataUrl = reader.result as string;
          
          if (!imageDataUrl) {
            throw new Error("파일을 읽을 수 없습니다.");
          }

          const ocrResult = await runOCR(imageDataUrl);

          console.log("🎯 [OCR 페이지 - 파일 업로드 결과 수신]");
          console.log("📊 OCR 결과:", ocrResult);

          // 더미데이터 감지
          const isDummy = isDummyData(ocrResult);
          if (isDummy) {
            console.warn("⚠️ 더미데이터 감지됨. 모든 필드를 빈 값으로 처리합니다.");
          }

          // OCR 결과 유효성 검사
          if (!ocrResult || (!ocrResult.name && !ocrResult.company && !ocrResult.email)) {
            console.warn("⚠️ OCR 결과가 불완전합니다:", ocrResult);
            console.warn("  - 이름:", ocrResult?.name || "없음");
            console.warn("  - 회사:", ocrResult?.company || "없음");
            console.warn("  - 이메일:", ocrResult?.email || "없음");
            // 경고만 표시하고 계속 진행
          } else {
            console.log("✅ OCR 결과 유효성 검사 통과");
          }

          // 더미데이터인 경우 모든 필드를 빈 값으로 처리 (이름 포함)
          const pending = {
            id: generateUUID(),
            name: isDummy ? undefined : (ocrResult.name ?? undefined),
            position: isDummy ? undefined : (ocrResult.position ?? undefined),
            company: isDummy ? undefined : (ocrResult.company ?? undefined),
            phone: isDummy ? undefined : (ocrResult.phone ?? undefined),
            email: isDummy ? undefined : (ocrResult.email ?? undefined),
            memo: isDummy ? undefined : (ocrResult.memo ?? undefined),
            image: imageDataUrl,
          };

          setPendingCard(pending);
          navigate("/confirm");
        } catch (e) {
          console.error("OCR 처리 오류:", e);
          const errorMessage = e instanceof Error 
            ? e.message 
            : "OCR 분석에 실패했습니다. 다시 시도해 주세요.";
          setError(errorMessage);
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError("파일을 읽는 중 오류가 발생했습니다. 파일이 손상되었을 수 있습니다.");
        setIsProcessing(false);
      };
      
      reader.onabort = () => {
        setError("파일 읽기가 취소되었습니다.");
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("파일 업로드 오류:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "파일 업로드에 실패했습니다. 다시 시도해 주세요.";
      setError(errorMessage);
      setIsProcessing(false);
    } finally {
      // input 초기화 (같은 파일을 다시 선택할 수 있도록)
      event.target.value = "";
    }
  };

  if (!isInitialized) {
    return (
      <div className="ocr-page">
        <div className="ocr-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              color: "white",
              fontSize: "16px",
            }}
          >
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    // Confirm 페이지에서 온 경우 명함집으로 이동
    const fromConfirm = (location.state as { fromConfirm?: boolean } | null)?.fromConfirm;
    if (fromConfirm) {
      navigate("/business-cards");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="ocr-page">
      <div className="ocr-container">
        {/* Header */}
        <div className="ocr-header">
          <button
            className="ocr-back-button"
            onClick={handleBack}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="ocr-header-content">
            <h1 className="ocr-title">명함을 촬영해주세요</h1>
            <p className="ocr-subtitle">
              명함이 가이드 안에 들어오도록 조정해주세요
            </p>
          </div>
          <div style={{ width: '24px' }}></div> {/* Placeholder for right alignment */}
        </div>

        {/* Camera Component or File Upload */}
        {useCamera ? (
          <OCRCamera
            key={cameraToggle}
            onCapture={handleCapture}
            isProcessing={isProcessing}
            onError={handleCameraError}
          />
        ) : (
          <div className="ocr-file-upload">
            <div className="ocr-file-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                id="file-upload-input"
                style={{ display: "none" }}
              />
              <label
                htmlFor="file-upload-input"
                className="ocr-file-upload-label"
              >
                <div className="ocr-file-upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                      fill="white"
                    />
                  </svg>
                </div>
                <p className="ocr-file-upload-text">명함 이미지 선택</p>
                <p className="ocr-file-upload-hint">
                  클릭하여 파일을 선택하세요
                </p>
              </label>
            </div>
            {isProcessing && (
              <div className="ocr-processing">
                <div className="ocr-processing-spinner"></div>
                <p>OCR 분석 중...</p>
                <p className="ocr-processing-hint">잠시만 기다려주세요</p>
              </div>
            )}
          </div>
        )}

        {/* Guide Message */}
        <div className="ocr-guide-message">명함을 수평으로 맞춰주세요</div>

        {/* Error Message */}
        {error && <div className="ocr-error-message">{error}</div>}
      </div>

      {/* Camera Permission Dialog */}
      {showPermissionDialog && (
        <div className="permission-dialog-overlay">
          <div className="permission-dialog">
            <button
              className="permission-dialog-close"
              onClick={() => setShowPermissionDialog(false)}
              type="button"
            >
              <img src={imgClose} alt="닫기" />
            </button>
            <div className="permission-dialog-content">
              <h2 className="permission-dialog-title">
                카메라를 허용해주세요
              </h2>
              <p className="permission-dialog-description">
                &quot;설정 - gpt4b - 카메라&quot;로 들어가서
                <br />
                &apos;허용&apos;을 눌러주세요.
              </p>
            </div>
            <button
              className="permission-dialog-button"
              onClick={() => {
                setShowPermissionDialog(false);
                // 여기서 다시 카메라 요청 로직 추가 가능
              }}
              type="button"
            >
              카메라 허용
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCR;