# Troubleshooting Guide

Solutions for common issues with Drift.

## Quick Diagnostics

### Health Check

```bash
# Check if app is responding
curl -v http://localhost:3001/api/health

# Check container status (Docker)
docker ps -a | grep drift

# Check service status (systemd)
systemctl status drift
```

### Log Analysis

```bash
# Docker logs
docker logs drift --tail 100

# Systemd logs
journalctl -u drift -n 100

# PM2 logs
pm2 logs drift --lines 100
```

## Startup Issues

### App Won't Start

#### Symptoms

- Container exits immediately
- Service fails to start
- No response on port

#### Diagnosis

```bash
# Check exit code
docker inspect drift --format='{{.State.ExitCode}}'

# Check logs for errors
docker logs drift 2>&1 | tail -50
```

#### Common Causes

**Missing Environment Variables**

```plaintext
Error: Missing environment variable: DATABASE_URL
```

Solution: Ensure all required variables are set:

```bash
# Check .env file exists
cat .env | grep DATABASE_URL
cat .env | grep NEXTAUTH_SECRET
```

**Invalid DATABASE_URL**

```plaintext
Error: Invalid connection string
```

Solution: Verify format:

```bash
# Correct format
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**Port Already in Use**

```plaintext
Error: listen EADDRINUSE: address already in use :::3001
```

Solution:

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 yarn start:prod
```

### Database Connection Failed

#### Symptoms

```plaintext
Error: Can't reach database server
PrismaClientInitializationError: Can't reach database
```

#### Diagnosis

```bash
# Test database connectivity
psql -h localhost -U drift -d drift -c "SELECT 1"

# From Docker
docker exec drift nc -zv db 5432
```

#### Solutions

**Database not running**

```bash
# Start PostgreSQL
docker compose up -d db

# Check status
docker compose ps db
```

**Wrong credentials**

```bash
# Verify credentials
psql -h localhost -U drift -d drift
# Enter password when prompted
```

**Network issues (Docker)**

```bash
# Check networks
docker network ls
docker network inspect drift_default

# Ensure containers on same network
docker compose up -d --force-recreate
```

**Connection limit reached**

```sql
-- Check connections
SELECT count(*) FROM pg_stat_activity;

-- Increase limit in postgresql.conf
max_connections = 200
```

## Runtime Errors

### 500 Internal Server Error

#### Diagnosis

```bash
# Check application logs
docker logs drift --tail 200 | grep -i error
```

#### Common Causes

**Prisma client not generated**

```plaintext
Error: @prisma/client did not initialize yet
```

Solution:

```bash
yarn prisma generate
```

**Database schema mismatch**

```plaintext
Error: The table `posts` does not exist
```

Solution:

```bash
yarn prisma migrate deploy
```

### 502 Bad Gateway

#### Symptoms

- Nginx/reverse proxy returns 502
- App appears down but container is running

#### Diagnosis

```bash
# Check if app is listening
curl http://localhost:3001/api/health

# Check container health
docker inspect drift --format='{{.State.Health.Status}}'
```

#### Solutions

**App crashed but container running**

```bash
# Restart container
docker restart drift
```

**Wrong upstream port**

Check nginx config:

```nginx
# Should match Drift's port
proxy_pass http://localhost:3001;
```

### Memory Issues

#### Symptoms

```plaintext
FATAL ERROR: Reached heap limit Allocation failed
JavaScript heap out of memory
```

#### Diagnosis

```bash
# Check memory usage
docker stats drift --no-stream

# Check for memory limits
docker inspect drift | grep Memory
```

#### Solutions

**Increase memory limit**

```bash
docker run -m 1g drift
```

**Node.js heap size**

```bash
NODE_OPTIONS="--max-old-space-size=512" yarn start:prod
```

**Memory leak**

- Restart container periodically
- Monitor and investigate with profiling

### Performance Issues

#### Slow Response Times

**Diagnosis**

```bash
# Check response time
time curl http://localhost:3001/

# Check database queries
docker logs drift 2>&1 | grep "prisma:query"
```

**Solutions**

- Enable database query logging to find slow queries
- Add indexes for frequent queries
- Implement caching
- Scale horizontally

#### High CPU Usage

**Diagnosis**

```bash
# Check CPU usage
docker stats drift --no-stream

# Check processes
docker exec drift top
```

**Solutions**

- Profile application
- Optimize heavy computations
- Scale horizontally

## Authentication Issues

### Can't Log In

#### OAuth Errors

```plaintext
Error: OAuthCallbackError
```

**Causes and solutions:**

- Callback URL mismatch: Update OAuth app settings
- Expired client secret: Regenerate in provider settings
- Network issues: Check firewall rules

#### Session Issues

```plaintext
Error: Session not found
```

**Solutions:**

- Clear browser cookies
- Check `NEXTAUTH_SECRET` hasn't changed
- Verify `NEXTAUTH_URL` matches actual URL

### Registration Failed

**Registration password required**

If `REGISTRATION_PASSWORD` is set, users must provide it.

**Email already exists**

Each email can only be used once (unless using different OAuth providers).

## Database Issues

### Migration Failed

```plaintext
Error: Migration failed
```

**Solutions:**

```bash
# Check migration status
yarn prisma migrate status

# Reset database (DESTRUCTIVE)
yarn prisma migrate reset

# Force deploy (skip checks)
yarn prisma migrate deploy --skip-generate
```

### Data Corruption

**Symptoms:**

- Foreign key violations
- Orphaned records
- Inconsistent data

**Diagnosis:**

```sql
-- Find orphaned posts (no author)
SELECT * FROM posts WHERE "authorId" NOT IN (SELECT id FROM users);

-- Find orphaned files (no post)
SELECT * FROM files WHERE "postId" NOT IN (SELECT id FROM posts);
```

**Recovery:**

```sql
-- Clean orphaned records
DELETE FROM files WHERE "postId" NOT IN (SELECT id FROM posts);
```

## Docker Issues

### Container Keeps Restarting

**Diagnosis:**

```bash
# Check restart count
docker inspect drift --format='{{.RestartCount}}'

# Check last exit
docker inspect drift --format='{{.State.ExitCode}}'
```

**Solutions:**

- Check logs for crash reason
- Increase memory limits
- Fix application errors

### Volume Permission Issues

```plaintext
Error: EACCES: permission denied
```

**Solutions:**

```bash
# Fix ownership
sudo chown -R 1001:1001 ./data

# Or run as root (not recommended)
docker run --user root drift
```

### Network Issues

```plaintext
Error: Could not resolve host
```

**Solutions:**

```bash
# Check DNS
docker exec drift nslookup db

# Use IP instead of hostname
DATABASE_URL="postgresql://user:pass@172.17.0.2:5432/drift"
```

## Getting Help

### Information to Gather

Before asking for help, collect:

- Drift version
- Deployment method (Docker, systemd, etc.)
- Full error message
- Relevant logs
- Steps to reproduce

### Support Channels

- [GitHub Issues](https://github.com/lbenicio/drift/issues)
- Check existing issues first
- Provide detailed information

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* yarn start:dev
```

For Prisma:

```bash
DEBUG="prisma:*" yarn start:dev
```
