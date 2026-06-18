@echo off
echo ========================================
echo UrCheck Database Setup Script
echo ========================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not running.
    echo Please install Docker Desktop and start it.
    pause
    exit /b 1
)

echo [1/4] Starting PostgreSQL container...
cd /d "D:\Docker Compose"
docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start Docker container.
    pause
    exit /b 1
)

echo [OK] PostgreSQL container started
echo.

REM Wait for PostgreSQL to be ready
echo [2/4] Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul

REM Check if we can connect
echo Testing connection...
docker-compose exec -T postgres pg_isready -U admin >nul 2>&1
if errorlevel 1 (
    echo [WARN] PostgreSQL might still be starting...
    echo Waiting a bit longer...
    timeout /t 5 /nobreak >nul
)

echo [OK] PostgreSQL is ready
echo.

REM Generate Prisma client
echo [3/4] Generating Prisma client...
cd /d "D:\Thuc tap\urcheck\urcheck"
npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

REM Run migrations
echo [4/4] Running database migrations...
npx prisma migrate dev --name init
if errorlevel 1 (
    echo [ERROR] Failed to run migrations
    pause
    exit /b 1
)
echo [OK] Migrations applied
echo.

REM Seed database
echo.
echo [5/5] Seeding database with sample data...
npm run seed
if errorlevel 1 (
    echo [ERROR] Failed to seed database
    pause
    exit /b 1
)
echo [OK] Database seeded
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the development server: npm run dev
echo 2. Open http://localhost:3000 in your browser
echo 3. Check TASKS_PLAN.md for remaining tasks
echo.
pause
