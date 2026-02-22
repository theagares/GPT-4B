// utils/ocr.tsx
import { createWorker, Worker } from "tesseract.js";
// @ts-ignore - api.js is a JavaScript file
import { ocrAPI } from "./api";

export interface OCRParsedResult {
  rawText: string;
  name?: string;
  position?: string;
  company?: string;
  phone?: string;
  email?: string;
  memo?: string;
}

let workerPromise: Promise<Worker> | null = null;

/**
 * Tesseract worker를 싱글톤으로 생성
 */
async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      // tesseract.js v5: 언어를 createWorker에 직접 전달
      const worker = await createWorker("kor+eng", 1);
      return worker;
    })();
  }
  return workerPromise;
}

/**
 * base64 이미지에서 data URL prefix 제거
 */
function removeDataUrlPrefix(base64Image: string): string {
  return base64Image.replace(/^data:image\/\w+;base64,/, "");
}

/**
 * 프로필 텍스트를 기반으로 필드를 추출하는 함수
 * 백엔드 서비스의 parseBusinessCardText 로직을 참고하여 개선
 */
function parseBusinessCard(text: string): Omit<OCRParsedResult, "rawText"> {
  console.log("🔍 [OCR 파싱 시작]");
  console.log("📝 원본 텍스트:", text);
  console.log("📏 텍스트 길이:", text.length);
  
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  console.log("📋 분리된 라인 수:", lines.length);
  console.log("📋 라인별 내용:", lines);
  
  if (lines.length === 0) {
    console.warn("⚠️ [OCR 파싱] 텍스트가 비어있습니다.");
    return {};
  }

  const result: Omit<OCRParsedResult, "rawText"> = {
    name: "",
    position: "",
    company: "",
    phone: "",
    email: "",
    memo: "",
  };

  // 1) 이메일 추출 (백엔드와 동일한 정규식)
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
    console.log("✅ 이메일 추출:", result.email);
  } else {
    console.log("❌ 이메일 추출 실패");
  }

  // 2) 전화번호 추출 (다양한 형식 지원)
  const phoneRegex = /(\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
    console.log("✅ 전화번호 추출:", result.phone);
  } else {
    console.log("❌ 전화번호 추출 실패");
  }

  // 3) 이름 추출 (첫 번째 라인이 보통 이름)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // 이메일이나 전화번호가 포함된 라인은 제외
    if (!result.email || !firstLine.includes(result.email)) {
      if (!result.phone || !firstLine.includes(result.phone)) {
        result.name = firstLine;
      }
    }
  }

  // 4) 직책 추출 (두 번째 라인 또는 키워드 포함 라인)
  const titleKeywords = [
    "대표이사", "대표", "이사", "전무", "상무", "부장", "차장", "과장",
    "대리", "주임", "사원", "팀장", "실장", "센터장", "원장",
    "Manager", "Director", "Lead", "CEO", "CTO", "CFO", "COO", "CMO", "Head",
    "Brand Strategist", "AI Researcher", "Product Designer",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // 이미 이름으로 사용된 라인은 제외
    if (result.name && line === result.name) continue;
    // 이메일/전화번호 포함 라인 제외
    if (result.email && line.includes(result.email)) continue;
    if (result.phone && line.includes(result.phone)) continue;

    // 키워드로 직책 찾기
    const found = titleKeywords.find(k => line.includes(k));
    if (found) {
      result.position = line;
      // 이름이 아직 없고 직책 라인에서 이름 추출 가능하면
      if (!result.name || result.name === lines[0].trim()) {
        const nameCandidate = line.replace(found, "").trim();
        if (nameCandidate && nameCandidate.length > 0) {
          result.name = nameCandidate;
        }
      }
      break;
    }
  }

  // 두 번째 라인이 직책일 수도 있음
  if (!result.position && lines.length > 1) {
    const secondLine = lines[1].trim();
    if (result.email && !secondLine.includes(result.email) &&
        result.phone && !secondLine.includes(result.phone)) {
      result.position = secondLine;
    }
  }

  // 이름이 아직 없으면 한글 2~4글자 라인 찾기
  if (!result.name || result.name === "") {
    for (const line of lines) {
      const cleanLine = line.replace(/\s/g, "");
      if (/^[가-힣]{2,4}$/.test(cleanLine)) {
        result.name = cleanLine;
        break;
      }
    }
  }

  // 5) 회사명 추출 (백엔드 로직과 유사)
  const companyMarkers = [
    "co", "ltd", "inc", "corp", "회사", "주식회사",
    "Co.", "Inc.", "Corporation", "Corp.", "Ltd",
    "(주)", "유한회사",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (companyMarkers.some(marker => line.includes(marker))) {
      result.company = lines[i].trim();
      break;
    }
  }

  // 회사명을 못 찾았으면 첫 번째 또는 세 번째 라인 사용
  if (!result.company || result.company === "") {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // 이미 사용된 필드 제외
      if (result.name && line === result.name) continue;
      if (result.position && line === result.position) continue;
      if (result.email && line.includes(result.email)) continue;
      if (result.phone && line.includes(result.phone)) continue;
      
      result.company = line;
      break;
    }
  }

  // 6) 메모용 기타 텍스트
  const memoLines = lines.filter(line => {
    const trimmed = line.trim();
    if (result.name && trimmed.includes(result.name)) return false;
    if (result.position && trimmed === result.position) return false;
    if (result.company && trimmed === result.company) return false;
    if (result.email && trimmed.includes(result.email)) return false;
    if (result.phone && trimmed.includes(result.phone)) return false;
    return true;
  });

  if (memoLines.length > 0) {
    result.memo = memoLines.join("\n");
  }

  // 빈 문자열을 undefined로 변환
  const parsedResult = {
    name: result.name || undefined,
    position: result.position || undefined,
    company: result.company || undefined,
    phone: result.phone || undefined,
    email: result.email || undefined,
    memo: result.memo || undefined,
  };
  
  console.log("📊 [OCR 파싱 결과]");
  console.log("  이름:", parsedResult.name || "(없음)");
  console.log("  직책:", parsedResult.position || "(없음)");
  console.log("  회사:", parsedResult.company || "(없음)");
  console.log("  전화:", parsedResult.phone || "(없음)");
  console.log("  이메일:", parsedResult.email || "(없음)");
  console.log("  메모:", parsedResult.memo || "(없음)");
  console.log("✅ [OCR 파싱 완료]");
  
  return parsedResult;
}

/**
 * 백엔드 API를 통해 OCR 처리 시도
 */
async function processWithBackendAPI(base64Image: string): Promise<OCRParsedResult | null> {
  console.log("🌐 [백엔드 API OCR 시도]");
  try {
    const base64Data = removeDataUrlPrefix(base64Image);
    console.log("📤 요청 데이터 크기:", base64Data.length, "bytes");
    
    const response = await ocrAPI.process(base64Data);
    console.log("📥 백엔드 API 전체 응답:", response);
    console.log("📥 백엔드 API 응답 데이터:", response.data);
    
    // 백엔드 응답 구조: { success: true, data: ocrResult }
    if (response.data && typeof response.data === 'object') {
      // 성공 여부 확인
      if (response.data.success === false) {
        console.warn("⚠️ 백엔드 API가 실패를 반환했습니다:", response.data.message);
        return null;
      }
      
      // 실제 OCR 결과는 response.data.data에 있음
      const ocrData = response.data.data || response.data;
      console.log("📊 백엔드 OCR 데이터:", ocrData);
      
      // 백엔드 응답 형식에 맞게 변환 (백엔드에서 rawText를 제공함)
      const result: OCRParsedResult = {
        rawText: ocrData.rawText || "",
        name: ocrData.name || undefined,
        position: ocrData.position || undefined,
        company: ocrData.company || undefined,
        phone: ocrData.phone || undefined,
        email: ocrData.email || undefined,
        memo: ocrData.memo || undefined,
      };
      
      // 결과가 비어있는지 확인
      const hasValidData = result.name || result.company || result.email || result.phone;
      if (!hasValidData) {
        console.warn("⚠️ 백엔드 응답에 유효한 데이터가 없습니다.");
        return null;
      }
      
      console.log("✅ [백엔드 API OCR 성공]");
      console.log("📊 추출된 결과:", result);
      return result;
    }
    console.warn("⚠️ 백엔드 응답 형식이 올바르지 않습니다.");
    console.warn("응답 구조:", JSON.stringify(response.data, null, 2));
    return null;
  } catch (error) {
    console.warn("❌ [백엔드 API OCR 실패]");
    console.warn("에러 상세:", error);
    if (error instanceof Error) {
      console.warn("에러 메시지:", error.message);
      console.warn("에러 스택:", error.stack);
    }
    // axios 에러인 경우 응답 데이터도 확인
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.warn("HTTP 상태 코드:", axiosError.response?.status);
      console.warn("응답 데이터:", axiosError.response?.data);
    }
    return null;
  }
}

/**
 * 클라이언트 측 Tesseract.js로 OCR 수행
 */
async function processWithTesseract(image: string): Promise<OCRParsedResult> {
  console.log("🔧 [Tesseract.js OCR 시작]");
  console.log("🖼️ 이미지 타입:", image.substring(0, 50) + "...");
  
  try {
    const worker = await getWorker();
    console.log("✅ Tesseract Worker 준비 완료");
    
    console.log("⏳ OCR 인식 중...");
    const { data } = await worker.recognize(image);
    const rawText = data.text ?? "";
    
    console.log("📝 [Tesseract OCR 원본 결과]");
    console.log("  인식된 텍스트 길이:", rawText.length);
    console.log("  인식된 텍스트:", rawText);
    console.log("  신뢰도 정보:", data.confidence);
    
    const parsed = parseBusinessCard(rawText);
    
    const result = {
      rawText,
      ...parsed,
    };
    
    console.log("✅ [Tesseract.js OCR 완료]");
    return result;
  } catch (error) {
    console.error("❌ [Tesseract.js OCR 오류]");
    console.error("에러 상세:", error);
    throw error;
  }
}

/**
 * base64 Data URL(또는 이미지 URL)을 받아서 OCR 수행 후 프로필 정보 필드를 파싱해 반환
 * 백엔드 API를 우선 시도하고, 실패 시 클라이언트 측 Tesseract.js로 폴백
 */
export async function runOCR(image: string): Promise<OCRParsedResult> {
  console.log("🚀 [OCR 처리 시작]");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    // 1. 백엔드 API 시도 (Google Cloud Vision 등 사용 가능)
    console.log("1️⃣ 백엔드 API 시도 중...");
    const backendResult = await processWithBackendAPI(image);
    if (backendResult) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ [최종 OCR 결과 - 백엔드 API 사용]");
      console.log("📊 최종 결과:", backendResult);
      return backendResult;
    }

    // 2. 폴백: 클라이언트 측 Tesseract.js 사용
    console.log("2️⃣ 백엔드 실패, Tesseract.js로 폴백...");
    const tesseractResult = await processWithTesseract(image);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ [최종 OCR 결과 - Tesseract.js 사용]");
    console.log("📊 최종 결과:", tesseractResult);
    return tesseractResult;
  } catch (error) {
    console.error("❌ [OCR 처리 실패]");
    console.error("에러 상세:", error);
    // 최종 폴백: Tesseract 재시도
    try {
      console.log("🔄 최종 폴백 시도 중...");
      const fallbackResult = await processWithTesseract(image);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ [최종 OCR 결과 - 폴백 성공]");
      console.log("📊 최종 결과:", fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error("❌ [최종 폴백도 실패]");
      console.error("에러 상세:", fallbackError);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      throw new Error("OCR 처리에 실패했습니다. 다시 시도해 주세요.");
    }
  }
}