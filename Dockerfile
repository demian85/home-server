# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Build stage – compiles TypeScript and rewrites path aliases
# -----------------------------------------------------------------------------
FROM node:24-slim AS builder

WORKDIR /app

# Install native build tools in case any dependency needs compilation,
# then remove them immediately to keep the layer small.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json tsconfig.json ./

# Install all deps but skip `postinstall` because the source files are not
# present yet (layer caching).
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Production stage – runs the compiled JS with only production dependencies
# -----------------------------------------------------------------------------
FROM node:24-slim AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./

# Install only production deps and skip the `postinstall` build step
# (the compiled artifacts are copied from the builder stage).
RUN npm ci --omit=dev --ignore-scripts

# Bring in the compiled output
COPY --from=builder /app/build ./build

# The compiled entry point
CMD ["node", "build/src/server/index.js"]
