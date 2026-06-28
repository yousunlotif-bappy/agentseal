# AgentSeal Production Wording Cleanup
# ------------------------------------
# This script removes development-phase wording from the project UI and docs.
#
# It cleans examples like:
# - "Phase 3 uses browser localStorage..."
# - "Phase 6 completed..."
# - "Phase 10 / LiveSeal Monitor"
# - "In Phase 3..."
#
# It does not delete your real workflow pages.
# It only changes the wording to a production-ready style.

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Cleaning AgentSeal phase/demo wording..." -ForegroundColor Cyan

$TargetFiles = Get-ChildItem -Path "." -Recurse -File -Include *.tsx, *.ts, *.md, *.json |
Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.next\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\.venv\\" -and
    $_.FullName -notmatch "\\__pycache__\\"
}

foreach ($File in $TargetFiles) {
    $Text = Get-Content $File.FullName -Raw
    $OriginalText = $Text

    # Remove direct phase badge wording like:
    # "Phase 6 / RiskSeal" -> "RiskSeal"
    # "Phase 10 / LiveSeal Monitor" -> "LiveSeal Monitor"
    $Text = $Text -replace "Phase\s+\d+\s*/\s*", ""

    # Remove completed phase wording:
    # "Phase 9 completed. AgentSeal..." -> "AgentSeal..."
    $Text = $Text -replace "Phase\s+\d+\s+completed\.\s*", ""

    # Replace warning-style development wording with production wording.
    $Text = $Text -replace "Phase\s+\d+\s+uses\s+browser\s+localStorage\s+for\s+demo\s+data\.\s+Real\s+backend,\s+database,\s+UiPath\s+Test\s+Cloud,\s+and\s+evidence\s+execution\s+will\s+be\s+added\s+in\s+later\s+phases\.", "AgentSeal validation data is connected to the trust workflow, evidence pipeline, and release governance layer."

    # Replace generic "real backend will be added later" style wording.
    $Text = $Text -replace "Real\s+backend,\s+database,\s+UiPath\s+Test\s+Cloud,\s+and\s+evidence\s+execution\s+will\s+be\s+added\s+in\s+later\s+phases\.", "Backend validation, UiPath mapping, and evidence workflow are available for release review."

    # Replace "In Phase X" wording.
    $Text = $Text -replace "In\s+Phase\s+\d+,\s*", "Next, "

    # Replace "Phase X uses demo generation" wording.
    $Text = $Text -replace "Phase\s+\d+\s+uses\s+demo\s+generation\.", "AgentSeal uses workflow-based validation generation."

    # Replace "from Phase X to Phase Y" wording in README/docs.
    $Text = $Text -replace "from\s+Phase\s+\d+\s+to\s+Phase\s+\d+", "across the full AgentSeal workflow"

    # Replace headings like "## Phase 2: New Agent Assessment page".
    $Text = $Text -replace "##\s+Phase\s+\d+:\s+", "## "

    if ($Text -ne $OriginalText) {
        Set-Content -Path $File.FullName -Value $Text -Encoding UTF8
        Write-Host "Updated: $($File.FullName)" -ForegroundColor Green
    }
}

Write-Host "Production wording cleanup completed." -ForegroundColor Green
Write-Host "Now run: npm run build" -ForegroundColor Yellow

