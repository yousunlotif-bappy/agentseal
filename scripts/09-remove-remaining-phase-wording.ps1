# AgentSeal Remaining Phase Wording Cleaner
# -----------------------------------------
# This script removes the remaining "Phase" wording from frontend UI files.
# It also cleans developer comments so the project feels production-ready.

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Removing remaining Phase wording from AgentSeal UI..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path ".\app" -Recurse -File -Include *.tsx, *.ts |
Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.next\\" -and
    $_.FullName -notmatch "\\dist\\"
}

foreach ($File in $Files) {
    $Text = Get-Content $File.FullName -Raw
    $Updated = $Text

    # Visible UI cleanup.
    $Updated = $Updated -replace "Phase 2 Connected", "Assessment Connected"
    $Updated = $Updated -replace "What This Phase Completes", "What This Build Completes"
    $Updated = $Updated -replace "Mock Backend API phase completed\.", "Mock Backend API workflow completed."

    # Developer comment cleanup.
    $Updated = $Updated -replace "Phase 2 upgrade:", "Assessment workflow upgrade:"
    $Updated = $Updated -replace "Phase 2 connection:", "Assessment workflow connection:"
    $Updated = $Updated -replace "Phase 3 ready:", "Gladiator workflow ready:"
    $Updated = $Updated -replace "Phase 3 next-step button", "Next-step button"
    $Updated = $Updated -replace "Phase 4:", "Gladiator Engine workflow:"
    $Updated = $Updated -replace "Phase 5:", "Test Execution workflow:"
    $Updated = $Updated -replace "Phase 6:", "RiskSeal workflow:"
    $Updated = $Updated -replace "Phase 7:", "Human Seal Gate workflow:"
    $Updated = $Updated -replace "Phase 8:", "Evidence Vault workflow:"
    $Updated = $Updated -replace "Phase 9:", "Release Certificate workflow:"
    $Updated = $Updated -replace "Phase 10:", "LiveSeal Monitor workflow:"

    # Generic cleanup for remaining lowercase "phase" in comments/text.
    $Updated = $Updated -replace "next workflow phase", "next workflow stage"
    $Updated = $Updated -replace "RiskSeal phase", "RiskSeal workflow"
    $Updated = $Updated -replace "this phase", "this workflow stage"
    $Updated = $Updated -replace "This Phase", "This Workflow Stage"

    if ($Updated -ne $Text) {
        Set-Content -Path $File.FullName -Value $Updated -Encoding UTF8
        Write-Host "Updated: $($File.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Remaining Phase wording cleanup completed." -ForegroundColor Green
Write-Host "Now verify with:" -ForegroundColor Yellow
Write-Host "Select-String -Path .\app\**\*.tsx -Pattern `"Phase|phase`"" -ForegroundColor White


