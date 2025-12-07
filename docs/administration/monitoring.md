# Monitoring Guide

Monitor your Drift instance for performance, availability, and security.

## Health Checks

### HTTP Health Endpoint

Drift provides a health check endpoint:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Using with Load Balancers

#### AWS ALB

```json
{
    "healthCheckPath": "/api/health",
    "healthCheckIntervalSeconds": 30,
    "healthyThresholdCount": 2,
    "unhealthyThresholdCount": 3
}
```

#### Nginx Upstream

```nginx
upstream drift {
    server 127.0.0.1:3001;
    health_check uri=/api/health interval=30s;
}
```

## Application Metrics

### Key Metrics to Monitor

| Metric             | Description          | Alert Threshold     |
| ------------------ | -------------------- | ------------------- |
| Response Time      | HTTP request latency | > 2s                |
| Error Rate         | 5xx responses        | > 1%                |
| Memory Usage       | Node.js heap         | > 80%               |
| CPU Usage          | Process CPU          | > 80%               |
| Active Connections | Concurrent users     | Depends on capacity |

### Prometheus Metrics

If you add a metrics endpoint, expose Node.js metrics:

```javascript
// Example metrics (not included by default)
const prometheus = require("prom-client");

// Collect default metrics
prometheus.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests",
    labelNames: ["method", "route", "status"],
});
```

## Infrastructure Monitoring

### Docker Stats

```bash
# Real-time container stats
docker stats drift

# One-time snapshot
docker stats --no-stream drift
```

### Container Health

```bash
# Check container status
docker inspect --format='{{.State.Health.Status}}' drift

# View health check logs
docker inspect --format='{{json .State.Health}}' drift | jq
```

### System Resources

```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU load
uptime

# Detailed process info
htop
```

## Database Monitoring

### PostgreSQL Metrics

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Connection by state
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;

-- Database size
SELECT pg_size_pretty(pg_database_size('drift'));

-- Table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC;

-- Slow queries (requires pg_stat_statements)
SELECT
    query,
    calls,
    total_exec_time / 1000 as total_seconds,
    mean_exec_time as avg_ms
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Enable Query Logging

```sql
-- Log queries slower than 1 second
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

## Log Monitoring

### Application Logs

```bash
# Docker logs
docker logs -f drift

# Systemd journal
journalctl -u drift -f

# PM2 logs
pm2 logs drift
```

### Log Aggregation

#### Loki + Grafana

```yaml
# docker-compose.yml
services:
    loki:
        image: grafana/loki:2.9.0
        ports:
            - "3100:3100"
        volumes:
            - loki_data:/loki

    promtail:
        image: grafana/promtail:2.9.0
        volumes:
            - /var/log:/var/log
            - ./promtail-config.yml:/etc/promtail/config.yml
```

#### ELK Stack

```yaml
# filebeat.yml
filebeat.inputs:
    - type: container
      paths:
          - "/var/lib/docker/containers/*/*.log"
      processors:
          - add_docker_metadata: ~

output.elasticsearch:
    hosts: ["elasticsearch:9200"]
```

## Alerting

### Uptime Monitoring

#### UptimeRobot (Free)

- Monitor: `https://drift.example.com/api/health`
- Check interval: 5 minutes
- Alert: Email/SMS/Webhook

#### Healthchecks.io

```bash
# Add to backup script or cron
curl -fsS --retry 3 https://hc-ping.com/your-uuid
```

### Custom Alert Script

```bash
#!/bin/bash
# alert-check.sh

DRIFT_URL="http://localhost:3001"
WEBHOOK_URL="https://hooks.slack.com/services/..."

# Check health
response=$(curl -s -o /dev/null -w "%{http_code}" "$DRIFT_URL/api/health")

if [ "$response" != "200" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"🚨 Drift health check failed! Status: $response\"}"
fi
```

### Prometheus Alertmanager

```yaml
# alertmanager.yml
route:
    receiver: "slack"

receivers:
    - name: "slack"
      slack_configs:
          - api_url: "https://hooks.slack.com/services/..."
            channel: "#alerts"
```

Alert rules:

```yaml
# prometheus-rules.yml
groups:
    - name: drift
      rules:
          - alert: DriftDown
            expr: up{job="drift"} == 0
            for: 1m
            labels:
                severity: critical
            annotations:
                summary: "Drift is down"

          - alert: HighMemoryUsage
            expr: process_resident_memory_bytes{job="drift"} > 500000000
            for: 5m
            labels:
                severity: warning
            annotations:
                summary: "High memory usage"

          - alert: HighErrorRate
            expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
            for: 5m
            labels:
                severity: warning
            annotations:
                summary: "High error rate"
```

## Dashboards

### Grafana Dashboard

Key panels:

- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Active users
- Database connections
- Memory/CPU usage

### Docker Stats Dashboard

Using ctop or lazydocker:

```bash
# Install ctop
docker run --rm -ti \
    --name=ctop \
    -v /var/run/docker.sock:/var/run/docker.sock \
    quay.io/vektorlab/ctop:latest
```

## Performance Baseline

### Establish Baselines

Document normal metrics:

| Metric              | Normal Range | Investigation Threshold |
| ------------------- | ------------ | ----------------------- |
| Response time (p50) | 50-100ms     | > 200ms                 |
| Response time (p99) | 200-500ms    | > 1s                    |
| Memory usage        | 200-400MB    | > 500MB                 |
| CPU usage           | 10-30%       | > 70%                   |
| DB connections      | 5-20         | > 50                    |

### Load Testing

```bash
# Using hey
hey -n 1000 -c 50 https://drift.example.com/

# Using ab
ab -n 1000 -c 50 https://drift.example.com/

# Using k6
k6 run load-test.js
```

## Security Monitoring

### Failed Login Attempts

Monitor authentication logs for brute force attempts.

### Unusual Activity

- Spike in API requests
- Unusual user agents
- Geographic anomalies

### Security Headers Check

```bash
# Check security headers
curl -I https://drift.example.com | grep -i "x-frame\|x-content\|strict"
```

## Runbook Template

### Incident Response

1. **Detect** - Automated alert or user report
1. **Assess** - Check health endpoint, logs, metrics
1. **Mitigate** - Restart service, scale up, rollback
1. **Resolve** - Fix root cause
1. **Review** - Post-incident analysis

### Common Issues

| Symptom        | Check        | Action               |
| -------------- | ------------ | -------------------- |
| 502 errors     | App running? | Restart container    |
| Slow responses | Memory/CPU   | Scale or optimize    |
| DB errors      | Connections  | Check pool, restart  |
| High memory    | Leak?        | Restart, investigate |
