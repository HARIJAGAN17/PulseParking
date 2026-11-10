@echo off
title ParkPulse Launcher
echo ========================================================
echo               PARKPULSE FACILITY SYSTEM
echo              Know Before You Go Launcher
echo ========================================================
echo.

set "BACKEND_DIR=%~dp0backend"
set "FRONTEND_DIR=%~dp0frontend"

echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "ParkPulse Backend (Spring Boot)" cmd /k "cd /d %BACKEND_DIR% && mvnw.cmd spring-boot:run"

echo [2/3] Starting React + Vite Frontend (Port 5173)...
start "ParkPulse Frontend (Vite)" cmd /k "cd /d %FRONTEND_DIR% && npm.cmd run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening ParkPulse in default browser...
start http://localhost:5173

echo.
echo ========================================================
echo ParkPulse is running!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo Swagger:  http://localhost:8080/swagger-ui.html
echo ========================================================
pause

