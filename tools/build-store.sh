#!/bin/bash
# AAB 빌드 (Google Play Store 등록용)
# 출력: artifacts/cassette-player/android/app/build/outputs/bundle/release/app-release.aab

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/../artifacts/cassette-player/android"
OUTPUT="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"

echo ">>> AAB 빌드 시작 (Play Store용)..."
cd "$ANDROID_DIR"
./gradlew bundleRelease

echo ""
echo ">>> 완료!"
echo ">>> 파일 위치: $OUTPUT"
ls -lh "$OUTPUT"
