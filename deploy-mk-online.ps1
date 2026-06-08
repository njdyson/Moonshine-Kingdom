# Deploy mk-online: build in the source repo, mirror dist into this repo, commit, push.
# Run from this repo's root.

$ErrorActionPreference = 'Stop'

$source = 'C:\Users\nickj\Desktop\MK Online\mk-online'
$here = $PSScriptRoot
$dest = Join-Path $here 'mk-online\dist'

if (-not (Test-Path "$source\package.json")) {
    throw "Source not found at $source. Clone github.com/njdyson/mk-online there first."
}

Write-Host '==> Building mk-online...' -ForegroundColor Cyan
Push-Location $source
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
} finally {
    Pop-Location
}

Write-Host '==> Mirroring dist into repo...' -ForegroundColor Cyan
robocopy "$source\dist" $dest /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
# robocopy exit codes 0-7 are success
if ($LASTEXITCODE -ge 8) { throw "robocopy failed (exit $LASTEXITCODE)" }

Write-Host '==> Committing...' -ForegroundColor Cyan
Push-Location $here
try {
    git add mk-online/dist
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Write-Host '   No changes to commit.' -ForegroundColor Yellow
        return
    }
    Push-Location $source
    $shortSha = git rev-parse --short HEAD
    Pop-Location
    git commit -m "Deploy mk-online (source $shortSha)"
    Write-Host '==> Pushing...' -ForegroundColor Cyan
    git push origin main
} finally {
    Pop-Location
}

Write-Host '==> Done. Pull on the server to go live.' -ForegroundColor Green
