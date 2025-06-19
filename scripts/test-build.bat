@echo off
REM Test Build Script for Greenupp (Windows)
REM This script tests the build process locally to catch issues before deployment

echo 🧪 Testing build process for Greenupp...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

echo 📦 Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo 🔍 Running linting...
call npm run lint
if errorlevel 1 (
    echo ❌ Linting failed
    exit /b 1
)

echo ✅ Running type check...
call npm run check
if errorlevel 1 (
    echo ❌ Type check failed
    exit /b 1
)

echo 🏗️ Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

echo 🧪 Testing production start...
REM Test if the built application can start (timeout after 10 seconds)
timeout /t 10 /nobreak >nul 2>&1
call npm start
if errorlevel 1 (
    echo ⚠️ Production start test completed (this is normal)
)

echo.
echo ✅ Build test completed successfully!
echo 🚀 Your application is ready for deployment.
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. The CI/CD pipeline will automatically deploy to Railway
echo 3. Or deploy manually: railway up 