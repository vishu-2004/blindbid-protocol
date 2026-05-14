@echo off
title BlindBid Protocol - Monad Testnet
color 0D

echo ============================================
echo   BlindBid Protocol - Monad Testnet
echo ============================================
echo.

:: ─── 1. Mint MonkeyNFTs on Monad ─────────────
echo [1/3] Minting MonkeyNFTs on Monad Testnet...
cd /d e:\blindbid-protocol\contracts
call npm run mint:monad
if errorlevel 1 (
    echo [ERROR] Minting on Monad Testnet failed!
    pause
    exit /b 1
)
echo       NFTs minted on Monad Testnet!
echo.

:: ─── 2. Start Backend ────────────────────────
echo [2/3] Starting backend server...
start "Backend Server" cmd /k "cd /d e:\blindbid-protocol\backend && npm run dev"
timeout /t 3 /nobreak >nul
echo       Backend server started!
echo.

:: ─── 3. Start Frontend ──────────────────────
echo [3/3] Starting frontend dev server...
start "Frontend Dev" cmd /k "cd /d e:\blindbid-protocol\frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo       Frontend dev server started!
echo.

echo ============================================
echo   All services are running!
echo ============================================
echo.
echo   Backend       :  http://localhost:5000
echo   Frontend      :  http://localhost:5173
echo   Network       :  Monad Testnet
echo.
echo   Close this window or press any key to exit.
echo   (Services will keep running in their own windows)
echo ============================================
pause
