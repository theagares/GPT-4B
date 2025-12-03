# 최종 피그마 링크 기반 이미지 변수 목록

## ✅ 삭제 완료된 변수
- `src/pages/MyDetailPage.jsx` - `imgVector4`, `imgIcon` (사용하지 않음)

## 📋 현재 사용 중인 피그마 링크 변수 (13개 파일, 약 53개 변수)

### 1. `src/pages/AddEventPage.jsx` (4개)
- `imgVector` - 뒤로가기 화살표
- `imgVector1` - 이전/다음 화살표
- `imgButton` - 참여자 추가 버튼
- `imgBackIcon` - 뒤로가기 아이콘

### 2. `src/pages/LandingPage.jsx` (4개)
- `imgImageWithFallback` - 인기 선물 이미지 1
- `imgImageWithFallback1` - 인기 선물 이미지 2
- `imgImageWithFallback2` - 인기 선물 이미지 3
- `imgImageWithFallback3` - 인기 선물 이미지 4

### 3. `src/pages/GiftHistoryPage.jsx` (5개)
- `giftHistoryImage1` - 선물 이력 이미지 1
- `giftHistoryImage2` - 선물 이력 이미지 2
- `giftHistoryImage3` - 선물 이력 이미지 3
- `giftHistoryImage4` - 선물 이력 이미지 4
- `giftHistoryImage5` - 선물 이력 이미지 5

### 4. `src/pages/CardGiftHistoryPage.jsx` (9개)
- `imgImageWithFallback` - 선물 이미지 1
- `imgImageWithFallback1` - 선물 이미지 2
- `imgImageWithFallback2` - 선물 이미지 3
- `imgImageWithFallback3` - 선물 이미지 4
- `imgImageWithFallback4` - 선물 이미지 5
- `imgIcon` - 아이콘 1
- `imgIcon2` - 아이콘 2
- `imgIcon4` - 아이콘 4
- `imgVector4` - 뒤로가기 아이콘

### 5. `src/components/BottomNavigation.jsx` (2개)
- `imgImage10` - MY 탭 아이콘
- `imgGpt4B4` - AI 추천 GPT 로고

### 6. `src/pages/BusinessCardGiftHistoryPage.jsx` (5개)
- `businessCardGiftImage1` - 선물 이미지 1
- `businessCardGiftImage2` - 선물 이미지 2
- `businessCardGiftImage3` - 선물 이미지 3
- `businessCardGiftImage4` - 선물 이미지 4
- `businessCardGiftImage5` - 선물 이미지 5

### 7. `src/pages/PersonalGiftHistoryPage.jsx` (5개)
- `personalGiftImage1` - 선물 이미지 1
- `personalGiftImage2` - 선물 이미지 2
- `personalGiftImage3` - 선물 이미지 3
- `personalGiftImage4` - 선물 이미지 4
- `personalGiftImage5` - 선물 이미지 5

### 8. `src/pages/MyPage.jsx` (3개)
- `imgGpt4B2` - GPT-4b 로고
- `imgVector` - 위로 스와이프 화살표
- `imgVector4` - 뒤로가기 아이콘

### 9. `src/pages/PopularGiftsPage.jsx` (11개)
- `imgVector` - 뒤로가기 화살표
- `imgIcon` - 정렬 아이콘
- `imgIcon1` - 필터 아이콘
- `imgImageWithFallback` - 선물 이미지 1
- `imgImageWithFallback1` - 선물 이미지 2
- `imgImageWithFallback2` - 선물 이미지 3
- `imgImageWithFallback3` - 선물 이미지 4
- `imgImageWithFallback4` - 선물 이미지 5
- `imgImageWithFallback5` - 선물 이미지 6
- `imgImageWithFallback6` - 선물 이미지 7
- `imgImageWithFallback7` - 선물 이미지 8

### 10. `src/pages/GiftDetailPage.jsx` (1개)
- `imgVector` - 뒤로가기 화살표
- **하드코딩된 링크**: 선물 이미지들 (12개) - 변수로 정의되지 않음

### 11. `src/pages/FilterPage.jsx` (3개)
- `imgVector` - 뒤로가기 화살표
- `imgCloseVector1` - 닫기 아이콘 라인 1
- `imgCloseVector2` - 닫기 아이콘 라인 2

### 12. `src/components/OCRCamera/OCRCamera.tsx` (1개)
- `imgCameraIcon` - 카메라 촬영 아이콘

---

## 🚨 하드코딩된 피그마 링크 (변수로 정의되지 않음)

### `src/pages/GiftRecommendResultPage.jsx` (4개)
- Line 12: `image: 'https://www.figma.com/api/mcp/asset/e61c2b5d-68eb-409e-9b25-a90abd759a96'`
- Line 20: `image: 'https://www.figma.com/api/mcp/asset/2fbadc50-65b5-4cb8-8a55-788f604b6dd8'`
- Line 28: `image: 'https://www.figma.com/api/mcp/asset/a166d192-abaa-4496-bc6a-bd5336537959'`
- Line 176: `src="https://www.figma.com/api/mcp/asset/c2072de6-f1a8-4f36-a042-2df786f153b1"`

### `src/pages/GiftDetailPage.jsx` (12개)
- Line 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 178: 선물 이미지들 (하드코딩)

---

## 📊 요약 통계

- **변수로 정의된 피그마 링크**: 53개 변수 (13개 파일)
- **하드코딩된 피그마 링크**: 약 16개 (2개 파일)
- **총 피그마 링크**: 약 69개
- **삭제된 사용하지 않는 변수**: 2개 (`MyDetailPage.jsx`)

---

## 📝 참고사항

1. **선물 이미지들**: 대부분의 선물 이미지들은 더미 데이터로 사용 중이며, 실제 서비스에서는 API나 로컬 이미지로 교체될 예정입니다.

2. **아이콘 이미지들**: 많은 아이콘 이미지들이 SVG로 교체 가능하며, 일부는 이미 교체되었습니다.

3. **로고 이미지들**: 
   - `imgGpt4B2` (MyPage.jsx) - 로컬 PNG로 교체 가능
   - `imgGpt4B4` (BottomNavigation.jsx) - 로컬 PNG로 교체 가능

4. **하드코딩된 링크**: `GiftRecommendResultPage.jsx`와 `GiftDetailPage.jsx`에는 변수로 정의되지 않고 직접 하드코딩된 피그마 링크들이 있습니다. 이를 변수로 정의하는 것을 권장합니다.

---

## 🔄 다음 단계 제안

1. 하드코딩된 피그마 링크들을 변수로 정의
2. 선물 이미지들을 로컬 이미지나 placeholder로 교체
3. 아이콘들을 SVG로 교체 (우선순위: 뒤로가기, 필터, 정렬 등)
4. 로고 이미지들을 로컬 PNG로 교체

