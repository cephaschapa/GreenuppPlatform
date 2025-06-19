#!/bin/bash

# Build script for Railway deployment
# This ensures all dependencies are properly installed before building

set -e

echo "🚀 Starting build process..."

# Install all dependencies (including devDependencies)
echo "📦 Installing dependencies..."
npm ci

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!" 