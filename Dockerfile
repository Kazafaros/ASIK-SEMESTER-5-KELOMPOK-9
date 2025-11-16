# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy frontend files
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install nginx untuk serve frontend
RUN apk add --no-cache nginx

# Copy from builder
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "backend/src/server.js"]
