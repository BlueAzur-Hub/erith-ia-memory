@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Seven Heaven Strategy Lab - Python local
echo.
echo  SEVEN HEAVEN STRATEGY LAB
echo  Simulation PAPER locale - aucun ordre reel
echo.
py -3.13 -c "import sys; raise SystemExit(0 if sys.version_info[:2] == (3,13) else 1)" >nul 2>nul
if errorlevel 1 (
  echo Python 3.13 est introuvable par le lanceur Windows.
  echo Rien n'a ete installe ou modifie.
  pause
  exit /b 1
)
if not exist "workspace" mkdir "workspace"
if not exist "workspace" (
  echo Impossible de creer le dossier workspace. Verifie les droits du disque.
  pause
  exit /b 1
)
set "SEVEN_LAB_HOST=127.0.0.1"
set "SEVEN_LAB_PORT=8777"
set "SEVEN_LAB_WORKSPACE=%CD%\workspace"
if not defined SEVEN_LAB_OPEN_BROWSER set "SEVEN_LAB_OPEN_BROWSER=1"
echo Utilisation de Python 3.13 deja installe sur ce PC.
echo Serveur local : http://127.0.0.1:8777
echo Laisse cette fenetre ouverte durant l'utilisation.
echo Pour arreter : Ctrl+C ou ferme cette fenetre.
echo.
py -3.13 -m src.server
set "EXITCODE=%errorlevel%"
if not "%EXITCODE%"=="0" (
  echo.
  echo Le laboratoire n'a pas pu demarrer. Aucun ordre n'a ete envoye.
  echo Si le port 8777 est occupe, ferme l'ancienne instance du laboratoire.
  pause
)
exit /b %EXITCODE%
