# Start Local
Write-Host "Starting project locally..."
Write-Host "Ensure you have a Postgres database running at localhost:5432 (or update apps/api/.env)"
Write-Host "Ensure you have a Redis instance running at localhost:6379 (or update apps/api/.env)"
npm run dev
