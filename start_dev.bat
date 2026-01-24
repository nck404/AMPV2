@echo off
title HumanBio Launcher
echo ==========================================
echo   Starting HumanBio Development System
echo ==========================================

echo.
echo [1/2] Initializing Backend Neural Core (Flask)...
start "HumanBio Backend" cmd /k "cd src\backend && python app.py"

timeout /t 2 /nobreak >nul

echo.
echo [2/2] Launching Visual Interface (SvelteKit)...
start "HumanBio Frontend" cmd /k "cd src\frontend\amp && pnpm run dev"

echo.
echo ==========================================
echo   System Active. Access local portals.
echo ==========================================
