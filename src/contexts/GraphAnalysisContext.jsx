import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { cardAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'

const GraphAnalysisContext = createContext(null)

const CACHE_KEY = 'relation_graph_cache'
const ANALYSIS_STATUS_KEY = 'graph_analysis_status'

// SSE 연결을 위한 API URL (환경변수에서 /api 제거)
function getSSEApiUrl() {
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl) {
        // cloudfront URL에서 /api 제거
        return envApiUrl.replace(/\/api\/?$/, '');
    }
    return 'http://localhost:3000';
}

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
    
    // SSE 진행률 상태
    const [progress, setProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')
    const [currentStep, setCurrentStep] = useState(0)
    const [totalSteps, setTotalSteps] = useState(5)
    const [analyzedCount, setAnalyzedCount] = useState(0)
    const [totalAnalyzeCount, setTotalAnalyzeCount] = useState(0)
    
    const eventSourceRef = useRef(null)

    // 명함 개수 조회
    const fetchCardCount = useCallback(async () => {
        // 인증 체크 추가
        if (!isAuthenticated()) {
            setTotalCardCount(0)
            return
        }
        
        try {
            const response = await cardAPI.getAll({ limit: 1 })
            const total = response.data?.pagination?.total
            if (typeof total === 'number') {
                setTotalCardCount(total)
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

    // SSE 방식 분석 시작
    const startAnalysis = useCallback(async (analyzeCount = 20, displayCount = 10) => {
        if (isAnalyzing) return

        setIsAnalyzing(true)
        setError(null)
        setAnalysisComplete(false)
        setProgress(0)
        setProgressMessage('분석 준비 중...')
        setCurrentStep(0)
        setAnalyzedCount(0)
        setTotalAnalyzeCount(analyzeCount)
        sessionStorage.setItem(ANALYSIS_STATUS_KEY, 'analyzing')

        // 기존 EventSource 연결 정리
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        const SSE_API = getSSEApiUrl()
        const url = `${SSE_API}/api/graph/llm-auto-stream?limit=${analyzeCount}&maxIterations=2`
        
        console.log('🔗 SSE 연결 시작:', url)
        
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.addEventListener('start', (e) => {
            const data = JSON.parse(e.data)
            console.log('🚀 분석 시작:', data)
            setProgressMessage(data.message)
            setProgress(data.progress || 0)
        })

        eventSource.addEventListener('progress', (e) => {
            const data = JSON.parse(e.data)
            console.log('📊 진행률:', data)
            setProgressMessage(data.message)
            setProgress(data.progress || 0)
            setCurrentStep(data.currentStep || 0)
            setTotalSteps(data.totalSteps || 5)
            
            if (data.analyzedCount !== undefined) {
                setAnalyzedCount(data.analyzedCount)
            }
            if (data.totalCount !== undefined) {
                setTotalAnalyzeCount(data.totalCount)
            }
        })

        eventSource.addEventListener('complete', (e) => {
            const data = JSON.parse(e.data)
            console.log('✅ 분석 완료:', data)
            
            eventSource.close()
            eventSourceRef.current = null

            if (data.success && data.data) {
                // 캐시에 저장
                const cacheData = {
                    data: data.data,
                    analyzeCount,
                    displayCount,
                    timestamp: Date.now()
                }
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
                setCachedData(cacheData)

                setProgress(100)
                setProgressMessage('분석 완료!')
                setAnalysisComplete(true)
                setShowCompletePopup(true)
            } else {
                setError(data.message || '분석 실패')
            }
            
            sessionStorage.removeItem(ANALYSIS_STATUS_KEY)
            setIsAnalyzing(false)
        })

        eventSource.addEventListener('error', (e) => {
            if (e.data) {
                const data = JSON.parse(e.data)
                console.error('❌ SSE 에러:', data)
                setError(data.message)
            } else {
                console.error('❌ SSE 연결 에러:', e)
                setError('서버 연결이 끊어졌습니다. 다시 시도해주세요.')
            }
            
            eventSource.close()
            eventSourceRef.current = null
            sessionStorage.removeItem(ANALYSIS_STATUS_KEY)
            setIsAnalyzing(false)
        })

        eventSource.onerror = (e) => {
            console.error('❌ EventSource 에러:', e)
            // 연결이 끊어진 경우에만 에러 처리 (이미 complete된 경우 무시)
            if (eventSource.readyState === EventSource.CLOSED && isAnalyzing) {
                setError('서버 연결이 끊어졌습니다.')
                setIsAnalyzing(false)
                sessionStorage.removeItem(ANALYSIS_STATUS_KEY)
            }
        }
    }, [isAnalyzing])
    
    // 분석 취소
    const cancelAnalysis = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }
        setIsAnalyzing(false)
        setProgress(0)
        setProgressMessage('')
        sessionStorage.removeItem(ANALYSIS_STATUS_KEY)
    }, [])

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
            // SSE 진행률 상태
            progress,
            progressMessage,
            currentStep,
            totalSteps,
            analyzedCount,
            totalAnalyzeCount,
            // 액션
            startAnalysis,
            cancelAnalysis,
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

