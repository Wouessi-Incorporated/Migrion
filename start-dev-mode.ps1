# Migrion Development Mode Startup Script (PowerShell)
# This script bypasses build issues and starts the services in development mode

param(
    [switch]$Help,
    [switch]$Clean,
    [switch]$Rebuild
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
Migrion Development Mode Startup Script

DESCRIPTION:
    This script bypasses Next.js build issues and starts services in development mode
    with a simple fallback frontend for Docker testing.

USAGE:
    .\start-dev-mode.ps1 [OPTIONS]

OPTIONS:
    -Help       Show this help message
    -Clean      Clean all containers and volumes before starting
    -Rebuild    Force rebuild of all images

EXAMPLES:
    .\start-dev-mode.ps1              # Normal development startup
    .\start-dev-mode.ps1 -Clean       # Clean startup
    .\start-dev-mode.ps1 -Rebuild     # Rebuild and start

DEVELOPMENT SERVICES:
    Frontend:    http://localhost:3000 (Development fallback)
    API:         http://localhost:4000
    PostgreSQL:  http://localhost:5432
    Redis:       http://localhost:6379
    Directus:    http://localhost:8055
    n8n:         http://localhost:5678
    Adminer:     http://localhost:8080

FEATURES:
    • Bypasses Next.js build errors
    • Simple fallback frontend
    • Fast Docker testing
    • All services in development mode
"@
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxAttempts = 20
    )

    Write-Status "Checking $ServiceName availability..."

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "$ServiceName is ready!"
                return $true
            }
        }
        catch {
            # Service not ready yet
        }

        Write-Host "." -NoNewline
        Start-Sleep -Seconds 3
    }

    Write-Warning "$ServiceName is not ready yet, but continuing..."
    return $false
}

function Stop-AllServices {
    Write-Status "Stopping all development services..."
    try {
        docker compose -f docker-compose.dev.yml down --remove-orphans 2>$null
        Write-Success "All development services stopped."
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

    Write-Host "🚀 Starting Migrion in Development Mode..." -ForegroundColor $Green
    Write-Host "==============================================" -ForegroundColor $Blue

    # Check if Docker is running
    try {
        docker info 2>$null | Out-Null
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        exit 1
    }

    # Check if compose file exists
    if (-not (Test-Path "docker-compose.dev.yml")) {
        Write-Error "docker-compose.dev.yml not found. Please ensure you're in the correct directory."
        exit 1
    }

    # Clean up if requested
    if ($Clean) {
        Write-Status "Cleaning all containers and volumes..."
        docker compose -f docker-compose.dev.yml down -v --remove-orphans 2>$null
        docker system prune -f 2>$null
    }
    else {
        Write-Status "Stopping any existing containers..."
        docker compose -f docker-compose.dev.yml down --remove-orphans 2>$null
    }

    Write-Warning "DEVELOPMENT MODE ACTIVE"
    Write-Warning "This bypasses Next.js build issues for quick testing"
    Write-Host ""

    $buildFlag = ""
    if ($Rebuild) {
        $buildFlag = "--build"
        Write-Status "Force rebuilding all images..."
    }

    Write-Status "Starting essential services..."

    # Start databases first
    Write-Status "Starting PostgreSQL..."
    if ($Rebuild) {
        docker compose -f docker-compose.dev.yml up -d --build postgres
    }
    else {
        docker compose -f docker-compose.dev.yml up -d postgres
    }

    Write-Status "Starting Redis..."
    docker compose -f docker-compose.dev.yml up -d redis

    # Wait for databases
    Write-Status "Waiting for databases to be ready..."
    Start-Sleep -Seconds 10

    # Start API service
    Write-Status "Starting API service..."
    if ($Rebuild) {
        docker compose -f docker-compose.dev.yml up -d --build api
    }
    else {
        docker compose -f docker-compose.dev.yml up -d api
    }

    # Wait for API
    Write-Status "Waiting for API to be ready..."
    Start-Sleep -Seconds 15
    Test-ServiceHealth -ServiceName "API" -Url "http://localhost:4000/health"

    # Start supporting services
    Write-Status "Starting supporting services..."
    docker compose -f docker-compose.dev.yml up -d directus n8n adminer

    Write-Success "Background services are starting..."

    # Show service status
    Write-Host ""
    Write-Status "Development Service Status:"
    Write-Host "├── PostgreSQL:  http://localhost:5432 (DB)"
    Write-Host "├── Redis:       http://localhost:6379 (Cache)"
    Write-Host "├── API:         http://localhost:4000 (Backend)"
    Write-Host "├── Directus:    http://localhost:8055 (CMS)"
    Write-Host "├── n8n:         http://localhost:5678 (Automation)"
    Write-Host "└── Adminer:     http://localhost:8080 (DB Admin)"
    Write-Host ""

    # Start frontend in development mode (foreground)
    Write-Status "Starting Frontend in Development Mode..."
    Write-Success "Frontend will be available at: http://localhost:3000"
    Write-Host ""
    Write-Host "🎉 Development Frontend starting..." -ForegroundColor $Green
    Write-Host "📱 Open http://localhost:3000 in your browser" -ForegroundColor $Yellow
    Write-Host "🔧 API available at http://localhost:4000" -ForegroundColor $Yellow
    Write-Host "⚡ All services running in development mode" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "🚨 DEVELOPMENT MODE FEATURES:" -ForegroundColor $Red
    Write-Host "   • Bypasses Next.js build issues"
    Write-Host "   • Simple fallback frontend"
    Write-Host "   • Hot reload disabled"
    Write-Host "   • Suitable for Docker testing"
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor $Red
    Write-Host "==============================================" -ForegroundColor $Blue

    # Start web service in foreground
    if ($Rebuild) {
        docker compose -f docker-compose.dev.yml up --build web
    }
    else {
        docker compose -f docker-compose.dev.yml up web
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Stop-AllServices
    exit 1
}
finally {
    Write-Status "Shutting down all development services..."
    Stop-AllServices
}
