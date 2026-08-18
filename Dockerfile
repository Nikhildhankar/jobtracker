# Stage 1: Build Frontend and Compile Server
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm install

# Copy codebase
COPY . .

# Build Vite client static dist and verify TypeScript compilation
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy compiled frontend dist and server source files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start production server using tsx
CMD ["npx", "tsx", "server/index.ts"]
