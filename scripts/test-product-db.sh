#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="meeting-recorder-test-$(date +%s)-$$"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
docker run --detach --name "$container" --env POSTGRES_PASSWORD=disposable-test-only postgres:17 >/dev/null
for attempt in {1..30}; do
  if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
docker cp supabase/migrations/202609210001_meeting_recorder.sql "$container":/tmp/migration.sql >/dev/null
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/product/database.sql
