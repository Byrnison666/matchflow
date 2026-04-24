@echo off
chcp 65001 >nul
title MatchFlow — Dev

echo.
echo ========================================
echo   MatchFlow — Запуск Dev-окружения
echo ========================================
echo.

REM --- Проверка .env ---
if not exist "matchflow-backend\.env" (
    echo [ОШИБКА] matchflow-backend\.env не найден.
    echo Сначала запусти setup.bat
    pause
    exit /b 1
)

REM --- Запуск / проверка контейнеров ---
echo Запускаю контейнеры...
docker compose up -d >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Не удалось запустить Docker-контейнеры.
    echo Убедись что Docker Desktop запущен.
    pause
    exit /b 1
)

REM --- Ждём PostgreSQL ---
echo Жду PostgreSQL...
:wait_pg
docker exec matchflow-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_pg
)
echo [OK] PostgreSQL готов.
echo [OK] Redis готов.

REM --- Запуск бэкенда в отдельном окне ---
echo.
echo Открываю окно Backend  ^(порт 3001^)...
start "MatchFlow Backend" cmd /k "cd /d %~dp0matchflow-backend && bun run start:dev"

REM --- Небольшая пауза, чтобы бэкенд успел стартовать ---
timeout /t 3 /nobreak >nul

REM --- Запуск фронтенда в отдельном окне ---
echo Открываю окно Frontend ^(порт 3000^)...
start "MatchFlow Frontend" cmd /k "cd /d %~dp0matchflow-frontend && bun run dev"

echo.
echo ========================================
echo   Сервисы запущены:
echo.
echo   Frontend  ->  http://localhost:3000
echo   Backend   ->  http://localhost:3001
echo   PgAdmin   ->  подключись к localhost:5432
echo              логин: postgres / password: password
echo.
echo   Закрой это окно когда захочешь.
echo   Окна Backend и Frontend работают независимо.
echo ========================================
echo.
pause
