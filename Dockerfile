# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

# Keep build image packages current (OS-level CVEs)
RUN apk upgrade --no-cache

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm run build \
  && npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3847

# OS patches + remove npm/npx from the runtime image.
# The app only needs the Node runtime; shipping npm pulls vulnerable
# transitive packages such as node-tar (CVE-2026-59874 and related).
RUN apk upgrade --no-cache \
  && rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack \
    /root/.npm \
  && addgroup -S app && adduser -S app -G app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

USER app
EXPOSE 3847

# Native fetch is available on Node 22 — no wget dependency required.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3847)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
