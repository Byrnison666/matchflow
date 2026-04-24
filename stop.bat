@echo off
chcp 65001 >nul
title MatchFlow — Stop

echo.
echo Останавливаю контейнеры MatchFlow...
docker compose stop
echo [OK] PostgreSQL и Redis остановлены.
echo.
echo Данные сохранены в Docker volumes.
echo Для полного удаления данных: docker compose down -v
echo.
pause
