#!/bin/bash

# Database Backup Script
# This script creates automated database backups

set -e

# Configuration
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="nextgen_outreach"
DB_USER="postgres"
BACKUP_DIR="/backups"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

echo "🗄️ Creating database backup..."

# Create the backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

echo "✅ Backup created: $COMPRESSED_FILE"

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "🧹 Cleaned up backups older than $RETENTION_DAYS days"

# Verify backup was created
if [ -f "$COMPRESSED_FILE" ]; then
    BACKUP_SIZE=$(du -h $COMPRESSED_FILE | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "🎉 Backup process completed successfully!"
