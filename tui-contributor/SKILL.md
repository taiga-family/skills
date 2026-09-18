---
name: tui-contributor
description: Implement, fix, or review code in the taiga-family/taiga-ui monorepo. Use for Taiga UI source, public APIs, demos, schematics, unit tests, or screenshot tests. Do not use for ordinary application code that only consumes @taiga-ui packages.
---

# Taiga UI contributor

Make the smallest repository-native change that solves the issue, preserves public API compatibility, and includes the narrowest useful regression coverage.

## Establish the repository contract

Before editing:

1. Read the root `AGENTS.md`, `CONTRIBUTING.md`, `package.json`, `nx.json`, and the affected project's `project.json`.
2. Read the issue or PR conversation when one is provided. Treat the requested behavior and maintainer feedback as acceptance criteria.
3. Inspect the implementation, its public export path, nearby tests, and the matching demo example. Prefer an existing local pattern over a new abstraction.
4. Check the working tree and preserve unrelated changes.

Do not copy version-specific API details from model memory. The checked-out source, adjacent tests, demo examples, and generated API surface are authoritative for that revision.

## Map the change before coding

Identify which surfaces are affected:

| Surface                | Typical location                                           | Required follow-up                                                               |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Library implementation | `projects/<package>/`                                      | Unit test and targeted build                                                     |
| Public API             | entry-point `index.ts` files and package config            | Verify the symbol is exported from the intended package                          |
| User-visible component | matching demo page                                         | Update or add a canonical example when behavior/API changes                      |
| Visual behavior        | `projects/demo-playwright/`                                | Focused Playwright interaction or screenshot coverage                            |
| Schematics/migrations  | `projects/cdk/schematics/` or `projects/taiga-schematics/` | Fixture/snapshot coverage and a re-run/idempotency case                          |
| Styles/tokens          | component styles or `projects/styles/`                     | Check light/dark, forced states, RTL, and native control behavior where relevant |

Search imports and consumers before changing or removing a public symbol. A compile-time success inside one project is not proof that package boundaries or secondary entry points are correct.

## Implementation rules

- For a bug, add the smallest failing automated test first and confirm it fails for the expected reason.
- Fix the root invariant rather than the observed screenshot or one call site.
- Preserve DOM, focus, keyboard, form-control, and accessibility behavior unless the task explicitly changes them.
- Follow existing component structure and naming. Keep logic, template, and styles in their established files.
- Avoid unrelated cleanup, broad formatting, and opportunistic migrations.
- Do not introduce a deprecated Taiga UI or Angular API.
- Treat a public API change as backward-compatible by default. If compatibility cannot be preserved, stop and state the break clearly before expanding the patch.

### Component and directive changes

Verify all affected states, not only the default rendering:

- disabled, readonly, loading, invalid, and empty states when supported;
- keyboard navigation, focus restoration, and escape/outside-click behavior for interactive UI;
- reactive-form value, touched/dirty state, and disabled-state propagation for controls;
- projected content and portalled content for dropdowns, dialogs, hints, and notifications;
- RTL and theme-sensitive layout when positioning or color tokens change.

Do not test private fields or incidental CSS classes when a public behavior, DOM contract, harness, or user interaction can express the same invariant.

### Schematics and migrations

- Prefer the repository's declarative migration mechanisms before adding bespoke AST traversal.
- Test a fresh input and an already-migrated or partially migrated input. A migration must not crash or duplicate output when run again.
- Cover NgModule and standalone forms when the transformed construct can appear in both.
- Use the existing fixture and snapshot conventions. Review the semantic diff; do not accept a large snapshot rewrite without explaining every affected case.

## Choose the narrowest verification

Read the current scripts and Nx targets instead of assuming command names. In the current repository shape, useful targeted forms are:

```bash
npx nx test <project> --runTestsByPath <path/to/file.spec.ts>
npx nx build <project>
npx eslint <changed-files>
npx prettier --check <changed-files>
npx stylelint <changed-style-files>
npx nx e2e demo-playwright --grep '<focused title>'
```

Use broader checks only when the affected surface justifies them:

```bash
npm run typecheck
npm test
npm run run-many:build:libs
npx nx e2e demo-playwright
```

If the exact targeted command is rejected by the installed tool version, inspect `project.json` and the runner help once, then use the supported equivalent. Do not bypass dependency constraints with `--force` or `--legacy-peer-deps`.

## Visual regression discipline

For a visual bug, reproduce it in the closest existing demo example or add a minimal example. Add a focused Playwright assertion and update only its expected snapshot. Inspect the produced image and snapshot diff; a regenerated file is not evidence that the new rendering is correct.

Prefer behavioral assertions for logic and accessibility. Use screenshots for layout, styling, clipping, positioning, and state combinations that are materially visual.

## Finish

Before handing off:

- re-read the complete diff for accidental public exports, generated files, and unrelated formatting;
- state which checks ran and their exact result;
- call out checks that could not run and why;
- use a Conventional Commit scope that matches the affected package when a commit is requested.
