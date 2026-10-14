@echo off
setlocal
cd /d "%~dp0"
title ERITH.IA - Apercu Firefox isole
echo.
echo   ERITH.IA - Apercu local de la PR, sans publication Pages
echo   Aucun ordre crypto n'est autorise par cet outil.
echo   Fermez le Bridge prive avant cet essai isole.
echo.
where py >nul 2>&1
if not errorlevel 1 (
  start "ERITH.IA - serveur local" cmd /k py -3 -m http.server 8765 --bind 127.0.0.1
  timeout /t 3 /nobreak >nul
  start "" "http://127.0.0.1:8765/public/agent_crypto_erith_ia/trader/trading-desk.html"
  exit /b 0
)
where python >nul 2>&1
if not errorlevel 1 (
  start "ERITH.IA - serveur local" cmd /k python -m http.server 8765 --bind 127.0.0.1
  timeout /t 3 /nobreak >nul
  start "" "http://127.0.0.1:8765/public/agent_crypto_erith_ia/trader/trading-desk.html"
  exit /b 0
)
echo   Python absent : lancement du serveur Windows integre.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_PREVIEW_WINDOWS.ps1"
if errorlevel 1 pause
