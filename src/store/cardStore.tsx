import { create } from "zustand";

export type BusinessCard = {
  id: string;
  name: string;
  position?: string;
  company?: string;
  phone?: string;
  email?: string;
  memo?: string;
  image?: string;
  design?: string;
};

type CardState = {
  cards: BusinessCard[];
  pendingCard: BusinessCard | null;
  addCard: (card: BusinessCard) => void;
  setPendingCard: (card: BusinessCard | null) => void;
  getCardById: (id: string) => BusinessCard | undefined;
  updateCard: (id: string, updates: Partial<BusinessCard>) => void;
};

const demoCards: BusinessCard[] = [
  {
    id: crypto.randomUUID(),
    name: "최하늘",
    position: "Product Designer",
    company: "Orbit Studio",
    phone: "010-2345-6789",
    email: "ha-neul@orbit.studio",
  },
  {
    id: crypto.randomUUID(),
    name: "강지민",
    position: "Partnership Lead",
    company: "Blueberry Labs",
    phone: "010-9876-5432",
    email: "jimin@blueberrylabs.io",
  },
];

export const useCardStore = create<CardState>((set, get) => ({
  cards: demoCards,
  pendingCard: null,
  addCard: (card) =>
    set((state) => ({
      cards: [card, ...state.cards],
    })),
  setPendingCard: (card) => set({ pendingCard: card }),
  getCardById: (id) => get().cards.find((card) => card.id === id),
  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
    })),
}));

