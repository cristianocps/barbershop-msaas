#!/usr/bin/env bash
# Funções compartilhadas — backup/restore PostgreSQL (docker-compose / SSH)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_ROOT/docker-compose.yml}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-}"

POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-postgres_barbershop}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups/postgres}"

# SSH (preencher no .env ou passar --ssh user@host)
BACKUP_SSH="${BACKUP_SSH:-}"
BACKUP_SSH_HOST="${BACKUP_SSH_HOST:-}"
BACKUP_SSH_USER="${BACKUP_SSH_USER:-}"
BACKUP_SSH_PORT="${BACKUP_SSH_PORT:-22}"
BACKUP_SSH_REMOTE_DIR="${BACKUP_SSH_REMOTE_DIR:-}"
BACKUP_SSH_IDENTITY_FILE="${BACKUP_SSH_IDENTITY_FILE:-}"
BACKUP_SSH_REMOTE_COMPOSE_FILE="${BACKUP_SSH_REMOTE_COMPOSE_FILE:-docker-compose.yml}"

USE_SSH=false
SSH_TARGET=""

load_env() {
  local env_file="$REPO_ROOT/.env"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
  POSTGRES_USER="${POSTGRES_USER:-postgres}"
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-qwas7845}"
  POSTGRES_DB="${POSTGRES_DB:-barbershop_prod_db}"
}

compose() {
  local args=(-f "$COMPOSE_FILE")
  if [[ -n "$COMPOSE_PROJECT" ]]; then
    args+=(-p "$COMPOSE_PROJECT")
  fi
  docker compose "${args[@]}" "$@"
}

postgres_container_id() {
  compose ps -q "$POSTGRES_SERVICE" 2>/dev/null | head -n1
}

require_postgres_running() {
  local cid
  cid="$(postgres_container_id || true)"
  if [[ -z "$cid" ]]; then
    echo "Erro: serviço '$POSTGRES_SERVICE' não está em execução." >&2
    echo "Suba o stack: docker compose -f \"$COMPOSE_FILE\" up -d postgres" >&2
    exit 1
  fi
  if ! docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null | grep -q true; then
    echo "Erro: container PostgreSQL existe mas não está rodando." >&2
    exit 1
  fi
}

exec_pg() {
  compose exec -T "$POSTGRES_SERVICE" "$@"
}

timestamp() {
  date +%Y%m%d_%H%M%S
}

ensure_backup_dir() {
  mkdir -p "$BACKUP_DIR"
}

# Garante caminho absoluto na máquina onde o script é executado (nunca no servidor SSH)
resolve_local_output_path() {
  local path="$1"
  if [[ "$path" != /* ]]; then
    path="$REPO_ROOT/$path"
  fi
  mkdir -p "$(dirname "$path")"
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$path"
  else
    local dir base
    dir="$(cd "$(dirname "$path")" && pwd)"
    base="$(basename "$path")"
    echo "$dir/$base"
  fi
}

log() {
  echo "[$(date '+%H:%M:%S')] $*"
}

# ── SSH ──────────────────────────────────────────────────────

resolve_ssh_target() {
  if [[ -n "$SSH_TARGET" ]]; then
    return 0
  fi
  if [[ -n "$BACKUP_SSH" ]]; then
    SSH_TARGET="$BACKUP_SSH"
    return 0
  fi
  if [[ -n "$BACKUP_SSH_HOST" ]]; then
    SSH_TARGET="${BACKUP_SSH_USER:-root}@${BACKUP_SSH_HOST}"
    return 0
  fi
  echo "Erro: modo SSH requer BACKUP_SSH ou BACKUP_SSH_HOST no .env, ou --ssh user@host" >&2
  exit 1
}

ssh_opts() {
  SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=25)
  if [[ -n "$BACKUP_SSH_PORT" && "$BACKUP_SSH_PORT" != "22" ]]; then
    SSH_OPTS+=(-p "$BACKUP_SSH_PORT")
  fi
  if [[ -n "$BACKUP_SSH_IDENTITY_FILE" && -f "$BACKUP_SSH_IDENTITY_FILE" ]]; then
    SSH_OPTS+=(-i "$BACKUP_SSH_IDENTITY_FILE")
  fi
}

run_ssh() {
  resolve_ssh_target
  ssh_opts
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$@"
}

# pg_dump remoto → stdout (arquivo salvo na máquina local pelo backup.sh).
# Credenciais vêm do .env local (ou padrões do docker-compose). .env no servidor é opcional.
remote_pg_dump_stdout() {
  resolve_ssh_target
  ssh_opts

  local remote_dir_q compose_q project_q service_q container_q
  local pg_user_q pg_pass_q pg_db_q
  remote_dir_q="$(printf '%q' "${BACKUP_SSH_REMOTE_DIR:-}")"
  compose_q="$(printf '%q' "$BACKUP_SSH_REMOTE_COMPOSE_FILE")"
  project_q="$(printf '%q' "$COMPOSE_PROJECT")"
  service_q="$(printf '%q' "$POSTGRES_SERVICE")"
  container_q="$(printf '%q' "$POSTGRES_CONTAINER")"
  pg_user_q="$(printf '%q' "$POSTGRES_USER")"
  pg_pass_q="$(printf '%q' "$POSTGRES_PASSWORD")"
  pg_db_q="$(printf '%q' "$POSTGRES_DB")"

  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "bash -s" -- \
    "$remote_dir_q" "$compose_q" "$project_q" "$service_q" "$container_q" \
    "$pg_user_q" "$pg_pass_q" "$pg_db_q" <<'REMOTE_SCRIPT'
set -euo pipefail
REMOTE_DIR="$1"
COMPOSE_FILE_NAME="$2"
COMPOSE_PROJECT_NAME="$3"
PG_SERVICE="$4"
PG_CONTAINER="$5"
POSTGRES_USER="$6"
POSTGRES_PASSWORD="$7"
POSTGRES_DB="$8"

run_pg_dump() {
  docker exec -i "$PG_CONTAINER" \
    env PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -Fc \
    --no-owner \
    --no-acl
}

# 1) Container nomeado (docker-compose: postgres_barbershop) — não precisa de pasta nem .env remoto
if docker inspect "$PG_CONTAINER" >/dev/null 2>&1; then
  run_pg_dump
  exit 0
fi

# 2) Fallback: docker compose no diretório do projeto (BACKUP_SSH_REMOTE_DIR / --remote-dir)
if [[ -z "$REMOTE_DIR" || ! -d "$REMOTE_DIR" ]]; then
  echo "Erro: container '$PG_CONTAINER' não encontrado no servidor." >&2
  echo "Informe o diretório do projeto: --remote-dir /caminho/no/servidor" >&2
  echo "Ou defina BACKUP_SSH_REMOTE_DIR no .env local." >&2
  exit 1
fi

cd "$REMOTE_DIR"

compose_args=(-f "$COMPOSE_FILE_NAME")
if [[ -n "$COMPOSE_PROJECT_NAME" ]]; then
  compose_args+=(-p "$COMPOSE_PROJECT_NAME")
fi

if ! docker compose "${compose_args[@]}" ps -q "$PG_SERVICE" 2>/dev/null | grep -q .; then
  echo "Erro: serviço '$PG_SERVICE' não encontrado em $REMOTE_DIR" >&2
  exit 1
fi

docker compose "${compose_args[@]}" exec -T "$PG_SERVICE" \
  env PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -Fc \
  --no-owner \
  --no-acl
REMOTE_SCRIPT
}

require_ssh_connection() {
  resolve_ssh_target
  ssh_opts
  if ! ssh "${SSH_OPTS[@]}" -o ConnectTimeout=10 "$SSH_TARGET" "command -v docker >/dev/null"; then
    echo "Erro: docker não disponível em $SSH_TARGET" >&2
    exit 1
  fi
}

# Envia dump para o servidor e executa pg_restore no container remoto
remote_pg_restore() {
  local dump_file="$1"
  resolve_ssh_target
  ssh_opts

  local remote_tmp="/tmp/barbershop_restore_$(timestamp)_$$.dump"
  local remote_dir_q compose_q project_q service_q container_q
  local pg_user_q pg_pass_q pg_db_q
  remote_dir_q="$(printf '%q' "${BACKUP_SSH_REMOTE_DIR:-}")"
  compose_q="$(printf '%q' "$BACKUP_SSH_REMOTE_COMPOSE_FILE")"
  project_q="$(printf '%q' "$COMPOSE_PROJECT")"
  service_q="$(printf '%q' "$POSTGRES_SERVICE")"
  container_q="$(printf '%q' "$POSTGRES_CONTAINER")"
  pg_user_q="$(printf '%q' "$POSTGRES_USER")"
  pg_pass_q="$(printf '%q' "$POSTGRES_PASSWORD")"
  pg_db_q="$(printf '%q' "$POSTGRES_DB")"

  log "Enviando dump para $SSH_TARGET:$remote_tmp ..."
  scp "${SSH_OPTS[@]}" "$dump_file" "${SSH_TARGET}:${remote_tmp}"

  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "bash -s" -- \
    "$remote_dir_q" "$compose_q" "$project_q" "$service_q" "$container_q" \
    "$pg_user_q" "$pg_pass_q" "$pg_db_q" "$remote_tmp" <<'REMOTE_SCRIPT'
set -euo pipefail
REMOTE_DIR="$1"
COMPOSE_FILE_NAME="$2"
COMPOSE_PROJECT_NAME="$3"
PG_SERVICE="$4"
PG_CONTAINER="$5"
POSTGRES_USER="$6"
POSTGRES_PASSWORD="$7"
POSTGRES_DB="$8"
DUMP_PATH="$9"

terminate_connections() {
  docker exec -i "$PG_CONTAINER" \
    env PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -U "$POSTGRES_USER" \
    -d postgres \
    -v ON_ERROR_STOP=1 \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
    >/dev/null 2>&1 || true
}

run_pg_restore() {
  docker cp "$DUMP_PATH" "${PG_CONTAINER}:/tmp/restore.dump"
  docker exec -i "$PG_CONTAINER" \
    env PGPASSWORD="$POSTGRES_PASSWORD" pg_restore \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --role="$POSTGRES_USER" \
    /tmp/restore.dump
  docker exec -i "$PG_CONTAINER" rm -f /tmp/restore.dump
}

if docker inspect "$PG_CONTAINER" >/dev/null 2>&1; then
  terminate_connections
  run_pg_restore
  rm -f "$DUMP_PATH"
  exit 0
fi

if [[ -z "$REMOTE_DIR" || ! -d "$REMOTE_DIR" ]]; then
  echo "Erro: container '$PG_CONTAINER' não encontrado. Use --remote-dir /caminho/no/servidor" >&2
  exit 1
fi

cd "$REMOTE_DIR"

compose_args=(-f "$COMPOSE_FILE_NAME")
if [[ -n "$COMPOSE_PROJECT_NAME" ]]; then
  compose_args+=(-p "$COMPOSE_PROJECT_NAME")
fi

docker compose "${compose_args[@]}" exec -T "$PG_SERVICE" \
  env PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -U "$POSTGRES_USER" \
  -d postgres \
  -v ON_ERROR_STOP=1 \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
  >/dev/null 2>&1 || true

docker compose "${compose_args[@]}" cp "$DUMP_PATH" "${PG_SERVICE}:/tmp/restore.dump"
docker compose "${compose_args[@]}" exec -T "$PG_SERVICE" \
  env PGPASSWORD="$POSTGRES_PASSWORD" pg_restore \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --clean \
  --if-exists \
  --no-owner \
  --role="$POSTGRES_USER" \
  /tmp/restore.dump
docker compose "${compose_args[@]}" exec -T "$PG_SERVICE" rm -f /tmp/restore.dump
rm -f "$DUMP_PATH"
REMOTE_SCRIPT
}
