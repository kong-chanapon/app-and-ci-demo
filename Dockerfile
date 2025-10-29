# Multi-stage build for optimal image size
FROM node:18-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-bookworm-slim AS production

# Add metadata labels
LABEL maintainer="devops-team"
LABEL version="1.0.0"
LABEL description="DevOps Demo Node.js App"

RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init curl && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 nodeapp && \
    useradd -m -u 1001 -g nodeapp -s /usr/sbin/nologin nodeapp

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder --chown=nodeapp:nodeapp /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeapp:nodeapp package*.json ./
COPY --chown=nodeapp:nodeapp server.js ./

# Switch to non-root user
USER nodeapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
