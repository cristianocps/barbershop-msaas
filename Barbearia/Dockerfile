# ──────────────────────────────────────────────────────────────
# Dockerfile  –  Frontend React/Vite (Nginx)
# Build multi-stage: compila o Vite no container e serve com Nginx.
# Contexto: ./Barbearia
# ──────────────────────────────────────────────────────────────

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
