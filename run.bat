@echo off
cd /d "%~dp0"

echo --------------------------------------------------
echo [1/3] Fixing missing LightningCSS native binary...
echo --------------------------------------------------
call npm install lightningcss-win32-x64-msvc --save-dev --force

echo.
echo --------------------------------------------------
echo [2/3] Checking remaining dependencies...
echo --------------------------------------------------
if not exist "node_modules\.bin\vite.cmd" (
    echo Installing node_modules...
    call npm install
)

echo.
echo --------------------------------------------------
echo [3/3] Opening browser and starting dev server...
echo --------------------------------------------------
start http://localhost:3000
call npm run dev

echo.
echo --------------------------------------------------
echo [WARNING] Server stopped! Press any key to exit.
echo --------------------------------------------------
pause