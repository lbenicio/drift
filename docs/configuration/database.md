# Database Configuration

Guide for setting up and optimizing PostgreSQL for Drift.

## Requirements

| Requirement | Minimum | Recommended      |
| ----------- | ------- | ---------------- |
| PostgreSQL  | 14.x    | 17.x             |
| RAM         | 256 MB  | 1 GB+            |
| Storage     | 100 MB  | Depends on usage |

## Connection Setup

### Connection String Format

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Examples

```bash
# Local development
DATABASE_URL="postgresql://drift:password@localhost:5432/drift"

# Docker network
DATABASE_URL="postgresql://drift:password@db:5432/drift"

# Remote server
DATABASE_URL="postgresql://drift:password@db.example.com:5432/drift"

# With SSL
DATABASE_URL="postgresql://drift:password@host:5432/drift?sslmode=require"

# Connection pooling
DATABASE_URL="postgresql://drift:password@host:5432/drift?connection_limit=10"
```

## PostgreSQL Setup

### Docker (Recommended for Development)

```yaml
# docker-compose.yml
services:
    db:
        image: postgres:17-alpine
        environment:
            POSTGRES_USER: drift
            POSTGRES_PASSWORD: your-secure-password
            POSTGRES_DB: drift
        volumes:
            - postgres_data:/var/lib/postgresql/data
        ports:
            - "5432:5432"
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U drift"]
            interval: 5s
            timeout: 5s
            retries: 5

volumes:
    postgres_data:
```

### Manual Installation

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create user and database
sudo -u postgres psql
```

```sql
CREATE USER drift WITH PASSWORD 'your-secure-password';
CREATE DATABASE drift OWNER drift;
GRANT ALL PRIVILEGES ON DATABASE drift TO drift;
\q
```

#### macOS (Homebrew)

```bash
brew install postgresql@17
brew services start postgresql@17

createuser -s drift
createdb -O drift drift
```

### Cloud Providers

#### Supabase

1. Create a project at [supabase.com](https://supabase.com)
1. Go to Settings → Database
1. Copy the connection string (use "Transaction" pooler for serverless)

```bash
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

#### Neon

1. Create a project at [neon.tech](https://neon.tech)
1. Copy the connection string from the dashboard

```bash
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

#### Railway

1. Add PostgreSQL plugin to your project
1. Use the `DATABASE_URL` variable automatically provided

#### AWS RDS

1. Create PostgreSQL instance in RDS
1. Configure security groups for access
1. Use the endpoint provided

```bash
DATABASE_URL="postgresql://drift:password@drift-db.xxxxx.us-east-1.rds.amazonaws.com:5432/drift"
```

## Database Migrations

### Running Migrations

```bash
# Apply all pending migrations
yarn prisma migrate deploy

# Create new migration (development)
yarn prisma migrate dev --name your-migration-name
```

### Migration Status

```bash
# Check migration status
yarn prisma migrate status
```

### Reset Database (Development Only)

```bash
# Warning: This deletes all data
yarn prisma migrate reset
```

## Schema Overview

Drift uses the following data model:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│    Post     │────<│    File     │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │     ┌─────────────┐
       └────<│   Account   │  (OAuth providers)
       │     └─────────────┘
       │     ┌─────────────┐
       └────<│   Session   │
       │     └─────────────┘
       │     ┌─────────────┐
       └────<│  ApiToken   │
             └─────────────┘
```

### Key Tables

| Table        | Purpose                       |
| ------------ | ----------------------------- |
| `users`      | User accounts                 |
| `posts`      | Code snippets and documents   |
| `files`      | Individual files within posts |
| `accounts`   | OAuth provider connections    |
| `sessions`   | Active user sessions          |
| `api_tokens` | API authentication tokens     |

## Performance Optimization

### Connection Pooling

For production, use connection pooling to manage database connections efficiently.

#### Prisma Connection Limit

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

#### PgBouncer

For high-traffic deployments, use PgBouncer:

```ini
# pgbouncer.ini
[databases]
drift = host=localhost port=5432 dbname=drift

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

### Indexing

Drift's schema includes optimized indexes. For custom queries, consider:

```sql
-- Example: Index for searching posts by title
CREATE INDEX idx_posts_title ON posts USING gin(to_tsvector('english', title));
```

### Vacuum and Maintenance

```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

Set up automatic maintenance:

```bash
# /etc/cron.daily/postgres-maintenance
#!/bin/bash
sudo -u postgres psql -d drift -c "VACUUM ANALYZE;"
```

## Monitoring

### Database Size

```sql
SELECT pg_size_pretty(pg_database_size('drift'));
```

### Table Sizes

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### Active Connections

```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'drift';
```

### Slow Queries

Enable slow query logging:

```sql
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();
```

## Troubleshooting

### Connection Refused

1. Verify PostgreSQL is running: `pg_isready`
1. Check firewall rules
1. Verify `postgresql.conf` allows connections
1. Check `pg_hba.conf` authentication rules

### Authentication Failed

1. Verify username and password
1. Check `pg_hba.conf` for correct auth method
1. URL-encode special characters in password

### Too Many Connections

1. Increase `max_connections` in `postgresql.conf`
1. Implement connection pooling
1. Check for connection leaks in application

### SSL Connection Required

Add SSL mode to connection string:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Security Best Practices

1. **Use strong passwords** - Minimum 16 characters
1. **Limit network access** - Firewall rules, VPC
1. **Enable SSL** - Encrypt connections
1. **Regular backups** - See [Backup Guide](../administration/backup-restore.md)
1. **Keep updated** - Apply security patches
1. **Least privilege** - Only grant necessary permissions
