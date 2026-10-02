#!/usr/bin/env bash
# Remove the working dirs `claude plugin eval --keep-temp` leaves behind.
#
# run.sh always passes --keep-temp so evals/tier1 can rebuild the generated code
# for free afterwards; the dirs pile up in the temp dir, sealed mode 000, and are
# only useful until the next run.
#
#   npm run eval:clean              # delete them
#   npm run eval:clean -- --dry-run # just list what would go
#
# Only directories named exactly like the harness names them (e-XXXXXX) and
# owned by you are touched; anything else in the temp dir is left alone.
set -euo pipefail

DRY=""
[ "${1:-}" = "--dry-run" ] && DRY=1

found=0
bases=""
for base in "${TMPDIR:-/tmp}" /tmp; do
  # /tmp is a symlink to /private/tmp on macOS and find will not descend it.
  real="$(cd "$base" 2>/dev/null && pwd -P)" || continue
  case " $bases " in *" $real "*) continue ;; esac
  bases="$bases $real"
done

for base in $bases; do
  while IFS= read -r dir; do
    [ -n "$dir" ] || continue
    name="${dir##*/}"
    # Belt and braces: the harness names these e- plus six alphanumerics.
    case "$name" in
      e-[A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9]) ;;
      *) continue ;;
    esac
    found=$((found + 1))
    if [ -n "$DRY" ]; then
      echo "would remove $dir"
    else
      chmod -R 700 "$dir" 2>/dev/null || true
      rm -rf "$dir"
      echo "removed $dir"
    fi
  done < <(find "$base" -maxdepth 1 -type d -user "$(id -un)" -name 'e-??????' 2>/dev/null | sort)
done

if [ "$found" -eq 0 ]; then
  echo "no kept eval dirs found"
elif [ -n "$DRY" ]; then
  echo "$found dir(s) — rerun without --dry-run to delete"
else
  echo "$found dir(s) removed"
fi
