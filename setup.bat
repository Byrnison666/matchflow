@echo off
chcp 65001 >nul
title MatchFlow - Setup

echo.
echo ========================================
echo   MatchFlow - Первичная настройка
echo ========================================
echo.

REM --- Проверка Docker ---
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Docker не найден.
    echo Скачай и установи: https://www.docker.com/products/docker-desktop
    echo Затем перезапусти этот скрипт.
    pause
    exit /b 1
)
echo [OK] Docker найден.

REM --- Проверка Bun ---
bun --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Bun не найден.
    echo Установи: https://bun.sh  или выполни: powershell -c "irm bun.sh/install.ps1 | iex"
    pause
    exit /b 1
)
echo [OK] Bun найден.

REM --- Создание .env для бэкенда ---
if not exist "matchflow-backend\.env" (
    echo.
    echo Создаю matchflow-backend\.env из .env.example...
    copy "matchflow-backend\.env.example" "matchflow-backend\.env" >nul
    echo [OK] Файл создан. Отредактируй при необходимости: matchflow-backend\.env
) else (
    echo [OK] matchflow-backend\.env уже существует.
)

REM --- Создание .env для фронтенда ---
if not exist "matchflow-frontend\.env.local" (
    echo.
    echo Создаю matchflow-frontend\.env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:3001
        echo NEXT_PUBLIC_WS_URL=http://localhost:3001
    ) > "matchflow-frontend\.env.local"
    echo [OK] matchflow-frontend\.env.local создан.
) else (
    echo [OK] matchflow-frontend\.env.local уже существует.
)

REM --- Запуск контейнеров ---
echo.
echo Запускаю PostgreSQL и Redis...
docker compose up -d
if errorlevel 1 (
    echo [ОШИБКА] Не удалось запустить контейнеры. Проверь docker-compose.yml
    pause
    exit /b 1
)
echo [OK] Контейнеры запущены.

REM --- Ждём PostgreSQL ---
echo Жду готовности PostgreSQL...
:wait_pg
docker exec matchflow-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_pg
)
echo [OK] PostgreSQL готов.

REM --- Установка зависимостей бэкенда ---
echo.
echo Устанавливаю зависимости бэкенда...
cd matchflow-backend
bun install --frozen-lockfile 2>nul || bun install
cd ..
echo [OK] Backend deps установлены.

REM --- Установка зависимостей фронтенда ---
echo.
echo Устанавливаю зависимости фронтенда...
cd matchflow-frontend
bun install --frozen-lockfile 2>nul || bun install
cd ..
echo [OK] Frontend deps установлены.

REM --- Миграции ---
echo.
echo Применяю миграции БД...
cd matchflow-backend
bun run migration:run
if errorlevel 1 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Миграция не прошла. Если БД уже настроена - игнорируй.
)
cd ..

echo.
echo ========================================
echo   Setup завершён!
echo   Теперь запускай: start.bat
echo ========================================
echo.
pause
