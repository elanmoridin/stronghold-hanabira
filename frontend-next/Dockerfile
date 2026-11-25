# Stage 1: Build Stage
FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS builder

# Set environment variables
#ENV NODE_ENV=production  # webpack could not find components
ENV APP_ENV=prod

# Set working directory
WORKDIR /app

# Install dependencies
# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies and sharp in a single RUN command to reduce layers
# sharp is bundled with next 15 as an optional dep; npm ci = exactly the lockfile
RUN npm ci --no-audit --no-fund

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production Stage
FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a

# Set environment variables
ENV NODE_ENV=production
ENV APP_ENV=prod

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from builder
COPY --from=builder /app/package*.json ./

# Install only production dependencies using npm ci
RUN npm ci --omit=dev --no-audit --no-fund

# Copy built assets and necessary folders from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content

# Expose the desired port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
