param(
    [ValidateSet("npm", "pnpm")]
    [string]$FrontendRunner = "npm"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$frontendDirectory = Join-Path $repositoryRoot "frontend"
$mavenWrapper = Join-Path $repositoryRoot "mvnw.cmd"

function Resolve-CommandPath {
    param([Parameter(Mandatory = $true)][string]$Name)

    $command = Get-Command "$Name.cmd" -ErrorAction SilentlyContinue
    if ($null -eq $command) {
        $command = Get-Command $Name -ErrorAction SilentlyContinue
    }
    if ($null -eq $command) {
        throw "Required command '$Name' was not found on PATH."
    }
    return $command.Source
}

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory
    )

    Write-Host "`n==> $Label" -ForegroundColor Cyan
    Push-Location $WorkingDirectory
    try {
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$Label failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

if (-not (Test-Path -LiteralPath $mavenWrapper -PathType Leaf)) {
    throw "Maven wrapper was not found at '$mavenWrapper'."
}
if (-not (Test-Path -LiteralPath $frontendDirectory -PathType Container)) {
    throw "Frontend directory was not found at '$frontendDirectory'."
}

$frontendCommand = Resolve-CommandPath -Name $FrontendRunner

Invoke-CheckedCommand `
    -Label "Backend test suite" `
    -Command $mavenWrapper `
    -Arguments @("test") `
    -WorkingDirectory $repositoryRoot

Invoke-CheckedCommand `
    -Label "Frontend test suite" `
    -Command $frontendCommand `
    -Arguments @("run", "test") `
    -WorkingDirectory $frontendDirectory

Invoke-CheckedCommand `
    -Label "Frontend lint" `
    -Command $frontendCommand `
    -Arguments @("run", "lint") `
    -WorkingDirectory $frontendDirectory

Invoke-CheckedCommand `
    -Label "Frontend production build" `
    -Command $frontendCommand `
    -Arguments @("run", "build") `
    -WorkingDirectory $frontendDirectory

Write-Host "`nAll StudyMate verification steps passed." -ForegroundColor Green
