# CI/CD — GitHub Actions + GHCR

## Workflow

| Arquivo | Trigger | Ação |
|---------|---------|------|
| [docker.yml](workflows/docker.yml) | PR em `main` | Build das imagens (sem publicar) |
| [docker.yml](workflows/docker.yml) | Push em `main` ou tag `v*` | Build + push para **ghcr.io** |

## Imagens publicadas

```
ghcr.io/<seu-usuario-github>/barbearia-backend:latest
ghcr.io/<seu-usuario-github>/barbearia-backend:<sha>
ghcr.io/<seu-usuario-github>/barbearia-frontend:latest
ghcr.io/<seu-usuario-github>/barbearia-frontend:<sha>
```

Tags semver ao publicar release `v1.2.3`.

## Permissões

O `GITHUB_TOKEN` do workflow já tem `packages: write`. Nenhum secret extra é obrigatório para publicar no GHCR do mesmo repositório.

Para o servidor **puxar** imagens privadas, crie um [PAT](https://github.com/settings/tokens) com `read:packages` e no servidor:

```bash
echo "TOKEN" | docker login ghcr.io -u SEU_USUARIO --password-stdin
```

## Deploy no servidor (manual / Portainer)

1. Defina no `.env` ou no shell:

```bash
export GHCR_OWNER=seu-usuario-github   # minúsculas, igual ao GitHub
export GHCR_TAG=latest                  # ou SHA curto do commit
```

2. Atualize os containers:

```bash
docker compose -f docker-compose.yml -f docker-compose.ghcr.yml pull backend frontend
docker compose -f docker-compose.yml -f docker-compose.ghcr.yml up -d backend frontend
```

Postgres e Redis continuam no `docker-compose.yml` base (build local não é usado para app).

## Login com Google

Configure o OAuth Client no [Google Cloud Console](https://console.cloud.google.com/) (tipo **Web**) e defina:

| Variável | Onde |
|----------|------|
| `GOOGLE_CLIENT_ID` | Backend (`appsettings` / env do container) |
| `VITE_GOOGLE_CLIENT_ID` | Build do frontend (arg Docker ou `.env`) |

Origens autorizadas de exemplo: `http://localhost:5173`, `https://seu-dominio.com`.

## Tornar pacotes públicos (opcional)

GitHub → **Packages** → pacote → **Package settings** → **Change visibility** → Public.

Assim o `docker pull` no servidor não exige login.

## Release versionada

```bash
git tag v1.0.0
git push origin v1.0.0
```

Publica também `ghcr.io/.../barbearia-backend:1.0.0` e `:1.0`.
