# ============================================================
# SHIFTBASE - 1-Click PowerShell Dev Environment Launcher
# ============================================================

$root = "$HOME\Documents\shiftbase"
Set-Location $root

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "           STARTING SHIFTBASE DEV ENVIRONMENT               " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start Backend in a separate window
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; if (-not (Test-Path 'venv')) { python -m venv venv }; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8000"

# 2. Start Frontend in a separate window
Write-Host "[2/2] Launching React Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; if (-not (Test-Path 'node_modules')) { npm install }; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SHIFTBASE IS RUNNING!" -ForegroundColor Green
Write-Host "  - Frontend UI    : http://localhost:5173" -ForegroundColor White
Write-Host "  - API Swagger Doc: http://localhost:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green