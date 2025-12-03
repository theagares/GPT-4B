import { useEffect, useRef, useState } from "react";
import "./OCRCamera.css";

// SVG Icon Component
function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 3H15L17 6H21A2 2 0 0 1 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17A3 3 0 1 0 12 11A3 3 0 0 0 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

type OCRCameraProps = {
  onCapture: (image: string) => void;
  isProcessing?: boolean;
  onError?: (error: string) => void;
  onCameraToggle?: () => void;
};

const OCRCamera = ({ onCapture, isProcessing = false, onError, onCameraToggle }: OCRCameraProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // 기존 스트림 정리
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamError(null);
      } catch (error: any) {
        console.error("Camera error:", error);
        const errorMessage = error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
          ? "카메라 접근이 거부되었습니다. 설정에서 카메라 권한을 허용해주세요."
          : "카메라에 접근할 수 없습니다.";
        setStreamError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, onError]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/png"));
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="ocr-camera-container">
      <div className="ocr-camera-preview">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="ocr-camera-video"
        />
        
        {/* 명함 가이드 프레임 */}
        <div className="ocr-guide-frame">
          <div className="ocr-guide-corner top-left"></div>
          <div className="ocr-guide-corner top-right"></div>
          <div className="ocr-guide-corner bottom-left"></div>
          <div className="ocr-guide-corner bottom-right"></div>
          <div className="ocr-guide-center-dot"></div>
        </div>

        {streamError && (
          <div className="ocr-camera-error">
            {streamError}
          </div>
        )}
      </div>

      {/* 촬영 버튼 */}
      <div className="ocr-capture-section">
        <button
          type="button"
          onClick={handleCapture}
          disabled={isProcessing || !!streamError}
          className="ocr-capture-button"
        >
          <div className="ocr-capture-button-inner">
            <div className="ocr-capture-icon">
              <CameraIcon />
            </div>
          </div>
        </button>
        <p className="ocr-capture-hint">버튼을 눌러 촬영하세요</p>
      </div>
    </div>
  );
};

export default OCRCamera;

