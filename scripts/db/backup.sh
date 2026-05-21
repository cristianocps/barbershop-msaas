#!/usr/bin/env bash
# Backup do PostgreSQL (local docker-compose ou remoto via SSH)
#
# Local:
#   ./scripts/db/backup.sh
#   ./scripts/db/backup.sh /caminho/customizado.dump
#
# SSH — pg_dump no servidor, arquivo salvo só localmente (sem .env no servidor):
#   ./scripts/db/backup.sh --ssh root@servidor
#   ./scripts/db/backup.sh --ssh root@servidor ./dump-prod.dump
#   ./scripts/db/backup.sh --ssh root@servidor --remote-dir /opt/barbearia
# Credenciais: .env local (opcional) ou padrões do docker-compose.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/db/_lib.sh
source "$SCRIPT_DIR/_lib.sh"

load_env

OUTPUT=""
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
    *)
      OUTPUT="$1"
      shift
      ;;
  esac
done

ensure_backup_dir

if [[ -z "$OUTPUT" ]]; then
  SUFFIX=""
  [[ "$USE_SSH" == true ]] && SUFFIX="_ssh"
  OUTPUT="$BACKUP_DIR/${POSTGRES_DB}${SUFFIX}_$(timestamp).dump"
fi
OUTPUT="$(resolve_local_output_path "$OUTPUT")"

if [[ "$USE_SSH" == true ]]; then
  require_ssh_connection
  resolve_ssh_target
  log "Modo: backup remoto via SSH (download para esta máquina)"
  log "Servidor: $SSH_TARGET | container: $POSTGRES_CONTAINER"
  [[ -n "${BACKUP_SSH_REMOTE_DIR:-}" ]] && log "Fallback compose em: $BACKUP_SSH_REMOTE_DIR"
  log "Banco: $POSTGRES_DB | usuário: $POSTGRES_USER (credenciais locais ou padrão)"
  log "Arquivo local: $OUTPUT"
  log "Nenhum .dump é gravado no servidor remoto."
  remote_pg_dump_stdout > "$OUTPUT"
else
  require_postgres_running
  log "Modo: local (docker compose)"
  log "Banco: $POSTGRES_DB | Container: $POSTGRES_SERVICE"
  log "Arquivo local: $OUTPUT"
  exec_pg env PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -Fc \
    --no-owner \
    --no-acl \
    > "$OUTPUT"
fi

SIZE="$(du -h "$OUTPUT" | cut -f1)"
log "Backup concluído ($SIZE): $OUTPUT"
