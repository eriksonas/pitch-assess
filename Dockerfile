# syntax=docker/dockerfile:1.6

# ---------- Stage 1: build the React frontend ----------
FROM node:22-alpine AS frontend-builder

ARG VITE_PB_URL=https://pitch.agent-startup.com
ENV VITE_PB_URL=${VITE_PB_URL}

WORKDIR /app
COPY package.json package-lock.json ./
# `npm install` (not `npm ci`) because npm 10 incorrectly flags some
# platform-specific optional deps (esbuild/rollup native binaries) as
# required, which makes `npm ci` fail on platforms different from where
# the lock file was generated. npm install handles them gracefully.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM debian:bookworm-slim AS runtime

# ca-certificates: needed for outbound HTTPS to OpenRouter / OpenAI from
# the pb_hooks proxy. curl + unzip: only used during build to fetch PB.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl unzip \
 && rm -rf /var/lib/apt/lists/*

ARG POCKETBASE_VERSION=0.38.1
WORKDIR /app

RUN curl -fsSL -o /tmp/pb.zip \
      "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" \
 && unzip -j /tmp/pb.zip pocketbase -d /app \
 && rm /tmp/pb.zip \
 && chmod +x /app/pocketbase \
 && apt-get purge -y curl unzip \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

# Static handler in pb_hooks/static.pb.js reads this to know where the SPA lives.
ENV PB_STATIC_DIR=/app/build

COPY --from=frontend-builder /app/build /app/build
COPY pocketbase/pb_hooks /app/pb_hooks
COPY pocketbase/pb_migrations /app/pb_migrations

EXPOSE 8090
VOLUME ["/app/pb_data"]

CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090", "--hooksWatch=false"]
