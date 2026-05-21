#!/usr/bin/env bash
# Restore do PostgreSQL (local docker-compose ou remoto via SSH)
#
# Local:
#   ./scripts/db/restore.sh arquivo.dump [--yes]
#
# SSH:
#   ./scripts/db/restore.sh --ssh arquivo.dump [--yes]
#   ./scripts/db/restore.sh --ssh deploy@servidor arquivo.dump -y

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/db/_lib.sh
source "$SCRIPT_DIR/_lib.sh"

SKIP_CONFIRM=false
DUMP_FILE=""

# Primeiro: extrair --ssh e alvo opcional
REMAINING=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ssh)
      USE_SSH=true
      shift
      if [[ $# -gt 0 && "$1" != -* && "$1" == *@* ]]; then
        SSH_TARGET="$1"
        shift
      fi
      ;;
    --ssh=*)
      USE_SSH=true
      SSH_TARGET="${1#*=}"
      shift
      ;;
    --remote-dir)
      BACKUP_SSH_REMOTE_DIR="$2"
      shift 2
      ;;
    --remote-dir=*)
      BACKUP_SSH_REMOTE_DIR="${1#*=}"
      shift
      ;;
    -y|--yes) SKIP_CONFIRM=true; shift ;;
    -h|--help)
      sed -n '2,14p' "$0"
      exit 0
      ;;
    *)
      REMAINING+=("$1")
      shift
      ;;
  esac
done

DUMP_FILE="${REMAINING[0]:-}"

if [[ -z "$DUMP_FILE" ]]; then
  echo "Uso: $0 [--ssh [user@host]] <arquivo.dump> [--yes]" >&2
  echo "Backups padrão em: $BACKUP_DIR" >&2
  exit 1
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  if [[ -f "$BACKUP_DIR/$DUMP_FILE" ]]; then
    DUMP_FILE="$BACKUP_DIR/$DUMP_FILE"
  else
    echo "Arquivo não encontrado: $DUMP_FILE" >&2
    exit 1
  fi
fi

load_env

TARGET_DESC="local ($POSTGRES_SERVICE)"
if [[ "$USE_SSH" == true ]]; then
  resolve_ssh_target
  TARGET_DESC="SSH ($SSH_TARGET → $BACKUP_SSH_REMOTE_DIR)"
fi

echo ""
echo "  RESTORE PostgreSQL"
echo "  Destino    : $TARGET_DESC"
echo "  Banco      : $POSTGRES_DB"
echo "  Arquivo    : $DUMP_FILE"
echo ""
echo "  Isso APAGA e recria objetos do banco (pg_restore --clean)."
echo "  Recomendado: parar o backend antes (local ou remoto)."
echo ""

if [[ "$SKIP_CONFIRM" != true ]]; then
  read -r -p "Continuar? [digite SIM] " confirm
  if [[ "$confirm" != "SIM" ]]; then
    echo "Cancelado."
    exit 0
  fi
fi

if [[ "$USE_SSH" == true ]]; then
  require_ssh_connection
  log "Restaurando via SSH..."
  remote_pg_restore "$DUMP_FILE"
  log "Restore remoto concluído em $POSTGRES_DB"
  log "Verifique o backend no servidor: docker compose up -d backend"
else
  require_postgres_running
  log "Encerrando conexões ativas em $POSTGRES_DB..."
  exec_pg env PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -U "$POSTGRES_USER" \
    -d postgres \
    -v ON_ERROR_STOP=1 \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
    >/dev/null 2>&1 || true

  log "Restaurando dump..."
  docker compose -f "$COMPOSE_FILE" ${COMPOSE_PROJECT:+-p "$COMPOSE_PROJECT"} exec -T "$POSTGRES_SERVICE" \
    env PGPASSWORD="$POSTGRES_PASSWORD" pg_restore \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --role="$POSTGRES_USER" \
    < "$DUMP_FILE"

  log "Restore concluído em $POSTGRES_DB"
  log "Suba o backend se estiver parado: docker compose up -d backend"
fi
