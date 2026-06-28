# AgentSeal Frontend Build Script
# -------------------------------
# This script creates a clean production build for the Next.js app.

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Starting AgentSeal frontend build..." -ForegroundColor Cyan

if (Test-Path ".next") {
    Write-Host "Removing old .next cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
}

npm run build

Write-Host "Frontend production build completed successfully." -ForegroundColor Green


