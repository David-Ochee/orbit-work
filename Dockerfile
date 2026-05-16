# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:26-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm ci --workspace=backend --workspace=frontend

COPY . .

RUN npm run build --workspace=backend
RUN npm run build --workspace=frontend

# ─── Backend runtime ─────────────────────────────────────────────────────────
FROM node:26-alpine AS backend
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/lib ./lib

RUN npm ci --omit=dev

EXPOSE 4000
CMD ["node", "dist/index.js"]

# ─── Frontend runtime (standalone Next.js) ───────────────────────────────────
FROM node:26-alpine AS frontend
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
