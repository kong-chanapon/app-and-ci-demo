const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || '1.0.0';
const BUILD_TIME = new Date().toISOString();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Logging middleware
app.use(morgan('combined'));

// Compression middleware
app.use(compression());

// Parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    version: VERSION
  });
});

// Metrics endpoint (simple)
app.get('/metrics', (req, res) => {
  res.status(200).json({
    version: VERSION,
    buildTime: BUILD_TIME,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoints
app.get('/api/info', (req, res) => {
  res.json({
    app: 'DevOps Demo',
    version: VERSION,
    buildTime: BUILD_TIME,
    message: 'Hello from Node.js API!',
    techStack: [
      'Node.js',
      'Express',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'ArgoCD'
    ]
  });
});

// Main route - serve HTML
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevOps Demo App - Node.js</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            text-align: center;
            animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .version {
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 1.2em;
            margin: 20px 0;
            display: inline-block;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .info {
            margin: 30px 0;
            font-size: 1.1em;
            line-height: 1.8;
        }
        
        .tech-stack {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }
        
        .tech-item {
            background: rgba(255, 255, 255, 0.15);
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.9em;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.2s ease;
        }
        
        .tech-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.25);
        }
        
        .api-section {
            margin-top: 40px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .api-links {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        
        .api-link {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.2s ease;
            font-size: 0.9em;
        }
        
        .api-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }
        
        .stats {
            margin-top: 30px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-label {
            font-size: 0.8em;
            opacity: 0.8;
            margin-bottom: 5px;
        }
        
        .stat-value {
            font-size: 1.1em;
            font-weight: bold;
            color: #FFD700;
        }
        
        @media (max-width: 600px) {
            h1 { font-size: 2em; }
            .container { padding: 20px; }
            .tech-stack { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 DevOps Demo</h1>
        <div class="version">Version: ${VERSION}</div>
        
        <div class="info">
            <p>🎯 <strong>Node.js CI/CD Pipeline Demo</strong></p>
            <p>Jenkins → Docker → Kubernetes → ArgoCD</p>
        </div>

        <div class="tech-stack">
            <div class="tech-item">🟢 Node.js</div>
            <div class="tech-item">⚡ Express</div>
            <div class="tech-item">🐳 Docker</div>
            <div class="tech-item">☸️ Kubernetes</div>
            <div class="tech-item">🔨 Jenkins</div>
            <div class="tech-item">🔄 ArgoCD</div>
        </div>

        <div class="api-section">
            <h3>📡 API Endpoints</h3>
            <div class="api-links">
                <a href="/health" class="api-link">Health Check</a>
                <a href="/ready" class="api-link">Readiness</a>
                <a href="/metrics" class="api-link">Metrics</a>
                <a href="/api/info" class="api-link">App Info</a>
            </div>
        </div>

        <div class="stats" id="stats">
            <div class="stat-item">
                <div class="stat-label">Build Time</div>
                <div class="stat-value" id="buildTime">${BUILD_TIME}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Current Time</div>
                <div class="stat-value" id="currentTime"></div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Node.js Version</div>
                <div class="stat-value">${process.version}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Environment</div>
                <div class="stat-value">${process.env.NODE_ENV || 'development'}</div>
            </div>
        </div>
    </div>

    <script>
        // Update current time
        function updateTime() {
            document.getElementById('currentTime').textContent = 
                new Date().toLocaleTimeString();
        }
        
        updateTime();
        setInterval(updateTime, 1000);

        // Add some interactivity
        document.querySelectorAll('.tech-item').forEach(item => {
            item.addEventListener('click', () => {
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 150);
            });
        });
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 DevOps Demo App Started!
📍 Port: ${PORT}
🏷️  Version: ${VERSION}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toISOString()}

📡 Endpoints:
   GET  /           - Main page
   GET  /health     - Health check
   GET  /ready      - Readiness check  
   GET  /metrics    - App metrics
   GET  /api/info   - App information
    `);
  });
}

// Export app for testing
module.exports = app;