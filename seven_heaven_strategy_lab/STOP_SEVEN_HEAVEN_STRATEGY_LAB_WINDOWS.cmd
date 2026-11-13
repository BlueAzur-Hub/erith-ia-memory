@echo off
setlocal
cd /d "%~dp0"
docker compose down
if errorlevel 1 (
  echo Arret impossible. Verifier Docker Desktop.
  pause
  exit /b 1
)
echo Seven Heaven Strategy Lab est arrete. Les donnees du dossier workspace restent en place.
pause
