# ──────────────────────────────────────────────────────────────
# Dockerfile  –  Frontend React/Vite (Multi-stage build)
#
# Stage 1 (builder): Node.js instala dependências e roda npm run build
# Stage 2 (runtime): Nginx serve os arquivos estáticos gerados
#
# Não é necessário buildar localmente nem commitar a pasta dist/.
# O Docker faz o build automático ao subir o stack no Portainer.
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências primeiro (aproveita cache do Docker)
COPY package*.json ./
RUN npm ci

# Copia o restante do código e builda
COPY . .
RUN npm run build

# ── Stage 2: Runtime (Nginx) ───────────────────────────────────
FROM nginx:stable-alpine

# Remove config padrão e coloca a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build gerado no stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
