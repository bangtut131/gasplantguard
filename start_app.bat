@echo off
title Plant Disease ID App Launcher
echo ===================================================
echo   GAMA AGRO SEJATI - Plant Disease ID App
echo ===================================================
echo.

REM Check and install Root dependencies
if not exist "node_modules" (
    echo [INFO] Installing Root dependencies...
    call npm install
)

REM Check and install Server dependencies
if not exist "server\node_modules" (
    echo [INFO] Installing Server dependencies...
    cd server
    call npm install
    cd ..
)

REM Check and install Client dependencies
if not exist "client\node_modules" (
    echo [INFO] Installing Client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo [INFO] Starting Application...
echo [INFO] Opening browser at http://localhost:5173...
echo.

start http://localhost:5173
call npm run dev

pause
