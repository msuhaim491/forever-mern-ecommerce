@echo off
cd /d "%~dp0"
echo FOREVER - MERN Store
if not exist "backend\.env" (
  echo.
  echo ERROR: backend\.env not found. Follow SETUP-WINDOWS-QUICKSTART.txt first.
  echo.
  pause
  exit /b 1
)
echo Starting backend, customer website and admin dashboard...
echo Shop: http://localhost:5173
 echo Admin: http://localhost:5174
 echo API: http://localhost:5000/api/health
npm run dev
pause
