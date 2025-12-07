# Systemd Service Configuration

Run Drift as a systemd service on Linux servers.

## Prerequisites

- Linux server with systemd
- Node.js 24+ installed
- PostgreSQL database accessible
- Drift application built

## Basic Setup

### 1. Create System User

```bash
# Create a dedicated user for Drift
sudo useradd --system --home /opt/drift --shell /bin/false drift
```

### 2. Install Application

```bash
# Create directory
sudo mkdir -p /opt/drift
cd /opt/drift

# Clone and build
sudo git clone https://github.com/lbenicio/drift.git .
sudo chown -R drift:drift /opt/drift

# Switch to drift user for setup
sudo -u drift bash

# Enable corepack and install
corepack enable
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Build application
yarn prisma generate
yarn prisma migrate deploy
yarn build:pkg

exit
```

### 3. Create Service File

```ini
# /etc/systemd/system/drift.service
[Unit]
Description=Drift - Self-hosted Gist Clone
Documentation=https://github.com/lbenicio/drift
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=drift
Group=drift
WorkingDirectory=/opt/drift

# Environment
Environment=NODE_ENV=production
Environment=PORT=3001
EnvironmentFile=/opt/drift/.env

# Start command
ExecStart=/usr/bin/yarn start:prod

# Restart policy
Restart=on-failure
RestartSec=10
StartLimitInterval=60
StartLimitBurst=3

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
ReadWritePaths=/opt/drift

# Resource limits
MemoryMax=512M
CPUQuota=100%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=drift

[Install]
WantedBy=multi-user.target
```

### 4. Enable and Start

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable at boot
sudo systemctl enable drift

# Start service
sudo systemctl start drift

# Check status
sudo systemctl status drift
```

## Service Management

### Common Commands

```bash
# Start
sudo systemctl start drift

# Stop
sudo systemctl stop drift

# Restart
sudo systemctl restart drift

# Reload (if supported)
sudo systemctl reload drift

# Status
sudo systemctl status drift

# Enable at boot
sudo systemctl enable drift

# Disable at boot
sudo systemctl disable drift
```

### Viewing Logs

```bash
# Follow logs
sudo journalctl -u drift -f

# Last 100 lines
sudo journalctl -u drift -n 100

# Since last boot
sudo journalctl -u drift -b

# Time range
sudo journalctl -u drift --since "2024-01-01" --until "2024-01-02"

# Export logs
sudo journalctl -u drift --no-pager > drift.log
```

## Advanced Configuration

### Socket Activation

For faster startup and on-demand activation:

```ini
# /etc/systemd/system/drift.socket
[Unit]
Description=Drift Socket

[Socket]
ListenStream=3001
Accept=no

[Install]
WantedBy=sockets.target
```

Update service:

```ini
# /etc/systemd/system/drift.service
[Unit]
Requires=drift.socket
After=drift.socket
```

### Multiple Instances

```ini
# /etc/systemd/system/drift@.service
[Unit]
Description=Drift Instance %i
After=network.target postgresql.service

[Service]
Type=simple
User=drift
Group=drift
WorkingDirectory=/opt/drift

Environment=NODE_ENV=production
Environment=PORT=300%i
EnvironmentFile=/opt/drift/.env

ExecStart=/usr/bin/yarn start:prod

Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start multiple instances:

```bash
sudo systemctl enable drift@1 drift@2 drift@3
sudo systemctl start drift@1 drift@2 drift@3
```

### With Watchdog

Enable automatic restart on hang:

```ini
[Service]
Type=notify
WatchdogSec=30
```

### Resource Limits

```ini
[Service]
# Memory limits
MemoryMax=512M
MemoryHigh=400M

# CPU limits
CPUQuota=100%
CPUWeight=100

# File limits
LimitNOFILE=65535
LimitNPROC=4096

# IO limits (requires cgroups v2)
IOWeight=100
```

## Environment File

Create `/opt/drift/.env`:

```bash
# Database
DATABASE_URL=postgresql://drift:password@localhost:5432/drift

# Application
DRIFT_URL=https://drift.example.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://drift.example.com

# Features
ENABLE_ADMIN=true
CREDENTIAL_AUTH=true
```

Secure the file:

```bash
sudo chown drift:drift /opt/drift/.env
sudo chmod 600 /opt/drift/.env
```

## Updating Drift

### Manual Update

```bash
# Stop service
sudo systemctl stop drift

# Update code
cd /opt/drift
sudo -u drift git pull
sudo -u drift yarn install
sudo -u drift yarn prisma migrate deploy
sudo -u drift yarn build:pkg

# Start service
sudo systemctl start drift
```

### Update Script

Create `/opt/drift/update.sh`:

```bash
#!/bin/bash
set -e

echo "Stopping Drift..."
sudo systemctl stop drift

echo "Updating code..."
cd /opt/drift
git pull

echo "Installing dependencies..."
yarn install

echo "Running migrations..."
yarn prisma migrate deploy

echo "Building..."
yarn build:pkg

echo "Starting Drift..."
sudo systemctl start drift

echo "Update complete!"
sudo systemctl status drift
```

```bash
sudo chmod +x /opt/drift/update.sh
```

## Security Hardening

### Strict Service Configuration

```ini
[Service]
# User/Group
User=drift
Group=drift
DynamicUser=false

# Filesystem
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectKernelLogs=true
ProtectControlGroups=true
ProtectClock=true
ProtectHostname=true
RestrictRealtime=true
RestrictSUIDSGID=true
RemoveIPC=true
PrivateMounts=true

# Network
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
IPAddressDeny=any
IPAddressAllow=localhost

# Capabilities
CapabilityBoundingSet=
AmbientCapabilities=
NoNewPrivileges=true

# Syscalls
SystemCallFilter=@system-service
SystemCallArchitectures=native

# Read-write paths
ReadWritePaths=/opt/drift/.next
ReadWritePaths=/opt/drift/node_modules/.cache
```

## Troubleshooting

### Service Won't Start

```bash
# Check status
sudo systemctl status drift

# Check logs
sudo journalctl -u drift -n 50 --no-pager

# Test manually
sudo -u drift /usr/bin/yarn start:prod
```

### Permission Denied

```bash
# Fix ownership
sudo chown -R drift:drift /opt/drift

# Check SELinux (if enabled)
sudo ausearch -m AVC -ts recent
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process or change port
```

### High Memory Usage

1. Check for memory leaks in logs
1. Reduce `MemoryMax` and monitor
1. Consider adding swap
1. Scale horizontally instead

## Monitoring Integration

### Prometheus Metrics

Add to service:

```ini
[Service]
Environment=METRICS_ENABLED=true
Environment=METRICS_PORT=9090
```

### Health Check Script

```bash
#!/bin/bash
# /opt/drift/healthcheck.sh

if curl -sf http://localhost:3001/api/health > /dev/null; then
    exit 0
else
    exit 1
fi
```

Use with monitoring tools like Nagios, Zabbix, or custom scripts.
