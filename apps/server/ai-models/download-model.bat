@echo off
REM download-model.bat — Download Qwen3-4B-Q4_K_M GGUF model for local LLM inference
REM
REM Usage:
REM   cd ai-models
REM   download-model.bat
REM
REM The model will be saved to: ai-models\qwen3-4b-q4_k_m.gguf

setlocal enabledelayedexpansion

set "MODEL_DIR=%~dp0"
set "MODEL_FILE=qwen3-4b-q4_k_m.gguf"
set "MODEL_PATH=%MODEL_DIR%%MODEL_FILE%"
set "DOWNLOAD_URL=https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/qwen3-4b-q4_k_m.gguf"

echo ========================================
echo   AceProxy - Local LLM Model Downloader
echo ========================================
echo.

REM Check if model already exists
if exist "%MODEL_PATH%" (
  echo [OK] Model already exists: %MODEL_PATH%
  echo   To re-download, delete the file first: del "%MODEL_PATH%"
  goto :eof
)

echo Model: Qwen3-4B-Q4_K_M (~2.5 GB)
echo Source: %DOWNLOAD_URL%
echo Target: %MODEL_PATH%
echo.

REM Use PowerShell to download (available on all modern Windows)
echo Downloading with PowerShell...
powershell -Command "& { $ProgressPreference = 'SilentlyContinue'; Write-Host 'Downloading...'; try { Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MODEL_PATH%' -UseBasicParsing; Write-Host '[OK] Download complete: %MODEL_PATH%' } catch { Write-Host '[ERROR] Download failed:' $_.Exception.Message; exit 1 } }"

if exist "%MODEL_PATH%" (
  echo.
  echo [OK] Download complete: %MODEL_PATH%
  echo.
  echo You can now start the AceProxy server. The model will be loaded on first AI request.
) else (
  echo.
  echo [ERROR] Download failed. Please check your internet connection and try again.
  exit /b 1
)

endlocal
