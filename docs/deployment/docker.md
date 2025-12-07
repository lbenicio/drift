# Docker Deployment Guide

Production-ready Docker deployment for Drift.

## Quick Start

```bash
# Pull the latest image
docker pull ghcr.io/lbenicio/drift:latest

# Run with minimal configuration
docker run -d \
  --name drift \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/drift" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e DRIFT_URL="https://your-domain.com" \
  ghcr.io/lbenicio/drift:latest
```

## Image Details

### Available Tags

| Tag      | Description                       |
| -------- | --------------------------------- |
| `latest` | Latest stable release             |
| `vX.Y.Z` | Specific version (e.g., `v1.0.0`) |
| `main`   | Latest development build          |

### Image Specifications

| Property          | Value                        |
| ----------------- | ---------------------------- |
| Base Image        | `node:24-alpine`             |
| Architectures     | `linux/amd64`, `linux/arm64` |
| Exposed Port      | `3001`                       |
| User              | `nextjs` (UID 1001)          |
| Working Directory | `/app`                       |

## Configuration

### Required Environment Variables

```bash
DATABASE_URL="postgresql://user:password@host:5432/drift"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
DRIFT_URL="https://your-domain.com"
```

### All Environment Variables

See [Environment Variables Reference](../configuration/environment-variables.md) for complete list.

### Example Run Command

```bash
docker run -d \
  --name drift \
  --restart unless-stopped \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://drift:password@db:5432/drift" \
  -e NEXTAUTH_SECRET="super-secret-key-change-me" \
  -e NEXTAUTH_URL="https://drift.example.com" \
  -e DRIFT_URL="https://drift.example.com" \
  -e ENABLE_ADMIN="true" \
  -e WELCOME_TITLE="My Drift Instance" \
  -e GITHUB_CLIENT_ID="your-github-client-id" \
  -e GITHUB_CLIENT_SECRET="your-github-client-secret" \
  ghcr.io/lbenicio/drift:latest
```

## Building Locally

### Standard Build

```bash
# Clone repository
git clone https://github.com/lbenicio/drift.git
cd drift

# Build image
docker build -t drift:local .

# Run local build
docker run -d -p 3001:3001 drift:local
```

### Multi-Architecture Build

```bash
# Create builder for multi-arch
docker buildx create --name drift-builder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t drift:local \
  --load \
  .
```

### Build Arguments

| Argument   | Default                 | Description               |
| ---------- | ----------------------- | ------------------------- |
| `API_URL`  | `http://localhost:3000` | API base URL during build |
| `NODE_ENV` | `production`            | Node environment          |

```bash
docker build \
  --build-arg API_URL="https://api.example.com" \
  -t drift:custom .
```

## Docker Networks

### Connecting to External Database

```bash
# Create network
docker network create drift-network

# Run Drift on the network
docker run -d \
  --name drift \
  --network drift-network \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@postgres:5432/drift" \
  ghcr.io/lbenicio/drift:latest
```

### With PostgreSQL Container

```bash
# Create network
docker network create drift-network

# Start PostgreSQL
docker run -d \
  --name drift-db \
  --network drift-network \
  -e POSTGRES_USER=drift \
  -e POSTGRES_PASSWORD=secretpassword \
  -e POSTGRES_DB=drift \
  -v drift-pgdata:/var/lib/postgresql/data \
  postgres:17-alpine

# Start Drift
docker run -d \
  --name drift \
  --network drift-network \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://drift:secretpassword@drift-db:5432/drift" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e DRIFT_URL="http://localhost:3001" \
  ghcr.io/lbenicio/drift:latest
```

## Health Checks

The container exposes a health endpoint:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' drift

# Manual health check
curl http://localhost:3001/api/health
```

### Custom Health Check

```bash
docker run -d \
  --name drift \
  --health-cmd="curl -f http://localhost:3001/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  ghcr.io/lbenicio/drift:latest
```

## Logging

### View Logs

```bash
# Follow logs
docker logs -f drift

# Last 100 lines
docker logs --tail 100 drift

# With timestamps
docker logs -t drift
```

### Log Drivers

```bash
# JSON file with rotation
docker run -d \
  --name drift \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  ghcr.io/lbenicio/drift:latest
```

## Resource Limits

```bash
docker run -d \
  --name drift \
  --memory=512m \
  --memory-swap=1g \
  --cpus=1.0 \
  ghcr.io/lbenicio/drift:latest
```

### Recommended Resources

| Environment       | Memory | CPU  |
| ----------------- | ------ | ---- |
| Development       | 256 MB | 0.5  |
| Production (low)  | 512 MB | 1.0  |
| Production (high) | 1 GB+  | 2.0+ |

## Updating

### Pull and Replace

```bash
# Pull latest image
docker pull ghcr.io/lbenicio/drift:latest

# Stop and remove old container
docker stop drift
docker rm drift

# Start new container (with same configuration)
docker run -d \
  --name drift \
  -p 3001:3001 \
  # ... your environment variables
  ghcr.io/lbenicio/drift:latest
```

### Zero-Downtime Update

For zero-downtime updates, use a reverse proxy with multiple instances
or orchestration tools like Docker Swarm or Kubernetes.

## Security Considerations

### Run as Non-Root

The image runs as `nextjs` user (UID 1001) by default.

### Read-Only Filesystem

```bash
docker run -d \
  --name drift \
  --read-only \
  --tmpfs /tmp \
  ghcr.io/lbenicio/drift:latest
```

### Security Scanning

```bash
# Scan image for vulnerabilities
docker scout cves ghcr.io/lbenicio/drift:latest

# Or with Trivy
trivy image ghcr.io/lbenicio/drift:latest
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs drift

# Check if port is in use
lsof -i :3001

# Run interactively for debugging
docker run -it --rm ghcr.io/lbenicio/drift:latest sh
```

### Database Connection Failed

1. Verify database is accessible from container
1. Check network configuration
1. Verify `DATABASE_URL` format
1. Test connection: `docker exec drift nc -zv db-host 5432`

### Out of Memory

1. Increase memory limit
1. Check for memory leaks in logs
1. Monitor with: `docker stats drift`

### Permission Denied

The container runs as UID 1001. Ensure mounted volumes have correct permissions:

```bash
chown -R 1001:1001 /path/to/volume
```
