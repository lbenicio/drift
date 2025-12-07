# PM2 Process Management

Run Drift with PM2 for process management, clustering, and zero-downtime deployments.

## Prerequisites

- Node.js 24+ installed
- Drift application built
- PM2 installed globally

## Installation

### Install PM2

```bash
npm install -g pm2
```

### Verify Installation

```bash
pm2 --version
```

## Basic Setup

### Start Drift with PM2

```bash
cd /path/to/drift

# Build first
yarn build:pkg

# Start with PM2
pm2 start yarn --name drift --interpreter bash -- start:prod
```

### Using Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
    apps: [
        {
            name: "drift",
            script: "yarn",
            args: "start:prod",
            interpreter: "/bin/bash",
            cwd: "/opt/drift",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            env: {
                NODE_ENV: "production",
                PORT: 3001,
            },
            env_file: ".env",
        },
    ],
};
```

Start with ecosystem file:

```bash
pm2 start ecosystem.config.js
```

## PM2 Commands

### Process Management

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop drift

# Restart
pm2 restart drift

# Reload (zero-downtime)
pm2 reload drift

# Delete from PM2
pm2 delete drift
```

### Monitoring

```bash
# List all processes
pm2 list

# Detailed status
pm2 show drift

# Real-time logs
pm2 logs drift

# Real-time monitoring
pm2 monit

# Dashboard
pm2 plus
```

### Logs

```bash
# All logs
pm2 logs

# Specific app logs
pm2 logs drift

# Clear logs
pm2 flush

# Log rotation
pm2 install pm2-logrotate
```

## Clustering

Run multiple instances for better performance:

```javascript
// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "drift",
            script: "yarn",
            args: "start:prod",
            interpreter: "/bin/bash",
            cwd: "/opt/drift",
            instances: "max", // or specific number: 4
            exec_mode: "cluster",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
```

📝 **Note:** Next.js already handles clustering internally.
For Next.js apps, `instances: 1` is usually sufficient.

## Auto-Start on Boot

```bash
# Generate startup script
pm2 startup

# Follow the instructions output by the command
# Usually something like:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u youruser --hp /home/youruser

# Save current process list
pm2 save
```

## Zero-Downtime Deployments

### Using PM2 Reload

```bash
# Update code
git pull
yarn install
yarn build:pkg

# Zero-downtime reload
pm2 reload drift
```

### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

cd /opt/drift

echo "Pulling latest code..."
git pull

echo "Installing dependencies..."
yarn install

echo "Running migrations..."
yarn prisma migrate deploy

echo "Building application..."
yarn build:pkg

echo "Reloading PM2..."
pm2 reload drift

echo "Deployment complete!"
pm2 show drift
```

### Using PM2 Deploy

Configure deployment in ecosystem:

```javascript
// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "drift",
            script: "yarn",
            args: "start:prod",
            interpreter: "/bin/bash",
        },
    ],
    deploy: {
        production: {
            user: "deploy",
            host: "server.example.com",
            ref: "origin/main",
            repo: "git@github.com:lbenicio/drift.git",
            path: "/opt/drift",
            "pre-deploy-local": "",
            "post-deploy": "yarn install && yarn prisma migrate deploy && yarn build:pkg && pm2 reload ecosystem.config.js --env production",
            "pre-setup": "",
        },
    },
};
```

Deploy commands:

```bash
# Initial setup
pm2 deploy production setup

# Deploy
pm2 deploy production

# Rollback
pm2 deploy production revert 1
```

## Advanced Configuration

### Full Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "drift",
            script: "yarn",
            args: "start:prod",
            interpreter: "/bin/bash",
            cwd: "/opt/drift",

            // Instances
            instances: 1,
            exec_mode: "fork",

            // Restart behavior
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: "10s",

            // Logging
            log_file: "/var/log/drift/combined.log",
            out_file: "/var/log/drift/out.log",
            error_file: "/var/log/drift/error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,

            // Environment
            env: {
                NODE_ENV: "production",
                PORT: 3001,
            },
            env_file: ".env",

            // Health check
            listen_timeout: 8000,
            kill_timeout: 5000,

            // Cron restart (optional)
            // cron_restart: '0 0 * * *', // Daily at midnight
        },
    ],
};
```

### Log Rotation

```bash
# Install log rotate module
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

### Memory Limits

```javascript
{
  max_memory_restart: '500M',  // Restart if memory exceeds 500MB
  node_args: '--max-old-space-size=450',  // V8 heap limit
}
```

## Monitoring and Metrics

### PM2 Plus (Paid)

```bash
pm2 plus
```

Features:

- Real-time metrics dashboard
- Historical data
- Alerts and notifications
- Memory/CPU profiling

### Prometheus Metrics

```bash
# Install metrics module
pm2 install pm2-prometheus-exporter

# Metrics available at :9209/metrics
```

### Custom Monitoring Script

```bash
#!/bin/bash
# monitor.sh

while true; do
  MEMORY=$(pm2 jlist | jq '.[0].monit.memory')
  CPU=$(pm2 jlist | jq '.[0].monit.cpu')
  UPTIME=$(pm2 jlist | jq '.[0].pm2_env.pm_uptime')

  echo "$(date): Memory: $MEMORY, CPU: $CPU%, Uptime: $UPTIME"

  # Alert if memory > 400MB
  if [ "$MEMORY" -gt 400000000 ]; then
    echo "WARNING: High memory usage!"
  fi

  sleep 60
done
```

## Integration with Nginx

```nginx
upstream drift {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name drift.example.com;

    location / {
        proxy_pass http://drift;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### App Keeps Restarting

```bash
# Check logs
pm2 logs drift --lines 100

# Check restart count
pm2 show drift | grep restarts

# Increase min_uptime
min_uptime: '30s'
```

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# Set memory limit
max_memory_restart: '400M'

# Check for leaks
pm2 show drift | grep memory
```

### Process Not Starting

```bash
# Check error logs
pm2 logs drift --err --lines 50

# Try starting manually
cd /opt/drift && yarn start:prod

# Check permissions
ls -la /opt/drift
```

### Clear and Restart

```bash
# Nuclear option - clear everything
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```
