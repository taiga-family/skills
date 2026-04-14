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
| Entity moved to a legacy package, migration is complex/ambiguous | Auto-move the import + leave a TODO comment for manual steps    |
| Entity removed, replacement exists but API differs significantly | Leave a TODO comment explaining what to use instead             |
| Entity removed, no replacement needed                            | Remove the import automatically, no TODO needed                 |
| Entity removed, unclear how to work without it                   | Leave a TODO comment explaining the situation                   |

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

Pick the simplest utility that covers the case. A custom function in `vN/steps/templates/` is only justified when no existing utility fits.

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

## Step 5: Know the pitfalls

The pipeline in `vN/index.ts` runs TS migrations first, then template migrations, then warnings last. Read the file to understand the full order before writing a new migration.

Key things to watch for:

- **Pipeline order matters** — if two utilities target the same attribute, the one running later may overwrite the first. Use `filterFn` to exclude elements already handled upstream.
- **Warning utilities run last** — if an entity is renamed earlier in the pipeline, use the post-rename name/package when referencing it in a warning utility.
- **Remove vs warn are mutually exclusive** — removing an import prevents the warning from firing. Choose one: either remove silently or warn with a TODO, not both.
- **Dynamic template values** — `[attr]="variable"` needs a conditional expression, not a static replacement. Otherwise it breaks runtime behavior.
- **Attribute removal utilities typically remove both static and dynamic forms** — use `filterFn` if you need different handling for `attr` vs `[attr]="expr"`.

## Checklist before PR

- [ ] Checked previous version API (exports, demo usage, deprecated annotations)
- [ ] Checked current version API (new name, new package, new behavior)
- [ ] Verified no existing migration covers this
- [ ] Chose the simplest utility that works
- [ ] Handled edge cases: static attribute, dynamic binding, false value
- [ ] Wrote test with representative cases
- [ ] Ran `--updateSnapshot` and verified snapshots are correct
- [ ] Ran all vN tests to check for regressions
- [ ] Updated PR description with before/after table
