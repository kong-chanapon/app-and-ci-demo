pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    options {
        // Keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        // Docker registry - for local use Docker Hub or local registry
        DOCKER_REGISTRY = 'docker.io' // or your local registry
        DOCKER_USERNAME = 'chanapon63070028' // เปลี่ยนเป็น username ที่ถูกต้อง
        IMAGE_NAME = 'nodejs-demo'
        
        // Dynamic versioning
        BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        IMAGE_TAG = "${BUILD_VERSION}"
        
        // Kubernetes & ArgoCD config
        K8S_NAMESPACE = 'default'
        HELM_CHART_REPO = 'https://github.com/kong-chanapon/k8s-demo.git' // Helm chart repository
        ARGOCD_APP_NAME = 'nodejs-demo'
        
        // Tools
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('🔍 Environment Check') {
            steps {
                script {
                    echo "🚀 Starting CI Pipeline"
                    echo "📝 Build Number: ${env.BUILD_NUMBER}"
                    echo "🔗 Git Commit: ${env.GIT_COMMIT}"
                    echo "🏷️  Image Tag: ${IMAGE_TAG}"
                    echo "📦 Full Image Name: ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    // Check Docker
                    sh 'docker --version'
                    sh 'docker info'
                }
            }
        }

        stage('🧪 Run Tests') {
            steps {
                script {
                    echo "🧪 Running Node.js tests..."
                    
                    // Install dependencies and run tests
                    sh """
                        # Install dependencies
                        npm ci
                        
                        # Run linting (if eslint is configured)
                        # npm run lint
                        
                        # Run unit tests with coverage
                        npm run test:coverage
                        
                        # Security audit
                        npm audit --audit-level moderate || true
                    """
                }
            }
        }

        stage('🔧 Build Application') {
            steps {
                script {
                    echo "🔨 Building Docker image..."
                    
                    // Build with BuildKit for better performance
                    sh """
                        docker build \
                            --tag ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} \
                            --tag ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest \
                            --label "build.number=${env.BUILD_NUMBER}" \
                            --label "git.commit=${env.GIT_COMMIT}" \
                            --label "build.date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
                            .
                    """
                }
            }
        }

        stage('🧪 Test Image') {
            steps {
                script {
                    echo "🔍 Testing Docker image..."
                    
                    // Test image can run
                    sh """
                        # Run container in detached mode
                        docker run -d --name test-${BUILD_NUMBER} -p 8081:3000 \
                            ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
                        
                        # Wait for container to start
                        sleep 10
                        
                        # Test health endpoint
                        curl -f http://localhost:8081/health || exit 1
                        
                        # Test readiness endpoint
                        curl -f http://localhost:8081/ready || exit 1
                        
                        # Test main page
                        curl -f http://localhost:8081/ || exit 1
                        
                        # Test API endpoint
                        curl -f http://localhost:8081/api/info || exit 1
                        
                        # Cleanup test container
                        docker stop test-${BUILD_NUMBER} || true
                        docker rm test-${BUILD_NUMBER} || true
                    """
                }
            }
        }

        stage('🚢 Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "📤 Pushing to Docker registry..."
                    
                    // Login to Docker registry
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', 
                                                    usernameVariable: 'DOCKER_USER', 
                                                    passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                        
                        // Push both tagged and latest versions
                        sh "docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('📝 Update Helm Values') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "📝 Updating Helm chart values..."
                    
                    // Clone helm chart repository
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', 
                                                    usernameVariable: 'GIT_USER', 
                                                    passwordVariable: 'GIT_PASS')]) {
                        sh """
                            # Configure Git
                            git config --global user.email "jenkins@example.com"
                            git config --global user.name "Jenkins CI"
                            
                            # Clone helm chart repo
                            rm -rf helm-chart || true
                            git clone https://\${GIT_USER}:\${GIT_PASS}@github.com/kong-chanapon/nginx-demo-chart.git helm-chart
                            cd helm-chart
                            
                            # Update image tag in values.yaml
                            sed -i '' 's/tag: .*/tag: "${IMAGE_TAG}"/' values.yaml
                            
                            # Commit and push changes
                            git add values.yaml
                            git commit -m "Update image tag to ${IMAGE_TAG} (Build: ${BUILD_NUMBER})"
                            git push origin main
                            
                            # Cleanup
                            cd ..
                            rm -rf helm-chart
                        """
                    }
                }
            }
        }

        stage('🔄 Trigger ArgoCD Sync') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "🔄 Triggering ArgoCD synchronization..."
                    
                    // Option 1: Use ArgoCD CLI (if available in Jenkins container)
                    sh """
                        # Wait for Helm chart update to propagate
                        sleep 10
                        
                        # Trigger ArgoCD sync via CLI (if argocd CLI is installed)
                        # argocd app sync ${ARGOCD_APP_NAME} --server argocd-server.argocd.svc.cluster.local
                        
                        # Option 2: Use curl to ArgoCD API
                        echo "✅ Helm chart updated. ArgoCD will detect changes automatically."
                        echo "🔍 Monitor deployment at ArgoCD UI: http://localhost:8080"
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker image prune -f || true'
                sh "docker image rm ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true"
            }
        }
        
        success {
            echo """
            ✅ Pipeline completed successfully!
            
            📦 Built Image: ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
            🏷️  Version: ${BUILD_VERSION}
            🔗 Git Commit: ${env.GIT_COMMIT}
            
            🚀 Next Steps:
            1. Check ArgoCD UI for deployment status
            2. Verify application is running in Kubernetes
            3. Test the application endpoint
            """
        }

        failure {
            echo """
            ❌ Pipeline failed!
            
            🔍 Check the logs above for error details.
            Common issues:
            - Docker build failures
            - Test failures
            - Registry push issues
            - Git repository access problems
            """
        }

        cleanup {
            // Clean workspace
            cleanWs()
        }
    }
}
