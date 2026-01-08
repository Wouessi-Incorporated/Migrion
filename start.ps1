<#
.SYNOPSIS
    Starts the Migrion V13 application infrastructure.

.DESCRIPTION
    This script initializes the Migrion V13 application by:
    1. Ensuring .env files exist for API and Web
    2. Starting all services via docker-compose
    3. Initializing the database with Prisma migrations
    4. Seeding initial data
#>
function Start-MigrionApp {
    [CmdletBinding()]
    param (
        [Switch]$Build = $true,
        [Switch]$Detached = $true,
        [Switch]$SkipInit = $false
    )

    $OriginalLocation = Get-Location
    $ScriptRoot = $PSScriptRoot

    try {
        Write-Host "Starting Migrion V13 App..." -ForegroundColor Cyan
        Set-Location -Path $ScriptRoot

        # Ensure .env files exist
        if (-not (Test-Path "apps\api\.env")) {
            Write-Host "Creating API .env file..." -ForegroundColor Yellow
            Copy-Item "apps\api\.env.example" "apps\api\.env"
        }
        if (-not (Test-Path "apps\web\.env")) {
            Write-Host "Creating Web .env file..." -ForegroundColor Yellow
            Copy-Item "apps\web\.env.example" "apps\web\.env"
        }

        # Start docker-compose
        $ComposeArgs = @("up")
        if ($Build) { $ComposeArgs += "--build" }
        if ($Detached) { $ComposeArgs += "-d" }

        Write-Host "Starting Docker services..." -ForegroundColor Green
        docker compose @ComposeArgs

        if (-not $SkipInit -and $Detached) {
            Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10

            Write-Host "Initializing database..." -ForegroundColor Green
            docker compose exec -T api npx prisma migrate dev --name init

            Write-Host "Seeding database..." -ForegroundColor Green
            docker compose exec -T api npm run seed

            Write-Host "`n✓ Migrion V13 is running!" -ForegroundColor Green
            Write-Host "  Web:      http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  API:      http://localhost:4000/health" -ForegroundColor Cyan
            Write-Host "  Directus: http://localhost:8055" -ForegroundColor Cyan
            Write-Host "  n8n:      http://localhost:5678" -ForegroundColor Cyan
            Write-Host "  Adminer:  http://localhost:8080" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Error "Failed to start application: $_"
    }
    finally {
        Set-Location -Path $OriginalLocation
    }
}

# Invoking the function to maintain original script behavior
Start-MigrionApp
