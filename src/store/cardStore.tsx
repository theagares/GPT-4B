import { create } from "zustand";
// @ts-ignore - JavaScript module without type definitions
import { cardAPI } from "../utils/api";
// @ts-ignore - JavaScript module without type definitions
import { isAuthenticated } from "../utils/auth";
import { generateUUID } from "../utils/uuid";

export type BusinessCard = {
  id: string | number;
  name: string;
  position?: string;
  company?: string;
  phone?: string;
  email?: string;
  gender?: string;
  memo?: string;
  image?: string;
  design?: string;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CardState = {
  cards: BusinessCard[];
  pendingCard: BusinessCard | null;
  isLoading: boolean;
  addCard: (card: BusinessCard) => Promise<BusinessCard>;
  setPendingCard: (card: BusinessCard | null) => void;
  getCardById: (id: string | number) => BusinessCard | undefined;
  updateCard: (id: string | number, updates: Partial<BusinessCard>) => Promise<void>;
  deleteCard: (id: string | number) => Promise<void>;
  fetchCards: (search?: string) => Promise<void>;
};

const demoCards: BusinessCard[] = [
  {
    id: "card-park-sangmu", // 박상무 명함 고정 ID
    name: "박상무",
    position: "상무",
    company: "테스트 회사",
    phone: "010-1234-5678",
    email: "park@test.com",
  },
  {
    id: generateUUID(),
    name: "최하늘",
    position: "Product Designer",
    company: "Orbit Studio",
    phone: "010-2345-6789",
    email: "ha-neul@orbit.studio",
  },
  {
    id: generateUUID(),
    name: "강지민",
    position: "Partnership Lead",
    company: "Blueberry Labs",
    phone: "010-9876-5432",
    email: "jimin@blueberrylabs.io",
  },
];

export const useCardStore = create<CardState>((set, get) => ({
  cards: [], // 초기 상태를 빈 배열로 설정하여 더미 데이터가 보이지 않도록 함
  pendingCard: null,
  isLoading: true, // 초기 로딩 상태를 true로 설정
  
  fetchCards: async (search = '') => {
    if (!isAuthenticated()) {
      set({ cards: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await cardAPI.getAll({ search, limit: 200 });
      if (response.data.success) {
        // DB에서 받은 데이터를 BusinessCard 타입으로 변환
        const cards = (response.data.data || []).map((card: any) => ({
          id: card.id,
          name: card.name,
          position: card.position,
          company: card.company,
          phone: card.phone,
          email: card.email,
          gender: card.gender,
          memo: card.memo,
          image: card.image,
          design: card.design || 'design-1',
          isFavorite: card.isFavorite || false,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        }));
        set({ cards, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  addCard: async (card) => {
    if (isAuthenticated()) {
      try {
        // DB에 저장 (빈 문자열을 undefined로 변환하여 백엔드에서 null로 처리되도록 함)
        const cleanCardData = {
          name: card.name,
          position: card.position && card.position.trim() !== '' ? card.position : undefined,
          company: card.company && card.company.trim() !== '' ? card.company : undefined,
          phone: card.phone && card.phone.trim() !== '' ? card.phone : undefined,
          email: card.email && card.email.trim() !== '' ? card.email : undefined,
          gender: card.gender && card.gender.trim() !== '' ? card.gender : undefined,
          memo: card.memo && card.memo.trim() !== '' ? card.memo : undefined,
          image: card.image && card.image.trim() !== '' ? card.image : undefined,
          design: card.design || 'design-1',
          isFavorite: card.isFavorite || false,
        };

        console.log('[CardStore] Creating card with data:', {
          ...cleanCardData,
          image: cleanCardData.image ? `[Base64 image, length: ${cleanCardData.image.length}]` : undefined
        });

        const response = await cardAPI.create(cleanCardData);
        
        if (response.data.success) {
          const newCard = response.data.data;
          // DB에서 받은 데이터를 BusinessCard 타입으로 변환
          const formattedCard = {
            id: newCard.id,
            name: newCard.name,
            position: newCard.position,
            company: newCard.company,
            phone: newCard.phone,
            email: newCard.email,
            gender: newCard.gender,
            memo: newCard.memo,
            image: newCard.image,
            design: newCard.design || 'design-1',
            isFavorite: newCard.isFavorite || false,
            createdAt: newCard.createdAt,
            updatedAt: newCard.updatedAt,
          };
          set((state) => ({
            cards: [formattedCard, ...state.cards],
          }));
          // 새로 생성된 카드 반환
          return formattedCard;
        }
        throw new Error('Failed to create card: API response was not successful');
      } catch (error) {
        console.error('Failed to create card:', error);
        throw error;
      }
    } else {
      // 로컬 스토리지 사용 (비인증 상태)
      const newCard = { ...card, id: card.id || generateUUID() };
      set((state) => ({
        cards: [newCard, ...state.cards],
      }));
      return newCard;
    }
  },
  
  setPendingCard: (card) => set({ pendingCard: card }),
  
  getCardById: (id) => get().cards.find((card) => card.id === id || String(card.id) === String(id)),
  
  updateCard: async (id, updates) => {
    if (isAuthenticated()) {
      try {
        // 빈 문자열을 null로 변환하는 헬퍼 함수
        const cleanField = (value: any): string | null => {
          if (value === undefined || value === null) return null;
          const trimmed = String(value).trim();
          return trimmed !== '' ? trimmed : null;
        };
        
        // 빈 문자열을 null로 변환하여 DB에 null로 저장되도록 함
        // updates 객체에 포함된 모든 필드를 처리하여 빈 값도 null로 저장되도록 함
        const cleanUpdates: any = {};
        
        // name은 필수이므로 항상 포함
        if (updates.name !== undefined) {
          cleanUpdates.name = updates.name;
        }
        
        // 선택적 필드들은 updates 객체에 포함되어 있으면 처리 (빈 문자열 포함)
        // 빈 문자열이면 null로 변환하여 명시적으로 저장
        // design과 isFavorite는 updates에 포함된 경우에만 처리 (다른 필드와 분리)
        if ('position' in updates || updates.position !== undefined) {
          cleanUpdates.position = cleanField(updates.position);
        }
        if ('company' in updates || updates.company !== undefined) {
          cleanUpdates.company = cleanField(updates.company);
        }
        if ('phone' in updates || updates.phone !== undefined) {
          cleanUpdates.phone = cleanField(updates.phone);
        }
        if ('email' in updates || updates.email !== undefined) {
          cleanUpdates.email = cleanField(updates.email);
        }
        if ('gender' in updates || updates.gender !== undefined) {
          cleanUpdates.gender = cleanField(updates.gender);
        }
        if ('memo' in updates || updates.memo !== undefined) {
          cleanUpdates.memo = cleanField(updates.memo);
        }
        if ('image' in updates || updates.image !== undefined) {
          cleanUpdates.image = cleanField(updates.image);
        }
        // design은 항상 값이 있어야 하므로 null이 될 수 없음
        if ('design' in updates || updates.design !== undefined) {
          cleanUpdates.design = updates.design || 'design-1';
        }
        if ('isFavorite' in updates || updates.isFavorite !== undefined) {
          cleanUpdates.isFavorite = updates.isFavorite || false;
        }
        
        const response = await cardAPI.update(id, cleanUpdates);
        if (response.data.success) {
          const updatedCard = response.data.data;
          const formattedCard = {
            id: updatedCard.id,
            name: updatedCard.name,
            position: updatedCard.position,
            company: updatedCard.company,
            phone: updatedCard.phone,
            email: updatedCard.email,
            gender: updatedCard.gender,
            memo: updatedCard.memo,
            image: updatedCard.image,
            design: updatedCard.design || 'design-1',
            isFavorite: updatedCard.isFavorite || false,
            createdAt: updatedCard.createdAt,
            updatedAt: updatedCard.updatedAt,
          };
          set((state) => ({
            cards: state.cards.map((card) =>
              (card.id === id || String(card.id) === String(id)) ? formattedCard : card
            ),
          }));
          // 명함 수정 후 목록을 새로고침하여 변경사항 반영
          get().fetchCards();
        }
      } catch (error) {
        console.error('Failed to update card:', error);
        throw error;
      }
    } else {
      // 로컬 스토리지 사용
      set((state) => ({
        cards: state.cards.map((card) =>
          (card.id === id || String(card.id) === String(id)) ? { ...card, ...updates } : card
        ),
      }));
    }
  },
  
  deleteCard: async (id) => {
    if (isAuthenticated()) {
      try {
        await cardAPI.delete(id);
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id && String(card.id) !== String(id)),
        }));
      } catch (error) {
        console.error('Failed to delete card:', error);
        throw error;
      }
    } else {
      // 로컬 스토리지 사용
      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id && String(card.id) !== String(id)),
      }));
    }
  },
}));

