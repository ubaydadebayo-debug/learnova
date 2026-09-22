@echo off
title Learnova Launcher
cd /d "%~dp0"

echo ==============================
echo       Learnova Launcher
echo ==============================
echo.
echo Starting the Learnova API and website...
echo.

start "Learnova API + Website" cmd /k "npm run dev"

echo Waiting for the servers to come up...
timeout /t 8 /nobreak >nul

echo Opening http://localhost:5173 in your browser...
start http://localhost:5173

echo.
echo Learnova is starting. A new window is running the servers.
echo Close that window when you are done to stop them.
echo.
pause