#!/usr/bin/env bash
# Atalho: backup e restore do PostgreSQL (local ou SSH)
#
#   ./scripts/db/pg-db.sh backup [--ssh [user@host]] [arquivo.dump]
#   ./scripts/db/pg-db.sh restore [--ssh [user@host]] <arquivo.dump> [--yes]
#   ./scripts/db/pg-db.sh list

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/db/_lib.sh
source "$SCRIPT_DIR/_lib.sh"

CMD="${1:-}"
shift || true

case "$CMD" in
  backup|b)
    exec "$SCRIPT_DIR/backup.sh" "$@"
    ;;
  restore|r)
    exec "$SCRIPT_DIR/restore.sh" "$@"
    ;;
  list|ls)
    load_env
    ensure_backup_dir
    echo "Backups em: $BACKUP_DIR"
    ls -lht "$BACKUP_DIR" 2>/dev/null || echo "(nenhum backup ainda)"
    ;;
  ""|help|-h|--help)
    cat <<EOF
PostgreSQL — backup / restore (docker-compose local ou remoto via SSH)

  $(basename "$0") backup [--ssh user@host] [--remote-dir /path] [arquivo.dump]
  $(basename "$0") restore [--ssh user@host] [--remote-dir /path] <arquivo> [--yes]
  $(basename "$0") list

SSH backup (sem .env no servidor):
  Usa docker exec no container postgres_barbershop (padrão do docker-compose).
  Credenciais: .env local opcional ou padrões (postgres / barbershop_prod_db).
  Arquivo .dump salvo só na sua máquina.

  --remote-dir só se o container tiver outro nome ou precisar de docker compose.

Exemplos:
  ./scripts/db/pg-db.sh backup --ssh root@5.75.142.3 ./dump-prod.dump
  ./scripts/db/pg-db.sh backup --ssh deploy@servidor --remote-dir /opt/barbearia
  POSTGRES_PASSWORD=xxx ./scripts/db/pg-db.sh backup --ssh root@servidor
EOF
    ;;
  *)
    echo "Comando inválido: $CMD (use backup, restore ou list)" >&2
    exit 1
    ;;
esac
