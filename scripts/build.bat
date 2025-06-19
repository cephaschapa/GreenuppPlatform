@echo off
REM Build script for Railway deployment (Windows version)
REM This ensures all dependencies are properly installed before building

echo 🚀 Starting build process...

REM Install all dependencies (including devDependencies)
echo 📦 Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Clean any previous builds
echo 🧹 Cleaning previous builds...
call npm run clean
if errorlevel 1 (
    echo ❌ Failed to clean previous builds
    exit /b 1
)

REM Build the application
echo 🏗️ Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

echo ✅ Build completed successfully! 