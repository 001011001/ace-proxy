@echo off
chcp 65001 >nul
title AceProxy Server (Watch Mode)
echo AceProxy — Watch Mode (auto restart on file change)
echo.
cd /d "%~dp0apps\server"
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
npx tsc
if %errorlevel% neq 0 (echo [ERROR] Compile failed & pause & exit /b 1)
start "AceProxy-Backend" node dist/src/main.js
echo Server started on http://localhost:3001
echo.
echo Watching for changes... Press Ctrl+C to stop.
echo.
:loop
timeout /t 3 /nobreak >nul
for /r "src" %%f in (*.ts) do (
  if exist "%%f" for %%g in ("%%f") do (
    if not exist ".watch\%%~nxf" copy "%%f" ".watch\%%~nxf" >nul 2>&1
    fc "%%f" ".watch\%%~nxf" >nul 2>&1
    if !errorlevel! neq 0 (
      echo [Change detected] %%~nxf
      copy "%%f" ".watch\%%~nxf" >nul 2>&1
      taskkill /F /IM node.exe >nul 2>&1
      timeout /t 1 /nobreak >nul
      npx tsc
      start "AceProxy-Backend" node dist/src/main.js
      echo [Restarted]
    )
  )
)
goto loop
