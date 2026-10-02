#!/usr/bin/env bash
# Full eval suite for all skills in this repo. Extra args pass through (e.g. --runs 1, --case '01*').
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if find "$HOME/.docker" -type l 2>/dev/null | grep -q .; then
  echo "~/.docker has symlinks that block Bash-granting evals. Quit Docker, then: mv ~/.docker ~/.docker.off (restore after the run)." >&2
  exit 1
fi

# Only a full run with the baseline arm overwrites the committed report; `eval:quick`
# (--ablation none) and filtered runs leave it alone.
REPORT=()
if [ $# -eq 0 ]; then
  REPORT=(--report evals/report.html)
fi

# Fail fast on a malformed case instead of discovering it mid-run.
node "$(dirname "${BASH_SOURCE[0]}")/lint.mjs" >/dev/null

# Binary is overridable: e.g. CLAUDE_BIN=/path/to/claude ./evals/run.sh
CLAUDE_BIN="${CLAUDE_BIN:-claude}"

# Pin the model the cases run on. Without this the suite silently inherits
# whoever's ~/.claude default (opus here), which makes scores incomparable
# between machines and ~2.5x more expensive than sonnet. Override per run:
#   EVAL_MODEL=opus ./evals/run.sh
EVAL_MODEL="${EVAL_MODEL:-sonnet}"

# allow-tools grants: ng-add for the setup cases (01/02), Write+Edit for the
# component-generation cases (10-16). --trust-plugin skips the first-run trust
# prompt so the suite runs non-interactively (CI).
# --keep-temp preserves each run's working dir so evals/tier1 can build the
# generated code afterwards for free (it costs no tokens). Clean up with:
#   chmod -R 700 /private/tmp/e-* && rm -rf /private/tmp/e-*
KEEP=(--keep-temp)
case " $* " in *" --keep-temp "*) KEEP=() ;; esac

exec "$CLAUDE_BIN" plugin eval . --ablation with-without --scaffold -j 4 --no-publish --trust-plugin \
  --model "$EVAL_MODEL" \
  ${KEEP[@]+"${KEEP[@]}"} \
  --allow-tools "Bash(npx ng add:*),Bash(ng add:*),Bash(node_modules/.bin/ng add:*),Write,Edit" \
  ${REPORT[@]+"${REPORT[@]}"} "$@"
