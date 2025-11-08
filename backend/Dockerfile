# Multi-stage Dockerfile for Backend API
# Stage 1: Build
# Using Debian base instead of Alpine for better Prisma compatibility
FROM node:18-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma in builder stage too
RUN apt-get update && \
    apt-get install -y openssl ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies needed for Prisma generation)
RUN npm ci

# Generate Prisma Client (after installing dependencies, before building)
# Force Debian binary target in builder stage - explicitly set to avoid musl detection
RUN npx prisma generate --schema=./prisma/schema.prisma

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
# Install both OpenSSL 1.1 and 3.0 to support both binary targets
RUN apt-get update && \
    apt-get install -y openssl ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Install production dependencies only (including Prisma CLI for migrations)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install Prisma CLI globally for migrations (install in production stage)
RUN npm install -g prisma@^5.7.1

# Copy Prisma schema (needed for migrations)
COPY --from=builder /app/prisma ./prisma

# CRITICAL: Copy Prisma binaries from builder stage to avoid platform misdetection
# The builder stage generates the correct Debian binaries, so we just copy them
# instead of regenerating which might detect the platform incorrectly
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker-entrypoint.sh /app/docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Create non-root user for security (Debian syntax)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --shell /bin/bash nodejs

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

