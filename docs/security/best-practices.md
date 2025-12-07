# Security Best Practices

Hardening your Drift instance for production use.

## Overview

Security is critical for any application handling user data. This guide covers
essential security measures for deploying Drift safely.

## Authentication Security

### Strong Secrets

Generate cryptographically secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate database password
openssl rand -hex 16
```

Never use:

- Default values from examples
- Simple or predictable strings
- Shared secrets across environments

### Password Storage

Drift uses bcrypt for password hashing:

- Automatic salting
- Configurable work factor
- Timing-attack resistant

### Session Security

NextAuth.js provides secure session handling:

- JWT tokens signed with NEXTAUTH_SECRET
- Secure, HttpOnly cookies
- CSRF protection built-in

Configuration in production:

```typescript
// Recommended session settings
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

## Network Security

### HTTPS Required

Always use HTTPS in production:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name drift.example.com;
    return 301 https://$server_name$request_uri;
}
```

### TLS Configuration

Modern TLS settings:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
```

### Security Headers

Add these headers via reverse proxy:

```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS protection (legacy browsers)
add_header X-XSS-Protection "1; mode=block" always;

# Referrer policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Firewall Configuration

Restrict access to necessary ports only:

```bash
# UFW example
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

Internal services should not be exposed:

```bash
# PostgreSQL only accessible locally
sudo ufw deny 5432
```

## Database Security

### Connection Security

Use SSL for database connections:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/drift?sslmode=require"
```

### Access Control

Follow least privilege principle:

```sql
-- Create dedicated user with minimal permissions
CREATE USER drift WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE drift TO drift;
GRANT USAGE ON SCHEMA public TO drift;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO drift;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO drift;
```

### Network Restrictions

Limit database access by IP:

```plaintext
# pg_hba.conf
# Only allow connections from app server
host drift drift 10.0.1.5/32 scram-sha-256
```

## Application Security

### Input Validation

Drift uses Prisma which prevents SQL injection. Additional validations:

- File size limits
- Content type verification
- Input sanitization for display

### XSS Prevention

React automatically escapes content. Be careful with:

- `dangerouslySetInnerHTML` - only with sanitized content
- User-generated HTML - sanitize with DOMPurify

### Rate Limiting

Implement at reverse proxy level:

```nginx
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
}
```

### File Upload Security

Drift stores files in the database:

- Size limits enforced
- Content stored as bytes (not executed)
- File type validation on display

## Container Security

### Run as Non-Root

Drift containers run as user `nextjs` (UID 1001):

```dockerfile
USER nextjs
```

### Read-Only Filesystem

Enable where possible:

```bash
docker run --read-only --tmpfs /tmp drift
```

### Resource Limits

Prevent resource exhaustion:

```bash
docker run \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  drift
```

### Image Scanning

Scan for vulnerabilities:

```bash
# Docker Scout
docker scout cves ghcr.io/lbenicio/drift:latest

# Trivy
trivy image ghcr.io/lbenicio/drift:latest
```

## Secrets Management

### Environment Variables

Never commit secrets:

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### Secret Rotation

Regularly rotate:

- `NEXTAUTH_SECRET` - Invalidates all sessions
- Database passwords
- OAuth client secrets
- API tokens

### Secrets in Production

Consider using:

- Docker secrets
- Kubernetes secrets
- HashiCorp Vault
- AWS Secrets Manager
- Environment variable injection

## Monitoring and Auditing

### Log Security Events

Monitor for:

- Failed login attempts
- Unusual API patterns
- Error spikes
- Unauthorized access attempts

### Access Logging

Enable access logs in reverse proxy:

```nginx
access_log /var/log/nginx/drift_access.log combined;
```

### Audit Trails

For compliance, consider database audit logging:

```sql
CREATE EXTENSION IF NOT EXISTS pgaudit;
```

## Incident Response

### Preparation

- Document escalation procedures
- Keep contact list updated
- Test backup restoration
- Have rollback plan ready

### Response Steps

- Identify and contain
- Assess impact
- Remediate
- Recover
- Post-incident review

### Security Contact

Report security vulnerabilities to: security@example.com

## Security Checklist

### Deployment

- [ ] HTTPS enabled with valid certificate
- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] Database password is strong and unique
- [ ] Firewall restricts unnecessary ports
- [ ] Reverse proxy configured with security headers
- [ ] Rate limiting enabled

### Configuration

- [ ] Registration password set (if private instance)
- [ ] Admin access restricted
- [ ] OAuth apps have minimal permissions
- [ ] Debug mode disabled in production

### Operations

- [ ] Regular backups configured
- [ ] Log monitoring in place
- [ ] Security updates automated
- [ ] Secrets rotation schedule defined

### Docker

- [ ] Running as non-root user
- [ ] Resource limits set
- [ ] Images scanned for vulnerabilities
- [ ] Using specific version tags (not `latest`)

## Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
