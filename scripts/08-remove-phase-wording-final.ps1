# AgentSeal Final Production Wording Cleaner
# ------------------------------------------
# Purpose:
# This script removes visible "Phase 1/2/3..." development wording
# from AgentSeal UI pages and replaces them with professional product wording.
#
# Safe target:
# - Only app/*.tsx and app/**/*.tsx files are updated.
# - node_modules, .next, dist, backend, and scripts are not touched.
#
# Run from project root:
#   .\scripts\08-remove-phase-wording-final.ps1

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Cleaning visible phase wording from AgentSeal UI..." -ForegroundColor Cyan

# Only clean frontend UI files.
$Files = Get-ChildItem -Path ".\app" -Recurse -File -Include *.tsx, *.ts |
Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.next\\" -and
    $_.FullName -notmatch "\\dist\\"
}

# Exact production replacements for your current visible UI messages.
$Replacements = @(
    @{
        Pattern = "Phase\s+3\s+uses\s+browser\s+localStorage\s+for\s+demo\s+data\.\s+Real\s+backend,\s+database,\s+UiPath\s+Test\s+Cloud,\s+and\s+evidence\s+execution\s+will\s+be\s+added\s+in\s+later\s+phases\."
        Value   = "AgentSeal validation data is connected across the trust workflow, evidence pipeline, backend validation layer, and release governance controls."
    },
    @{
        Pattern = "Phase\s+2\s+uses\s+demo\s+generation\.\s+In\s+Phase\s+3,\s+Gladiator\s+Engine\s+will\s+use\s+these\s+test\s+cases\s+to\s+create\s+adversarial\s+prompts\s+and\s+red-team\s+attacks\."
        Value   = "Test Forge generated the validation suite. Continue to Gladiator Engine to create adversarial prompts and red-team attacks."
    },
    @{
        Pattern = "Phase\s+4\s+completed\.\s+Next\s+phase\s+will\s+use\s+these\s+prompts\s+to\s+simulate\s+execution\s+results,\s+pass/fail\s+status,\s+and\s+evidence\s+logs\."
        Value   = "Red-team prompt library is ready. Continue to Test Execution to simulate validation results, pass/fail status, and evidence logs."
    },
    @{
        Pattern = "Phase\s+5\s+completed\.\s+RiskSeal\s+will\s+use\s+execution\s+failures,\s+warnings,\s+blocked\s+attacks,\s+and\s+evidence\s+logs\s+to\s+calculate\s+the\s+final\s+risk\s+score\."
        Value   = "Execution evidence is ready. Continue to RiskSeal to calculate the final risk score from failures, warnings, blocked attacks, and evidence logs."
    },
    @{
        Pattern = "Phase\s+6\s+completed\.\s+Human\s+Seal\s+Gate\s+will\s+use\s+this\s+decision,\s+route,\s+gates,\s+recommendations,\s+and\s+evidence\s+to\s+approve\s+or\s+reject\s+release\."
        Value   = "RiskSeal decision is ready. Continue to Human Seal Gate to review evidence, approve release, request remediation, or reject release."
    },
    @{
        Pattern = "Phase\s+7\s+completed\.\s+Evidence\s+Vault\s+will\s+collect\s+the\s+assessment,\s+tests,\s+prompts,\s+execution\s+run,\s+RiskSeal\s+report,\s+and\s+human\s+review\s+record\s+for\s+audit\s+readiness\."
        Value   = "Human review record is saved. Continue to Evidence Vault to package assessment, tests, prompts, execution results, RiskSeal report, and approval evidence."
    },
    @{
        Pattern = "Phase\s+8\s+completed\.\s+Release\s+Certificate\s+will\s+use\s+this\s+evidence\s+vault\s+package\s+to\s+generate\s+the\s+final\s+production-readiness\s+seal\."
        Value   = "Evidence Vault package is ready. Continue to Release Certificate to generate the final production-readiness seal."
    },
    @{
        Pattern = "Phase\s+9\s+completed\.\s+AgentSeal\s+has\s+issued\s+the\s+final\s+production\s+seal\s+certificate\s+from\s+the\s+full\s+evidence\s+trail\."
        Value   = "AgentSeal has issued the final production seal certificate from the full evidence trail."
    },
    @{
        Pattern = "Phase\s+10\s+completed\.\s+LiveSeal\s+Monitor\s+now\s+watches\s+the\s+released\s+certificate,\s+runtime\s+health,\s+drift\s+signals,\s+incidents,\s+and\s+scheduled\s+re-validation\s+readiness\."
        Value   = "LiveSeal Monitor now watches the released certificate, runtime health, drift signals, incidents, and scheduled re-validation readiness."
    }
)

$ChangedFiles = 0

foreach ($File in $Files) {
    $Text = Get-Content $File.FullName -Raw
    $Updated = $Text

    # Apply exact visible message replacements.
    foreach ($Rule in $Replacements) {
        $Updated = [regex]::Replace(
            $Updated,
            $Rule.Pattern,
            $Rule.Value,
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
    }

    # Remove small badge text like:
    # "Phase 4 / Gladiator Engine" -> "Gladiator Engine"
    # "Phase 10 / LiveSeal Monitor" -> "LiveSeal Monitor"
    $Updated = [regex]::Replace(
        $Updated,
        "Phase\s+\d+\s*/\s*",
        "",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    # Generic fallback:
    # "Phase 6 completed. Something..." -> "Something..."
    $Updated = [regex]::Replace(
        $Updated,
        "Phase\s+\d+\s+completed\.\s*",
        "",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    # Generic fallback:
    # "Next phase will..." -> "The next workflow step will..."
    $Updated = [regex]::Replace(
        $Updated,
        "Next\s+phase\s+will",
        "The next workflow step will",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    # Generic fallback:
    # "In Phase 3, ..." -> "Next, ..."
    $Updated = [regex]::Replace(
        $Updated,
        "In\s+Phase\s+\d+,\s*",
        "Next, ",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    # Generic fallback:
    # "Phase 2 uses demo generation." -> "Test Forge uses workflow-based validation generation."
    $Updated = [regex]::Replace(
        $Updated,
        "Phase\s+\d+\s+uses\s+demo\s+generation\.",
        "Test Forge uses workflow-based validation generation.",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    if ($Updated -ne $Text) {
        Set-Content -Path $File.FullName -Value $Updated -Encoding UTF8
        $ChangedFiles++
        Write-Host "Updated: $($File.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Production wording cleanup completed." -ForegroundColor Green
Write-Host "Files updated: $ChangedFiles" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now run this to verify:" -ForegroundColor Yellow
Write-Host "Select-String -Path .\app\**\*.tsx -Pattern `"Phase|later phases|demo data|browser localStorage`"" -ForegroundColor White


