#!/bin/bash
# APK 빌드 (직접 설치/테스트용)
# 출력: artifacts/cassette-player/android/app/build/outputs/apk/release/app-release.apk

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/../artifacts/cassette-player/android"
OUTPUT="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

echo ">>> APK 빌드 시작..."
cd "$ANDROID_DIR"
./gradlew assembleRelease

echo ""
echo ">>> 완료!"
echo ">>> 파일 위치: $OUTPUT"
ls -lh "$OUTPUT"
