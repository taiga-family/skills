# Tier-1: does the generated code actually compile?

The default eval graders are **Tier-0**: they grep the files the agent wrote
(`tool_used` / `file_exists`). They are fast, deterministic, and run in CI for
free — but they are blind to whether the code *builds*. An import that names the
wrong package, a directive that is never imported, a type mismatch — all pass
Tier-0 as long as the right substring appears in a written file.

**Tier-1** overlays the agent's `src/` onto a fixture with real, installed
dependencies and runs `ng build`. **It never calls the model — no tokens, no API
cost**, just build time. It catches the class of defect Tier-0 cannot:

| Defect | Tier-0 | Tier-1 |
|---|---|---|
| `import { TuiCheckbox } from '@taiga-ui/kit'` (it lives in `core`) | ✅ passes (substring present) — unless a dedicated `*-not-from-kit` grader exists | ❌ FAIL `TS2305 … has no exported member` |
| invented `*tuiTextfieldDropdown` structural directive | ✅ passes | ❌ FAIL `NG8116` |
| bare `readonly` on a typed boolean `@Input` | ✅ passes | ❌ FAIL `TS2322` |

Tier-1 is **opt-in and manual**. It needs a real `npm install` (heavy, network)
and is not wired into the eval run or CI. The paid part is the eval run that
produces its input: keep `--keep-temp` on (`run.sh` does) and you can re-check
builds for free afterwards instead of paying for another run. Use it as a spot-check after changing
the skill or a grader, or when a case's Tier-0 score looks suspiciously green.

> Tier-1 still does not *run* the app. A directive that compiles but was never
> imported renders as a plain native control (build stays green). That silent
> class is **Tier-2** (browser smoke-test) — kept as a manual spot-check on the
> flagship `16-mini-crm`, not automated here.

---

## One-time setup: the installed fixture

Tier-1 builds against a fixture that has dependencies installed. Create it once
(all commands in this file run from the repo root):

```sh
REPO="$PWD"                       # repo root
F=/tmp/tier1-fixture
mkdir -p "$F"
(cd "$F" && "$REPO/evals/_fixtures/scaffold-taiga.sh" && npm install)
```

This is the same scaffold the eval cases use (`angular-no-taiga` + the
`angular-taiga-overlay`), plus a real `npm install`. The fixtures carry no
lockfile — on purpose, so Renovate's bumps stay small — so each install resolves
whatever currently satisfies their ranges. If a Tier-1 failure looks like it
comes from a dependency rather than the agent's code, reinstall the fixture
before chasing it. The bare skeleton must build
green before you overlay any agent output:

```sh
cd /tmp/tier1-fixture && node_modules/.bin/ng build --configuration development
```

The fixture lives in `/tmp` and is ephemeral — recreate it if it disappears.
Point `build-check.mjs` elsewhere with `TIER1_FIXTURE=/path/to/fixture`.

---

## Running a build check

Tier-1 needs the agent's actual source files, which the eval harness only keeps
when you pass `--keep-temp`:

```sh
./evals/run.sh --case '14-checkbox' --keep-temp
```

`run.sh` passes `--keep-temp` on its own, so a plain `npm run eval` already
leaves the dirs behind — pass the flag explicitly only when calling the harness
directly. (`CLAUDE_BIN=/path/to/claude` overrides the binary if you need it.)

Each run prints its kept directory, e.g. `kept temp: /private/tmp/e-a8Gsl7`.
The agent's project root is `<keptdir>/sealed/home/cwd/`; `home/` and `tmp/` are
sealed mode `000`, so open the dir first:

```sh
chmod 700 /private/tmp/e-a8Gsl7 /private/tmp/e-a8Gsl7/sealed
```

> Do **not** run `git` (or anything that reads config from cwd) inside a kept
> directory — the harness warns about this explicitly.

Then build one or more kept dirs. `build-check.mjs` resolves each argument to a
source tree (`<dir>/sealed/home/cwd/src`, then `<dir>/src`, then `<dir>`):

```sh
npm run tier1 -- /private/tmp/e-a8Gsl7 /private/tmp/e-jrH8CS
```

Output:

```
TIER-1  ng build
────────────────────────────────────────────────────────────
✓ PASS  e-a8Gsl7
✗ FAIL  e-jrH8CS
         TS2305: Module '@taiga-ui/kit' has no exported member 'TuiCheckbox'.
         NG1010: ...
────────────────────────────────────────────────────────────
1/2 built
```

Exit code is `0` only if every input builds, `1` otherwise — so it can gate a
manual check. Each build runs in a private temp copy of the fixture (config +
tsconfig, `node_modules` symlinked, `src/` replaced with the agent's), so the
fixture itself is never mutated.

---

## Worked example (the `14-checkbox` finding)

This is why Tier-1 exists. On `14-checkbox`, Tier-0 originally scored the bare
arm **1.00** — it wrote `tuiCheckbox`, so `uses-checkbox` matched. But the bare
arm imported `TuiCheckbox` from `@taiga-ui/kit` (it lives in `@taiga-ui/core`).
Tier-1 caught it immediately: bare `✗ FAIL TS2305`, with-skill `✓ PASS`.

That finding drove a Tier-0 fix: a `checkbox-not-from-kit` grader
(`input_match: "TuiCheckbox[^;]*@taiga-ui/kit"`, `min 0 max 0`) now makes the
wrong-package import visible to the cheap tier too. After adding it the case
discriminates without a build: **with 1.00 / without 0.76, Δ +0.24**.

The pattern generalizes: when Tier-1 surfaces a build break that Tier-0 missed,
prefer to encode it as a targeted negative grader so the cheap tier catches the
regression on every run — and keep Tier-1 for the defects that only a compiler
can see.

---

## Cleaning up

Kept dirs pile up in the temp dir and are sealed, so deleting them takes a
`chmod` first. The repo script does both:

```sh
npm run eval:clean              # delete them
npm run eval:clean -- --dry-run # list what would go first
```

It only touches directories the harness named (`e-` plus six alphanumerics) that
you own — everything else in the temp dir is left alone. Do this once you've
finished building a batch; the dirs are the only copy of that run's output.
