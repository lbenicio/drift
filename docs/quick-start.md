# Quick Start Guide

Get Drift running in under 5 minutes with Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## Steps

### 1. Clone the Repository

```bash
git clone https://github.com/lbenicio/drift.git
cd drift
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and set at minimum:

```bash
# Generate a secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set your domain (use localhost for local testing)
DRIFT_URL=http://localhost:3001
```

### 3. Start the Services

```bash
docker compose up -d
```

This starts:

- **Drift** application on port 3001
- **PostgreSQL** database on port 5432

### 4. Access Drift

Open your browser to [http://localhost:3001](http://localhost:3001)

### 5. Create Your First Account

1. Click "Sign Up"
1. Enter your username, email, and password
1. Start creating posts!

## Quick Commands

```bash
# View logs
docker compose logs -f drift

# Stop services
docker compose down

# Stop and remove data
docker compose down -v

# Rebuild after changes
docker compose up -d --build
```

## What's Next?

- [Full Installation Guide](./installation.md) - All installation methods
- [Environment Variables](./configuration/environment-variables.md) - Customize your instance
- [Authentication Setup](./configuration/authentication.md) - Add GitHub/Keycloak OAuth
- [Production Deployment](./deployment/docker.md) - Secure production setup

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker compose logs drift

# Ensure ports are available
lsof -i :3001
lsof -i :5432
```

### Database connection issues

```bash
# Check if PostgreSQL is healthy
docker compose ps

# Restart PostgreSQL
docker compose restart db
```

### Need to reset everything

```bash
# Remove all containers and volumes
docker compose down -v

# Start fresh
docker compose up -d
```

---

📌 **Need help?** Open an issue on [GitHub](https://github.com/lbenicio/drift/issues)
