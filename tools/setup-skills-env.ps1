# Project-local dependency installer (no global installs, no global config)
# Usage: powershell -ExecutionPolicy Bypass -File .\tools\setup-skills-env.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$venv = Join-Path $root ".venv"
$py = Join-Path $venv "Scripts\python.exe"
$browsers = Join-Path $root ".playwright-browsers"

if (-not (Test-Path $py)) {
    Write-Host "[1/4] create project-local venv"
    python -m venv $venv
}

Write-Host "[2/4] install requirements.txt"
& $py -m pip install --upgrade pip
& $py -m pip install -r (Join-Path $root "requirements.txt")

Write-Host "[3/4] install sprite-gen editable from vendored skill dir"
& $py -m pip install -e (Join-Path $root ".trae\skills\sprite-gen")

Write-Host "[4/4] download Playwright chromium into project .playwright-browsers"
$env:PLAYWRIGHT_BROWSERS_PATH = $browsers
if (-not $env:PLAYWRIGHT_DOWNLOAD_HOST) {
    # cdn.playwright.dev is unreachable on some CN networks; npmmirror serves the same builds
    $env:PLAYWRIGHT_DOWNLOAD_HOST = "https://cdn.npmmirror.com/binaries/playwright"
}
& $py -m playwright install chromium

# Make activated venv use the project-local browser dir (only edits a project file)
$activate = Join-Path $venv "Scripts\Activate.ps1"
$line = "`$env:PLAYWRIGHT_BROWSERS_PATH = (Join-Path (Split-Path -Parent (Split-Path -Parent `$PSScriptRoot)) '.playwright-browsers')"
if (-not (Select-String -Path $activate -Pattern "PLAYWRIGHT_BROWSERS_PATH" -Quiet)) {
    Add-Content -Path $activate -Value "`n# project-local Playwright browsers"
    Add-Content -Path $activate -Value $line
}

Write-Host "done. browser dir: $browsers"
