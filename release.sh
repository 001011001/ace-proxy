#!/bin/bash

# AceProxy Unified Build & Release Script
echo "🚀 Starting AceProxy Production Build..."

# 1. Backend Build
echo "📦 Building Server..."
cd apps/server && npm install && npm run build
cd ../..

# 2. Web Landing Page Build
echo "🌐 Building Web Download Center..."
cd apps/web && npm install && npm run build
cd ../..

# 3. Mobile App Packaging (Expo EAS)
echo "📱 Preparing Mobile App Release..."
echo "To generate the standalone APK, run: cd apps/mobile && eas build --platform android --profile production"

# 4. Final Manifest
echo "✅ Build Complete!"
echo "Server: apps/server/dist"
echo "Web: apps/web/.next"
echo "Mobile: Follow EAS build link to download .apk"
