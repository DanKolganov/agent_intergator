FROM node:20-slim AS builder
WORKDIR /app

# Copy the package manifest first to leverage Docker cache for installs
COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.json

# Copy the full project so the build can run
COPY . .

RUN npm install

# Build client + server bundle
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Copy package manifest to install runtime deps
COPY package.json package-lock.json* ./

# Install only production deps
RUN npm install --omit=dev --no-audit --no-fund

EXPOSE 5000

# In production the start script sets NODE_ENV=production
CMD ["npm", "start"]
