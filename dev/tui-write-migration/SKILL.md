---
name: tui-write-migration
description: >
  Use this skill when writing or reviewing Taiga UI schematics migrations. Covers: analyzing API changes between major
  versions, choosing the right migration utility, writing tests with snapshots, and avoiding common pitfalls. Invoke
  whenever asked to add, fix, or review a migration in projects/cdk/schematics/.
---

## Where to find the previous major version's source

Use whichever approach is available:

- **GitHub MCP** (if installed) — browse the repo directly via MCP tools, targeting the `v{N-1}.x` branch
- **`git show`** — browse any file from the previous major branch without a separate checkout:
  `git show v{N-1}.x:projects/<package>/index.ts`
- **Scripts** in the `scripts/` directory alongside this skill — resolve the correct branch from `package.json` automatically:
  - `browse-exports.sh <path>` — fetch a file via `gh` CLI
  - `search-symbol.sh <EntityName>` — find which package exported a symbol

## Step 1: Analyze the change

Before writing a migration, answer these questions:

1. **Find the entity in the previous major version** — check the public API (exports in `index.ts`) and usage in demo pages
2. **Find the equivalent in the current version** — check `projects/` for exports, renamed/moved/removed entities
3. **Check if migration already exists** — search in `projects/cdk/schematics/ng-update/vN/`
4. **Determine the type of change** — rename, package move, API change, removal

## Step 2: Choose the migration strategy

| Situation                                                        | Strategy                                                        |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Simple 1:1 rename or package move                                | Auto-migrate using an existing constant-driven utility          |
| Target symbol is a **barrel array** (`readonly [...]`)           | Rename/move as usual **and set `spreadInModule: true`** (see note) |
| Entity moved to a legacy package, migration is complex/ambiguous | Auto-move the import + leave a TODO comment for manual steps    |
| Entity removed, replacement exists but API differs significantly | Leave a TODO comment explaining what to use instead             |
| Entity removed, no replacement needed                            | Remove the import automatically, no TODO needed                 |
| Entity removed, unclear how to work without it                   | Leave a TODO comment explaining the situation                   |

**Barrel arrays need a spread in NgModule.** If the `to`-symbol is a barrel array in the target major (`declare const X: readonly [...]`), set `spreadInModule: true`. `@NgModule.imports` is typed `any[] | Type<any> | ModuleWithProviders<{}>`, so a `readonly [...]` tuple is not assignable and raises `TS2322` — which breaks the whole module and cascades into `NG8001/NG8002/NG8004` for every component declared there. Standalone `@Component.imports` accepts a `ReadonlyArray`, so it must **not** be spread — the `inModule` guard handles that automatically. Verify the **actual export shape in the target branch**: `declare const X: readonly [...]` is a barrel (needs the spread), `declare class X` is a single class (spreading it throws `TS2488`). This is invisible in standalone-only demos, which is exactly why it slips past demo-based checks.

### Priority

Focus on what impacts users most:

1. **High priority**: `@Component({ imports: [...] })` + template inputs/outputs (directives, pipes, components)
2. **Medium priority**: `inject()` calls, constructor injection, `viewChild` references
3. **Low priority**: Internal/private API usage, edge cases, type-only imports

## Step 3: Choose the migration utility

Before writing any code, explore what already exists:

1. Check `vN/steps/constants/` — constant-driven utilities for common patterns
2. Check `vN/steps/migrate-templates.ts` — to see which utilities are registered for this version
3. Look at existing migrations in `vN/steps/templates/` as reference

**Prefer a declarative entry in `vN/steps/constants/` over a new function.** Those files are lists consumed by generic runners, so most renames, moves, removals, and TODO comments are one entry — far more reviewable than bespoke code. A custom function in `vN/steps/templates/` is a last resort; a case that seems to need one because it does two things at once (e.g. leave a TODO **and** remove an attribute) usually splits into two declarative entries instead.

## Step 4: Write test

**File**: `vN/tests/schematic-migrate-<name>.spec.ts`

The `migrate()` function accepts these fields (all optional except when needed):

- `component` — TypeScript component source (triggers `.ts` snapshot)
- `template` — external HTML template (triggers `.html` snapshot)
- `styles` — LESS/CSS source (triggers `.less` snapshot)
- `packageJson` — JSON string (triggers `package.json` snapshot)
- `projectJson` — JSON string (triggers `project.json`/`angular.json` snapshot)

Look at existing tests in `vN/tests/` for the exact imports and structure — they follow a consistent pattern using `createMigration` from the shared test utilities.

Run tests: `npx jest schematic-migrate-<name> --updateSnapshot`

Run all vN tests: `npx jest ng-update/vN`

### Barrel and kind-changing rules: cover NgModule and re-migration

If the `to`-target is a barrel array (or the rule otherwise changes a node's kind), the test **must** include:

- a `@NgModule({imports: [...]})` case (not just standalone) — the spread only matters under `@NgModule`;
- a **re-migration** case where the array already holds the spread (`imports: [...X, LegacyModule]`).

A single-element array on a fresh run passes even when the multi-element / re-run case crashes — that gap is exactly how barrel-spread and node-kind bugs reach production.

### Use snapshots, not manual assertions

Assert output only through `migrate()` snapshots. Do **not** hand-write `expect(result).toContain(...)` / `.not.toContain(...)` on the migrated string. A migration rewrites a whole file, so whole-file snapshot comparison is the point; substring peeks under-specify it — they pass on corrupted whitespace, a dropped `}`, a mangled unrelated attribute — and couple the test to internal output fragments. `migrate()` also removes the boilerplate (`runMigration` + reading `host` files) that manual assertions drag in.

Caveat, not a loophole: `createMigration` snapshots only files **changed** by the migration (`before !== after`), so a snapshot cannot express "this input was left unchanged". Do not reach for manual assertions to cover that gap. A no-op test on input the migration deliberately ignores (malformed/empty expressions, unrelated tags) is rarely worth its place and is the lone odd test in an otherwise snapshot-based file — cover the migration's real transformations with snapshots and drop the no-op guard.

### Comment discipline (tests and migration code)

The test title and the snapshot are the spec — they already state intent and capture the exact output. Do **not** add comments on top that repeat them. Keep comments scarce; reviewers push back on narration.

Remove (do not write) comments that:

- **Restate the test title** — `it('keeps [src] literal without a TODO')` needs no `// a bound literal is not a SafeResourceUrl, so no TODO` above it.
- **Narrate the snapshot** — "the snapshot's `After` shows the inserted comment", "must show `track $index`". Whatever the snapshot proves, read the snapshot.
- **Reference the review process** — never mention a reviewer or a bot in a permanent comment (`// Guards Gemini's fix`, `// per review`). That is throwaway context, not code documentation.

Keep only comments that explain genuinely non-obvious **intent or a gotcha** the code cannot show on its own — e.g. why a regex is split to avoid super-linear backtracking, why an attribute intentionally stays on the wrapper instead of moving, why a value is deliberately skipped. A one-line rationale with a docs link is fine.

Traceability (an issue id like `#13823`) belongs in the **test title** or the **commit message**, not in a narration comment.

## Step 5: Know the pitfalls

The pipeline in `vN/index.ts` runs TS migrations first, then template migrations, then warnings last. Read the file to understand the full order before writing a new migration.

Key things to watch for:

- **Pipeline order matters** — if two utilities target the same attribute, the one running later may overwrite the first. Use `filterFn` to exclude elements already handled upstream.
- **Warning utilities run last** — if an entity is renamed earlier in the pipeline, use the post-rename name/package when referencing it in a warning utility.
- **Remove vs warn are mutually exclusive** — removing an import prevents the warning from firing. Choose one: either remove silently or warn with a TODO, not both.
- **Dynamic template values** — `[attr]="variable"` needs a conditional expression, not a static replacement. Otherwise it breaks runtime behavior.
- **Attribute removal utilities typically remove both static and dynamic forms** — use `filterFn` if you need different handling for `attr` vs `[attr]="expr"`.
- **Kind-changing text replacements break re-migration.** Replacing an identifier reference with text of a _different node kind_ (`...Name` → `SpreadElement`, `provideTaiga()` → `CallExpression`) via `replaceWithText` corrupts ts-morph's tree diff (`The children of the old and new trees were expected to have the same count`) when the file _already_ contains that construct — a re-run, or a partially-migrated codebase. Detect when the reference is already wrapped (e.g. its parent is a `SpreadElement`) and replace only the inner identifier, preserving the node kind.

## Checklist before PR

- [ ] Checked previous version API (exports, demo usage, deprecated annotations)
- [ ] Checked current version API (new name, new package, new behavior)
- [ ] Verified no existing migration covers this
- [ ] Preferred a declarative `constants/` entry; a bespoke `templates/` function only if nothing fit
- [ ] Handled edge cases: static attribute, dynamic binding, false value
- [ ] Barrel `to`-target: set `spreadInModule`, verified export shape in the target branch, tested `@NgModule` + re-migration (already-spread) cases
- [ ] Wrote test with representative cases
- [ ] Assertions via `migrate()` snapshots only — no manual `toContain`/`not.toContain`, no no-op guard tests (see Use snapshots)
- [ ] No narration comments — titles/snapshots carry intent; kept only non-obvious "why" notes (see Comment discipline)
- [ ] Ran `--updateSnapshot` and verified snapshots are correct
- [ ] Ran all vN tests to check for regressions
- [ ] Updated PR description with before/after table
