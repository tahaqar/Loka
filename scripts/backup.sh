#!/bin/bash
# Amalon CRM - Automated Database Backup Script with Retention
# Supports SQLite (dev) and PostgreSQL (production)

set -e

BACKUP_DIR="${BACKUP_DIR:-/backup}"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

if [ -n "$POSTGRES_DB" ]; then
  # PostgreSQL production backup
  BACKUP_FILE="$BACKUP_DIR/amalon_crm_${POSTGRES_DB}_$DATE.sql.gz"
  echo "📦 Creating PostgreSQL dump for $POSTGRES_DB..."
  pg_dump -h "${POSTGRES_HOST:-localhost}" -U "${POSTGRES_USER:-amalon_admin}" -d "$POSTGRES_DB" | gzip > "$BACKUP_FILE"
  echo "✅ PostgreSQL backup saved to $BACKUP_FILE"
else
  # SQLite backup
  if [ -f "./dev.db" ]; then
    BACKUP_FILE="$BACKUP_DIR/amalon_crm_sqlite_$DATE.db.gz"
    echo "📦 Backing up SQLite dev.db..."
    gzip -c "./dev.db" > "$BACKUP_FILE"
    echo "✅ SQLite backup saved to $BACKUP_FILE"
  fi
fi

# Cleanup old backups older than retention window
echo "🧹 Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "amalon_crm_*.gz" -type f -mtime +$RETENTION_DAYS -delete
echo "✨ Backup job finished successfully."
