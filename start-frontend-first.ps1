# Migrion Frontend-First Startup Script (PowerShell)
# This script starts the frontend first and runs other services in background

param(
    [switch]$Help,
    [switch]$Clean,
    [switch]$Build
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Show-Help {
    Write-Host @"
Migrion Frontend-First Startup Script

USAGE:
    .\start-frontend-first.ps1 [OPTIONS]

OPTIONS:
    -Help     Show this help message
    -Clean    Clean all containers and volumes before starting
    -Build    Force rebuild of all images

EXAMPLES:
    .\start-frontend-first.ps1          # Normal startup
    .\start-frontend-first.ps1 -Clean   # Clean startup
    .\start-frontend-first.ps1 -Build   # Rebuild and start

SERVICES:
    Frontend:    http://localhost:3000
    API:         http://localhost:4000
    Directus:    http://localhost:8055
    n8n:         http://localhost:5678
    Adminer:     http://localhost:8080
"@
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxAttempts = 30
    )

    Write-Status "Checking $ServiceName availability..."

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "$ServiceName is ready!"
                return $true
            }
        }
        catch {
            # Service not ready yet
        }

        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    Write-Warning "$ServiceName is not ready yet, but continuing..."
    return $false
}

function Stop-AllServices {
    Write-Status "Stopping all services..."
    try {
        docker compose -f docker-start-frontend-first.yml down --remove-orphans 2>$null
        Write-Success "All services stopped."
    }
    catch {
        Write-Warning "Some services may still be running."
    }
}

# Handle Ctrl+C gracefully
$cleanup = {
    Write-Host ""
    Write-Status "Received interrupt signal. Cleaning up..."
    Stop-AllServices
    exit 0
}

# Register cleanup on Ctrl+C
[Console]::CancelKeyPress += $cleanup

try {
    # Show help if requested
    if ($Help) {
        Show-Help
        exit 0
    }

    Write-Host "🚀 Starting Migrion with Frontend-First approach..." -ForegroundColor $Green
    Write-Host "==================================================" -ForegroundColor $Blue

    # Check if Docker is running
    try {
        docker info 2>$null | Out-Null
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        exit 1
    }

    # Check if compose file exists
    if (-not (Test-Path "docker-start-frontend-first.yml")) {
        Write-Error "docker-start-frontend-first.yml not found. Please ensure you're in the correct directory."
        exit 1
    }

    # Clean up if requested
    if ($Clean) {
        Write-Status "Cleaning all containers and volumes..."
        docker compose -f docker-start-frontend-first.yml down -v --remove-orphans 2>$null
        docker system prune -f 2>$null
    }
    else {
        Write-Status "Stopping any existing containers..."
        docker compose -f docker-start-frontend-first.yml down --remove-orphans 2>$null
    }

    $buildFlag = ""
    if ($Build) {
        $buildFlag = "--build"
        Write-Status "Force rebuilding all images..."
    }

    Write-Status "Building and starting background services..."

    # Start essential services first (databases)
    Write-Status "Starting PostgreSQL..."
    docker compose -f docker-start-frontend-first.yml up -d postgres

    Write-Status "Starting Redis..."
    docker compose -f docker-start-frontend-first.yml up -d redis

    # Wait for databases to be ready
    Test-ServiceHealth -ServiceName "PostgreSQL" -Url "http://localhost:5432" | Out-Null
    Start-Sleep -Seconds 5

    # Start API service
    Write-Status "Starting API service..."
    if ($Build) {
        docker compose -f docker-start-frontend-first.yml up -d --build api
    }
    else {
        docker compose -f docker-start-frontend-first.yml up -d api
    }

    # Wait for API to be ready
    Test-ServiceHealth -ServiceName "API" -Url "http://localhost:4000/health"

    # Start supporting services in background
    Write-Status "Starting supporting services in background..."
    docker compose -f docker-start-frontend-first.yml up -d directus n8n adminer

    Write-Success "Background services are starting up..."

    # Show service status
    Write-Host ""
    Write-Status "Service Status:"
    Write-Host "├── PostgreSQL:  http://localhost:5432"
    Write-Host "├── Redis:       http://localhost:6379"
    Write-Host "├── API:         http://localhost:4000"
    Write-Host "├── Directus:    http://localhost:8055"
    Write-Host "├── n8n:         http://localhost:5678"
    Write-Host "└── Adminer:     http://localhost:8080"
    Write-Host ""

    # Finally, start the frontend in foreground
    Write-Status "Starting Frontend (Next.js) in foreground..."
    Write-Success "Frontend will be available at: http://localhost:3000"
    Write-Host ""
    Write-Host "🎉 Frontend is starting up..." -ForegroundColor $Green
    Write-Host "📱 Open http://localhost:3000 in your browser" -ForegroundColor $Yellow
    Write-Host "🔧 API available at http://localhost:4000" -ForegroundColor $Yellow
    Write-Host "⚡ All other services running in background" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor $Red
    Write-Host "==================================================" -ForegroundColor $Blue

    # Start web service in foreground (this will keep the script running)
    if ($Build) {
        docker compose -f docker-start-frontend-first.yml up --build web
    }
    else {
        docker compose -f docker-start-frontend-first.yml up web
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Stop-AllServices
    exit 1
}
finally {
    Write-Status "Shutting down all services..."
    Stop-AllServices
}
