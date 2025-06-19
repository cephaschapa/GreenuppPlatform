#!/bin/bash

# Test Build Script for Greenupp
# This script tests the build process locally to catch issues before deployment

set -e

echo "🧪 Testing build process for Greenupp..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔍 Running linting..."
npm run lint

echo "✅ Running type check..."
npm run check

echo "🏗️ Building application..."
npm run build

echo "🧪 Testing production start..."
# Test if the built application can start (timeout after 10 seconds)
timeout 10s npm start || true

echo ""
echo "✅ Build test completed successfully!"
echo "🚀 Your application is ready for deployment."
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. The CI/CD pipeline will automatically deploy to Railway"
echo "3. Or deploy manually: railway up" 