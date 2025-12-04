// utils/ocr.ts
import { createWorker, Worker } from "tesseract.js";

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
 * 명함 텍스트를 기반으로 필드를 추출하는 함수
 */
function parseBusinessCard(text: string): Omit<OCRParsedResult, "rawText"> {
  const rawLines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (rawLines.length === 0) {
    return {};
  }

  // 1) 이메일 / 전화번호 추출
  let email: string | undefined;
  let phone: string | undefined;

  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const phoneRegex =
    /(\+82[-\s]?)?0?1[0-9][-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}/;

  for (const line of rawLines) {
    if (!email) {
      const m = line.match(emailRegex);
      if (m) email = m[0];
    }
    if (!phone) {
      const m = line.match(phoneRegex);
      if (m) phone = m[0];
    }
  }

  // 이메일/전화 포함된 라인은 다른 필드 추출에서 제외
  const remainingLines = rawLines.filter(line => {
    if (email && line.includes(email)) return false;
    if (phone && line.includes(phone)) return false;
    return true;
  });

  // 2) 직책/이름 추출
  let name: string | undefined;
  let position: string | undefined;

  const titleKeywords = [
    "대표이사",
    "대표",
    "이사",
    "전무",
    "상무",
    "부장",
    "차장",
    "과장",
    "대리",
    "주임",
    "사원",
    "팀장",
    "실장",
    "센터장",
    "원장",
    "Manager",
    "Director",
    "Lead",
    "CEO",
    "CTO",
    "CFO",
    "COO",
    "CMO",
    "Head",
  ];

  for (const line of remainingLines) {
    const found = titleKeywords.find(k => line.includes(k));
    if (found) {
      position = line; // 일단 라인 전체를 직책 필드로 저장
      const nameCandidate = line.replace(found, "").trim();
      if (nameCandidate && !name) {
        name = nameCandidate;
      }
      break;
    }
  }

  // 직책 키워드를 못 찾았으면, 한글 2~4글자짜리 라인을 이름 후보로 사용
  if (!name) {
    const nameCandidate = remainingLines.find(line =>
      /^[가-힣]{2,4}$/.test(line.replace(/\s/g, "")),
    );
    if (nameCandidate) {
      name = nameCandidate.replace(/\s/g, "");
    }
  }

  // 3) 회사명 추출
  let company: string | undefined;
  const companyMarkers = [
    "주식회사",
    "(주)",
    "유한회사",
    "회사",
    "Co.",
    "Inc.",
    "Corporation",
    "Corp.",
    "Ltd",
  ];

  company =
    remainingLines.find(line =>
      companyMarkers.some(m => line.includes(m)),
    ) ?? remainingLines[0];

  // 4) memo용 기타 텍스트
  const memoLines = rawLines.filter(line => {
    if (name && line.includes(name)) return false;
    if (position && line === position) return false;
    if (company && line === company) return false;
    if (email && line.includes(email)) return false;
    if (phone && line.includes(phone)) return false;
    return true;
  });

  const memo =
    memoLines.length > 0 ? memoLines.join("\n") : undefined;

  return {
    name,
    position,
    company,
    phone,
    email,
    memo,
  };
}

/**
 * base64 Data URL(또는 이미지 URL)을 받아서
 * Tesseract.js로 OCR 수행 후 명함 정보 필드를 파싱해 반환
 */
export async function runOCR(image: string): Promise<OCRParsedResult> {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  const rawText = data.text ?? "";

  const parsed = parseBusinessCard(rawText);

  return {
    rawText,
    ...parsed,
  };
}
