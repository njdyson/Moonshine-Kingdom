<#
    Build the shipping PDFs into "V0.9 PDFs".

    WHY THIS EXISTS RATHER THAN PRINTING FROM THE BROWSER: as of 2026-07-29 the
    Rulebook and the Kingpin's Guide print from Chrome's Ctrl+P dialog at ~2/3
    size in the top-left of the sheet (cause still unfound; see
    memory/rulebook-print-workflow.md). Headless --print-to-pdf does NOT have the
    bug: it renders exact A4 at 100% with no blank pages. So this script is both
    the convenient path and the correct one.

    Two builds per long document:
      (Print)  - plain Chrome render, images at full weight, for real printing.
      (Screen) - the same file with every image stream downsampled and JPEGed by
                 tools/compress_pdf.py. Text stays vector and byte-identical.

    Usage:
      pwsh -File tools/build_pdfs.ps1              # the default set
      pwsh -File tools/build_pdfs.ps1 -Only Rulebook
      pwsh -File tools/build_pdfs.ps1 -List        # show what it would build
    Or just double-click "Build PDFs.cmd" in the repo root.
#>
param(
    [string]$Only = '',
    [switch]$List,
    [int]$MaxWidth = 1400,
    [int]$Quality = 74
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $repo 'V0.9 PDFs'

# source HTML -> output base name; Screen = also emit a compressed companion
$docs = @(
    @{ Name = 'Rulebook';        Src = 'Rulebook v0.9.html';        Screen = $true  }
    @{ Name = "Kingpin's Guide"; Src = "Kingpin's Guide v0.9.html"; Screen = $true  }
)

if ($List) {
    $docs | ForEach-Object { "{0,-18} <- {1}  (screen build: {2})" -f $_.Name, $_.Src, $_.Screen }
    return
}
if ($Only) { $docs = $docs | Where-Object { $_.Name -like "*$Only*" } }
if (-not $docs) { throw "No documents matched -Only '$Only'" }

$chrome = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw 'Chrome not found. Edit $chrome in tools/build_pdfs.ps1.' }

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function Get-PdfInfo($path) {
    # NOTE: r"..." not r'...' — "Kingpin's Guide" contains an apostrophe, which
    # closes a single-quoted Python literal and silently kills this readout.
    $py = @"
import sys, pypdfium2 as pdfium
d = pdfium.PdfDocument(r"$path")
w, h = d[0].get_size()
print(f'{len(d)}pp  {w/72*25.4:.0f}x{h/72*25.4:.0f}mm')
"@
    try { python -c $py 2>$null } catch { '' }
}

foreach ($d in $docs) {
    $src = Join-Path $repo $d.Src
    if (-not (Test-Path $src)) { Write-Warning "missing source: $($d.Src)"; continue }

    $printPdf = Join-Path $outDir ("{0} (Print).pdf" -f $d.Name)
    $tmp = Join-Path $env:TEMP ("mk_{0}.pdf" -f ([guid]::NewGuid().ToString('N')))
    $uri = ([uri](Resolve-Path $src).Path).AbsoluteUri

    Write-Host "`n=== $($d.Name) ===" -ForegroundColor Cyan
    Write-Host "  rendering $($d.Src)"
    # --print-to-pdf needs a literal absolute Windows path; it silently writes
    # nothing if the path is assembled awkwardly, hence the explicit temp file.
    & $chrome --headless=new --disable-gpu --no-pdf-header-footer `
        --print-to-pdf-no-header "--print-to-pdf=$tmp" $uri 2>$null | Out-Null
    if (-not (Test-Path $tmp)) { Write-Warning "  render produced nothing for $($d.Name)"; continue }

    Move-Item -Force $tmp $printPdf
    $mb = (Get-Item $printPdf).Length / 1MB
    Write-Host ("  print  -> {0}  {1:N1} MB  {2}" -f (Split-Path $printPdf -Leaf), $mb, (Get-PdfInfo $printPdf))

    if ($d.Screen) {
        $screenPdf = Join-Path $outDir ("{0} (Screen).pdf" -f $d.Name)
        python (Join-Path $PSScriptRoot 'compress_pdf.py') $printPdf $screenPdf $MaxWidth $Quality | Out-Null
        if (Test-Path $screenPdf) {
            $smb = (Get-Item $screenPdf).Length / 1MB
            Write-Host ("  screen -> {0}  {1:N1} MB  ({2:N1}x smaller)" -f (Split-Path $screenPdf -Leaf), $smb, ($mb / $smb))
        } else { Write-Warning '  compress step produced nothing' }
    }
}

Write-Host "`nDone. Output in: $outDir" -ForegroundColor Green
