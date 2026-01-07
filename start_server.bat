@echo off
title EcoMap Server
echo Starting EcoMap Server...
echo ----------------------------------------
echo Open your browser to: http://localhost:3000
echo ----------------------------------------
cd /d "%~dp0"
node server.js
pause
