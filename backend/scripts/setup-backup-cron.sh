#!/bin/bash

# Setup Automated Database Backups
# This script sets up a cron job to run database backups automatically

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-database.sh"
CRON_SCHEDULE="${CRON_SCHEDULE:-0 2 * * *}"  # Default: 2 AM daily

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "Error: Backup script not found at $BACKUP_SCRIPT"
    exit 1
fi

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Get the path to .env file (should be in parent directory)
ENV_FILE="$(dirname "$SCRIPT_DIR")/.env"

if [ ! -f "$ENV_FILE" ]; then
    log_warn ".env file not found at $ENV_FILE"
    log_warn "You'll need to set DATABASE_URL in your environment"
fi

# Create cron job
CRON_JOB="$CRON_SCHEDULE cd $SCRIPT_DIR && source $ENV_FILE && $BACKUP_SCRIPT >> /var/log/db-backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    log_warn "Cron job already exists. Removing old one..."
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

log_info "Cron job added successfully!"
log_info "Schedule: $CRON_SCHEDULE"
log_info "Backup script: $BACKUP_SCRIPT"
log_info ""
log_info "To view cron jobs: crontab -l"
log_info "To remove cron job: crontab -e (then delete the line)"
log_info ""
log_info "Backup logs will be written to: /var/log/db-backup.log"

