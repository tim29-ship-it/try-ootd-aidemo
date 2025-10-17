@echo off
setlocal

cd /d "%~dp0extension\popup" || goto :error

call npm install || goto :error
call npm run build || goto :error

echo Build done
goto :eof

:error
echo Build failed
exit /b 1
