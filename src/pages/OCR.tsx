import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OCRCamera from "../components/OCRCamera/OCRCamera";
import { runOCR } from "../utils/ocr";
import { useCardStore } from "../store/cardStore";
import "./OCR.css";

// 닫기 아이콘 SVG 컴포넌트
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// 모바일/웹 감지 함수
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
};

// 카메라 지원 여부 확인
const hasCameraSupport = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

const OCR = () => {
  const navigate = useNavigate();
  const setPendingCard = useCardStore((state) => state.setPendingCard);
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
      const ocrResult = await runOCR(image);
      const pending = {
        id: crypto.randomUUID(),
        name: ocrResult.name ?? "이름 미확인",
        position: ocrResult.position,
        company: ocrResult.company,
        phone: ocrResult.phone,
        email: ocrResult.email,
        memo: ocrResult.memo,
        image,
      };
      setPendingCard(pending);
      navigate("/confirm");
    } catch (err) {
      console.error(err);
      setError("OCR 분석에 실패했습니다. 다시 시도해 주세요.");
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // 파일을 base64로 변환
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        const ocrResult = await runOCR(imageDataUrl);
        const pending = {
          id: crypto.randomUUID(),
          name: ocrResult.name ?? "이름 미확인",
          position: ocrResult.position,
          company: ocrResult.company,
          phone: ocrResult.phone,
          email: ocrResult.email,
          memo: ocrResult.memo,
          image: imageDataUrl,
        };
        setPendingCard(pending);
        navigate("/confirm");
      };
      reader.onerror = () => {
        setError('파일을 읽는 중 오류가 발생했습니다.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("OCR 분석에 실패했습니다. 다시 시도해 주세요.");
      setIsProcessing(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="ocr-page">
        <div className="ocr-container">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            color: 'white',
            fontSize: '16px'
          }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ocr-page">
      <div className="ocr-container">
        {/* Header */}
        <div className="ocr-header">
          <button
            className="ocr-back-button"
            onClick={() => navigate("/business-cards")}
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
          {useCamera && (
            <button
              className="ocr-flip-button"
              onClick={() => {
                setCameraToggle((prev) => prev + 1);
              }}
              type="button"
            >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M12 6V2M12 22V18M6 12H2M22 12H18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          )}
          {!useCamera && (
            <button
              className="ocr-switch-button"
              onClick={() => {
                if (hasCameraSupport()) {
                  setUseCamera(true);
                } else {
                  setError('이 브라우저는 카메라를 지원하지 않습니다.');
                }
              }}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M12 6V2M12 22V18M6 12H2M22 12H18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Title Section */}
        <div className="ocr-title-section">
          <p className="ocr-step">Step 1.</p>
          <h1 className="ocr-title">명함을 촬영해주세요</h1>
          <p className="ocr-subtitle">명함이 가이드 안에 들어오도록 조정해주세요</p>
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
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload-input" className="ocr-file-upload-label">
                <div className="ocr-file-upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                      fill="white"
                    />
                  </svg>
                </div>
                <p className="ocr-file-upload-text">명함 이미지 선택</p>
                <p className="ocr-file-upload-hint">클릭하여 파일을 선택하세요</p>
              </label>
            </div>
            {isProcessing && (
              <div className="ocr-processing">
                <p>OCR 분석 중...</p>
              </div>
            )}
          </div>
        )}

        {/* Guide Message */}
        <div className="ocr-guide-message">
          💡 명함을 수평으로 맞춰주세요
        </div>

        {/* Error Message */}
        {error && (
          <div className="ocr-error-message">
            {error}
          </div>
        )}
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
              <CloseIcon />
            </button>
            <div className="permission-dialog-content">
              <h2 className="permission-dialog-title">카메라를 허용해주세요</h2>
              <p className="permission-dialog-description">
                "설정 - gpt4b - 카메라"로 들어가서
                <br />
                '허용'을 눌러주세요.
              </p>
            </div>
            <button
              className="permission-dialog-button"
              onClick={() => {
                setShowPermissionDialog(false);
                // 설정 페이지로 이동하거나 카메라 권한 다시 요청
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

