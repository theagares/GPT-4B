import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCardStore } from "../store/cardStore";
import { preferenceAPI } from "../utils/api";
import { isAuthenticated } from "../utils/auth";

const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const card = useCardStore((state) =>
    id ? state.getCardById(id) : undefined,
  );
  const [preferences, setPreferences] = useState<{
    likes: Array<{ item: string; evidence: string[]; weight?: number }>;
    dislikes: Array<{ item: string; evidence: string[]; weight?: number }>;
    uncertain: Array<{ item: string; evidence: string[]; weight?: number }>;
  }>({ likes: [], dislikes: [], uncertain: [] });
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  // Load preferences
  useEffect(() => {
    if (!card || !isAuthenticated()) return;

    const loadPreferences = async () => {
      setIsLoadingPreferences(true);
      try {
        const cardId = typeof card.id === 'string' ? parseInt(card.id, 10) : card.id;
        if (isNaN(cardId)) return;

        const response = await preferenceAPI.getPreferences(cardId);
        if (response.data && response.data.success) {
          setPreferences(response.data.data || { likes: [], dislikes: [], uncertain: [] });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, [card]);

  // Rebuild preferences
  const handleRebuildPreferences = async () => {
    if (!card || !isAuthenticated() || isRebuilding) return;

    setIsRebuilding(true);
    try {
      const cardId = typeof card.id === 'string' ? parseInt(card.id, 10) : card.id;
      if (isNaN(cardId)) {
        alert('Invalid card ID');
        return;
      }

      const response = await preferenceAPI.rebuildPreferences(cardId, 50);
      if (response.data && response.data.success) {
        setPreferences(response.data.data || { likes: [], dislikes: [], uncertain: [] });
      }
    } catch (error) {
      console.error('Failed to rebuild preferences:', error);
      alert('프로필 갱신에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsRebuilding(false);
    }
  };

  // Toggle evidence expansion
  const toggleEvidence = (category: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${category}-${index}`;
    setExpandedEvidence((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Close all evidence when clicking overlay
  const closeAllEvidence = () => {
    setExpandedEvidence({});
  };

  // Check if any evidence is expanded
  const hasExpandedEvidence = Object.values(expandedEvidence).some(Boolean);

  // 브라우저 뒤로가기 처리
  useEffect(() => {
    const handlePopState = () => {
      if (location.state?.returnToSearchResult) {
        navigate('/search-result', { 
          state: { 
            query: location.state.searchQuery || '' 
          },
          replace: true
        })
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [location.state, navigate])

  // 뒤로가기 처리
  const handleBack = () => {
    if (location.state?.returnToSearchResult) {
      navigate('/search-result', { 
        state: { 
          query: location.state.searchQuery || '' 
        } 
      })
    } else {
      navigate(-1) // 일반적인 뒤로가기
    }
  }

  if (!card) {
    return (
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow-lg">
        <p className="text-sm text-slate-500">명함을 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* 뒤로가기 버튼 */}
      {location.state?.returnToSearchResult && (
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          검색 결과로 돌아가기
        </button>
      )}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-glass">
        <p className="text-sm text-white/70">{card.company}</p>
        <p className="mt-6 text-3xl font-semibold">{card.name}</p>
        <p className="text-sm text-white/70">{card.position}</p>
        <div className="mt-6 text-sm text-white/70">
          <p>{card.phone}</p>
          <p>{card.email}</p>
        </div>
      </div>
      <section className="space-y-3 rounded-3xl bg-white p-6 shadow-lg">
        <InfoRow label="회사" value={card.company} />
        <InfoRow label="직함" value={card.position} />
        <InfoRow label="전화" value={card.phone} />
        <InfoRow label="이메일" value={card.email} />
        <button
          type="button"
          onClick={() => navigate(`/memo?businessCardId=${card.id}`)}
          className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          메모 페이지로 이동
        </button>
      </section>

      {/* Preferences Section */}
      <section className="rounded-3xl bg-white p-6 shadow-lg relative">
        {/* Overlay when evidence is expanded */}
        {hasExpandedEvidence && (
          <div
            className="absolute inset-0 bg-black/20 rounded-3xl z-10"
            onClick={closeAllEvidence}
          />
        )}
        <div className="flex items-center justify-between mb-4 relative z-20">
          <h3 className="text-lg font-semibold text-slate-900">선호도 프로필</h3>
          <button
            type="button"
            onClick={handleRebuildPreferences}
            disabled={isRebuilding}
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isRebuilding ? '갱신 중...' : '프로필 갱신'}
          </button>
        </div>

        {isLoadingPreferences ? (
          <div className="text-center py-8 text-sm text-slate-500 relative z-20">선호도를 불러오는 중...</div>
        ) : (
          <div className="space-y-4 relative z-20">
            {/* Likes */}
            {preferences.likes && preferences.likes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <span>👍</span> 좋아함
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.likes.map((item: any, index: number) => (
                    <div key={`like-${index}`} className="relative">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <span>{item.item}</span>
                        {item.evidence && item.evidence.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleEvidence('like', index, e)}
                            className="ml-1 text-blue-500"
                            title="증거 보기"
                          >
                            ℹ️
                          </button>
                        )}
                      </div>
                      {expandedEvidence[`like-${index}`] && item.evidence && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[200px] max-w-[300px]" onClick={(e) => e.stopPropagation()}>
                          {item.evidence.map((ev: string, evIndex: number) => (
                            <div key={evIndex} className="text-xs text-slate-600 py-1">
                              &quot;{ev}&quot;
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dislikes */}
            {preferences.dislikes && preferences.dislikes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <span>👎</span> 싫어함
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.dislikes.map((item: any, index: number) => (
                    <div key={`dislike-${index}`} className="relative">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        <span>{item.item}</span>
                        {item.evidence && item.evidence.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleEvidence('dislike', index, e)}
                            className="ml-1 text-red-500"
                            title="증거 보기"
                          >
                            ℹ️
                          </button>
                        )}
                      </div>
                      {expandedEvidence[`dislike-${index}`] && item.evidence && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[200px] max-w-[300px]" onClick={(e) => e.stopPropagation()}>
                          {item.evidence.map((ev: string, evIndex: number) => (
                            <div key={evIndex} className="text-xs text-slate-600 py-1">
                              &quot;{ev}&quot;
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncertain */}
            {preferences.uncertain && preferences.uncertain.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <span>❓</span> 불확실
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.uncertain.map((item: any, index: number) => (
                    <div key={`uncertain-${index}`} className="relative">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        <span>{item.item}</span>
                        {item.evidence && item.evidence.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleEvidence('uncertain', index, e)}
                            className="ml-1 text-slate-500"
                            title="증거 보기"
                          >
                            ℹ️
                          </button>
                        )}
                      </div>
                      {expandedEvidence[`uncertain-${index}`] && item.evidence && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[200px] max-w-[300px]" onClick={(e) => e.stopPropagation()}>
                          {item.evidence.map((ev: string, evIndex: number) => (
                            <div key={evIndex} className="text-xs text-slate-600 py-1">
                              &quot;{ev}&quot;
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!preferences.likes || preferences.likes.length === 0) &&
             (!preferences.dislikes || preferences.dislikes.length === 0) &&
             (!preferences.uncertain || preferences.uncertain.length === 0) && (
              <div className="text-center py-8 text-sm text-slate-500">
                선호도 정보가 없습니다. 메모를 작성한 후 &quot;프로필 갱신&quot; 버튼을 눌러주세요.
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/add", { state: { draft: card } })}
          className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
        >
          편집하기
        </button>
        <button
          type="button"
          onClick={() => navigate("/ocr")}
          className="rounded-2xl bg-primary py-3 text-sm font-semibold text-white"
        >
          새 명함 추가
        </button>
      </div>
    </section>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
};

export default CardDetail;

