@echo off
cd /d "%~dp0"

echo =========================================
echo SEVEN HEAVEN - YOUTUBE SYNC
echo =========================================

cd /d C:\Aerith_YouTube_Reader

python youtube_reader_v3.py

echo.
echo =========================================
echo Synchronisation terminee
echo =========================================

pause
