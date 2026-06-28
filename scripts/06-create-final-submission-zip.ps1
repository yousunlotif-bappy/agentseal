# AgentSeal Final Submission ZIP Creator
# --------------------------------------
# This script creates a clean final ZIP without node_modules, .next, .venv, or git files.

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root "dist"
$Temp = Join-Path $Dist "agentseal-final-submission"
$ZipPath = Join-Path $Dist "agentseal-final-submission.zip"

Write-Host "Preparing final AgentSeal submission package..." -ForegroundColor Cyan

if (!(Test-Path $Dist)) {
    New-Item -ItemType Directory -Path $Dist | Out-Null
}

if (Test-Path $Temp) {
    Remove-Item -Recurse -Force $Temp
}

if (Test-Path $ZipPath) {
    Remove-Item -Force $ZipPath
}

New-Item -ItemType Directory -Path $Temp | Out-Null

# Folders/files that should not be included in final submission.
$ExcludedNames = @(
    ".git",
    ".next",
    "node_modules",
    ".vercel",
    "dist",
    ".venv",
    "__pycache__",
    ".pytest_cache",
    ".vscode",
    ".idea"
)

function Should-Skip {
    param ([string]$Path)

    foreach ($Name in $ExcludedNames) {
        if ($Path -like "*\$Name\*" -or $Path -like "*\$Name") {
            return $true
        }
    }

    if ($Path -like "*.zip") {
        return $true
    }

    return $false
}

function Copy-Clean {
    param (
        [string]$Source,
        [string]$Destination
    )

    Get-ChildItem -Path $Source -Force | ForEach-Object {
        if (Should-Skip $_.FullName) {
            return
        }

        $TargetPath = Join-Path $Destination $_.Name

        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
            Copy-Clean -Source $_.FullName -Destination $TargetPath
        }
        else {
            Copy-Item -Path $_.FullName -Destination $TargetPath -Force
        }
    }
}

Copy-Clean -Source $Root -Destination $Temp

Compress-Archive -Path "$Temp\*" -DestinationPath $ZipPath -Force

Write-Host "Final ZIP created successfully:" -ForegroundColor Green
Write-Host $ZipPath -ForegroundColor Cyan


