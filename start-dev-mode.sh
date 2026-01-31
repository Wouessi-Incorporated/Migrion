#!/bin/bash

# Migrion Development Mode Startup Script
# This script bypasses build issues and starts the services in development mode

set -e

echo "🚀 Starting Migrion in Development Mode..."
echo "=============================================="

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
    local max_attempts=20
    local attempt=1

    print_status "Checking $service_name availability..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi

        echo -n "."
        sleep 3
        attempt=$((attempt + 1))
    done

    print_warning "$service_name is not ready yet, but continuing..."
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    docker compose -f docker-compose.dev.yml down
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup EXIT INT TERM

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if compose file exists
if [ ! -f "docker-compose.dev.yml" ]; then
    print_error "docker-compose.dev.yml not found. Please ensure you're in the correct directory."
    exit 1
fi

print_status "Stopping any existing containers..."
docker compose -f docker-compose.dev.yml down --remove-orphans

print_warning "DEVELOPMENT MODE ACTIVE"
print_warning "This bypasses Next.js build issues for quick testing"
echo ""

print_status "Starting essential services..."

# Start databases first
print_status "Starting PostgreSQL..."
docker compose -f docker-compose.dev.yml up -d postgres

print_status "Starting Redis..."
docker compose -f docker-compose.dev.yml up -d redis

# Wait for databases
print_status "Waiting for databases to be ready..."
sleep 10

# Start API service
print_status "Starting API service..."
docker compose -f docker-compose.dev.yml up -d api

# Wait for API
print_status "Waiting for API to be ready..."
sleep 15
check_service "API" "http://localhost:4000/health"

# Start supporting services in background
print_status "Starting supporting services..."
docker compose -f docker-compose.dev.yml up -d directus n8n adminer

print_success "Background services are starting..."

# Show service status
echo ""
print_status "Development Service Status:"
echo "├── PostgreSQL:  http://localhost:5432 (DB)"
echo "├── Redis:       http://localhost:6379 (Cache)"
echo "├── API:         http://localhost:4000 (Backend)"
echo "├── Directus:    http://localhost:8055 (CMS)"
echo "├── n8n:         http://localhost:5678 (Automation)"
echo "└── Adminer:     http://localhost:8080 (DB Admin)"
echo ""

# Start frontend in development mode (foreground)
print_status "Starting Frontend in Development Mode..."
print_success "Frontend will be available at: http://localhost:3000"
echo ""
echo "🎉 Development Frontend starting..."
echo "📱 Open http://localhost:3000 in your browser"
echo "🔧 API available at http://localhost:4000"
echo "⚡ All services running in development mode"
echo ""
echo "🚨 DEVELOPMENT MODE FEATURES:"
echo "   • Bypasses Next.js build issues"
echo "   • Simple fallback frontend"
echo "   • Hot reload disabled"
echo "   • Suitable for Docker testing"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=============================================="

# Start web service in foreground
docker compose -f docker-compose.dev.yml up web

print_status "Shutting down all services..."
docker compose -f docker-compose.dev.yml down
print_success "All development services stopped."
