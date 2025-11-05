# Database Backup Guide

## Overview

This guide covers the database backup strategy for Physician Dashboard 2035. Regular backups are **critical for HIPAA compliance** and data protection.

## Backup Scripts

### Automated Backup Script

Location: `backend/scripts/backup-database.sh`

**Usage:**
```bash
cd backend
./scripts/backup-database.sh
```

**Features:**
- Creates timestamped SQL dump
- Compresses backup (gzip)
- Automatic cleanup of old backups (30 days retention)
- Optional S3 upload
- Configurable via environment variables

**Environment Variables:**
```bash
BACKUP_DIR=./backups              # Backup directory
RETENTION_DAYS=30                 # Days to keep backups
BACKUP_S3_BUCKET=your-bucket     # Optional: S3 bucket for cloud backup
DATABASE_URL=postgresql://...    # Required: Database connection string
```

### Restore Script

Location: `backend/scripts/restore-database.sh`

**Usage:**
```bash
cd backend
./scripts/restore-database.sh backups/physician_dashboard_20240101_120000.sql.gz
```

**⚠️ WARNING:** This will overwrite all existing data!

## Automated Backups

### Setup Cron Job

Run the setup script to configure automated daily backups:

```bash
cd backend
./scripts/setup-backup-cron.sh
```

This will:
- Create a cron job for daily backups at 2 AM
- Make backup script executable
- Configure log file location

### Manual Cron Setup

Or manually add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 2 * * * cd /path/to/backend && source .env && ./scripts/backup-database.sh >> /var/log/db-backup.log 2>&1
```

### Backup Schedule Options

- **Daily:** `0 2 * * *` (2 AM daily)
- **Twice Daily:** `0 2,14 * * *` (2 AM and 2 PM)
- **Hourly:** `0 * * * *` (every hour)

## Backup Storage

### Local Storage

Backups are stored in `backend/backups/` by default.

### Cloud Storage (Recommended)

For production, upload backups to cloud storage:

**AWS S3:**
```bash
# Set environment variable
export BACKUP_S3_BUCKET=your-backup-bucket

# Backup script will auto-upload if AWS CLI is configured
```

**Manual S3 Upload:**
```bash
aws s3 cp backups/physician_dashboard_*.sql.gz s3://your-bucket/database-backups/
```

**Other Cloud Options:**
- Google Cloud Storage
- Azure Blob Storage
- Dropbox (via API)
- Backblaze B2

## Backup Verification

### Verify Backup File

```bash
# Check backup file exists
ls -lh backend/backups/

# Verify backup is compressed
file backend/backups/physician_dashboard_*.sql.gz

# Test decompression
gunzip -t backend/backups/physician_dashboard_*.sql.gz
```

### Test Restore (on Test Database)

```bash
# Create test database
createdb physician_dashboard_test

# Restore to test database
DATABASE_URL=postgresql://user:pass@localhost/db_test \
  ./scripts/restore-database.sh backups/physician_dashboard_*.sql.gz
```

## Backup Best Practices

### 1. Regular Backups
- **Daily backups minimum** for production
- **Hourly backups** for critical systems
- **Before major changes** (migrations, updates)

### 2. Backup Retention
- **30 days** local backups
- **90 days** cloud backups
- **1 year** monthly backups

### 3. Backup Testing
- **Test restore monthly** to verify backups work
- **Document restore procedures**
- **Practice disaster recovery**

### 4. Security
- **Encrypt backups** containing PHI (HIPAA requirement)
- **Secure backup storage** (access controls)
- **Audit backup access** (who accessed backups)

### 5. Monitoring
- **Monitor backup success/failure**
- **Alert on backup failures**
- **Track backup sizes** (detect anomalies)

## Production Setup

### 1. Database-Level Backups

For production, consider managed database backups:

**AWS RDS:**
- Automated daily backups
- Point-in-time recovery
- Cross-region replication

**Google Cloud SQL:**
- Automated backups
- On-demand backups
- Binary logging

**Azure Database:**
- Automated backups
- Long-term retention

### 2. Backup Encryption

Encrypt backups at rest:

```bash
# Encrypt backup before upload
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt when needed
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### 3. Backup Monitoring

Set up alerts for:
- Backup failures
- Backup size anomalies
- Backup age (too old)

### 4. Disaster Recovery Plan

Document:
- Recovery time objective (RTO)
- Recovery point objective (RPO)
- Backup locations
- Restore procedures
- Contact information

## Troubleshooting

### Backup Fails

**Check:**
- Database connection (`DATABASE_URL`)
- Disk space (`df -h`)
- Permissions (`chmod +x scripts/backup-database.sh`)
- PostgreSQL tools installed (`pg_dump --version`)

### Restore Fails

**Check:**
- Backup file is valid
- Database connection
- Disk space
- User permissions

### Cron Not Running

**Check:**
- Cron service running (`systemctl status cron`)
- Cron logs (`/var/log/cron`)
- Permissions on script
- Environment variables accessible

## HIPAA Compliance

### Requirements

1. **Regular Backups** ✅ (Daily automated)
2. **Backup Encryption** ⚠️ (Configure in production)
3. **Backup Testing** ⚠️ (Test monthly)
4. **Backup Audit Logs** ⚠️ (Track access)
5. **Disaster Recovery Plan** ⚠️ (Document procedures)

### Compliance Checklist

- [ ] Daily automated backups configured
- [ ] Backups encrypted at rest
- [ ] Backups stored off-site (cloud)
- [ ] Restore procedures documented
- [ ] Monthly restore testing scheduled
- [ ] Backup access logged and audited
- [ ] Disaster recovery plan documented

## Additional Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [AWS RDS Backup Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.BackingUpAndRestoringAmazonRDSInstances.html)
- [HIPAA Backup Requirements](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)

---

**Last Updated**: 2024
**Status**: Production Ready (with cloud storage configuration)

