#!/bin/bash

# Database Restore Script
# This script restores a PostgreSQL database from a backup file
# WARNING: This will overwrite existing data!

set -e

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

# Check if backup file is provided
if [ -z "$1" ]; then
    log_error "Usage: $0 <backup_file>"
    log_info "Example: $0 backups/physician_dashboard_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL environment variable is not set"
    log_info "Please set DATABASE_URL in your .env file or export it"
    exit 1
fi

log_warn "WARNING: This will overwrite all existing data in the database!"
log_warn "Are you sure you want to continue? (yes/no)"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
fi

log_info "Starting database restore..."
log_info "Backup file: $BACKUP_FILE"

# Extract connection details from DATABASE_URL
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)$ ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    
    # Set password for psql
    export PGPASSWORD="$DB_PASS"
    
    # Check if backup is compressed
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        log_info "Decompressing backup..."
        TEMP_FILE=$(mktemp)
        gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
        
        # Restore database
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$TEMP_FILE"; then
            rm "$TEMP_FILE"
            log_info "Database restored successfully"
        else
            rm "$TEMP_FILE"
            log_error "Restore failed!"
            exit 1
        fi
    else
        # Restore uncompressed backup
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"; then
            log_info "Database restored successfully"
        else
            log_error "Restore failed!"
            exit 1
        fi
    fi
else
    log_error "Could not parse DATABASE_URL"
    log_info "Using direct psql with DATABASE_URL"
    
    # Fallback: try direct connection
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
    else
        psql "$DATABASE_URL" < "$BACKUP_FILE"
    fi
    
    log_info "Database restored successfully"
fi

log_info "Restore completed successfully"

