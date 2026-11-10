@echo off
title ParkPulse Stopper
echo Stopping any running ParkPulse processes on ports 8080 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Stopping process %%a on port 8080...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Stopping process %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo All services stopped cleanly.
timeout /t 2 /nobreak >nul

