@echo off
setlocal
cd /d "%~dp0"
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop est absent. Installer Docker Desktop puis redemarrer Windows.
  pause
  exit /b 1
)
if not exist "workspace" mkdir "workspace"
docker compose up --build -d
if errorlevel 1 (
  echo Echec du lancement Docker. Verifier Docker Desktop et les journaux.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:8777"
echo Seven Heaven Strategy Lab est lance en local. Aucun ordre reel.
pause
