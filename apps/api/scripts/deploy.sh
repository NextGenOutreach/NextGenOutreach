#!/bin/bash

# Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on any error

echo "🚀 Starting NextGenOutreach Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the API directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production with your production environment variables"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    print_error "docker-compose is not installed"
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p backups
mkdir -p ssl
mkdir -p monitoring/grafana/{dashboards,datasources}

# Generate secrets if not set
print_status "Checking environment variables..."
source .env.production

if [ "$JWT_SECRET" = "CHANGE_THIS_IN_PRODUCTION_USE_32_CHAR_SECRET" ]; then
    print_warning "Generating new JWT secrets..."
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 32)
    
    # Update the .env.production file
    sed -i "s/CHANGE_THIS_IN_PRODUCTION_USE_32_CHAR_SECRET/$JWT_SECRET/" .env.production
    sed -i "s/CHANGE_THIS_IN_PRODUCTION_USE_32_CHAR_REFRESH_SECRET/$JWT_REFRESH_SECRET/" .env.production
    sed -i "s/CHANGE_THIS_TO_32_CHAR_SESSION_SECRET/$SESSION_SECRET/" .env.production
    
    print_status "Generated new secrets and updated .env.production"
fi

# Check required variables
required_vars=("DATABASE_URL" "JWT_SECRET" "ADMIN_EMAIL" "ADMIN_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == CHANGE_* ]]; then
        print_error "Required environment variable $var is not set properly in .env.production"
        exit 1
    fi
done

# Backup current database if exists
print_status "Creating database backup..."
if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres nextgen_outreach > "backups/pre-deployment-$(date +%Y%m%d-%H%M%S).sql"
    print_status "Database backup created"
fi

# Build and deploy
print_status "Building and deploying containers..."

# Pull latest images
print_status "Pulling latest base images..."
docker-compose -f docker-compose.prod.yml pull

# Build application
print_status "Building application..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing services
print_status "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Start database and wait for it to be ready
print_status "Starting database..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10
until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres; do
    echo "Waiting for postgres..."
    sleep 2
done

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# Start all services
print_status "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check API health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "✅ API is healthy"
else
    print_error "❌ API health check failed"
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
fi

# Check database health
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_status "✅ Database is healthy"
else
    print_error "❌ Database health check failed"
    exit 1
fi

# Check Redis health
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_status "✅ Redis is healthy"
else
    print_error "❌ Redis health check failed"
    exit 1
fi

# Show service status
print_status "Service status:"
docker-compose -f docker-compose.prod.yml ps

# Final deployment information
echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📊 Monitoring URLs:"
echo "  - API: http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo "  - Health Check: http://localhost:3001/health"
echo "  - Grafana: http://localhost:3001 (if enabled)"
echo "  - Prometheus: http://localhost:9090 (if enabled)"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart: docker-compose -f docker-compose.prod.yml restart [service]"
echo ""
print_warning "Don't forget to:"
echo "  - Set up SSL certificates in ./ssl/"
echo "  - Configure your domain DNS"
echo "  - Set up monitoring alerts"
echo "  - Test all functionality"
