@echo off
title AMP Launcher


echo "                          ";
echo "                          ";
echo " ,--,--.,--,--,--. ,---.  ";
echo "' ,-.  ||        || .-. | ";
echo "\\ '-'  ||  |  |  || '-' ' ";
echo " \`--\`--'\`--\`--\`--'|  |-'  ";
echo "                  \`--'    ";

echo ==========================================
echo   Starting AMP Development System
echo ==========================================

echo.
echo [1/2] Initializing Backend (Flask)...
start "AMP Backend" cmd /k "cd src\backend && python app.py"

timeout /t 2 /nobreak >nul

echo.
echo [2/2] Launching Visual Interface (SvelteKit)...
start "AMP Frontend" cmd /k "cd src\frontend\amp && pnpm run dev"

echo.
echo ==========================================
echo   System Active. Access local portals.
echo ==========================================
