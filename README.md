# DevOps Demo App - Node.js Edition

Local DevOps pipeline demonstration using Jenkins, Docker, Kubernetes (Colima), and ArgoCD.

## 🏗️ Architecture

```
GitHub (Source) → Jenkins (CI) → Docker Registry → ArgoCD (CD) → Kubernetes (Colima)
```

## 🚀 Tech Stack

- **Backend**: Node.js + Express
- **CI/CD**: Jenkins Pipeline
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Colima)
- **GitOps**: ArgoCD
- **Registry**: Docker Hub (or local registry)

## 📁 Project Structure

```
app-and-ci-demo/
├── server.js              # Node.js application
├── package.json           # Dependencies & scripts
├── Dockerfile             # Container definition
├── Jenkinsfile           # CI Pipeline
├── jest.config.js        # Test configuration
├── test/                 # Test files
├── .dockerignore         # Docker ignore rules
├── .gitignore            # Git ignore rules
└── README.md            # This file
```

## 🔧 Setup Instructions

### 1. Prerequisites

- Colima with Kubernetes enabled
- Jenkins running in Colima
- ArgoCD installed in Kubernetes
- Docker Hub account (or local registry)
- GitHub repository for Helm charts

### 2. Jenkins Configuration

1. **Install Required Plugins**:
   - Docker Pipeline
   - Git Plugin
   - Pipeline Plugin
   - Credentials Plugin

2. **Add Credentials**:
   ```
   ID: docker-hub-credentials
   Type: Username with password
   Username: your-dockerhub-username
   Password: your-dockerhub-token
   ```

   ```
   ID: github-credentials  
   Type: Username with password
   Username: your-github-username
   Password: your-github-token
   ```

3. **Create Pipeline Job**:
   - New Item → Pipeline
   - Pipeline script from SCM → Git
   - Repository URL: your-repo-url
   - Script Path: Jenkinsfile

### 3. Helm Chart Repository

Create a separate repository for Helm charts:
```
nodejs-demo-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml (optional)
```

### 4. ArgoCD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nodejs-demo
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/kong-chanapon/nodejs-demo-chart.git
    targetRevision: HEAD
    path: .
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## 🔄 Workflow

1. **Developer pushes code** → GitHub
2. **Jenkins detects changes** → Triggers pipeline
3. **Build stage** → Creates Docker image
4. **Test stage** → Validates container
5. **Push stage** → Uploads to registry
6. **Update stage** → Modifies Helm values
7. **ArgoCD detects changes** → Deploys to Kubernetes

## 🌐 Local URLs

- **Application**: http://localhost:3000 (development) / http://localhost:30080 (k8s deployment)
- **API Endpoints**: 
  - Health: http://localhost:3000/health
  - Readiness: http://localhost:3000/ready
  - Metrics: http://localhost:3000/metrics
  - Info: http://localhost:3000/api/info
- **Jenkins**: http://localhost:8080
- **ArgoCD**: http://localhost:8081

## 🐛 Troubleshooting

### Build Issues
```bash
# Check Docker daemon
docker info

# Check Kubernetes
kubectl get nodes
kubectl get pods -A
```

### Registry Issues
```bash
# Login to Docker Hub
docker login

# Test push manually
docker tag nodejs-demo:latest username/nodejs-demo:test
docker push username/nodejs-demo:test
```

### ArgoCD Issues
```bash
# Check ArgoCD status
kubectl get applications -n argocd

# Sync manually
argocd app sync nodejs-demo
```

### Node.js Application Issues
```bash
# Check application logs
docker logs nodejs-demo-dev

# Test endpoints manually
curl -f http://localhost:3000/health
curl http://localhost:3000/metrics
```

## 📊 Monitoring

Check deployment status:
```bash
# Application pods
kubectl get pods -l app=nodejs-demo

# Application service
kubectl get svc nodejs-demo

# Application logs
kubectl logs -l app=nodejs-demo --tail=50

# Application ingress (if configured)  
kubectl get ingress nodejs-demo
```

## 🔐 Security Notes

- Use non-root user in Docker container
- Enable security headers in Nginx
- Use secrets for sensitive data
- Enable RBAC in Kubernetes

## 📈 Next Steps

1. Add automated tests (unit, integration)
2. Implement security scanning
3. Add monitoring and logging
4. Setup environment promotion (dev → staging → prod)
5. Add rollback capabilities
