# ──────────────────────────────────────────────────────────────
# Dockerfile  –  Backend ASP.NET Core 8
# Contexto: ./backend/Controle_Barbearia
# ──────────────────────────────────────────────────────────────

# ── Estágio 1: build ──────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia arquivos de projeto primeiro (cache de restore)
COPY ["src/BarberShop/BarberShop.csproj",                           "src/BarberShop/"]
COPY ["src/BarberShop.Aplicacao/BarberShop.Aplicacao.csproj",       "src/BarberShop.Aplicacao/"]
COPY ["src/BarberShop.Dominio/BarberShop.Dominio.csproj",           "src/BarberShop.Dominio/"]
COPY ["src/BarberShop.Infraestrutura/BarberShop.Infraestrutura.csproj", "src/BarberShop.Infraestrutura/"]
COPY ["src/BarberShop.Repositorio/BarberShop.Repositorio.csproj",   "src/BarberShop.Repositorio/"]
COPY ["src/BarberShop.Servicos/BarberShop.Servicos.csproj",         "src/BarberShop.Servicos/"]

# Restore de dependências
RUN dotnet restore "src/BarberShop/BarberShop.csproj"

# Copia todo o código e publica
COPY . .
WORKDIR /src/src/BarberShop
RUN dotnet publish "BarberShop.csproj" -c Release -o /app/publish --no-restore

# ── Estágio 2: runtime ────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Cria usuário não-root para segurança
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

# A porta padrão do Kestrel no container é 8080 (ASP.NET 8+)
EXPOSE 8080

ENTRYPOINT ["dotnet", "BarberShop.dll"]
