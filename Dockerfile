# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* .npmrc ./

# Install ALL dependencies (including devDependencies) for build
# npm ci includes devDependencies by default; --include=dev can break on npm 10.x
RUN npm ci --legacy-peer-deps

# Install production dependencies only
FROM base AS deps-prod
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* .npmrc ./
RUN npm ci --omit=dev --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/dist/public ./dist/public

# Copy the built server
COPY --from=builder /app/dist/index.js ./dist/index.js

# Copy package.json for start script
COPY package.json ./

# Copy production node_modules
COPY --from=deps-prod /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Health check for Dokploy / orchestrators (node:20-alpine has no wget/curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r => { r.resume(); r.on('end', () => process.exit(r.statusCode === 200 ? 0 : 1)); }).on('error', () => process.exit(1));"

# Start the application
CMD ["npm", "start"] 