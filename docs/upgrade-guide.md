# Upgrade Guide

Safe procedures for upgrading Drift to newer versions.

## Before Upgrading

### Pre-upgrade Checklist

- [ ] Read the [changelog](https://github.com/MaxLeiter/drift/releases)
- [ ] Backup database (see [backup guide](../administration/backup-restore.md))
- [ ] Note current version
- [ ] Review breaking changes
- [ ] Test in staging environment
- [ ] Schedule maintenance window

### Check Current Version

```bash
# Check package.json version
cat package.json | grep version

# Or via API (if running)
curl http://localhost:3001/api/health
```

## Docker Upgrades

### Pull Latest Image

```bash
# Pull new version
docker pull ghcr.io/maxleiter/drift:latest

# Or specific version
docker pull ghcr.io/maxleiter/drift:v1.2.0
```

### Upgrade with Docker Compose

```bash
# Navigate to project directory
cd /opt/drift

# Backup current state
docker compose exec postgres pg_dump -U drift drift > backup-$(date +%Y%m%d).sql

# Pull new images
docker compose pull

# Stop and recreate containers
docker compose down
docker compose up -d

# Verify upgrade
docker compose logs -f drift
```

### Rollback Docker

```bash
# Stop current containers
docker compose down

# Pull previous version
docker pull ghcr.io/maxleiter/drift:v1.1.0

# Update docker-compose.yml with old version
# Then restart
docker compose up -d

# Restore database if needed
docker compose exec -T postgres psql -U drift drift < backup-20240101.sql
```

## Source Upgrades

### Git-based Updates

```bash
# Navigate to project directory
cd /opt/drift

# Stash local changes (if any)
git stash

# Fetch latest changes
git fetch origin

# Check for new releases
git tag -l

# Checkout specific version
git checkout v1.2.0

# Or update to latest main
git checkout main
git pull origin main

# Re-apply local changes
git stash pop

# Install dependencies
yarn install

# Run database migrations
yarn prisma:migrate

# Generate Prisma client
yarn prisma:generate

# Rebuild application
yarn build

# Restart service
sudo systemctl restart drift
```

### Handling Conflicts

```bash
# If merge conflicts occur
git status

# Option 1: Reset and keep theirs
git checkout --theirs .
yarn install

# Option 2: Manual resolution
# Edit conflicted files, then:
git add .
git stash drop
```

## Database Migrations

### Running Migrations

Migrations run automatically with `prisma:migrate`, but you can also:

```bash
# Check migration status
yarn prisma migrate status

# Apply pending migrations
yarn prisma migrate deploy

# Reset database (DANGER: deletes data)
yarn prisma migrate reset
```

### Handling Migration Failures

```bash
# Check migration history
yarn prisma migrate status

# Mark migration as applied (if manually fixed)
yarn prisma migrate resolve --applied "migration_name"

# Rollback to specific migration
yarn prisma migrate resolve --rolled-back "migration_name"
```

## Breaking Changes by Version

### Version 2.0.0

- **Node.js 24 Required:** Update Node.js before upgrading
- **Yarn 4 Required:** Enable corepack: `corepack enable`
- **Prisma 7:** Run migrations after upgrade
- **Environment Variables:** `SESSION_SECRET` renamed to `NEXTAUTH_SECRET`

Migration steps:

```bash
# Update Node.js
nvm install 24
nvm use 24

# Enable corepack
corepack enable

# Update environment
sed -i 's/SESSION_SECRET/NEXTAUTH_SECRET/' .env

# Run upgrade
yarn install
yarn prisma:migrate
yarn build
```

### Version 1.5.0

- **New OAuth Scopes:** Re-authenticate GitHub/GitLab connections
- **Password Hashing:** Existing passwords automatically migrated

### Version 1.0.0

- Initial stable release
- No migration needed for new installations

## Zero-Downtime Upgrades

### Blue-Green Deployment

```bash
# Start new version alongside old
docker run -d --name drift-new \
  -p 3002:3001 \
  --env-file .env \
  ghcr.io/maxleiter/drift:v1.2.0

# Test new version
curl http://localhost:3002/api/health

# Update load balancer to new version
# Then stop old version
docker stop drift-old
docker rm drift-old
```

### Rolling Updates (Kubernetes)

```yaml
spec:
    strategy:
        type: RollingUpdate
        rollingUpdate:
            maxSurge: 1
            maxUnavailable: 0
```

## Post-Upgrade Steps

### Verify Functionality

```bash
# Check application health
curl http://localhost:3001/api/health

# Check database connection
yarn prisma db execute --stdin <<< "SELECT 1"

# Check logs for errors
docker compose logs drift | grep -i error
```

### Clear Caches

```bash
# Clear Next.js cache
rm -rf .next/cache

# Rebuild if needed
yarn build

# Restart application
sudo systemctl restart drift
```

### Update Monitoring

- Update version labels in monitoring
- Check for new metrics endpoints
- Review new configuration options

## Troubleshooting Upgrades

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules .yarn/cache
yarn install

# Clear build cache
rm -rf .next
yarn build
```

### Migration Failures

```bash
# View detailed migration error
yarn prisma migrate status

# Manually apply SQL if needed
yarn prisma db execute --stdin < manual-fix.sql

# Mark migration as applied
yarn prisma migrate resolve --applied "20240101000000_fix"
```

### Runtime Errors After Upgrade

```bash
# Check application logs
docker compose logs drift

# Verify environment variables
docker compose exec drift env | grep -E "DATABASE|NEXTAUTH"

# Test database connection
docker compose exec drift yarn prisma db execute --stdin <<< "SELECT 1"
```

### Rollback Procedure

```bash
# Stop current version
docker compose down

# Restore database backup
docker compose up -d postgres
docker compose exec -T postgres psql -U drift drift < backup.sql

# Deploy previous version
git checkout v1.1.0
docker compose up -d

# Verify rollback
curl http://localhost:3001/api/health
```

## Automated Upgrades

### Using Renovate

```json
{
    "extends": ["config:base"],
    "packageRules": [
        {
            "matchPackageNames": ["drift"],
            "automerge": false,
            "labels": ["upgrade"]
        }
    ]
}
```

### Using Dependabot

```yaml
version: 2
updates:
    - package-ecosystem: "docker"
      directory: "/"
      schedule:
          interval: "weekly"
```

## Version Support

| Version | Status  | Support Until |
| ------- | ------- | ------------- |
| 2.x     | Current | Active        |
| 1.x     | LTS     | 2025-01-01    |
| 0.x     | EOL     | Unsupported   |

Always upgrade to supported versions for security updates.
