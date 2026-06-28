# AgentSeal Final Health Check
# ----------------------------
# This script checks the important files and gives clear pass/fail output.

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$RequiredFiles = @(
    "package.json",
    "app\page.tsx",
    "app\assessment\page.tsx",
    "app\test-forge\page.tsx",
    "app\gladiator-engine\page.tsx",
    "app\test-execution\page.tsx",
    "app\riskseal\page.tsx",
    "app\human-seal-gate\page.tsx",
    "app\evidence-vault\page.tsx",
    "app\release-certificate\page.tsx",
    "app\liveseal-monitor\page.tsx",
    "app\backend-health\page.tsx",
    "app\uipath-proof\page.tsx",
    "backend\main.py",
    "backend\requirements.txt",
    "backend\routes_uipath.py",
    "backend\services\uipath_proof.py"
)

Write-Host "Checking AgentSeal required files..." -ForegroundColor Cyan

foreach ($File in $RequiredFiles) {
    if (Test-Path $File) {
        Write-Host "OK: $File" -ForegroundColor Green
    }
    else {
        Write-Host "MISSING: $File" -ForegroundColor Red
        throw "Required file missing: $File"
    }
}

Write-Host "File health check passed." -ForegroundColor Green
Write-Host "Now run: npm run build" -ForegroundColor Yellow
Write-Host "Then run backend and test APIs." -ForegroundColor Yellow


