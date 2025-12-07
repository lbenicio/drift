# Docker Compose Deployment

Deploy Drift with PostgreSQL using Docker Compose.

## Quick Start

```bash
# Clone repository
git clone https://github.com/lbenicio/drift.git
cd drift

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start services
docker compose up -d
```

## Configuration Files

### Basic docker-compose.yml

```yaml
services:
    drift:
        image: ghcr.io/lbenicio/drift:latest
        container_name: drift
        restart: unless-stopped
        ports:
            - "3001:3001"
        environment:
            - DATABASE_URL=postgresql://drift:${DB_PASSWORD}@db:5432/drift
            - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
            - NEXTAUTH_URL=${DRIFT_URL}
            - DRIFT_URL=${DRIFT_URL}
            - ENABLE_ADMIN=${ENABLE_ADMIN:-false}
            - WELCOME_TITLE=${WELCOME_TITLE:-Drift}
            - REGISTRATION_PASSWORD=${REGISTRATION_PASSWORD:-}
        depends_on:
            db:
                condition: service_healthy
        healthcheck:
            test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
            interval: 30s
            timeout: 10s
            retries: 3
            start_period: 40s

    db:
        image: postgres:17-alpine
        container_name: drift-db
        restart: unless-stopped
        environment:
            - POSTGRES_USER=drift
            - POSTGRES_PASSWORD=${DB_PASSWORD}
            - POSTGRES_DB=drift
        volumes:
            - postgres_data:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U drift -d drift"]
            interval: 5s
            timeout: 5s
            retries: 5

volumes:
    postgres_data:
```

### Environment File (.env)

```bash
# Database
DB_PASSWORD=your-secure-database-password

# Application
DRIFT_URL=https://drift.example.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Optional
ENABLE_ADMIN=true
WELCOME_TITLE=My Drift Instance
REGISTRATION_PASSWORD=
```

## Production Configuration

### With Reverse Proxy Network

```yaml
services:
    drift:
        image: ghcr.io/lbenicio/drift:latest
        container_name: drift
        restart: unless-stopped
        expose:
            - "3001"
        networks:
            - drift-internal
            - proxy
        environment:
            - DATABASE_URL=postgresql://drift:${DB_PASSWORD}@db:5432/drift
            - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
            - NEXTAUTH_URL=${DRIFT_URL}
            - DRIFT_URL=${DRIFT_URL}
        depends_on:
            db:
                condition: service_healthy
        labels:
            # Traefik labels (if using Traefik)
            - "traefik.enable=true"
            - "traefik.http.routers.drift.rule=Host(`drift.example.com`)"
            - "traefik.http.routers.drift.tls.certresolver=letsencrypt"
            - "traefik.http.services.drift.loadbalancer.server.port=3001"

    db:
        image: postgres:17-alpine
        container_name: drift-db
        restart: unless-stopped
        networks:
            - drift-internal
        environment:
            - POSTGRES_USER=drift
            - POSTGRES_PASSWORD=${DB_PASSWORD}
            - POSTGRES_DB=drift
        volumes:
            - postgres_data:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U drift -d drift"]
            interval: 5s
            timeout: 5s
            retries: 5

networks:
    drift-internal:
        driver: bridge
    proxy:
        external: true

volumes:
    postgres_data:
```

### With Resource Limits

```yaml
services:
    drift:
        image: ghcr.io/lbenicio/drift:latest
        deploy:
            resources:
                limits:
                    cpus: "1.0"
                    memory: 512M
                reservations:
                    cpus: "0.25"
                    memory: 256M
        # ... other configuration

    db:
        image: postgres:17-alpine
        deploy:
            resources:
                limits:
                    cpus: "0.5"
                    memory: 256M
                reservations:
                    cpus: "0.1"
                    memory: 128M
        # ... other configuration
```

### With Logging Configuration

```yaml
services:
    drift:
        image: ghcr.io/lbenicio/drift:latest
        logging:
            driver: "json-file"
            options:
                max-size: "10m"
                max-file: "5"
        # ... other configuration

    db:
        image: postgres:17-alpine
        logging:
            driver: "json-file"
            options:
                max-size: "10m"
                max-file: "3"
        # ... other configuration
```

## Full Production Example

```yaml
# docker-compose.prod.yml
services:
    drift:
        image: ghcr.io/lbenicio/drift:latest
        container_name: drift
        restart: unless-stopped
        user: "1001:1001"
        expose:
            - "3001"
        networks:
            - drift-internal
            - proxy
        environment:
            - DATABASE_URL=postgresql://drift:${DB_PASSWORD}@db:5432/drift
            - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
            - NEXTAUTH_URL=${DRIFT_URL}
            - DRIFT_URL=${DRIFT_URL}
            - ENABLE_ADMIN=${ENABLE_ADMIN:-false}
            - WELCOME_TITLE=${WELCOME_TITLE:-Drift}
            - WELCOME_CONTENT=${WELCOME_CONTENT:-}
            - REGISTRATION_PASSWORD=${REGISTRATION_PASSWORD:-}
            - CREDENTIAL_AUTH=${CREDENTIAL_AUTH:-true}
            - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-}
            - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-}
        depends_on:
            db:
                condition: service_healthy
        healthcheck:
            test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
            interval: 30s
            timeout: 10s
            retries: 3
            start_period: 40s
        deploy:
            resources:
                limits:
                    cpus: "1.0"
                    memory: 512M
        logging:
            driver: "json-file"
            options:
                max-size: "10m"
                max-file: "5"

    db:
        image: postgres:17-alpine
        container_name: drift-db
        restart: unless-stopped
        networks:
            - drift-internal
        environment:
            - POSTGRES_USER=drift
            - POSTGRES_PASSWORD=${DB_PASSWORD}
            - POSTGRES_DB=drift
            - PGDATA=/var/lib/postgresql/data/pgdata
        volumes:
            - postgres_data:/var/lib/postgresql/data
            - ./backups:/backups
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U drift -d drift"]
            interval: 5s
            timeout: 5s
            retries: 5
        deploy:
            resources:
                limits:
                    cpus: "0.5"
                    memory: 256M
        logging:
            driver: "json-file"
            options:
                max-size: "10m"
                max-file: "3"

networks:
    drift-internal:
        driver: bridge
    proxy:
        external: true

volumes:
    postgres_data:
```

## Commands

### Start Services

```bash
# Start in foreground
docker compose up

# Start in background
docker compose up -d

# Start with specific file
docker compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f drift
docker compose logs -f db

# Last 100 lines
docker compose logs --tail 100 drift
```

### Stop Services

```bash
# Stop without removing
docker compose stop

# Stop and remove containers
docker compose down

# Stop, remove containers and volumes
docker compose down -v
```

### Update Services

```bash
# Pull latest images
docker compose pull

# Recreate containers with new images
docker compose up -d --force-recreate

# Or in one command
docker compose pull && docker compose up -d
```

### Database Operations

```bash
# Access PostgreSQL shell
docker compose exec db psql -U drift -d drift

# Run migrations
docker compose exec drift npx prisma migrate deploy

# Create backup
docker compose exec db pg_dump -U drift drift > backup.sql

# Restore backup
cat backup.sql | docker compose exec -T db psql -U drift -d drift
```

### Scaling (Development)

```bash
# Run multiple drift instances
docker compose up -d --scale drift=3
```

📝 **Note:** Scaling requires a load balancer in front of the instances.

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is healthy
docker compose ps

# Test connection
docker compose exec drift nc -zv db 5432

# Check database logs
docker compose logs db
```

### Container Won't Start

```bash
# Check exit code and logs
docker compose ps -a
docker compose logs drift

# Try running interactively
docker compose run --rm drift sh
```

### Reset Everything

```bash
# Stop and remove everything
docker compose down -v --remove-orphans

# Remove images
docker compose down --rmi all

# Start fresh
docker compose up -d
```

### Permission Issues

```bash
# Fix volume permissions
sudo chown -R 1001:1001 ./data

# Or run as root (not recommended)
# user: "0:0"
```

## Backup Strategy

### Automated Backups with Cron

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker compose exec -T db pg_dump -U drift drift > "$BACKUP_DIR/drift_$DATE.sql"

# Keep only last 7 days
find "$BACKUP_DIR" -name "drift_*.sql" -mtime +7 -delete
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

See [Backup & Restore Guide](../administration/backup-restore.md) for more details.
