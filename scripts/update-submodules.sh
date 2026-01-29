#!/usr/bin/env bash
set -euo pipefail

# Robust submodule updater
# Usage: scripts/update-submodules.sh [--no-pull]
# - By default this will initialize submodules and attempt a fast-forward pull
# - Use --no-pull to only init/update without pulling remote branches

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "ERROR: Not in a git repository." >&2
  exit 1
fi
cd "$REPO_ROOT"

NO_PULL=false
for arg in "$@"; do
  case "$arg" in
    --no-pull) NO_PULL=true ;;
    --help|-h) echo "Usage: $0 [--no-pull]" ; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; echo "Usage: $0 [--no-pull]" >&2; exit 2 ;;
  esac
done

echo "Synchronizing submodule config and initializing submodules..."
# Ensure .gitmodules and local config are in sync
git submodule sync --recursive || true
# Try a remote-oriented init/update first (supported on newer git)
if git submodule update --init --recursive --remote --progress 2>/dev/null; then
  echo "Submodules initialized (remote mode)."
else
  # Fallback for older git versions
  git submodule update --init --recursive
  echo "Submodules initialized."
fi

export NO_PULL

# Iterate each submodule and attempt a safe fast-forward update
git submodule foreach --recursive '
  echo "\n== Submodule: $path =="

  # Skip if there are uncommitted changes
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "SKIP: Uncommitted changes detected in $path. Commit or stash before updating."
    exit 0
  fi

  # Fetch tags and refs
  git fetch --tags origin || echo "Warning: fetch failed for $path"

  # Determine branch to pull
  branch="$(git config -f "$toplevel/.gitmodules" --get submodule.$path.branch || true)"
  if [ -z "$branch" ]; then
    # Use tracking upstream of current branch if set (e.g., origin/main)
    branch="$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true)"
    if [ -n "$branch" ]; then
      branch="${branch#origin/}"
    fi
  fi
  if [ -z "$branch" ]; then
    # Fallback to origin's HEAD symbolic ref
    branch="$(git remote show origin 2>/dev/null | awk -F": " "/HEAD branch/ {print \$2}" || true)"
  fi
  if [ -z "$branch" ]; then
    echo "No branch detected for $path; skipping checkout/pull"
    exit 0
  fi

  echo "Detected branch: $branch"

  # Only proceed if remote branch exists
  if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    # Ensure local branch exists and is checked out
    if ! git rev-parse --verify "$branch" >/dev/null 2>&1; then
      # create local branch tracking origin/<branch>
      git checkout -b "$branch" "origin/$branch" 2>/dev/null || git checkout -b "$branch" || true
    else
      git checkout "$branch" 2>/dev/null || true
    fi

    if [ "$NO_PULL" = "false" ]; then
      # Try a fast-forward-only pull; if it fails, warn and leave it for manual resolution
      if ! git pull --ff-only origin "$branch" 2>/dev/null; then
        echo "NOTICE: Could not fast-forward $path/$branch. Manual intervention may be required."
      else
        echo "Updated $path to latest $branch (fast-forward)."
      fi
    else
      echo "Skipping pull for $path ( --no-pull passed )."
    fi
  else
    echo "Remote branch '$branch' not found for $path; skipping."
  fi
'

echo "\nAll submodules processed."

