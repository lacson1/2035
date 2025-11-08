#!/bin/bash

# Environment Configuration Setup Script
# This script helps set up and validate environment configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Generate secure random string
generate_secret() {
    openssl rand -base64 32
}

# Validate environment variable
validate_env_var() {
    local var_name=$1
    local var_value=$2
    local min_length=${3:-1}
    local pattern=${4:-""}

    if [ -z "$var_value" ]; then
        log_error "$var_name is required but not set"
        return 1
    fi

    if [ ${#var_value} -lt $min_length ]; then
        log_error "$var_name must be at least $min_length characters long"
        return 1
    fi

    if [ -n "$pattern" ] && ! echo "$var_value" | grep -q "$pattern"; then
        log_error "$var_name does not match required pattern: $pattern"
        return 1
    fi

    return 0
}

# Setup environment for specific stage
setup_environment() {
    local stage=$1
    local env_file=".env.$stage"

    log_info "Setting up $stage environment configuration..."

    # Create environment file if it doesn't exist
    if [ ! -f "$env_file" ]; then
        log_info "Creating $env_file from template..."
        cp env.production.template "$env_file"
    fi

    # Load existing configuration
    if [ -f "$env_file" ]; then
        set -a
        source "$env_file"
        set +a
    fi

    # Generate secrets if not set
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_strong_jwt_secret_here_minimum_32_characters" ]; then
        JWT_SECRET=$(generate_secret)
        log_info "Generated new JWT_SECRET"
    fi

    if [ -z "$JWT_REFRESH_SECRET" ] || [ "$JWT_REFRESH_SECRET" = "your_strong_jwt_refresh_secret_here_minimum_32_characters" ]; then
        JWT_REFRESH_SECRET=$(generate_secret)
        log_info "Generated new JWT_REFRESH_SECRET"
    fi

    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your_secure_postgres_password_here" ]; then
        POSTGRES_PASSWORD=$(generate_secret | head -c 16)
        log_info "Generated new POSTGRES_PASSWORD"
    fi

    if [ -z "$REDIS_PASSWORD" ] && [ "$stage" = "production" ]; then
        REDIS_PASSWORD=$(generate_secret | head -c 16)
        log_info "Generated new REDIS_PASSWORD"
    fi

    if [ -z "$GRAFANA_ADMIN_PASSWORD" ] && [ "$stage" = "production" ]; then
        GRAFANA_ADMIN_PASSWORD=$(generate_secret | head -c 16)
        log_info "Generated new GRAFANA_ADMIN_PASSWORD"
    fi

    # Set stage-specific defaults
    case $stage in
        "development")
            NODE_ENV="development"
            CORS_ORIGIN="http://localhost:5173,https://*.vercel.app"
            ENABLE_SWAGGER="true"
            LOG_LEVEL="debug"
            ;;
        "staging")
            NODE_ENV="production"
            CORS_ORIGIN="https://staging.yourdomain.com,https://*.vercel.app"
            ENABLE_SWAGGER="false"
            LOG_LEVEL="info"
            ;;
        "production")
            NODE_ENV="production"
            CORS_ORIGIN="https://yourdomain.com,https://*.vercel.app"
            ENABLE_SWAGGER="false"
            LOG_LEVEL="warn"
            ;;
    esac

    # Write configuration back to file
    cat > "$env_file" << EOF
# ==========================================
# $(echo $stage | tr '[:lower:]' '[:upper:]') ENVIRONMENT CONFIGURATION
# ==========================================
# Generated on $(date)
# DO NOT commit this file to version control

# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
NODE_ENV=$NODE_ENV
LOG_LEVEL=$LOG_LEVEL
ENABLE_SWAGGER=$ENABLE_SWAGGER

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=${POSTGRES_DB:-physician_dashboard_2035}
POSTGRES_PORT=${POSTGRES_PORT:-5432}

# Database URL for backend
DATABASE_URL=postgresql://\${POSTGRES_USER:-postgres}:$POSTGRES_PASSWORD@postgres:5432/\${POSTGRES_DB:-physician_dashboard_2035}?sslmode=require&connection_limit=20&pool_timeout=20

# ==========================================
# REDIS CONFIGURATION
# ==========================================
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=${REDIS_URL:-redis://:$REDIS_PASSWORD@redis:6379}
REDIS_PORT=${REDIS_PORT:-6379}

# ==========================================
# JWT CONFIGURATION
# ==========================================
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-15m}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN:-7d}

# ==========================================
# CORS CONFIGURATION
# ==========================================
CORS_ORIGIN=$CORS_ORIGIN

# ==========================================
# MONITORING & ERROR TRACKING
# ==========================================
SENTRY_DSN=${SENTRY_DSN:-}

# ==========================================
# RATE LIMITING
# ==========================================
RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-60000}
RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS:-100}

# ==========================================
# MONITORING (Optional)
# ==========================================
GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD

# ==========================================
# BACKUP CONFIGURATION
# ==========================================
BACKUP_S3_BUCKET=${BACKUP_S3_BUCKET:-}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-}
AWS_REGION=${AWS_REGION:-us-east-1}

EOF

    log_success "$stage environment configuration created at $env_file"
}

# Validate environment configuration
validate_environment() {
    local stage=$1
    local env_file=".env.$stage"

    log_info "Validating $stage environment configuration..."

    if [ ! -f "$env_file" ]; then
        log_error "Environment file $env_file not found"
        return 1
    fi

    # Load environment variables
    set -a
    source "$env_file"
    set +a

    local errors=0

    # Validate required variables
    validate_env_var "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD" 8 || ((errors++))
    validate_env_var "JWT_SECRET" "$JWT_SECRET" 32 || ((errors++))
    validate_env_var "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" 32 || ((errors++))
    validate_env_var "CORS_ORIGIN" "$CORS_ORIGIN" 1 || ((errors++))

    # Stage-specific validations
    case $stage in
        "production")
            # Production requires Redis password
            if [ -n "$REDIS_PASSWORD" ]; then
                validate_env_var "REDIS_PASSWORD" "$REDIS_PASSWORD" 8 || ((errors++))
            fi

            # Production should have Sentry DSN
            if [ -z "$SENTRY_DSN" ]; then
                log_warning "SENTRY_DSN is not set for production"
            fi

            # CORS should not contain localhost in production
            if echo "$CORS_ORIGIN" | grep -q "localhost"; then
                log_warning "CORS_ORIGIN contains localhost, which should not be allowed in production"
            fi
            ;;
    esac

    # Validate database URL construction
    if [ -n "$DATABASE_URL" ]; then
        if ! echo "$DATABASE_URL" | grep -q "postgresql://"; then
            log_error "DATABASE_URL must be a valid PostgreSQL connection string"
            ((errors++))
        fi
    fi

    if [ $errors -eq 0 ]; then
        log_success "$stage environment validation passed"
        return 0
    else
        log_error "$stage environment validation failed with $errors errors"
        return 1
    fi
}

# Deploy environment configuration
deploy_environment() {
    local stage=$1
    local env_file=".env.$stage"

    log_info "Deploying $stage environment configuration..."

    # Validate before deploying
    if ! validate_environment "$stage"; then
        log_error "Cannot deploy invalid environment configuration"
        exit 1
    fi

    case $stage in
        "staging")
            # Deploy to staging infrastructure
            log_info "Deploying to staging environment..."
            # Add your staging deployment commands here
            ;;
        "production")
            # Deploy to production infrastructure
            log_info "Deploying to production environment..."
            # Add your production deployment commands here
            ;;
    esac

    log_success "$stage environment deployed successfully"
}

# Main script logic
case "${1:-help}" in
    "setup")
        if [ -z "$2" ]; then
            log_error "Usage: $0 setup <environment>"
            log_error "Environments: development, staging, production"
            exit 1
        fi
        setup_environment "$2"
        ;;
    "validate")
        if [ -z "$2" ]; then
            log_error "Usage: $0 validate <environment>"
            log_error "Environments: development, staging, production"
            exit 1
        fi
        if validate_environment "$2"; then
            log_success "Environment is valid"
        else
            log_error "Environment validation failed"
            exit 1
        fi
        ;;
    "deploy")
        if [ -z "$2" ]; then
            log_error "Usage: $0 deploy <environment>"
            log_error "Environments: staging, production"
            exit 1
        fi
        deploy_environment "$2"
        ;;
    "generate-secrets")
        log_info "Generating new secrets..."
        echo "JWT_SECRET=$(generate_secret)"
        echo "JWT_REFRESH_SECRET=$(generate_secret)"
        echo "POSTGRES_PASSWORD=$(generate_secret | head -c 16)"
        echo "REDIS_PASSWORD=$(generate_secret | head -c 16)"
        ;;
    "help"|*)
        echo "Environment Configuration Management Script"
        echo ""
        echo "Usage: $0 <command> [environment]"
        echo ""
        echo "Commands:"
        echo "  setup <env>       Setup environment configuration"
        echo "  validate <env>     Validate environment configuration"
        echo "  deploy <env>       Deploy environment configuration"
        echo "  generate-secrets   Generate new random secrets"
        echo "  help               Show this help message"
        echo ""
        echo "Environments:"
        echo "  development       Local development environment"
        echo "  staging          Staging environment"
        echo "  production       Production environment"
        echo ""
        echo "Examples:"
        echo "  $0 setup development"
        echo "  $0 validate production"
        echo "  $0 deploy staging"
        ;;
esac
