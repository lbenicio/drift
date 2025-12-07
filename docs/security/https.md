# HTTPS Setup Guide

Configure SSL/TLS certificates for secure connections.

## Overview

HTTPS is required for:

- Secure data transmission
- OAuth callback URLs
- Session cookie security
- SEO and browser trust

## Certificate Options

| Option        | Cost | Automation | Best For         |
| ------------- | ---- | ---------- | ---------------- |
| Let's Encrypt | Free | Yes        | Most deployments |
| Cloudflare    | Free | Yes        | CDN users        |
| Commercial CA | Paid | Varies     | Enterprise       |
| Self-signed   | Free | Manual     | Development only |

## Let's Encrypt with Certbot

### Nginx

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d drift.example.com

# Auto-renewal test
sudo certbot renew --dry-run
```

Certbot automatically:

- Obtains certificate
- Configures Nginx
- Sets up auto-renewal

### Standalone (No Web Server)

```bash
# Stop any service on port 80
sudo certbot certonly --standalone -d drift.example.com

# Certificates saved to:
# /etc/letsencrypt/live/drift.example.com/fullchain.pem
# /etc/letsencrypt/live/drift.example.com/privkey.pem
```

### Docker with Certbot

```yaml
services:
    certbot:
        image: certbot/certbot
        volumes:
            - ./certbot/conf:/etc/letsencrypt
            - ./certbot/www:/var/www/certbot
        command: certonly --webroot -w /var/www/certbot -d drift.example.com

    nginx:
        image: nginx:alpine
        ports:
            - "80:80"
            - "443:443"
        volumes:
            - ./nginx.conf:/etc/nginx/nginx.conf
            - ./certbot/conf:/etc/letsencrypt
            - ./certbot/www:/var/www/certbot
```

Nginx config for ACME challenge:

```nginx
server {
    listen 80;
    server_name drift.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

## Let's Encrypt with Caddy

Caddy handles certificates automatically:

```caddyfile
drift.example.com {
    reverse_proxy localhost:3001
}
```

That's it! Caddy automatically:

- Obtains Let's Encrypt certificate
- Configures HTTPS
- Handles renewal
- Redirects HTTP to HTTPS

## Cloudflare SSL

### Full (Strict) Mode

Recommended for production:

1. Add domain to Cloudflare
1. Update nameservers
1. Go to SSL/TLS settings
1. Select "Full (strict)"
1. Install origin certificate on server

### Origin Certificates

```bash
# Download from Cloudflare dashboard
# SSL/TLS > Origin Server > Create Certificate

# Install on server
sudo mkdir -p /etc/ssl/cloudflare
sudo cp cloudflare.pem /etc/ssl/cloudflare/cert.pem
sudo cp cloudflare.key /etc/ssl/cloudflare/key.pem
```

Nginx config:

```nginx
server {
    listen 443 ssl http2;
    server_name drift.example.com;

    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # Only allow Cloudflare IPs
    # (add all Cloudflare IP ranges)
}
```

## Manual Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name drift.example.com;

    # Certificate files
    ssl_certificate /etc/letsencrypt/live/drift.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/drift.example.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/drift.example.com/chain.pem;

    # Session caching
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # DH parameters (generate with: openssl dhparam -out dhparam.pem 2048)
    ssl_dhparam /etc/nginx/dhparam.pem;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:3001;
        # ... proxy settings
    }
}
```

## Traefik SSL Configuration

```yaml
# traefik.yml
certificatesResolvers:
    letsencrypt:
        acme:
            email: admin@example.com
            storage: /letsencrypt/acme.json
            httpChallenge:
                entryPoint: web
```

Docker labels:

```yaml
labels:
    - "traefik.http.routers.drift.tls.certresolver=letsencrypt"
```

## Certificate Renewal

### Automatic Renewal (Certbot)

Certbot sets up automatic renewal via systemd timer or cron:

```bash
# Check timer status
sudo systemctl status certbot.timer

# Manual renewal
sudo certbot renew
```

### Renewal Script

```bash
#!/bin/bash
# /etc/cron.daily/renew-certs

certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Monitoring Expiration

```bash
# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/drift.example.com/cert.pem

# Alert when expiring soon
echo | openssl s_client -servername drift.example.com -connect drift.example.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Testing SSL Configuration

### SSL Labs

Test your configuration: https://www.ssllabs.com/ssltest/

Target: A+ rating

### Local Testing

```bash
# Test connection
openssl s_client -connect drift.example.com:443

# Check certificate chain
openssl s_client -connect drift.example.com:443 -showcerts

# Check specific TLS version
openssl s_client -connect drift.example.com:443 -tls1_3
```

## Troubleshooting

### Certificate Not Trusted

- Check full chain is included
- Verify intermediate certificates
- Ensure certificate matches domain

### Mixed Content Warnings

- Update `DRIFT_URL` to use HTTPS
- Check for hardcoded HTTP URLs
- Update OAuth callback URLs

### Renewal Failed

```bash
# Check certbot logs
sudo journalctl -u certbot

# Manual renewal with debug
sudo certbot renew --dry-run --debug
```

### Port 443 in Use

```bash
# Find process using port
sudo lsof -i :443

# Kill or stop conflicting service
```

## Self-Signed Certificates (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/drift.key \
  -out /etc/ssl/certs/drift.crt \
  -subj "/CN=localhost"
```

⚠️ **Warning:** Never use self-signed certificates in production.
Browsers will show security warnings and OAuth providers won't work.

## Best Practices

- Always use TLS 1.2 or higher
- Enable HSTS with long max-age
- Use strong cipher suites
- Enable OCSP stapling
- Monitor certificate expiration
- Automate renewal process
- Test configuration regularly
