#!/usr/bin/env bash
# Canonical bounded publisher for Agent-Crypto live JSON snapshots.
# Owns publication transport only; collectors and market semantics stay unchanged.
set -euo pipefail

mode="${1:-}"
data_dir="${2:-}"
main_message="${3:-}"
data_message="${4:-}"
shift 4 || true
files=("$@")
data_branch="${AGENT_CRYPTO_DATA_BRANCH:-data/agent-crypto-live}"

case "$mode" in
  dual|data-only) ;;
  *) echo "Unsupported publication mode: $mode" >&2; exit 2 ;;
esac
[ -n "$data_dir" ] || { echo "Missing data_dir" >&2; exit 2; }
[ "${#files[@]}" -gt 0 ] || { echo "No owned files supplied" >&2; exit 2; }

temp_dir="$(mktemp -d)"
trap 'rm -rf "$temp_dir"' EXIT

for name in "${files[@]}"; do
  [ -f "$data_dir/$name" ] || { echo "Missing owned payload: $data_dir/$name" >&2; exit 3; }
  cp "$data_dir/$name" "$temp_dir/$name"
done

restore_owned_files() {
  mkdir -p "$data_dir"
  local name
  for name in "${files[@]}"; do
    cp "$temp_dir/$name" "$data_dir/$name"
  done
}

publish_ref() {
  local remote_branch="$1"
  local target_ref="$2"
  local message="$3"
  local label="$4"
  local attempt name

  for attempt in 1 2 3 4 5 6 7 8; do
    echo "$label · tentative $attempt/8"
    git fetch origin "$remote_branch"
    git reset --hard "origin/$remote_branch"
    restore_owned_files

    local staged=()
    for name in "${files[@]}"; do
      staged+=("$data_dir/$name")
    done
    git add "${staged[@]}"

    if git diff --cached --quiet; then
      echo "$label already current."
      return 0
    fi

    git commit -m "$message"
    if git push origin "HEAD:$target_ref"; then
      echo "$label published."
      return 0
    fi

    echo "$label changed remotely; retrying non-destructively."
    sleep $((attempt * 2))
  done

  echo "$label failed after 8 non-destructive attempts." >&2
  return 1
}

if [ "$mode" = "dual" ]; then
  publish_ref "main" "refs/heads/main" "$main_message" "Main compatibility publication"
fi

publish_ref "$data_branch" "refs/heads/$data_branch" "$data_message" "Live-data branch publication"
