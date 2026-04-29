# 백그라운드 오디오 구현 — 건드리면 안 되는 것들

Android Doze 모드에서 JS 스레드가 스로틀링되어 트랙 전환이 안 되는 버그를 고치면서
만들어진 구조다. 아래 항목들은 "더 깔끔해 보인다"는 이유로 바꾸면 반드시 백그라운드 재생이 깨진다.

---

## 1. Foreground Service (`CassettePlayerService.kt`)

**위치**: `artifacts/cassette-player/android/app/src/main/java/com/hscassette/player/CassettePlayerService.kt`

- `FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK`으로 선언된 Foreground Service
- 트랙 재생 시작 시 `WakeLock.startService(title)` → `WakeLock.stopService()` 흐름으로 관리
- **이 서비스를 제거하거나 일반 Service로 바꾸면**: Android 8+ 에서 백그라운드 진입 즉시 JS 스레드가 Doze에 의해 정지되어 트랙 전환 불가

### 알림 채널 두 개가 공존하는 이유
- `cassette_fg_service` (Kotlin): Foreground Service 유지용. 시스템 요구사항으로 반드시 존재해야 함
- `playback` (JS/expo-notifications): 사용자에게 보이는 재생 컨트롤 알림 (⏸ ⏭ 버튼)
- 두 개를 하나로 합치면 Foreground Service가 사라지거나 알림 버튼이 없어짐

---

## 2. PARTIAL_WAKE_LOCK (`WakeLockModule.kt`)

**위치**: `artifacts/cassette-player/android/app/src/main/java/com/hscassette/player/WakeLockModule.kt`

```kotlin
pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "CassettePlayer::AudioWakeLock")
```

- `PARTIAL_WAKE_LOCK`: CPU만 켜둠, 화면은 꺼져도 됨
- **`FULL_WAKE_LOCK` / `SCREEN_DIM_WAKE_LOCK`으로 바꾸면**: Play Store 정책 위반 + 배터리 소모 급증
- **`expo-keep-awake`로 대체하면**: 화면 켜짐 방식(SCREEN_DIM)이라 화면 꺼지면 무효

WakeLock은 재생 시작 시 acquire, 일시정지/정지 시 release. 노이즈 재생 중에도 유지해야 함.

---

## 3. `wasPlayingRef` + `trackEndedRef` (AppState 복구 로직)

**위치**: `artifacts/cassette-player/hooks/useAudioPlayer.ts` — AppState change 핸들러 (~502번 줄)

```ts
const wasPlayingRef = useRef(false);   // 재생 의도 상태
const trackEndedRef = useRef(false);   // 트랙이 자연 종료됐는지 여부
```

### 왜 `position` 체크를 하지 않는가
- 백그라운드에서 JS가 중단되면 position이 0으로 리셋되는 케이스가 있음
- position > 0 을 조건으로 넣으면 복구가 아예 안 됨

### 복구 분기 두 가지
| 상황 | 처리 |
|------|------|
| `soundRef` 있고 `isPlaying=false` + `trackEndedRef=true` | `advance()` — 다음 곡으로 전환 |
| `soundRef` 있고 `isPlaying=false` + `trackEndedRef=false` | `playAsync()` — 오디오 포커스 회복 후 재개 |
| `soundRef === null`, `noiseRef === null` | `playItemAt(idx)` — 트랙 전환 도중 JS가 멈춘 경우 |

**이 로직을 단순화하거나 `wasPlayingRef` 가드를 제거하면**: 화면 켜질 때마다 의도치 않은 재생 재개 발생

---

## 4. `noiseCancelRef` (FF/REW 중 노이즈 취소)

```ts
const noiseCancelRef = useRef(false);
```

- FF/REW 시작 시 진행 중인 노이즈만 취소하기 위한 별도 플래그
- `cancelRef`를 직접 쓰면 이후 재생 흐름 전체가 취소됨
- **`cancelRef`로 통합하면**: FF/REW 후 다음 트랙이 재생되지 않음

---

## 5. `AndroidManifest.xml` 권한

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

이 세 권한은 위 구조의 전제조건. 하나라도 빠지면 런타임 크래시.

---

## 참고: 버그 수정 히스토리

| 커밋 | 내용 |
|------|------|
| `ec3fda7` | Android PARTIAL_WAKE_LOCK으로 백그라운드 재생 중 JS 스레드 유지 |
| `23f2b3e` | 백그라운드에서 noise 아이템 건너뜀으로 다음 곡 재생 보장 |
| `c9fe95d` | AppState 복구 조건 개선 — position 체크 제거, wasPlayingRef 가드 추가 |
| `0e42003` | 백그라운드 트랙 전환 버그 수정 (알림 포커스 + 다다음곡 점프) |
