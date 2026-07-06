#!/usr/bin/env sh
set -e

cd /var/www/web-server

if [ ! -f .env ]; then
  cp .env.example .env
fi

if [ ! -d vendor ] || [ ! -f vendor/autoload.php ]; then
  composer install
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  php artisan key:generate --force
fi

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" >/dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
  done
fi

php artisan storage:link >/dev/null 2>&1 || true
php artisan optimize:clear

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --force
elif [ "${RUN_SEEDERS:-false}" = "auto" ]; then
  USER_COUNT=$(PGPASSWORD="${DB_PASSWORD:-}" psql \
    -h "${DB_HOST:-db}" \
    -p "${DB_PORT:-5432}" \
    -U "${DB_USERNAME:-postgres}" \
    -d "${DB_DATABASE:-postgres}" \
    -tAc "select count(*) from public.nguoi_dungs;" 2>/dev/null | tr -d '[:space:]')

  if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" = "0" ]; then
    echo "No seed data found. Running seeders..."
    php artisan db:seed --force
  else
    echo "Seed data already exists (${USER_COUNT} users). Skipping seeders."
  fi
fi

exec "$@"
