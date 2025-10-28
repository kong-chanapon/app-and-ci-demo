# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Add metadata labels
LABEL maintainer="devops-team"
LABEL version="1.0.0"
LABEL description="DevOps Demo Node.js App"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app directory and non-root user
RUN addgroup -g 1001 -S nodeapp && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodeapp -g nodeapp nodeapp

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
