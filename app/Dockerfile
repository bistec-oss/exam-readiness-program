FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Install ALL deps (including devDeps) so prisma migrate deploy / db:seed work
# inside the runtime image. The repo's seed.ts uses devDeps `tsx` and `dotenv`,
# and prisma.config.ts (root-level) imports `dotenv/config`. Standalone-mode
# builds drop devDeps; we install them here to keep the image self-sufficient
# for migrate + seed ops at runtime.
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Standalone build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Bring in devDeps + prisma CLI + the prisma config so `prisma migrate deploy`
# and `npx tsx prisma/seed.ts` work at runtime.
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
