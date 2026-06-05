# --- STAGE 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package management files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for building)
RUN npm ci

# Copy the rest of your application code
COPY . .

# Generate Prisma Client and build the NestJS application
RUN npx prisma generate
RUN npm run build

# Prune dev dependencies to save space for production
RUN npm prune --production

# --- STAGE 2: Production Run Stage ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy only the essential production files from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts .

# Set production environment
ENV NODE_ENV=production

# Expose the port your NestJS app runs on (Render defaults to 10000 if not specified)
EXPOSE 10000

# Start the application
CMD npx prisma migrate deploy && node dist/src/main
