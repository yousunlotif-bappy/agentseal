# AgentSeal FastAPI Backend Run Script
# ------------------------------------
# This script prepares and runs the FastAPI backend on port 8000.

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"

if (!(Test-Path $Backend)) {
    throw "backend folder not found."
}

Set-Location $Backend

Write-Host "Preparing AgentSeal FastAPI backend..." -ForegroundColor Cyan

if (!(Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    py -3 -m venv .venv
}

$Python = Join-Path $Backend ".venv\Scripts\python.exe"

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
& $Python -m pip install --upgrade pip
& $Python -m pip install -r requirements.txt

Write-Host "Starting FastAPI backend at http://127.0.0.1:8000" -ForegroundColor Green
& $Python -m uvicorn main:app --reload --port 8000


