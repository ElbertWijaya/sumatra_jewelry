@echo off
title Sumatra Jewelry Backend Runner
pushd "%~dp0"

echo.
echo === Quick Runner: install -> audit (non-blocking) -> prisma -> build -> start ===
echo [STEP] npm install
call npm install || echo [WARN] npm install reported issues; continuing...

echo [STEP] npm audit fix (non-blocking)
call npm audit fix --audit-level=high || echo [WARN] audit fix failed or network issue; continuing...

echo [STEP] prisma generate
call npx prisma generate >"%CD%\prisma-generate.log" 2>&1
IF ERRORLEVEL 1 (
	echo [WARN] prisma generate failed; see prisma-generate.log
) ELSE (
	echo [OK] Prisma client generated
)

echo [STEP] build (nest build)
call npm run build
IF ERRORLEVEL 1 (
	echo [ERROR] Build failed. See errors above.
	goto :end
)

echo [STEP] start server
call node dist/src/main.js
set EXITCODE=%ERRORLEVEL%

:end
echo.
echo [INFO] Exit code: %EXITCODE%
echo Press any key to close...
pause >nul
popd
