<#
.SYNOPSIS
    Starts the Migrion application infrastructure.

.DESCRIPTION
    This function initializes the application by navigating to the infrastructure directory
    and executing the docker-compose startup sequence.
#>
function Start-MigrionApp {
    [CmdletBinding()]
    param (
        [Switch]$Build = $true,
        [Switch]$Detached = $false
    )

    $OriginalLocation = Get-Location
    $ScriptRoot = $PSScriptRoot
    $InfraPath = Join-Path -Path $ScriptRoot -ChildPath "infra"

    try {
        if (-not (Test-Path -Path $InfraPath)) {
            throw "Infrastructure directory not found at: $InfraPath"
        }

        Write-Host "Starting Migrion App..." -ForegroundColor Cyan
        Set-Location -Path $InfraPath

        $ComposeArgs = @("up")
        if ($Build) { $ComposeArgs += "--build" }
        if ($Detached) { $ComposeArgs += "-d" }

        docker compose @ComposeArgs
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
