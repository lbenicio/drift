FROM node:24-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable

FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY . .

ARG API_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV API_URL=${API_URL:-http://localhost:3000}
ENV SKIP_ENV_VALIDATION=true

RUN yarn prisma generate
RUN yarn build:pkg

FROM node:24-alpine AS runner

WORKDIR /app

ARG NODE_ENV

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=${NODE_ENV:-production}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
