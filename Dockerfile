FROM node:20-slim AS builder
WORKDIR /app

# Install Python + build tools for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy full node_modules (needed for prisma CLI + better-sqlite3 native binaries)
COPY --from=builder /app/node_modules ./node_modules

# Copy prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Run migrations then start server
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
