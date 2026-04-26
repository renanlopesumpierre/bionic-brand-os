#!/usr/bin/env bash
# Syncs canonical brand docs from the TAG Brandbook folder into the portal.
# Run from the bionic-brand-os/ folder: `pnpm sync:content`

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRANDBOOK="$(cd "$ROOT/../Brandbook" 2>/dev/null && pwd || true)"

if [[ -z "$BRANDBOOK" ]]; then
  echo "Brandbook folder not found at ../Brandbook"
  exit 1
fi

BETINA_SRC="$BRANDBOOK"
BETINA_DST="$ROOT/content/clients/betina-weber"

mkdir -p "$BETINA_DST"

cp "$BETINA_SRC/brand-system.md"                     "$BETINA_DST/brand-system.md"
cp "$BETINA_SRC/brand-system.json"                   "$BETINA_DST/brand-system.json"
cp "$BETINA_SRC/betina-weber-design-system.md"       "$BETINA_DST/design-system.md"
cp "$BETINA_SRC/betina-weber-tokens.json"            "$BETINA_DST/design-tokens.json"
cp "$BETINA_SRC/brand-prompt.md"                     "$BETINA_DST/brand-prompt.md"
cp "$BETINA_SRC/betina-brand-prompt-master.md"       "$BETINA_DST/brand-agent-master.md"

echo "Synced Betina Weber content from Brandbook/"
ls -la "$BETINA_DST"
