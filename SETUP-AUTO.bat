@echo off
setlocal
cd /d "%~dp0"
title FOREVER Store - Automatic Development Setup
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0SETUP-AUTO.ps1"
echo.
if errorlevel 1 (
  echo Setup needs attention. Read the message above or send a screenshot WITHOUT passwords or secrets.
) else (
  echo Setup process finished.
)
pause
