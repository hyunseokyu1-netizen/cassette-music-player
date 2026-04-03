# Cassette Tape Music Player — 작업 계획서

## 프로젝트 개요

**앱 이름**: Cassette Tape Music Player  
**플랫폼**: Android (Expo Go / React Native)  
**컨셉**: 1980년대 빈티지 카세트 테이프 플레이어 UI  
**아키텍처**: 백엔드 없음 — 완전한 로컬 앱 (파일 선택 + AsyncStorage)

---

## 완료된 작업

### 1. 기본 앱 구조 구축
- Expo 아티팩트 생성 (`artifacts/cassette-player`)
- 라우팅: `app/player.tsx` (플레이어 화면), `app/library.tsx` (라이브러리 화면)
- 컨텍스트 기반 전역 상태 관리 (`AudioPlayerContext`)
- 빈티지 갈색/베이지 컬러 팔레트 (`constants/colors.ts`)
- 사용 폰트: Inter (400/500/600/700)

### 2. 오디오 파일 선택 방식 변경
- **문제**: `expo-media-library`는 Expo Go에서 Android `READ_MEDIA_AUDIO` 권한 오류 발생
- **해결**: `expo-document-picker`로 교체 → 별도 권한 불필요, 기기 파일 탐색기 직접 호출

### 3. A/B 사이드 시스템 구현
- 실제 카세트 테이프처럼 **Side A = 최대 6곡**, **Side B = 최대 6곡**
- AsyncStorage에 사이드별 별도 저장 (`@cassette_sideA_v3`, `@cassette_sideB_v3`)
- `flipSide()`: 사이드 전환 시 테이프 노이즈 재생 후 반대 사이드 첫 곡 자동 재생
- 플레이어 화면에 **카세트 플립 애니메이션** (scaleX: 1→0→1, 360ms)

### 4. 테이프 노이즈 효과
- `assets/sounds/tape-noise.wav` — Node.js로 직접 생성한 2.2초 테이프 히스 사운드
- **발동 시점**: 곡과 곡 사이 자동 전환, Next 버튼, 사이드 플립 — 모든 트랙 전환 시 재생
- 노이즈 재생 중 UI에 "TAPE NOISE" 상태 표시 + 릴 계속 회전

### 5. 카세트 SVG 디자인 리디자인
- `components/CassetteTape.tsx` — 완전히 새로 작성
- 실제 카세트 외형 재현: 다크 플라스틱 바디, 그라디언트 음영, 테이프 윈도우, 유리 반사 효과
- 네 모서리 필립스 나사, 카운터 홀, 가이드 롤러, 테이프 라인
- 레이블: Side A(빨간색), Side B(파란색) 컬러 스트라이프 + 트랙 목록 표시
- 재생 상태 ("▶ PLAY" / "■ STOP" / "■■ LOADING") 레이블에 표시

### 6. 리얼 테이프 물리 기반 릴 애니메이션
- `components/Spool.tsx` — 현실적인 회전 속도 구현
- **공급 릴** (왼쪽): 처음에 크고 느리게 → 점점 작아지며 빠르게 회전
- **감김 릴** (오른쪽): 처음에 작고 빠르게 → 점점 커지며 느리게 회전
- 회전 주기 공식: `period = 3000 + (radius/maxRadius)² × 15000 ms`
- Reanimated 워크릿 재귀 콜백으로 구현: 매 회전마다 현재 릴 크기 기반으로 속도 자동 조정

### 7. 버그 수정 — 워크릿 TDZ 오류
- **문제**: `const step = () => {}` 형태의 화살표 함수는 Reanimated 워크릿 컴파일러에서 재귀 시 Temporal Dead Zone 오류 발생
- **해결**: `function step() {}` 선언문으로 변경 (함수 선언은 호이스팅됨)

### 8. 아이콘 깨짐 수정 (Android 물리 기기)
- **문제**: `@expo/vector-icons` (Feather) 폰트가 실제 기기에서 로드 실패 → 모든 버튼 박스 표시
- **해결**: `components/Icon.tsx` 생성 — react-native-svg로 모든 아이콘을 SVG 패스로 직접 구현
- 적용 범위: `ControlButtons`, `player.tsx`, `library.tsx` 전체 Feather 사용 제거

---

## 현재 앱 구조

```
artifacts/cassette-player/
├── app/
│   ├── _layout.tsx          # 폰트 로딩, AudioPlayerProvider 래핑
│   ├── player.tsx           # 메인 플레이어 화면
│   └── library.tsx          # A/B 사이드 라이브러리 화면
├── components/
│   ├── CassetteTape.tsx     # 카세트 SVG 본체 + 레이블
│   ├── Spool.tsx            # 물리 기반 릴 애니메이션
│   ├── ControlButtons.tsx   # 재생 컨트롤 버튼
│   ├── ProgressBar.tsx      # 진행바
│   └── Icon.tsx             # SVG 아이콘 컴포넌트 (Feather 대체)
├── contexts/
│   └── AudioPlayerContext.tsx
├── hooks/
│   └── useAudioPlayer.ts    # 핵심 오디오 로직 (A/B 사이드, 테이프 노이즈)
├── constants/
│   └── colors.ts            # 빈티지 컬러 팔레트
└── assets/
    └── sounds/
        └── tape-noise.wav   # 생성된 테이프 히스 사운드
```

---

## 주요 제약 사항 (Expo Go 호환)

| 사용 불가 | 이유 |
|---|---|
| `expo-media-library` | Android `READ_MEDIA_AUDIO` 권한 — Expo Go AndroidManifest에 없음 |
| `useEffect` from `react-native-reanimated` | 워크릿 충돌 |
| `@expo/vector-icons` | 실제 기기에서 폰트 로드 실패 가능 |

---

## 향후 개선 가능 사항

- [ ] 트랙 재생 시간(duration) 자동 로드 (현재 `--:--` 표시)
- [ ] 카세트 레이블 직접 편집 (앨범명, 아티스트명)
- [ ] 재생 속도 조절 (0.5x / 1x / 1.5x / 2x)
- [ ] 배경 오디오 재생 (앱 최소화 시)
- [ ] 트랙 순서 드래그&드롭 정렬
- [ ] expo-audio 마이그레이션 (expo-av SDK 54 deprecated 예정)
