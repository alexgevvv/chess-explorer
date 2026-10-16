@echo off
cd /d "%~dp0"
title Chess Explorer
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm.cmd ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Keep this window open while using Chess Explorer.
call npm.cmd run dev -- --open
pause
