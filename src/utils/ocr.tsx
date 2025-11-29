import { BusinessCard } from "../store/cardStore";

export type OCRPayload = Partial<BusinessCard>;

const MOCK_RESPONSES: OCRPayload[] = [
  {
    name: "박소윤",
    position: "Brand Strategist",
    company: "Luna Collective",
    phone: "010-1234-5678",
    email: "soyoon@luna.co",
  },
  {
    name: "이도현",
    position: "AI Researcher",
    company: "Nova Labs",
    phone: "010-8765-4321",
    email: "dohyun@nova.ai",
  },
];

export const runOCR = async (image: string): Promise<OCRPayload> => {
  console.info("Simulating OCR with image payload length:", image.length);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const fallback: OCRPayload = {
    name: "이름을 인식하지 못했어요",
    memo: "OCR 결과를 수정해 주세요",
  };
  const random =
    MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  return random ?? fallback;
};

