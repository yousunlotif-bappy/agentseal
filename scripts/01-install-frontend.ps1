# AgentSeal Frontend Install Script
# --------------------------------
# This script installs all Next.js frontend dependencies.

$ErrorActionPreference = "Stop"

# Move to project root from /scripts folder.
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Installing AgentSeal frontend dependencies..." -ForegroundColor Cyan

if (!(Test-Path "package.json")) {
    throw "package.json not found. Please run this script from the AgentSeal project structure."
}

npm install

Write-Host "Frontend dependencies installed successfully." -ForegroundColor Green

