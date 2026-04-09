# 프로젝트 분석 보고서: Cassette Tape Music Player

## 1. 프로젝트 개요
- **앱 이름:** Cassette Tape Music Player
- **플랫폼:** Android (Expo Go 기반 React Native 앱)
- **핵심 컨셉:** 1980년대 빈티지 카세트 테이프 플레이어의 감성과 사용자 경험(UX)을 모바일 기기에 재현합니다.
- **아키텍처 특징:** 백엔드 서버 통신 없이 기기 내부에서 동작하는 완전한 로컬 앱입니다. `expo-document-picker`로 로컬 파일을 선택하고, `AsyncStorage`를 사용해 재생 상태 및 목록 등의 메타데이터를 유지합니다.

## 2. 사용된 주요 기술 스택
- **코어 프레임워크:** React Native (0.81.5) + React (19.1.0)
- **환경 및 빌드:** Expo (SDK 54), Expo Router v6
- **주요 Expo 패키지:**
  - `expo-av`: 핵심적인 오디오 재생 제어 및 테이프 효과음 재생
  - `expo-document-picker`: 안드로이드 `READ_MEDIA_AUDIO` 권한 획득 문제를 피하기 위한 파일 선택 유틸리티
  - `expo-file-system`: 선택한 오디오 파일을 앱 내부 캐시 스토리지로 복사하여 앱 재시작 후에도 지속 가능성을 보장
- **UI 및 애니메이션:**
  - `react-native-reanimated` (v4.1.1): 카세트 테이프가 돌아가거나 사이드를 뒤집는(Flip) 애니메이션 렌더링에 사용 (Worklet 활용)
  - `react-native-svg`: 디바이스 벡터 폰트의 깨짐 현상을 방지하기 위해 사용된 직접적인 경로 드로잉(아이콘, 카세트 바디 외관 등).

## 3. 핵심 디렉터리(`artifacts/cassette-player/`) 구조
```text
├── app/                  # 화면 라우팅 페이지 컴포넌트들
│   ├── _layout.tsx       # 폰트 세팅 및 전역 상태(Context Provider) 레이아웃
│   ├── player.tsx        # 메인 음악 컨트롤 화면 UI
│   └── library.tsx       # 테이프 안에 넣을 트랙 관리 모달/화면
├── components/           # 재사용 가능한 UI 블록
│   ├── CassetteTape.tsx  # 섬세한 카세트 본체 일러스트 + 레이블
│   ├── Spool.tsx         # 빙글빙글 도는 톱니바퀴 릴 애니메이션
│   ├── ControlButtons.tsx# 플레이, 정지, 플립 기능 버튼 그룹
│   ├── ProgressBar.tsx   # 음악 퍼센트 진행 표시 막대
│   └── Icon.tsx          # 에러 처리를 위한 SVG 100% 수제 호환 아이콘
├── contexts/             # 전역 상태 스토어 (AudioPlayerContext.tsx)
├── hooks/
│   └── useAudioPlayer.ts # 🔥 [핵심 두뇌] 음악 시작/정지, 파일 추가, A/B사이드 변환 전반 로직
├── constants/
│   └── colors.ts         # 앱 전반에 걸쳐 쓰이는 빈티지 컬러 HEX 리스트
└── assets/               # 이미지, 폰트 및 생성된 노이즈 백그라운드 사운드(tape-noise.wav)
```

## 4. 핵심 기능과 비즈니스 로직 특징

### 🎧 "A/B 사이드" 시스템 기믹 구현
기존 스트리밍 앱처럼 목록을 순서대로 재생하는 방식이 아닙니다. 이 앱은 완전히 오프라인 카세트 테이프의 제약을 묘사했습니다.
- `Side A`, `Side B` 로 분리하여 최대 30분 씩의 러닝타임 제약 조건을 가지고 있습니다.
- **플립(뒤집기) 기능:** `useAudioPlayer.ts` 내의 `flipSide` 로직이 계산의 핵심입니다. 카세트가 돌아가는 위치 시그니처(`sourceTapePositionMs`)를 기반으로 넘겼을 때 반대 사이드의 어느 트랙 몇 초 위치에서 다시 노래를 시작할 지 수학적으로 계산(`targetMs`)해 자연스럽게 이어줍니다.

### 💨 아날로그 감성의 노이즈 효과 (Hiss)
`tape-noise.wav`를 통해 턴을 넘기거나 트랙 간의 공백 시간에 약 2.2초의 노이즈 히스 사운드를 강제로 주입합니다. 기계적으로 빈 테이프가 헛도는 소리를 연출해 향수를 이끌어냅니다.

### ⚙️ 물리학 기반의 릴 애니메이션 공식 모델링
왼쪽에 위치한 타래(공급 릴)와 오른쪽에 말리는 타래(감김 릴)의 회전 속도는 재생 시간에 따라 테이프 볼륨량이 변하므로 회전 속도가 달라집니다.
이를 재현하기 위해 `period = 3000 + (radius/maxRadius)² × 15000 ms` 와 같은 계산 식을 Reanimated의 Worklet 재귀 렌더 함수로 엮어 60fps로 매끄럽게 동작하게 구현했습니다.

## 5. 종합 평가 및 개발 방향(개선안)
이 코드는 기술 데몬스트레이션 용도로 보일 만큼 리액트 네이티브 UI/UX 연출(Vector Graphics + Reanimated)에 대해 섬세하게 잘 짜여 있습니다.

이후 고도화를 시도한다면 다음과 같은 로드맵을 설계할 수 있습니다:
1. **백그라운드 지원:** 현재는 앱 활성화 상태 기준 로직이 강하므로, Android Expo 환경에 맞춘 Background 오디오 재생 설정(`expo-av` Background Audio).
2. **Audio 패키지 교체:** `expo-av` 라이브러리가 조만간 Deprecated 대상이므로, 최신 Expo SDK가 제공하는 `expo-audio` 라이브러리로의 API 마이그레이션이 필요해 보입니다.
3. **재생 속도 (피치 조절):** 재생 속도를 늦추거나 빠르게 하여 노후된 테이프가 늘어지는 듯한 효과를 주는 것.
