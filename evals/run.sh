#!/usr/bin/env bash
# Full taiga-setup eval suite. Extra args pass through (e.g. --runs 1, --case '01*').
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if find "$HOME/.docker" -type l 2>/dev/null | grep -q .; then
  echo "~/.docker has symlinks that block Bash-granting evals. Quit Docker, then: mv ~/.docker ~/.docker.off (restore after the run)." >&2
  exit 1
fi

# Only a full run (no extra args) overwrites the committed report.
REPORT=()
if [ $# -eq 0 ]; then
  REPORT=(--report evals/report.html)
fi

# Binary is overridable: e.g. CLAUDE_BIN=~/.local/bin/cbox ./evals/run.sh
CLAUDE_BIN="${CLAUDE_BIN:-claude}"

# allow-tools grants: ng-add for the setup cases (01/05), Write+Edit for the
# component-generation cases (10-13). --trust-plugin skips the first-run trust
# prompt so the suite runs non-interactively (CI).
exec "$CLAUDE_BIN" plugin eval . --ablation with-without --scaffold -j 4 --no-publish --trust-plugin \
  --allow-tools "Bash(npx ng add:*),Bash(ng add:*),Bash(node_modules/.bin/ng add:*),Write,Edit" \
  ${REPORT[@]+"${REPORT[@]}"} "$@"
