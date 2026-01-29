@echo off
echo Deploying Taskify to Firebase...
echo (This might take a moment to download the tools first)
call npx --yes firebase-tools deploy --only hosting
pause
