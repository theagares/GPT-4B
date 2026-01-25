import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'

const GraphAnalysisContext = createContext(null)

const CACHE_KEY = 'relation_graph_cache'
const ANALYSIS_STATUS_KEY = 'graph_analysis_status'

// API URL 설정 (api.js와 동일한 로직)
function getApiBaseUrl() {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;

    if (envApiUrl) {
        let apiUrl = envApiUrl;
        const protocol = window.location.protocol;
        if (envApiUrl.includes("localhost") && !isLocalhost) {
            apiUrl = envApiUrl.replace(/https?:\/\//, `${protocol}//`).replace(/localhost/g, hostname);
        }
        return apiUrl.replace(/\/api\/?$/, '');
    }

    if (!isLocalhost) {
        const protocol = window.location.protocol;
        return `${protocol}//${hostname}:3000`;
    }

    return 'http://localhost:3000';
}

const API_BASE = getApiBaseUrl()

export function GraphAnalysisProvider({ children }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisComplete, setAnalysisComplete] = useState(false)
    const [showCompletePopup, setShowCompletePopup] = useState(false)
    const [error, setError] = useState(null)
    const [cachedData, setCachedData] = useState(null)
    const [totalCardCount, setTotalCardCount] = useState(0)

    // 명함 개수 조회
    const fetchCardCount = useCallback(async () => {
        // 인증 체크 추가
        if (!isAuthenticated()) {
            setTotalCardCount(0)
            return
        }
        
        try {
            const response = await cardAPI.getAll({ limit: 1 })
            if (response.data?.pagination?.total) {
                setTotalCardCount(response.data.pagination.total)
            }
        } catch (err) {
            console.error('명함 개수 조회 오류:', err)
            // 401 에러인 경우 재시도하지 않도록 처리
            if (err.response?.status === 401) {
                setTotalCardCount(0)
            }
        }
    }, [])

    // 페이지 로드 시 캐시 및 진행 중인 분석 상태 확인
    useEffect(() => {
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
            try {
                const parsed = JSON.parse(cached)
                setCachedData(parsed)
            } catch (e) {
                console.error('캐시 파싱 오류:', e)
            }
        }

        // 분석 진행 상태 확인
        const status = sessionStorage.getItem(ANALYSIS_STATUS_KEY)
        if (status === 'analyzing') {
            setIsAnalyzing(true)
        }

        // 명함 개수 조회 (인증된 경우에만)
        if (isAuthenticated()) {
            fetchCardCount()
        }
    }, []) // fetchCardCount를 의존성에서 제거하여 무한 루프 방지

    // 분석 시작
    const startAnalysis = useCallback(async (analyzeCount = 20, displayCount = 10) => {
        if (isAnalyzing) return

        setIsAnalyzing(true)
        setError(null)
        setAnalysisComplete(false)
        sessionStorage.setItem(ANALYSIS_STATUS_KEY, 'analyzing')

        try {
            const response = await fetch(`${API_BASE}/api/graph/llm-auto?limit=${analyzeCount}&maxIterations=2`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error)
            }

            const data = result.data

            // 캐시에 저장
            const cacheData = {
                data,
                analyzeCount,
                displayCount,
                timestamp: Date.now()
            }
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
            setCachedData(cacheData)

            setAnalysisComplete(true)
            setShowCompletePopup(true)
            sessionStorage.removeItem(ANALYSIS_STATUS_KEY)

        } catch (err) {
            console.error('분석 오류:', err)
            setError(err.message)
            sessionStorage.removeItem(ANALYSIS_STATUS_KEY)
        } finally {
            setIsAnalyzing(false)
        }
    }, [isAnalyzing])

    // 팝업 닫기
    const closeCompletePopup = useCallback(() => {
        setShowCompletePopup(false)
    }, [])

    // 캐시 삭제
    const clearCache = useCallback(() => {
        sessionStorage.removeItem(CACHE_KEY)
        setCachedData(null)
        setAnalysisComplete(false)
    }, [])

    // 캐시 존재 여부
    const hasCache = !!cachedData

    return (
        <GraphAnalysisContext.Provider value={{
            isAnalyzing,
            analysisComplete,
            showCompletePopup,
            error,
            cachedData,
            hasCache,
            totalCardCount,
            startAnalysis,
            closeCompletePopup,
            clearCache,
            fetchCardCount,
        }}>
            {children}
        </GraphAnalysisContext.Provider>
    )
}

export function useGraphAnalysis() {
    const context = useContext(GraphAnalysisContext)
    if (!context) {
        throw new Error('useGraphAnalysis must be used within GraphAnalysisProvider')
    }
    return context
}

export default GraphAnalysisContext

