@echo off
REM Test script to verify server startup

echo 🧪 Testing server startup...

REM Set environment variables
set NODE_ENV=production
set PORT=5000

echo 📦 Starting server...
echo NODE_ENV=%NODE_ENV%
echo PORT=%PORT%

REM Start the server and wait a moment
start /B npm start

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Test health endpoint
echo 🔍 Testing health endpoint...
curl -s http://localhost:5000/api/health

if errorlevel 1 (
    echo ❌ Health check failed
    echo 🔍 Checking if server is running...
    netstat -an | findstr :5000
) else (
    echo ✅ Health check passed
)

REM Stop the server
taskkill /F /IM node.exe >nul 2>&1

echo 🧪 Test completed 