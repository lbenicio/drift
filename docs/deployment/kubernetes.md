# Kubernetes Deployment

Deploy Drift on Kubernetes with high availability and auto-scaling.

## Prerequisites

- Kubernetes cluster (1.25+)
- kubectl configured
- Helm 3.x (optional, for Helm chart)
- PostgreSQL database (managed or self-hosted)

## Quick Start with Manifests

### 1. Create Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
    name: drift
```

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

```bash
# Create secrets from literals
kubectl create secret generic drift-secrets \
  --namespace drift \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/drift" \
  --from-literal=NEXTAUTH_SECRET="your-secret-key"
```

Or with a manifest:

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
    name: drift-secrets
    namespace: drift
type: Opaque
stringData:
    DATABASE_URL: "postgresql://user:pass@host:5432/drift"
    NEXTAUTH_SECRET: "your-secret-key"
    # Add other secrets as needed
```

### 3. Create ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: drift-config
    namespace: drift
data:
    DRIFT_URL: "https://drift.example.com"
    NEXTAUTH_URL: "https://drift.example.com"
    ENABLE_ADMIN: "true"
    WELCOME_TITLE: "Drift"
    CREDENTIAL_AUTH: "true"
```

### 4. Create Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: drift
    namespace: drift
    labels:
        app: drift
spec:
    replicas: 2
    selector:
        matchLabels:
            app: drift
    template:
        metadata:
            labels:
                app: drift
        spec:
            securityContext:
                runAsUser: 1001
                runAsGroup: 1001
                fsGroup: 1001
            containers:
                - name: drift
                  image: ghcr.io/lbenicio/drift:latest
                  ports:
                      - containerPort: 3001
                        name: http
                  envFrom:
                      - configMapRef:
                            name: drift-config
                      - secretRef:
                            name: drift-secrets
                  resources:
                      requests:
                          memory: "256Mi"
                          cpu: "250m"
                      limits:
                          memory: "512Mi"
                          cpu: "1000m"
                  livenessProbe:
                      httpGet:
                          path: /api/health
                          port: 3001
                      initialDelaySeconds: 30
                      periodSeconds: 10
                      timeoutSeconds: 5
                      failureThreshold: 3
                  readinessProbe:
                      httpGet:
                          path: /api/health
                          port: 3001
                      initialDelaySeconds: 5
                      periodSeconds: 5
                      timeoutSeconds: 3
                      failureThreshold: 3
```

### 5. Create Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
    name: drift
    namespace: drift
spec:
    selector:
        app: drift
    ports:
        - port: 80
          targetPort: 3001
          name: http
    type: ClusterIP
```

### 6. Create Ingress

#### With nginx-ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: drift
    namespace: drift
    annotations:
        kubernetes.io/ingress.class: nginx
        cert-manager.io/cluster-issuer: letsencrypt-prod
        nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
    tls:
        - hosts:
              - drift.example.com
          secretName: drift-tls
    rules:
        - host: drift.example.com
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: drift
                            port:
                                number: 80
```

#### With Traefik

```yaml
# ingress-traefik.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: drift
    namespace: drift
    annotations:
        traefik.ingress.kubernetes.io/router.entrypoints: websecure
        traefik.ingress.kubernetes.io/router.tls: "true"
        cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
    tls:
        - hosts:
              - drift.example.com
          secretName: drift-tls
    rules:
        - host: drift.example.com
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: drift
                            port:
                                number: 80
```

### 7. Apply All Manifests

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
    name: drift
    namespace: drift
spec:
    scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: drift
    minReplicas: 2
    maxReplicas: 10
    metrics:
        - type: Resource
          resource:
              name: cpu
              target:
                  type: Utilization
                  averageUtilization: 70
        - type: Resource
          resource:
              name: memory
              target:
                  type: Utilization
                  averageUtilization: 80
```

## Pod Disruption Budget

```yaml
# pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
    name: drift
    namespace: drift
spec:
    minAvailable: 1
    selector:
        matchLabels:
            app: drift
```

## PostgreSQL on Kubernetes

### Using CloudNativePG Operator

```yaml
# postgres-cluster.yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
    name: drift-db
    namespace: drift
spec:
    instances: 3
    storage:
        size: 10Gi
        storageClass: standard
    postgresql:
        parameters:
            max_connections: "100"
            shared_buffers: "256MB"
    bootstrap:
        initdb:
            database: drift
            owner: drift
            secret:
                name: drift-db-credentials
```

### Connection Secret

```yaml
# db-secret.yaml
apiVersion: v1
kind: Secret
metadata:
    name: drift-db-credentials
    namespace: drift
type: Opaque
stringData:
    username: drift
    password: your-secure-password
```

## Helm Chart (Coming Soon)

A Helm chart for Drift is planned. In the meantime, use kustomize or raw manifests.

### Kustomize Structure

```plaintext
drift/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/
    ├── development/
    │   └── kustomization.yaml
    └── production/
        ├── kustomization.yaml
        ├── ingress.yaml
        └── hpa.yaml
```

#### Base kustomization.yaml

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
    - deployment.yaml
    - service.yaml
    - configmap.yaml
```

#### Production Overlay

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: drift
resources:
    - ../../base
    - ingress.yaml
    - hpa.yaml
patches:
    - patch: |-
          - op: replace
            path: /spec/replicas
            value: 3
      target:
          kind: Deployment
          name: drift
```

## Monitoring

### ServiceMonitor for Prometheus

```yaml
# servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
    name: drift
    namespace: drift
spec:
    selector:
        matchLabels:
            app: drift
    endpoints:
        - port: http
          path: /api/metrics
          interval: 30s
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n drift
kubectl describe pod <pod-name> -n drift
kubectl logs <pod-name> -n drift
```

### Check Events

```bash
kubectl get events -n drift --sort-by='.lastTimestamp'
```

### Access Pod Shell

```bash
kubectl exec -it <pod-name> -n drift -- sh
```

### Port Forward for Debugging

```bash
kubectl port-forward -n drift svc/drift 3001:80
```

### Check Resource Usage

```bash
kubectl top pods -n drift
```
