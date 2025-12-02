@echo off
setlocal enabledelayedexpansion

REM Portable backend launcher for Windows (install -> build -> run)
REM Usage: double-click start.bat (prod) or run: start.bat dev

pushd "%~dp0"

echo.
echo ================== Sumatra Jewelry Backend ==================
echo [INFO] Working directory: %CD%
echo [INFO] Node: ensure Node.js LTS is installed and available in PATH.
echo ==============================================================
echo.

echo [1/6] Checking Administrator rights (for optional firewall rule)...
net session >nul 2>&1
if %errorlevel%==0 (
  echo [ADMIN] Adding firewall rule for TCP 3000 (if not present)...
  netsh advfirewall firewall add rule name="Sumatra API 3000" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
) else (
  echo [INFO] Not running as Administrator; skipping firewall rule.
)

echo [2/6] Killing any running Node processes (to unlock Prisma files)...
taskkill /F /IM node.exe >nul 2>&1

echo [3/6] Installing dependencies via npm ci...
npm ci
if errorlevel 1 (
  echo [WARN] npm ci failed. Cleaning node_modules and retrying once...
  attrib -R -S -H "node_modules\.prisma\*" /S /D >nul 2>&1
  rmdir /S /Q node_modules >nul 2>&1
  npm cache clean --force >nul 2>&1
  npm ci
  if errorlevel 1 (
    echo [ERROR] npm ci failed again. Check antivirus exclusions and run this script as Administrator.
    echo         Folder to exclude: %CD%\node_modules\.prisma
    pause >nul
    popd
    exit /b 1
  )
)

echo [4/6] Generating Prisma client (if schema exists)...
if exist "prisma\schema.prisma" (
  npx prisma generate || echo [WARN] prisma generate failed; continuing...
) else (
  echo [INFO] prisma/schema.prisma not found; skipping generate.
)

if /I "%~1"=="dev" (
  echo [5/6] Starting in DEV mode (watch)...
  npm run start:dev
  set EXITCODE=%ERRORLEVEL%
  popd
  exit /b %EXITCODE%
)

echo [5/6] Building project for production...
npm run build
if errorlevel 1 (
  echo [ERROR] Build failed. Please review the errors above.
  pause >nul
  popd
  exit /b 1
)

echo [6/6] Starting server (production)...
echo [INFO] API expected at: http://0.0.0.0:3000/api (LAN via http://<YOUR_LAN_IP>:3000/api)
echo [HINT] Open http://localhost:3000/api/health to verify.
node dist/main.js
set EXITCODE=%ERRORLEVEL%

popd
exit /b %EXITCODE%
