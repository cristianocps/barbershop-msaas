# ──────────────────────────────────────────────────────────────
# Dockerfile  –  Frontend React/Vite (Nginx)
# Contexto: ./Barbearia
# ──────────────────────────────────────────────────────────────

# ── Estágio 1: build ──────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Argumento de build para a URL da API (passado pelo docker-compose)
ARG VITE_API_URL=http://208.109.189.35:5508
ENV VITE_API_URL=$VITE_API_URL

# Copia package.json e faz install (cache)
COPY package*.json ./
RUN npm ci --silent

# Copia o restante do código e faz build de produção
COPY . .
RUN npm run build

# ── Estágio 2: Nginx servindo os arquivos estáticos ───────────
FROM nginx:stable-alpine AS final

# Remove config padrão e coloca a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
