# Reverse Proxy Configuration

Configure Nginx, Caddy, or Traefik as a reverse proxy for Drift.

## Why Use a Reverse Proxy

- **SSL/TLS Termination** - Handle HTTPS certificates
- **Load Balancing** - Distribute traffic across instances
- **Caching** - Cache static assets
- **Security** - Hide backend servers, rate limiting
- **Compression** - Gzip responses

## Nginx

### Basic Configuration

```nginx
# /etc/nginx/sites-available/drift
server {
    listen 80;
    server_name drift.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name drift.example.com;

    # SSL certificates (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/drift.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/drift.example.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase max body size for file uploads
    client_max_body_size 50M;
}
```

### With Docker Network

```nginx
server {
    listen 443 ssl http2;
    server_name drift.example.com;

    # SSL configuration...

    location / {
        # Use Docker service name
        proxy_pass http://drift:3001;
        # ... other proxy settings
    }
}
```

### Load Balancing Multiple Instances

```nginx
upstream drift_backend {
    least_conn;
    server drift1:3001 weight=1;
    server drift2:3001 weight=1;
    server drift3:3001 weight=1;
}

server {
    listen 443 ssl http2;
    server_name drift.example.com;

    # SSL configuration...

    location / {
        proxy_pass http://drift_backend;
        # ... other proxy settings
    }
}
```

### Enable with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate and auto-configure
sudo certbot --nginx -d drift.example.com

# Enable site
sudo ln -s /etc/nginx/sites-available/drift /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Caddy

Caddy automatically handles SSL certificates via Let's Encrypt.

### Caddyfile

```caddyfile
drift.example.com {
    reverse_proxy localhost:3001

    # Security headers
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # File upload limit
    request_body {
        max_size 50MB
    }

    # Enable compression
    encode gzip

    # Logging
    log {
        output file /var/log/caddy/drift.log
    }
}
```

### With Docker

```caddyfile
drift.example.com {
    reverse_proxy drift:3001
}
```

### Docker Compose with Caddy

```yaml
services:
    caddy:
        image: caddy:2-alpine
        restart: unless-stopped
        ports:
            - "80:80"
            - "443:443"
        volumes:
            - ./Caddyfile:/etc/caddy/Caddyfile
            - caddy_data:/data
            - caddy_config:/config
        networks:
            - proxy

    drift:
        image: ghcr.io/lbenicio/drift:latest
        expose:
            - "3001"
        networks:
            - proxy
            - internal
        # ... environment variables

networks:
    proxy:
    internal:

volumes:
    caddy_data:
    caddy_config:
```

### Load Balancing with Caddy

```caddyfile
drift.example.com {
    reverse_proxy drift1:3001 drift2:3001 drift3:3001 {
        lb_policy least_conn
        health_uri /api/health
        health_interval 30s
    }
}
```

## Traefik

### Static Configuration

```yaml
# traefik.yml
api:
    dashboard: true

entryPoints:
    web:
        address: ":80"
        http:
            redirections:
                entryPoint:
                    to: websecure
                    scheme: https
    websecure:
        address: ":443"

certificatesResolvers:
    letsencrypt:
        acme:
            email: admin@example.com
            storage: /letsencrypt/acme.json
            httpChallenge:
                entryPoint: web

providers:
    docker:
        exposedByDefault: false
        network: proxy
```

### Docker Compose with Traefik

```yaml
services:
    traefik:
        image: traefik:v3.0
        restart: unless-stopped
        ports:
            - "80:80"
            - "443:443"
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock:ro
            - ./traefik.yml:/traefik.yml:ro
            - letsencrypt:/letsencrypt
        networks:
            - proxy

    drift:
        image: ghcr.io/lbenicio/drift:latest
        restart: unless-stopped
        expose:
            - "3001"
        networks:
            - proxy
            - internal
        labels:
            - "traefik.enable=true"
            - "traefik.http.routers.drift.rule=Host(`drift.example.com`)"
            - "traefik.http.routers.drift.entrypoints=websecure"
            - "traefik.http.routers.drift.tls.certresolver=letsencrypt"
            - "traefik.http.services.drift.loadbalancer.server.port=3001"
            # Security headers
            - "traefik.http.middlewares.drift-headers.headers.frameDeny=true"
            - "traefik.http.middlewares.drift-headers.headers.contentTypeNosniff=true"
            - "traefik.http.routers.drift.middlewares=drift-headers"
        # ... environment variables

networks:
    proxy:
    internal:

volumes:
    letsencrypt:
```

### Load Balancing with Traefik

Traefik automatically load balances when you scale containers:

```bash
docker compose up -d --scale drift=3
```

## Cloudflare

If using Cloudflare as a CDN/proxy:

### SSL Mode

Set SSL/TLS mode to **Full (Strict)** in Cloudflare dashboard.

### Page Rules

```plaintext
# Cache static assets
drift.example.com/_next/static/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month

# Bypass cache for API
drift.example.com/api/*
Cache Level: Bypass
```

### Cloudflare Headers

Your backend will receive Cloudflare headers:

- `CF-Connecting-IP` - Original client IP
- `CF-RAY` - Request ID for debugging
- `CF-IPCountry` - Client's country

Update your Nginx config:

```nginx
# Trust Cloudflare IPs
set_real_ip_from 173.245.48.0/20;
# ... (add all Cloudflare IP ranges)
real_ip_header CF-Connecting-IP;
```

## Security Best Practices

### Rate Limiting (Nginx)

```nginx
# Define rate limit zone
limit_req_zone $binary_remote_addr zone=drift_limit:10m rate=10r/s;

server {
    # Apply rate limiting
    location /api/ {
        limit_req zone=drift_limit burst=20 nodelay;
        proxy_pass http://localhost:3001;
    }
}
```

### Rate Limiting (Caddy)

```caddyfile
drift.example.com {
    rate_limit {
        zone dynamic_zone {
            key {remote_host}
            events 100
            window 1m
        }
    }
    reverse_proxy localhost:3001
}
```

### Firewall Rules

```bash
# Allow only proxy to access Drift
sudo ufw allow from 127.0.0.1 to any port 3001
sudo ufw deny 3001
```

## Troubleshooting

### 502 Bad Gateway

1. Check if Drift is running: `curl localhost:3001`
1. Verify proxy_pass URL is correct
1. Check Drift logs for errors

### SSL Certificate Issues

1. Verify domain DNS points to server
1. Check certificate paths
1. Ensure ports 80/443 are accessible

### WebSocket Errors

Ensure these headers are set:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

### Slow Responses

1. Enable keepalive connections
1. Check proxy timeouts
1. Enable response compression
