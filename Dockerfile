# Build stage for frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Copy built frontend
COPY --from=frontend-build /app/client/dist ./public

# Create data directory
RUN mkdir -p data

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "index.js"]
