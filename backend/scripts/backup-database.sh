#!/bin/bash

# Database Backup Script
# This script creates a backup of the PostgreSQL database
# Designed for HIPAA compliance - all patient data must be backed up regularly

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="physician_dashboard_${TIMESTAMP}.sql"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL environment variable is not set"
    log_info "Please set DATABASE_URL in your .env file or export it"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Full backup path
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

log_info "Starting database backup..."
log_info "Backup location: $BACKUP_PATH"

# Create backup using pg_dump
# Extract connection details from DATABASE_URL
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)$ ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    
    # Set password for pg_dump
    export PGPASSWORD="$DB_PASS"
    
    # Create backup
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        > "$BACKUP_PATH"; then
        log_info "Backup created successfully"
        
        # Compress backup
        if command -v gzip &> /dev/null; then
            log_info "Compressing backup..."
            gzip "$BACKUP_PATH"
            BACKUP_PATH="${BACKUP_PATH}.gz"
            log_info "Backup compressed: $BACKUP_PATH"
        fi
        
        # Get backup size
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        log_info "Backup size: $BACKUP_SIZE"
    else
        log_error "Backup failed!"
        exit 1
    fi
else
    log_error "Could not parse DATABASE_URL"
    log_info "Using direct pg_dump with DATABASE_URL"
    
    # Fallback: try direct connection
    if pg_dump "$DATABASE_URL" \
        --format=plain \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        > "$BACKUP_PATH"; then
        log_info "Backup created successfully"
        
        # Compress backup
        if command -v gzip &> /dev/null; then
            log_info "Compressing backup..."
            gzip "$BACKUP_PATH"
            BACKUP_PATH="${BACKUP_PATH}.gz"
            log_info "Backup compressed: $BACKUP_PATH"
        fi
        
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        log_info "Backup size: $BACKUP_SIZE"
    else
        log_error "Backup failed!"
        exit 1
    fi
fi

# Clean up old backups (retention policy)
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "physician_dashboard_*.sql*" -type f -mtime +$RETENTION_DAYS -delete

REMAINING=$(find "$BACKUP_DIR" -name "physician_dashboard_*.sql*" -type f | wc -l)
log_info "Remaining backups: $REMAINING"

log_info "Backup completed successfully: $BACKUP_PATH"

# Optional: Upload to cloud storage (S3, etc.)
if [ -n "$BACKUP_S3_BUCKET" ] && command -v aws &> /dev/null; then
    log_info "Uploading backup to S3..."
    aws s3 cp "$BACKUP_PATH" "s3://${BACKUP_S3_BUCKET}/database-backups/${BACKUP_NAME}"
    log_info "Backup uploaded to S3"
fi

exit 0

