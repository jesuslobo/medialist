# used as a reference:
# - https://nextjs.org/docs/pages/building-your-application/deploying#docker-image
# - https://stackoverflow.com/questions/78034830#78034830

FROM node:20.9-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps

# better-sqlite3 dependencies
RUN apk add --no-cache \
    python3 \
    sqlite\
    make\
    g++

USER node
WORKDIR /app
COPY --chown=node:node package*.json ./

USER root
RUN npm install --omit=dev

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 3. Production image, copy needed files
FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=node:node /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Migration files
COPY --from=builder --chown=node:node /app/src/server/db/migrations ./src/server/db/migrations
COPY --from=builder --chown=node:node /app/drizzle.config.ts ./drizzle.config.ts
# Docker entrypoint
COPY --from=builder --chown=node:node /app/docker-run.sh ./run.sh
RUN chmod +x run.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "run.sh"]