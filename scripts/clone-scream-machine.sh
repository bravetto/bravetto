#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-https://github.com/mataluni-bravetto/scream-machine}"
DEST="${2:-scream-machine}"

if [ -d "$DEST" ]; then
  echo "Destination '$DEST' already exists. Use 'scripts/update-submodules.sh' to sync submodules." >&2
  exit 1
fi

git clone "$REPO" "$DEST"
echo "Cloned $REPO → $DEST"
