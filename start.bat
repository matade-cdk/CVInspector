@echo off
echo ================================
echo     CVInspector Launcher
echo ================================
echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend App...
start cmd /k "cd frontend && npm start"
echo.
echo ================================
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ================================
pause
