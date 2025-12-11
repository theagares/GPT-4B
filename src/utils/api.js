import axios from "axios";

// API 기본 URL 설정
// 우선순위:
// 1. 환경 변수 VITE_API_BASE_URL (명시적 설정) - 단, localhost는 내부 IP로 변환
// 2. 내부 IP 접속 시: 현재 호스트의 3000 포트 사용
// 3. 기본값: /api (프록시 사용)
function getApiBaseUrl() {
  console.log("🔍 [API URL 설정 시작]");
  console.log("  - window.location.hostname:", window.location.hostname);
  console.log("  - window.location.href:", window.location.href);

  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  // 환경 변수 확인
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("  - VITE_API_BASE_URL:", envApiUrl || "(없음)");

  // 환경 변수가 있으면 localhost를 현재 hostname으로 치환
  if (envApiUrl) {
    let apiUrl = envApiUrl;
    const protocol = window.location.protocol;
    
    // 환경 변수에 localhost가 포함되어 있고, 실제 접속은 내부 IP인 경우
    if (envApiUrl.includes("localhost") && !isLocalhost) {
      // 프로토콜도 현재 프로토콜로 변경
      apiUrl = envApiUrl.replace(/https?:\/\//, `${protocol}//`).replace(/localhost/g, hostname);
      console.log("⚠️ 환경 변수의 localhost를 현재 hostname으로 치환");
      console.log("  원본:", envApiUrl);
      console.log("  치환:", apiUrl);
    } else if (!isLocalhost) {
      // 환경 변수에 localhost가 없어도, 실제 접속이 내부 IP면 hostname으로 치환
      // 예: http://127.0.0.1:3000 → http://172.16.131.101:3000
      if (envApiUrl.includes("127.0.0.1")) {
        apiUrl = envApiUrl.replace(/https?:\/\//, `${protocol}//`).replace(/127\.0\.0\.1/g, hostname);
        console.log("⚠️ 환경 변수의 127.0.0.1을 현재 hostname으로 치환");
        console.log("  원본:", envApiUrl);
        console.log("  치환:", apiUrl);
      } else {
        // 프로토콜만 현재 프로토콜로 변경
        if (!envApiUrl.startsWith(protocol)) {
          apiUrl = envApiUrl.replace(/^https?:\/\//, `${protocol}//`);
        }
        console.log("✅ 환경 변수 사용:", apiUrl);
      }
    } else {
      console.log("✅ 환경 변수 사용:", envApiUrl);
    }
    
    // 환경 변수 URL이 /api로 끝나지 않으면 추가
    if (!apiUrl.endsWith('/api') && !apiUrl.endsWith('/api/')) {
      // 포트 번호 뒤에 /api가 없으면 추가
      if (!apiUrl.match(/:\d+\/api/)) {
        apiUrl = apiUrl.replace(/\/$/, '') + '/api';
        console.log("⚠️ 환경 변수 URL에 /api 경로 추가:", apiUrl);
      }
    }
    
    return apiUrl;
  }

  // 내부 IP 범위 체크
  // - 192.168.0.0 ~ 192.168.255.255
  // - 10.0.0.0 ~ 10.255.255.255
  // - 172.16.0.0 ~ 172.31.255.255
  const is192 = /^192\.168\./.test(hostname);
  const is10 = /^10\./.test(hostname);
  const is172 = /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
  const isInternalIP = is192 || is10 || is172;

  // IP 주소 형식인지 확인 (숫자.숫자.숫자.숫자)
  const isIPFormat = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  console.log("📊 [판단 정보]");
  console.log("  - isLocalhost:", isLocalhost);
  console.log("  - is192:", is192);
  console.log("  - is10:", is10);
  console.log("  - is172:", is172);
  console.log("  - isInternalIP:", isInternalIP);
  console.log("  - isIPFormat:", isIPFormat);

  // localhost가 아니고, 내부 IP이거나 IP 형식이면 3000 포트 사용
  if (!isLocalhost && (isInternalIP || isIPFormat)) {
    // 내부 IP로 접속한 경우: 같은 호스트의 3000 포트 + /api 경로 사용
    const protocol = window.location.protocol;
    const apiUrl = `${protocol}//${hostname}:3000/api`;
    console.log("✅ 내부 IP/IP 형식 감지 → API URL:", apiUrl);
    return apiUrl;
  }

  // 기본값: 프록시 사용 (Vite 개발 서버의 프록시 설정)
  // 단, localhost가 아닌 경우 프록시가 작동하지 않으므로 직접 URL 사용
  if (!isLocalhost) {
    // 네트워크 접속 시: 현재 프로토콜과 호스트를 사용하되 백엔드 포트(3000) + /api 경로 사용
    const protocol = window.location.protocol;
    const apiUrl = `${protocol}//${hostname}:3000/api`;
    console.log("⚠️ localhost가 아니므로 직접 URL 사용:", apiUrl);
    return apiUrl;
  }

  console.log("⚠️ 기본값 사용 (프록시): /api");
  return "/api";
}

const API_BASE_URL = getApiBaseUrl();

// 최종 설정 로그
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 [최종 API 설정]");
console.log("  Base URL:", API_BASE_URL);
console.log("  Hostname:", window.location.hostname);
console.log("  Full URL:", window.location.href);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // API 요청 로그
    console.log("📤 [API 요청]", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ [API 요청 에러]", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => {
    console.log("✅ [API 응답 성공]", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error("❌ [API 응답 에러]", {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config
        ? `${error.config.baseURL}${error.config.url}`
        : "N/A",
    });
    // JSON 파싱 오류 처리
    if (error.message && error.message.includes("JSON")) {
      console.error("JSON parsing error:", error);
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            success: false,
            message: "서버 응답을 처리하는 중 오류가 발생했습니다.",
          },
        },
      });
    }

    if (error.response?.status === 401) {
      // 인증 실패 시 토큰 제거 및 로그인 페이지로 이동
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),

  register: (username, email, password, name, phone, position, company) => {
    console.group("🔵 REGISTER API REQUEST");
    console.log("1. Payload Details:", {
      username,
      email,
      password: password ? "[HIDDEN]" : "missing",
      name,
      phone,
      company,
      position,
    });
    console.groupEnd();
    return api.post("/auth/register", {
      username,
      email,
      password,
      name,
      phone,
      position,
      company,
    });
  },

  getMe: () => api.get("/auth/me"),

  googleLogin: (idToken) => api.post("/auth/google", { idToken }),

  appleLogin: (idToken) => api.post("/auth/apple", { idToken }),
};

// Business Card API
export const cardAPI = {
  getAll: (params = {}) => api.get("/cards", { params }),

  getById: (id) => api.get(`/cards/${id}`),

  create: (cardData) => api.post("/cards", cardData),

  update: (id, cardData) => api.put(`/cards/${id}`, cardData),

  delete: (id) => api.delete(`/cards/${id}`),
};

// OCR API
export const ocrAPI = {
  process: (image) => api.post("/ocr/process", { image }),
};

// Calendar/Event API
export const calendarAPI = {
  getEvents: (start, end) =>
    api.get("/calendar/events", { params: { start, end } }),

  createEvent: (eventData) => api.post("/calendar/events", eventData),

  updateEvent: (id, eventData) => api.put(`/calendar/events/${id}`, eventData),

  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
};

// Gift API
export const giftAPI = {
  // 기존 CRUD API
  getAll: (params = {}) => api.get("/gifts", { params }),

  getById: (id) => api.get(`/gifts/${id}`),

  create: (giftData) => api.post("/gifts", giftData),

  update: (id, giftData) => api.put(`/gifts/${id}`, giftData),

  delete: (id) => api.delete(`/gifts/${id}`),

  // ⭐ 통합 검색 API (ChromaDB + 네이버 쇼핑)
  // { query, rank, gender, memo, addMemo, minPrice, maxPrice }
  // minPrice, maxPrice는 만원 단위
  search: (searchData) => api.post("/gifts/search", searchData),

  // ⭐ 명함 기반 추천 API
  // { cardId, additionalInfo, gender, memos, minPrice, maxPrice, includeNaver }
  // minPrice, maxPrice는 만원 단위
  recommend: (recommendData) => api.post("/gifts/recommend", recommendData),

  // ⭐ 네이버 쇼핑 단독 검색 API (POST)
  // { query, display, sort, minPrice, maxPrice }
  // minPrice, maxPrice는 원 단위
  naverSearch: (searchData) => api.post("/gifts/naver", searchData),

  // ⭐ 네이버 쇼핑 단독 검색 API (GET)
  // ?q=검색어&display=3&sort=sim&minPrice=30000&maxPrice=100000
  naverSearchGet: (params) => api.get("/gifts/naver", { params }),
};

// Chat API
export const chatAPI = {
  getAll: () => api.get("/chat"),

  getById: (id) => api.get(`/chat/${id}`),

  sendMessage: (message, llmProvider = "gpt", chatId = null) =>
    api.post("/chat", { message, llmProvider, chatId }),

  createHistory: (messages, title, llmProvider = "gpt") =>
    api.post("/chat/create-history", { messages, title, llmProvider }),

  delete: (id) => api.delete(`/chat/${id}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (profileData) => api.put("/users/profile", profileData),
};

export default api;
