FROM node:20-slim AS builder
WORKDIR /app

# Install Python + build tools required by better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx prisma generate
RUN npm run build

# ─────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Standalone Next.js output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy full node_modules so startup.js can require('better-sqlite3')
COPY --from=builder /app/node_modules ./node_modules

# Startup script and prisma migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma

# PORT is injected by Railway at runtime — do not hardcode
EXPOSE 3000

CMD ["sh", "-c", "node scripts/startup.js && node server.js"]
