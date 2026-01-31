#!/bin/bash

# Migrion Frontend-First Startup Script
# This script starts the frontend first and runs other services in background

set -e

echo "🚀 Starting Migrion with Frontend-First approach..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    print_status "Checking $service_name availability..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_warning "$service_name is not ready yet, but continuing..."
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    docker compose -f docker-start-frontend-first.yml down
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup EXIT INT TERM

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "docker-start-frontend-first.yml" ]; then
    print_error "docker-start-frontend-first.yml not found. Please ensure you're in the correct directory."
    exit 1
fi

print_status "Stopping any existing containers..."
docker compose -f docker-start-frontend-first.yml down --remove-orphans

print_status "Building and starting background services..."

# Start essential services first (databases)
print_status "Starting PostgreSQL..."
docker compose -f docker-start-frontend-first.yml up -d postgres

print_status "Starting Redis..."
docker compose -f docker-start-frontend-first.yml up -d redis

# Wait for databases to be ready
check_service "PostgreSQL" "http://localhost:5432"
check_service "Redis" "http://localhost:6379"

# Start API service
print_status "Starting API service..."
docker compose -f docker-start-frontend-first.yml up -d api

# Wait for API to be ready
check_service "API" "http://localhost:4000/health"

# Start supporting services in background
print_status "Starting supporting services in background..."
docker compose -f docker-start-frontend-first.yml up -d directus n8n adminer

print_success "Background services are starting up..."

# Show service status
echo ""
print_status "Service Status:"
echo "├── PostgreSQL:  http://localhost:5432"
echo "├── Redis:       http://localhost:6379"
echo "├── API:         http://localhost:4000"
echo "├── Directus:    http://localhost:8055"
echo "├── n8n:         http://localhost:5678"
echo "└── Adminer:     http://localhost:8080"
echo ""

# Finally, start the frontend in foreground
print_status "Starting Frontend (Next.js) in foreground..."
print_success "Frontend will be available at: http://localhost:3000"
echo ""
echo "🎉 Frontend is starting up..."
echo "📱 Open http://localhost:3000 in your browser"
echo "🔧 API available at http://localhost:4000"
echo "⚡ All other services running in background"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Start web service in foreground (this will keep the script running)
docker compose -f docker-start-frontend-first.yml up web

print_status "Shutting down all services..."
docker compose -f docker-start-frontend-first.yml down
print_success "All services stopped."
