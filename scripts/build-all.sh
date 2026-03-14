#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

step() {
  echo
  echo "==> $1"
}

node_install() {
  local dir="$1"
  if [[ -f "$dir/package-lock.json" ]]; then
    npm --prefix "$dir" ci
  else
    npm --prefix "$dir" install
  fi
}

step "Building API"
if [[ -d "$ROOT_DIR/apps/api" ]]; then
  python3 -m pip install -r "$ROOT_DIR/apps/api/requirements.txt"
  (
    cd "$ROOT_DIR/apps/api"
    python3 -c "from app.main import app; print(app.title)"
  )
fi

step "Building MCP server"
node_install "$ROOT_DIR/apps/mcp-server"
npm --prefix "$ROOT_DIR/apps/mcp-server" run build

step "Building Web app"
node_install "$ROOT_DIR/apps/web"
npm --prefix "$ROOT_DIR/apps/web" run build

echo
echo "OpenClaw full build completed successfully."