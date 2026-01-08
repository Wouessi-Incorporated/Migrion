<#
.SYNOPSIS
    Starts the Migrion application locally.

.DESCRIPTION
    Checks for required ports, cleans up existing processes, and starts the development server.
#>

function Stop-PortProcess {
    param (
        [int]$Port
    )
    $Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    foreach ($Connection in $Connections) {
        $ProcessId = $Connection.OwningProcess
        if ($ProcessId -gt 0) {
            Write-Host "Killing process $ProcessId on port $Port..." -ForegroundColor Yellow
            Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Initializing Local Environment..." -ForegroundColor Cyan

# Cleanup ports
Stop-PortProcess -Port 3000
Stop-PortProcess -Port 4000

# Start App
Write-Host "Starting Migrion App (API: 4000, Web: 3000)..." -ForegroundColor Green
npm run dev
