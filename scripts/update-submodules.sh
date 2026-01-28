#!/usr/bin/env bash
set -euo pipefail

# Initialize and update submodules
git submodule update --init --recursive

# (Optional) Pull latest in each submodule's default branch
git submodule foreach 'git fetch origin || true; git checkout $(git rev-parse --abbrev-ref origin/HEAD | sed "s#origin/##") 2>/dev/null || true; git pull --ff-only origin HEAD || true'

echo "Submodules initialized and updated."
