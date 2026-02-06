FROM node:22-alpine AS base

# Enable corepack for pnpm
RUN corepack enable

# --- Dependencies stage ---
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build stage ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables needed at build time
ARG POSTGRES_URL
ARG REDIS_URL
ARG AUTH_SECRET
ARG BLOB_READ_WRITE_TOKEN

ENV POSTGRES_URL=${POSTGRES_URL}
ENV REDIS_URL=${REDIS_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# --- Runner stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Standalone output includes only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
