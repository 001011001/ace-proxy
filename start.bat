@echo off
chcp 65001 >nul
title AceProxy Server
echo.
echo    ╔══════════════════════════════╗
echo    ║     AceProxy Backend       ║
echo    ╚══════════════════════════════╝
echo.

set "SERVER_DIR=%~dp0apps\server"

cd /d "%SERVER_DIR%"

echo [1/4] Killing old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Compiling TypeScript...
call npx tsc
if %errorlevel% neq 0 (
    echo [ERROR] TypeScript compilation failed!
    pause
    exit /b 1
)
echo       Done.

echo [3/4] Starting server on http://localhost:3001...
start "AceProxy-Backend" node dist/src/main.js

echo [4/4] Waiting for server...
:wait
timeout /t 2 /nobreak >nul
curl -s http://localhost:3001/api/v1/health >nul 2>&1
if %errorlevel% neq 0 goto wait

echo       Server is ready!

echo.
echo    ┌─────────────────────────────────────────┐
echo    │  Frontend:  deploy\index.html            │
echo    │  Admin:     deploy\admin.html            │
echo    │  Login:     admin@aceproxy.id / Admin1234 │
echo    │  API:       http://localhost:3001/api/v1  │
echo    └─────────────────────────────────────────┘
echo.
echo    Press Ctrl+C in the server window to stop.

start "" "%~dp0deploy\index.html"

pause
