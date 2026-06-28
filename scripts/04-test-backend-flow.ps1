# AgentSeal Backend API Test Script
# ---------------------------------
# Backend must be running before this script:
# scripts/03-run-backend.ps1

$ErrorActionPreference = "Stop"

$BaseUrl = "http://127.0.0.1:8000"

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url
    )

    Write-Host "Testing $Name..." -ForegroundColor Cyan
    $Response = Invoke-RestMethod -Uri $Url -Method GET
    Write-Host "$Name OK" -ForegroundColor Green
    return $Response
}

Test-Endpoint "Health" "$BaseUrl/health"
Test-Endpoint "Full Demo Flow" "$BaseUrl/api/demo/run-full-flow"
Test-Endpoint "UiPath Proof" "$BaseUrl/api/uipath/proof"

Write-Host "All backend API tests completed successfully." -ForegroundColor Green


