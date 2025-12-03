# 피그마 링크 기반 이미지 변수 정리 보고서

## 삭제 완료된 사용하지 않는 변수들

### 1. LandingPage.jsx
- ❌ 삭제: `imgIcon`
- ❌ 삭제: `imgIcon1`

### 2. CalendarPage.jsx
- ❌ 삭제: `imgButton`
- ❌ 삭제: `imgBackIcon`
- ✅ 유지: `imgIcon` (사용 중)

### 3. CardGiftHistoryPage.jsx
- ❌ 삭제: `imgIcon1`
- ❌ 삭제: `imgIcon3`
- ❌ 삭제: `imgIcon5`
- ❌ 삭제: `imgIcon6`
- ❌ 삭제: `imgIcon7`
- ❌ 삭제: `imgIcon8`
- ❌ 삭제: `imgIcon9`
- ✅ 유지: `imgIcon`, `imgIcon2`, `imgIcon4`, `imgVector4` (사용 중)

### 4. MyDetailPage.jsx
- ❌ 삭제: `imgVector1`
- ❌ 삭제: `imgVector2`
- ❌ 삭제: `imgVector3`
- ❌ 삭제: `imgVector5`
- ❌ 삭제: `imgIcon2`
- ✅ 유지: 나머지 변수들 (사용 중)

### 5. OCR.tsx
- ❌ 삭제: `imgCameraIcon`
- ✅ 유지: `imgClose` (사용 중)

### 6. GiftHistoryPage.jsx
- ❌ 삭제: `imgVector4`
- ✅ 유지: `giftHistoryImage1-5` (사용 중)

---

## 남아있는 피그마 링크 기반 이미지 위치

### 1. src/pages/LandingPage.jsx
- `imgImageWithFallback` - 인기 선물 이미지
- `imgImageWithFallback1` - 인기 선물 이미지
- `imgImageWithFallback2` - 인기 선물 이미지
- `imgImageWithFallback3` - 인기 선물 이미지

### 2. src/pages/CalendarPage.jsx
- `imgIcon` - 드롭다운 아이콘

### 3. src/components/BottomNavigation.jsx
- `imgImage10` - MY 아이콘
- `imgGpt4B4` - AI 로고

### 4. src/pages/CardGiftHistoryPage.jsx
- `imgImageWithFallback` ~ `imgImageWithFallback4` - 선물 이미지들
- `imgIcon`, `imgIcon2`, `imgIcon4` - 아이콘들
- `imgVector4` - 뒤로가기 아이콘

### 5. src/pages/MyDetailPage.jsx
- `imgImageWithFallback` - 프로필 이미지
- `imgVector` - 프로필 오버레이
- `imgVector4` - 아이콘
- `imgIcon`, `imgIcon1`, `imgIcon3`, `imgIcon4`, `imgIcon5` - 각종 아이콘들

### 6. src/pages/MyPage.jsx
- `imgGpt4B2` - GPT-4b 로고
- `imgVector` - 화살표 아이콘
- `imgVector4` - 뒤로가기 아이콘

### 7. src/pages/OCR.tsx
- `imgClose` - 닫기 버튼 아이콘

### 8. src/pages/AddEventPage.jsx
- `imgVector` - 화살표 아이콘
- `imgVector1` - 화살표 아이콘
- `imgIcon` - 드롭다운 아이콘
- `imgButton` - 참여자 추가 버튼
- `imgBackIcon` - 뒤로가기 아이콘

### 9. src/pages/BusinessCardGiftHistoryPage.jsx
- `businessCardGiftImage1` ~ `businessCardGiftImage5` - 선물 이미지들

### 10. src/pages/PersonalGiftHistoryPage.jsx
- `personalGiftImage1` ~ `personalGiftImage5` - 선물 이미지들

### 11. src/pages/GiftHistoryPage.jsx
- `giftHistoryImage1` ~ `giftHistoryImage5` - 선물 이미지들

### 12. src/pages/GiftRecommendResultPage.jsx
- 하드코딩된 피그마 링크들이 여러 개 (변수로 정의되지 않음)

### 13. src/pages/PopularGiftsPage.jsx
- `imgVector` - 아이콘
- `imgIcon`, `imgIcon1` - 아이콘들
- `imgImageWithFallback` ~ `imgImageWithFallback7` - 선물 이미지들

### 14. src/pages/GiftDetailPage.jsx
- `imgVector` - 아이콘
- 하드코딩된 피그마 링크들이 여러 개 (변수로 정의되지 않음)

### 15. src/pages/FilterPage.jsx
- `imgVector` - 아이콘
- `imgCloseVector1`, `imgCloseVector2` - 닫기 아이콘들

### 16. src/components/OCRCamera/OCRCamera.tsx
- `imgCameraIcon` - 카메라 아이콘 (사용 여부 확인 필요)

---

## 요약

- **총 삭제된 변수 수**: 약 20개 이상
- **남아있는 피그마 링크 파일 수**: 16개 파일
- **주의사항**: 일부 파일(GiftRecommendResultPage.jsx, GiftDetailPage.jsx)에는 변수로 정의되지 않고 하드코딩된 피그마 링크들이 포함되어 있음

