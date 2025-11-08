#!/bin/bash

# Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"
OVERRIDE_FILE="docker-compose.override.prod.yml"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "Dependencies check passed"
}

check_environment() {
    log_info "Checking environment configuration..."

    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file '$ENV_FILE' not found!"
        log_info "Copy 'env.production.template' to '$ENV_FILE' and configure your variables"
        exit 1
    fi

    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a

    # Check critical environment variables
    required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "CORS_ORIGIN")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" = "your_secure_*" ]; then
            log_error "Required environment variable '$var' is not set or using default value"
            exit 1
        fi
    done

    log_success "Environment configuration check passed"
}

validate_secrets() {
    log_info "Validating secrets..."

    # Check JWT secret length
    if [ ${#JWT_SECRET} -lt 32 ]; then
        log_error "JWT_SECRET must be at least 32 characters long"
        exit 1
    fi

    if [ ${#JWT_REFRESH_SECRET} -lt 32 ]; then
        log_error "JWT_REFRESH_SECRET must be at least 32 characters long"
        exit 1
    fi

    # Check PostgreSQL password strength
    if [ ${#POSTGRES_PASSWORD} -lt 12 ]; then
        log_warning "POSTGRES_PASSWORD is shorter than recommended (12+ characters)"
    fi

    log_success "Secrets validation passed"
}

backup_database() {
    log_info "Creating pre-deployment database backup..."

    # Check if we have existing containers
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_info "Stopping existing containers for backup..."
        docker-compose -f "$COMPOSE_FILE" stop backend

        # Create backup
        log_info "Creating database backup..."
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres -d physician_dashboard_2035 > "backup-pre-deployment-$(date +%Y%m%d-%H%M%S).sql"

        log_success "Database backup created"
    else
        log_warning "No existing containers found, skipping database backup"
    fi
}

build_images() {
    log_info "Building Docker images..."

    # Build with no cache for production
    docker-compose -f "$COMPOSE_FILE" build --no-cache

    log_success "Docker images built successfully"
}

run_migrations() {
    log_info "Running database migrations..."

    # Start only postgres temporarily
    docker-compose -f "$COMPOSE_FILE" up -d postgres

    # Wait for postgres to be healthy
    log_info "Waiting for PostgreSQL to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres -d physician_dashboard_2035 >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -le 0 ]; then
        log_error "PostgreSQL failed to start within 60 seconds"
        exit 1
    fi

    # Run migrations
    docker-compose -f "$COMPOSE_FILE" run --rm backend npm run migrate

    log_success "Database migrations completed"
}

start_services() {
    log_info "Starting production services..."

    # Start all services
    docker-compose -f "$COMPOSE_FILE" -f "$OVERRIDE_FILE" up -d

    log_success "Services started successfully"
}

health_check() {
    log_info "Performing health checks..."

    # Wait for services to be healthy
    log_info "Waiting for backend to be healthy..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:${BACKEND_PORT:-3000}/health/live >/dev/null 2>&1; then
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done

    if [ $timeout -le 0 ]; then
        log_error "Backend health check failed"
        exit 1
    fi

    log_success "Health checks passed"
}

cleanup() {
    log_info "Cleaning up old Docker images..."

    # Remove unused images
    docker image prune -f

    log_success "Cleanup completed"
}

show_status() {
    log_info "Deployment status:"
    docker-compose -f "$COMPOSE_FILE" ps

    log_success "Production deployment completed successfully!"
    log_info ""
    log_info "Services are running on:"
    log_info "  - Backend API: http://localhost:${BACKEND_PORT:-3000}"
    log_info "  - PostgreSQL: localhost:${POSTGRES_PORT:-5432}"
    log_info "  - Redis: localhost:${REDIS_PORT:-6379}"
    if [ -n "$PROMETHEUS_ENABLED" ]; then
        log_info "  - Prometheus: http://localhost:9090"
        log_info "  - Grafana: http://localhost:3001"
    fi
    log_info ""
    log_info "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
    log_info "To stop services: docker-compose -f $COMPOSE_FILE down"
}

# Main deployment process
main() {
    log_info "Starting production deployment..."

    check_dependencies
    check_environment
    validate_secrets
    backup_database
    build_images
    run_migrations
    start_services
    health_check
    cleanup
    show_status

    log_success "🎉 Production deployment completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    "status")
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "stop")
        log_info "Stopping production services..."
        docker-compose -f "$COMPOSE_FILE" down
        log_success "Services stopped"
        ;;
    "restart")
        log_info "Restarting production services..."
        docker-compose -f "$COMPOSE_FILE" restart
        log_success "Services restarted"
        ;;
    "backup")
        backup_database
        ;;
    *)
        main
        ;;
esac
