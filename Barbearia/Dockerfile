# ──────────────────────────────────────────────────────────────
# Dockerfile  –  Frontend React/Vite (Nginx)
# O dist já vem pré-compilado no repositório.
# O Docker apenas copia os arquivos estáticos para o Nginx.
# Contexto: ./Barbearia
# ──────────────────────────────────────────────────────────────

FROM nginx:stable-alpine

# Remove config padrão e coloca a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build já compilado
COPY dist/ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
