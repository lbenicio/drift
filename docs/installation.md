# Installation Guide

This guide covers all installation methods for Drift, from development setup to production deployment.

## Prerequisites

### Required Software

| Software   | Minimum Version | Recommended | Notes                      |
| ---------- | --------------- | ----------- | -------------------------- |
| Node.js    | 20.x            | 24.x        | LTS versions recommended   |
| PostgreSQL | 14.x            | 17.x        | Required for data storage  |
| Yarn       | 4.x             | 4.9.x       | Enabled via corepack       |
| Git        | 2.x             | Latest      | For cloning the repository |

### System Requirements

| Resource | Minimum | Recommended | Notes                              |
| -------- | ------- | ----------- | ---------------------------------- |
| CPU      | 1 core  | 2+ cores    | More cores improve build times     |
| RAM      | 1 GB    | 2+ GB       | Node.js can be memory-intensive    |
| Disk     | 1 GB    | 5+ GB       | Includes dependencies and database |

## Installation Methods

### Method 1: Development Setup

Best for contributors and local testing.

```bash
# Clone the repository
git clone https://github.com/lbenicio/drift.git
cd drift

# Enable corepack for Yarn 4
corepack enable

# Install dependencies
yarn install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# At minimum, set:
#   - DATABASE_URL
#   - NEXTAUTH_SECRET
#   - DRIFT_URL

# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma migrate deploy

# Start development server
yarn start:dev
```

The development server will be available at `http://localhost:3000`.

### Method 2: Production Build

Best for self-hosting on a VPS or dedicated server.

```bash
# Clone and setup
git clone https://github.com/lbenicio/drift.git
cd drift
corepack enable
yarn install

# Configure environment
cp .env.example .env
# Edit .env for production settings

# Generate Prisma client and migrate
yarn prisma generate
yarn prisma migrate deploy

# Build for production
yarn build:pkg

# Start production server
yarn start:prod
```

### Method 3: Docker (Recommended for Production)

Simplest method for production deployment.

```bash
# Using pre-built image
docker pull ghcr.io/lbenicio/drift:latest

# Run with required environment variables
docker run -d \
  --name drift \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/drift" \
  -e NEXTAUTH_SECRET="your-secret-here" \
  -e DRIFT_URL="https://your-domain.com" \
  ghcr.io/lbenicio/drift:latest
```

See [Docker Deployment](./deployment/docker.md) for detailed Docker instructions.

### Method 4: Docker Compose

Best for all-in-one deployment with PostgreSQL.

```bash
# Clone repository
git clone https://github.com/lbenicio/drift.git
cd drift

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker compose up -d

# View logs
docker compose logs -f drift
```

See [Docker Compose Guide](./deployment/docker-compose.md) for more details.

## Post-Installation Steps

### 1. Create Admin User

The first user to register can optionally become an admin:

1. Set `ENABLE_ADMIN=true` in your environment
1. Register the first account
1. This account will have admin privileges

### 2. Configure Authentication

Choose your authentication method(s):

- **Credentials** (default): Username/password registration
- **GitHub OAuth**: Social login with GitHub
- **Keycloak**: Enterprise SSO integration

See [Authentication Guide](./configuration/authentication.md) for setup instructions.

### 3. Set Up Reverse Proxy (Production)

For production deployments, configure a reverse proxy for:

- SSL/TLS termination
- Domain routing
- Load balancing

See [Reverse Proxy Guide](./deployment/reverse-proxy.md).

### 4. Configure Backups

Set up automated database backups:

```bash
# Example: Daily PostgreSQL backup
pg_dump -U drift drift > backup_$(date +%Y%m%d).sql
```

See [Backup & Restore Guide](./administration/backup-restore.md).

## Verifying Installation

### Health Check

```bash
# Check if the server is running
curl http://localhost:3000/api/health
```

### Database Connection

```bash
# Test database connectivity
yarn prisma db pull
```

### Run Tests

```bash
# Run unit tests to verify setup
yarn test:unit
```

## Common Installation Issues

### Issue: Yarn not found

```bash
# Solution: Enable corepack
corepack enable
```

### Issue: Prisma client not generated

```bash
# Solution: Generate Prisma client
yarn prisma generate
```

### Issue: Database connection failed

1. Verify PostgreSQL is running
1. Check `DATABASE_URL` format
1. Ensure database exists
1. Verify network connectivity

See [Troubleshooting Guide](./administration/troubleshooting.md) for more solutions.

## Next Steps

- [Configure Environment Variables](./configuration/environment-variables.md)
- [Set Up Authentication](./configuration/authentication.md)
- [Deploy to Production](./deployment/docker.md)
