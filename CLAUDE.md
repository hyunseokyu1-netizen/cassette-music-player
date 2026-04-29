# Cassette Music Player — 프로젝트 가이드

## 프로젝트 구조

```
Cassette-Music-Player_Replit/
  artifacts/cassette-player/   ← 실제 앱 소스 (Expo/React Native)
  node_modules/                ← 루트 pnpm workspace
  pnpm-workspace.yaml
  CLAUDE.md                    ← 이 파일
```

## 기술 스택

- **Framework**: Expo SDK 54, React Native
- **라우터**: expo-router v6
- **오디오**: expo-av
- **패키지 매니저**: pnpm (workspace)
- **언어**: TypeScript

## 브랜치 전략

### 규칙

- `main` 브랜치는 항상 안정 상태 유지
- 모든 작업은 `main`에서 브랜치를 생성한 뒤 시작
- 작업 완료 후 `main`에 머지

### 브랜치 명명 규칙

| 종류 | 형식 | 예시 |
|------|------|------|
| 새 기능 | `feat/기능명` | `feat/youtube-player` |
| 버그 수정 | `fix/버그명` | `fix/tape-position-bug` |
| 디자인 변경 | `design/설명` | `design/retro-sprite` |
| 기타 작업 | `chore/설명` | `chore/update-deps` |

### 작업 프로토콜 (클로드가 따를 순서)

1. `git branch` + `git log --oneline -3` 로 현재 상태 확인
2. `main` 브랜치인지 확인 → 아니면 `git checkout main`
3. `main`이 `origin/main`과 동일한지 확인 → 뒤처지면 `git pull`
4. 작업용 브랜치 생성: `git checkout -b feat/기능명`
5. 작업 수행
6. 작업 완료 후 `main`에 머지: `git checkout main && git merge feat/기능명`
7. `git push origin main`

## 커밋 규칙

- **한국어** conventional commit 사용
- 형식: `type: 설명`
- type: `feat` / `fix` / `chore` / `docs` / `refactor` / `design`
- 예시: `feat: YouTube URL 스트리밍 재생 기능 추가`

## 알려진 설정 및 주의사항

### pnpm hoisting
- `.npmrc`에 `node-linker=hoisted` 설정 필요
- 이유: expo-router가 pnpm 기본 심볼릭링크 방식에서 `expo` 모듈을 못 찾는 문제

### Metro 중복 React 인스턴스
- `artifacts/cassette-player/metro.config.js`에 `resolveRequest`로 react/react-native 단일 인스턴스 강제
- 이유: hoisted 환경에서 루트 node_modules와 앱 node_modules에 React가 중복 생성되어 hook 오류 발생

### 기기 설치 (Android)
- `adb reverse tcp:8081 tcp:8081` 먼저 실행
- `npx expo run:android` 로 빌드 + 설치
- Metro는 `artifacts/cassette-player/node_modules/.bin/expo start --port 8081` 로 실행

### APK 빌드
- 명시적으로 요청할 때만 실행
