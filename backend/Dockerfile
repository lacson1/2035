# Multi-stage Dockerfile for Backend API
# Stage 1: Build
# Using Debian base instead of Alpine for better Prisma compatibility
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies needed for Prisma generation)
RUN npm ci

# Generate Prisma Client (after installing dependencies, before building)
RUN npx prisma generate

# Copy source code
COPY . .

# Copy entrypoint script (needed for production stage)
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Build TypeScript (Prisma Client types are now available from node_modules)
RUN npm run build

# Stage 2: Production
# Using Debian base instead of Alpine for better Prisma compatibility
FROM node:18-slim AS production

WORKDIR /app

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install production dependencies only (including Prisma CLI for migrations)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install Prisma CLI globally for migrations (install in production stage)
RUN npm install -g prisma@^5.7.1

# Copy Prisma schema to regenerate Prisma Client for Debian (glibc) platform
# IMPORTANT: We regenerate here instead of copying from builder to ensure Debian binary
COPY --from=builder /app/prisma ./prisma
# Regenerate Prisma Client for Debian platform (ensures correct binary, not Alpine/musl)
# This must happen AFTER installing dependencies and BEFORE copying dist
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker-entrypoint.sh /app/docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script to run migrations before starting
ENTRYPOINT ["/app/docker-entrypoint.sh"]

