# MIGRION V13 - Local Development Startup Script
# This script starts the application locally without Docker using SQLite

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MIGRION V13 - Local Development Setup                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$OriginalLocation = Get-Location
$ScriptRoot = $PSScriptRoot

try {
    Set-Location -Path $ScriptRoot
    
    # Step 1: Configure API for local development
    Write-Host "📝 Step 1: Configuring API for local development..." -ForegroundColor Yellow
    
    $apiEnvContent = @"
PORT=4000
APP_ORIGIN=http://localhost:3000
DATABASE_URL=file:./dev.db
JWT_SECRET=change_me_strong_local_dev_$(Get-Random)
ESCROW_WEBHOOK_SECRET=change_me_escrow_local_$(Get-Random)
"@
    
    Set-Content -Path "apps\api\.env" -Value $apiEnvContent -Force
    Write-Host "✅ API .env configured with SQLite" -ForegroundColor Green
    
    # Update schema to use SQLite
    $schemaPath = "apps\api\prisma\schema.prisma"
    $schemaContent = Get-Content $schemaPath -Raw
    $schemaContent = $schemaContent -replace 'provider = "postgresql"', 'provider = "sqlite"'
    Set-Content -Path $schemaPath -Value $schemaContent -Force
    Write-Host "✅ Prisma schema updated to use SQLite" -ForegroundColor Green
    
    # Step 2: Configure Web
    Write-Host "`n📝 Step 2: Configuring Web application..." -ForegroundColor Yellow
    
    $webEnvContent = @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CMS_URL=http://localhost:8055
NEXT_PUBLIC_SUPPORTED_LOCALES=en,fr,de
"@
    
    Set-Content -Path "apps\web\.env" -Value $webEnvContent -Force
    Write-Host "✅ Web .env configured" -ForegroundColor Green
    
    # Step 3: Initialize Database
    Write-Host "`n📝 Step 3: Initializing database..." -ForegroundColor Yellow
    Set-Location "apps\api"
    
    Write-Host "  → Generating Prisma client..." -ForegroundColor Gray
    npx prisma generate | Out-Null
    
    Write-Host "  → Running migrations..." -ForegroundColor Gray
    npx prisma migrate dev --name init --skip-generate | Out-Null
    
    Write-Host "  → Seeding database..." -ForegroundColor Gray
    npm run seed | Out-Null
    
    Set-Location $ScriptRoot
    Write-Host "✅ Database initialized and seeded" -ForegroundColor Green
    
    # Step 4: Kill any processes on ports 3000 and 4000
    Write-Host "`n📝 Step 4: Clearing ports..." -ForegroundColor Yellow
    npx -y kill-port 3000 4000 2>$null | Out-Null
    Write-Host "✅ Ports 3000 and 4000 cleared" -ForegroundColor Green
    
    # Step 5: Start the application
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   Starting MIGRION V13...                                 ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
    Write-Host "   Web:  http://localhost:3000" -ForegroundColor White
    Write-Host "   API:  http://localhost:4000/health" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Test Credentials:" -ForegroundColor Cyan
    Write-Host "   Admin:     admin@migrion.local / ChangeMeNow123!" -ForegroundColor White
    Write-Host "   Candidate: candidate@migrion.local / ChangeMeNow123!" -ForegroundColor White
    Write-Host "   Employer:  employer@migrion.local / ChangeMeNow123!" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
    Write-Host ""
    
    # Start both API and Web
    npm run dev
    
} catch {
    Write-Error "Failed to start application: $_"
    exit 1
} finally {
    Set-Location -Path $OriginalLocation
}
