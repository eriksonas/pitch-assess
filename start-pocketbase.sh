#!/bin/bash
# Wrapper that loads server-side environment variables from .env (project
# root) and then launches PocketBase. Server-only keys (OPENROUTER_API_KEY,
# OPENAI_API_KEY) must live here — never in the frontend bundle.
set -euo pipefail

cd "$(dirname "$0")"

if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

# Sanity check: warn loudly if the proxy keys still look like placeholders.
for var in OPENROUTER_API_KEY OPENAI_API_KEY; do
    val="${!var:-}"
    if [ -z "$val" ] || [[ "$val" == replace-with-* ]]; then
        echo "⚠️  $var is not set in .env — the AI proxy endpoints will return 503." >&2
    fi
done

exec ./pocketbase/pocketbase serve --http=127.0.0.1:8090 "$@"
