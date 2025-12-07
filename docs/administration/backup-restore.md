# Backup and Restore Guide

Strategies and procedures for backing up and restoring your Drift instance.

## What to Backup

| Component           | Priority     | Contains                          |
| ------------------- | ------------ | --------------------------------- |
| PostgreSQL Database | **Critical** | All posts, users, files, sessions |
| Environment File    | **Critical** | Configuration, secrets            |
| Uploaded Files      | Important    | User uploads (if any)             |

## Database Backup

### Manual Backup with pg_dump

```bash
# Full database backup
pg_dump -U drift -d drift -F c -f drift_backup_$(date +%Y%m%d_%H%M%S).dump

# SQL format (readable)
pg_dump -U drift -d drift > drift_backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed SQL
pg_dump -U drift -d drift | gzip > drift_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Docker Backup

```bash
# Backup from Docker container
docker exec drift-db pg_dump -U drift drift > backup.sql

# Compressed backup
docker exec drift-db pg_dump -U drift drift | gzip > backup.sql.gz

# Using docker compose
docker compose exec db pg_dump -U drift drift > backup.sql
```

### Backup Options Explained

| Option       | Description                                           |
| ------------ | ----------------------------------------------------- |
| `-F c`       | Custom format (compressed, supports parallel restore) |
| `-F p`       | Plain SQL format (readable, portable)                 |
| `-F t`       | Tar format                                            |
| `-j 4`       | Parallel backup with 4 jobs                           |
| `--clean`    | Add DROP statements before CREATE                     |
| `--no-owner` | Don't output ownership commands                       |

## Automated Backups

### Cron Job Setup

```bash
# Edit crontab
crontab -e
```

Add backup schedule:

```bash
# Daily backup at 2 AM
0 2 * * * /opt/drift/scripts/backup.sh >> /var/log/drift-backup.log 2>&1

# Weekly full backup on Sunday at 3 AM
0 3 * * 0 /opt/drift/scripts/backup-full.sh >> /var/log/drift-backup.log 2>&1
```

### Backup Script

Create `/opt/drift/scripts/backup.sh`:

```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/var/backups/drift"
DB_NAME="drift"
DB_USER="drift"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/drift_$TIMESTAMP.dump"

# Create backup
echo "$(date): Starting backup..."

if [ -n "$DOCKER_CONTAINER" ]; then
    # Docker backup
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -F c "$DB_NAME" > "$BACKUP_FILE"
else
    # Direct backup
    pg_dump -U "$DB_USER" -F c "$DB_NAME" -f "$BACKUP_FILE"
fi

# Compress if SQL format
if [[ "$BACKUP_FILE" == *.sql ]]; then
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
fi

echo "$(date): Backup created: $BACKUP_FILE"
echo "$(date): Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Remove old backups
echo "$(date): Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "drift_*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "drift_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "$(date): Backup complete"
```

Make executable:

```bash
chmod +x /opt/drift/scripts/backup.sh
```

### Docker Compose Backup Service

```yaml
# docker-compose.yml
services:
    backup:
        image: postgres:17-alpine
        volumes:
            - ./backups:/backups
            - ./scripts:/scripts
        environment:
            - PGHOST=db
            - PGUSER=drift
            - PGPASSWORD=${DB_PASSWORD}
            - PGDATABASE=drift
        entrypoint: /scripts/backup.sh
        depends_on:
            - db
        profiles:
            - backup
```

Run backup:

```bash
docker compose --profile backup run --rm backup
```

## Remote Backup Storage

### AWS S3

```bash
#!/bin/bash
# backup-to-s3.sh

# Create local backup
pg_dump -U drift -F c drift > /tmp/drift_backup.dump

# Upload to S3
aws s3 cp /tmp/drift_backup.dump \
    s3://your-bucket/drift/$(date +%Y/%m/%d)/drift_backup.dump

# Clean up
rm /tmp/drift_backup.dump
```

### Backblaze B2

```bash
#!/bin/bash
# Using rclone
rclone copy /var/backups/drift/ b2:drift-backups/$(date +%Y/%m/)
```

### Rsync to Remote Server

```bash
#!/bin/bash
rsync -avz --delete \
    /var/backups/drift/ \
    backup-server:/backups/drift/
```

## Database Restore

### Restore from Custom Format

```bash
# Stop application first
sudo systemctl stop drift

# Restore database
pg_restore -U drift -d drift -c drift_backup.dump

# Or create fresh database
dropdb -U drift drift
createdb -U drift drift
pg_restore -U drift -d drift drift_backup.dump

# Start application
sudo systemctl start drift
```

### Restore from SQL Format

```bash
# Stop application
sudo systemctl stop drift

# Restore
psql -U drift -d drift < drift_backup.sql

# Or from compressed
gunzip -c drift_backup.sql.gz | psql -U drift -d drift

# Start application
sudo systemctl start drift
```

### Docker Restore

```bash
# Stop drift container
docker compose stop drift

# Restore database
cat backup.sql | docker compose exec -T db psql -U drift -d drift

# Or for custom format
docker compose exec -T db pg_restore -U drift -d drift -c < backup.dump

# Start drift
docker compose start drift
```

### Restore to Different Server

```bash
# On new server, create database
createdb -U drift drift

# Restore from backup
pg_restore -U drift -d drift --no-owner backup.dump

# Update environment file with new settings
# Restart application
```

## Point-in-Time Recovery

For production systems, enable WAL archiving:

### PostgreSQL Configuration

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
```

### Recovery

```bash
# Stop PostgreSQL
# Copy base backup
# Create recovery.conf

restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_time = '2024-01-15 10:30:00'

# Start PostgreSQL - it will recover to specified time
```

## Environment Backup

### Backup .env File

```bash
# Copy to secure location
cp /opt/drift/.env /var/backups/drift/env_backup_$(date +%Y%m%d)

# Encrypt for storage
gpg --symmetric --cipher-algo AES256 /opt/drift/.env
```

### Important: Secret Rotation

After restoring, consider rotating secrets:

```bash
# Generate new NEXTAUTH_SECRET
openssl rand -base64 32

# Update .env file
# Restart application
# All sessions will be invalidated
```

## Disaster Recovery Plan

### Recovery Steps

1. **Provision new infrastructure**
    - Server/VM
    - PostgreSQL instance
    - DNS records

2. **Restore database**

    ```bash
    createdb -U drift drift
    pg_restore -U drift -d drift backup.dump
    ```

3. **Deploy application**

    ```bash
    docker pull ghcr.io/lbenicio/drift:latest
    ```

4. **Restore configuration**
    - Environment variables
    - SSL certificates
    - Reverse proxy config

5. **Verify and test**

    ```bash
    curl https://drift.example.com/api/health
    ```

6. **Update DNS** (if IP changed)

### Recovery Time Objectives

| Scenario            | Target RTO | Target RPO |
| ------------------- | ---------- | ---------- |
| Database corruption | 1 hour     | 24 hours   |
| Server failure      | 2 hours    | 24 hours   |
| Data center outage  | 4 hours    | 24 hours   |

## Monitoring Backups

### Verify Backup Integrity

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1

# Check file exists and has size
if [ ! -s "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file missing or empty"
    exit 1
fi

# Verify custom format backup
if [[ "$BACKUP_FILE" == *.dump ]]; then
    pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Backup verified: $BACKUP_FILE"
    else
        echo "ERROR: Backup corrupted"
        exit 1
    fi
fi
```

### Alert on Backup Failure

```bash
#!/bin/bash
# In backup script

if ! /opt/drift/scripts/backup.sh; then
    # Send alert
    curl -X POST "https://hooks.slack.com/..." \
        -d '{"text":"Drift backup failed!"}'
fi
```

## Best Practices

1. **Test restores regularly** - A backup is only good if you can restore it
2. **Use multiple backup locations** - Local + cloud storage
3. **Encrypt sensitive backups** - Especially when storing remotely
4. **Monitor backup jobs** - Alert on failures
5. **Document recovery procedures** - Keep runbooks updated
6. **Automate everything** - Manual backups get forgotten
7. **Retain multiple versions** - For recovering from logical errors
