# 🎵 카세트 테이프 뮤직 플레이어

> 1980년대 빈티지 카세트 테이프 감성의 안드로이드 음악 플레이어 앱. Expo (React Native) 기반.

[English README →](./README.md)

---

## 소개

카세트 테이프 뮤직 플레이어는 아날로그 카세트의 감성을 안드로이드 기기에서 그대로 재현합니다. 실제 카세트처럼 A면과 B면에 곡을 나눠 담고, 릴 회전 애니메이션·테이프 노이즈·플립 애니메이션으로 진짜 카세트를 쓰는 듯한 경험을 제공합니다.

## 스크린샷

<p align="center">
  <img src="./screenshots/player-side-a.png" width="28%" alt="플레이어 - Side A" />
  &nbsp;&nbsp;
  <img src="./screenshots/library.png" width="28%" alt="라이브러리" />
  &nbsp;&nbsp;
  <img src="./screenshots/player-side-b.png" width="28%" alt="플레이어 - Side B (재생 중)" />
</p>
<p align="center">
  <em>플레이어 (Side A) &nbsp;·&nbsp; 라이브러리 &nbsp;·&nbsp; 플레이어 (Side B, 재생 중)</em>
</p>

## 주요 기능

- **A/B 면 시스템** — 각 면에 6트랙씩, 실제 카세트 테이프와 동일한 구조
- **물리 기반 릴 회전 애니메이션** — 릴 반지름에 따라 회전 속도가 달라지는 물리적으로 정확한 애니메이션 (Reanimated 워크렛 기반)
- **테이프 노이즈** — 트랙이 바뀔 때마다 실제 테이프 잡음 재생
- **카세트 플립 애니메이션** — A면↔B면 전환 시 scaleX 기반 부드러운 플립 효과
- **백그라운드 오디오** — 화면이 꺼지거나 앱이 백그라운드로 전환되어도 재생 지속 (Android Foreground Service)
- **트랙 목록 유지** — 앱 재시작 후에도 AsyncStorage로 트랙 목록 복원
- **FF / REW** — 빠르게 감기/되감기, 릴 회전 속도 즉시 반응
- **빈티지 UI** — 1980년대 카세트 플레이어에서 영감 받은 브라운/베이지 컬러 테마

## 기술 스택

| 분류 | 패키지 |
|---|---|
| 프레임워크 | Expo (React Native) |
| 오디오 | expo-av |
| 애니메이션 | react-native-reanimated |
| SVG UI | react-native-svg |
| 파일 선택 | expo-document-picker |
| 백그라운드 서비스 | expo-notifications (Foreground Service) |
| 데이터 영속성 | @react-native-async-storage/async-storage |
| 햅틱 피드백 | expo-haptics |

## 프로젝트 구조

```
artifacts/cassette-player/
├── app/
│   ├── player.tsx          # 메인 플레이어 화면
│   └── library.tsx         # A/B 트랙 관리 (각 면 6슬롯)
├── components/
│   ├── CassetteTape.tsx    # SVG 카세트 본체 (그라디언트, 나사, 가이드 롤러, 라벨)
│   ├── Spool.tsx           # 물리 기반 회전 애니메이션 릴
│   ├── ControlButtons.tsx  # 재생 컨트롤 (재생, 정지, FF, REW, 플립)
│   └── ProgressBar.tsx     # 트랙 진행 표시
├── contexts/
│   └── AudioPlayerContext.tsx  # 오디오 상태 공유 컨텍스트
├── hooks/
│   └── useAudioPlayer.ts   # A/B 면 로직, 테이프 노이즈, 파일 선택, 데이터 저장
└── constants/
    └── colors.ts           # 빈티지 컬러 테마
```

## 시작하기

### 사전 준비

- Node.js 20 이상
- pnpm
- Expo CLI (`npm install -g expo-cli`)
- 안드로이드 기기 또는 에뮬레이터

### 설치

```bash
# 저장소 클론
git clone https://github.com/hyunseokyu1-netizen/cassette-music-player.git
cd cassette-music-player

# 의존성 설치
pnpm install

# 앱 디렉토리로 이동
cd artifacts/cassette-player
pnpm install
```

### 실행

```bash
# Expo 개발 서버 시작
npx expo start

# 안드로이드로 실행
npx expo run:android
```

### 프로덕션 APK 빌드

```bash
# EAS Build 사용
eas build --platform android --profile production
```

## 사용 방법

1. **Library** 탭을 연다
2. **Side A** 또는 **Side B**의 슬롯을 탭해서 음악 파일을 추가한다
3. **Player** 탭으로 돌아간다
4. **Play** 버튼을 누르면 카세트 릴이 돌아간다
5. **Flip** 버튼으로 A면과 B면을 전환한다

## 참고 사항

- 파일 선택에 `expo-document-picker` 사용 (Expo Go에서 스토리지 권한 불필요)
- `expo-media-library`는 사용하지 않음 (Expo Go에서 AUDIO 권한 충돌 발생)
- 백그라운드 오디오는 `expo-notifications` Foreground Service로 처리 (Android Doze 모드 대응)

## 라이선스

MIT
