@echo off
title BlindBid Protocol - Local Dev
color 0A

echo ============================================
echo   BlindBid Protocol - Local Development
echo ============================================
echo.

:: ─── 1. Start Hardhat Node ───────────────────
echo [1/5] Starting Hardhat local node...
start "Hardhat Node" cmd /k "cd /d e:\blindbid-protocol\contracts && npx hardhat node"

:: Wait for node to be ready (check if port 8545 is listening)
echo       Waiting for Hardhat node to be ready...
:WAIT_NODE
timeout /t 2 /nobreak >nul
powershell -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient; $tcp.Connect('127.0.0.1', 8545); $tcp.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo       ... still waiting for node on port 8545
    goto WAIT_NODE
)
echo       Hardhat node is ready on port 8545!
echo.

:: ─── 2. Deploy Contracts ─────────────────────
echo [2/5] Deploying contracts to localhost...
cd /d e:\blindbid-protocol\contracts
call npm run deploy
if errorlevel 1 (
    echo [ERROR] Contract deployment failed!
    pause
    exit /b 1
)
echo       Contracts deployed successfully!
echo.

:: ─── 3. Mint NFTs ────────────────────────────
echo [3/5] Minting MonkeyNFTs...
call npm run mint
if errorlevel 1 (
    echo [ERROR] Minting failed!
    pause
    exit /b 1
)
echo       NFTs minted successfully!
echo.

:: ─── 4. Start Backend ────────────────────────
echo [4/5] Starting backend server...
start "Backend Server" cmd /k "cd /d e:\blindbid-protocol\backend && npm run dev"
timeout /t 3 /nobreak >nul
echo       Backend server started!
echo.

:: ─── 5. Start Frontend ──────────────────────
echo [5/5] Starting frontend dev server...
start "Frontend Dev" cmd /k "cd /d e:\blindbid-protocol\frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo       Frontend dev server started!
echo.

echo ============================================
echo   All services are running!
echo ============================================
echo.
echo   Hardhat Node  :  http://localhost:8545
echo   Backend       :  http://localhost:5000
echo   Frontend      :  http://localhost:5173
echo.
echo   Close this window or press any key to exit.
echo   (Services will keep running in their own windows)
echo ============================================
pause
