import axios from 'axios';

// API 기본 URL 설정
// 개발 환경에서는 프록시를 사용하므로 상대 경로 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 토큰 제거 및 로그인 페이지로 이동
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  register: (username, email, password, name, phone, position, company) => {
    console.log('Register API call:', { username, email, name, phone: phone || 'not provided', position, company });
    return api.post('/auth/register', { username, email, password, name, phone, position, company });
  },
  
  getMe: () =>
    api.get('/auth/me'),
  
  googleLogin: (idToken) =>
    api.post('/auth/google', { idToken }),
  
  appleLogin: (idToken) =>
    api.post('/auth/apple', { idToken }),
};

// Business Card API
export const cardAPI = {
  getAll: (params = {}) =>
    api.get('/cards', { params }),
  
  getById: (id) =>
    api.get(`/cards/${id}`),
  
  create: (cardData) =>
    api.post('/cards', cardData),
  
  update: (id, cardData) =>
    api.put(`/cards/${id}`, cardData),
  
  delete: (id) =>
    api.delete(`/cards/${id}`),
};

// OCR API
export const ocrAPI = {
  process: (image) =>
    api.post('/ocr/process', { image }),
};

// Calendar/Event API
export const calendarAPI = {
  getEvents: (start, end) =>
    api.get('/calendar/events', { params: { start, end } }),
  
  createEvent: (eventData) =>
    api.post('/calendar/events', eventData),
  
  updateEvent: (id, eventData) =>
    api.put(`/calendar/events/${id}`, eventData),
  
  deleteEvent: (id) =>
    api.delete(`/calendar/events/${id}`),
};

// Gift API
export const giftAPI = {
  getAll: (params = {}) =>
    api.get('/gifts', { params }),
  
  getById: (id) =>
    api.get(`/gifts/${id}`),
  
  create: (giftData) =>
    api.post('/gifts', giftData),
  
  update: (id, giftData) =>
    api.put(`/gifts/${id}`, giftData),
  
  delete: (id) =>
    api.delete(`/gifts/${id}`),
  
  recommend: (cardId, additionalInfo) =>
    api.post('/gifts/recommend', { cardId, additionalInfo }),
};

// Chat API
export const chatAPI = {
  getAll: () =>
    api.get('/chat'),
  
  getById: (id) =>
    api.get(`/chat/${id}`),
  
  sendMessage: (message, llmProvider = 'gpt', chatId = null) =>
    api.post('/chat', { message, llmProvider, chatId }),
  
  delete: (id) =>
    api.delete(`/chat/${id}`),
};

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (profileData) =>
    api.put('/users/profile', profileData),
};

export default api;

