@echo off
chcp 65001 >nul
echo.
echo    AceProxy — Smoke Tests
echo    ======================
echo.
set BASE=http://localhost:3001/api/v1
set PASS=0
set FAIL=0

echo [1/8] Health check...
curl -sf %BASE%/health >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [2/8] Product list...
curl -sf "%BASE%/product/list?limit=1" 2>nul | findstr /C:"total" >nul
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [3/8] Dashboard KPI...
curl -sf %BASE%/dashboard/kpi >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [4/8] Dashboard Trend...
curl -sf %BASE%/dashboard/trend >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [5/8] Auth Register...
curl -sf -X POST %BASE%/auth/register -H "Content-Type: application/json" -d "{\"email\":\"smoke@test.local\",\"password\":\"Test1234\"}" >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [6/8] Auth Login...
curl -sf -X POST %BASE%/auth/login -H "Content-Type: application/json" -d "{\"email\":\"smoke@test.local\",\"password\":\"Test1234\"}" >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [7/8] Order List...
curl -sf %BASE%/order/list >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo [8/8] Vault Summary...
curl -sf %BASE%/vault/summary >nul 2>&1
if %errorlevel% equ 0 (echo        PASS & set /a PASS+=1) else (echo        FAIL & set /a FAIL+=1)

echo.
echo    ======================
echo    Result: %PASS% / 8 passed
if %FAIL% equ 0 (echo    ALL GOOD! & exit /b 0) else (echo    %FAIL% tests FAILED! & exit /b 1)
pause
