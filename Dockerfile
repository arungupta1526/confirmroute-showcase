# ==============================================================================
# ConfirmRoute - Production Multi-Stage Dockerfile
# Optimized for minimal footprint (~160MB), non-root security, and high speed
# ==============================================================================

# Stage 1: Base Alpine Environment (Node 24 Active LTS)
FROM node:24-alpine AS base
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Install Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use --ignore-scripts to prevent build lifecycle scripts from running before source code is copied
RUN npm ci --ignore-scripts

# Stage 3: Build Application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Run Next.js production build with standalone output
RUN npm run build

# Stage 4: Production Runtime Image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create secure unprivileged system user and remove package managers not needed at runtime
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn*

# Copy static assets and public directory
COPY --from=builder /app/public ./public

# Setup directory permissions for Next.js cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone server and static assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


# Run as non-root user
USER nextjs

EXPOSE 3000

# Start standalone Next.js server
CMD ["node", "server.js"]
