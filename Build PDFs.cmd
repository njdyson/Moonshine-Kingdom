@echo off
REM Double-click me. Renders the shipping PDFs into "V0.9 PDFs".
REM Uses headless Chrome, which (unlike the Ctrl+P dialog) renders these books
REM at the correct 100% A4 with no blank pages.
cd /d "%~dp0"
where pwsh >nul 2>nul
if %errorlevel%==0 (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\build_pdfs.ps1" %*
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "tools\build_pdfs.ps1" %*
)
echo.
pause
