---
name: tui-developer
description: >
  Build UI and app features with Taiga UI (`@taiga-ui/*`) in an Angular project that already has it
  installed. Use when creating components, building forms and inputs, wiring validation, opening
  dialogs / notifications / confirms, adding dropdowns or hints, theming and dark mode, or picking the
  right `tui*` component for a need. Teaches the durable method and delegates exact APIs, imports and
  selectors to the live source (the Taiga UI MCP server or `llms-full.txt`), because Taiga UI moves fast
  and model recall is usually a major version behind. To install and wire Taiga into a project, use the
  `tui-setup` skill first.
---

# Building with Taiga UI

The method for building with Taiga UI: the library's shape, how to pick components, and the mistakes to
avoid. It holds **no** exhaustive API — that lives in the live source you consult per task; the depth
lives in [`references/`](references).

> The #1 failure is writing Taiga code from memory that reflects an older major or an invented API.
> Everything here exists to prevent that. **If the live source and this skill disagree, the live source wins.**

## Step 0 — before writing any markup

1. **Is Taiga installed and wired?** If `package.json` has no `@taiga-ui/*`, or the app has no
   `<tui-root>` / `provideTaiga()`, stop — that is setup, not development. Run the **`tui-setup`** skill
   first, then come back here.
2. **Pin the major.** Read `package.json` (or `npm ls @taiga-ui/core`) — wiring and APIs differ across
   majors. [`references/v5/facts.md`](references/v5/facts.md) covers v5; for any other major, rely on the
   live source.
3. **Open the live source.** Prefer the Taiga UI **MCP** — `get_overview` (import map, checklist, common
   mistakes) once, then `get_component_example` per component you use. Otherwise
   `https://taiga-ui.dev/llms-full.txt`. **Confirm the owning package for every symbol before importing —
   never guess one.**

## Core rules

- **Pick by behaviour, then confirm the exact symbol live.** Map a need to a family in
  [capabilities.md](references/capabilities.md); get the real selector/import from the live source.
- **Controls are directives on native elements** inside a textfield wrapper — not custom `<tui-*>` tags.
- **Configure through DI**, not ad-hoc markup: providers and injected services (dialogs, notifications).
- **Compiles ≠ works.** Some wrong choices type-check and fail only at runtime — an unprovided service is
  a blank page, an unbound control renders inert. Run the app before you claim it's done.

## Reference files — read when

| Read | When |
|---|---|
| [architecture.md](references/architecture.md) | starting anything — the library's shape and the DI-first mental model |
| [capabilities.md](references/capabilities.md) | choosing which `tui*` component to reach for a given need |
| [forms.md](references/forms.md) | building any form, input, validation, or submit flow |
| [overlays.md](references/overlays.md) | dialogs, confirms, notifications / toasts, dropdowns, hints |
| [styling.md](references/styling.md) | about to write CSS — the escalation ladder that usually removes the need |
| [pitfalls.md](references/pitfalls.md) | before finishing — the anti-hallucination self-review |
| [v5/facts.md](references/v5/facts.md) | offline / no MCP — version-scoped concrete v5 symbols (safety net) |

## Angular fundamentals (compose, don't re-teach)

Assumes idiomatic modern Angular: standalone components, `ChangeDetectionStrategy.OnPush`, reactive
forms, signals for local state and `computed` for derived, logic in `.ts` / template in `.html` / styles
in the stylesheet, and `[class.x]` / `[style.p]` over `ngClass` / `ngStyle`. This skill does **not**
re-teach these — pair it with a general Angular skill, and detect the Angular major the same way you
detect the Taiga major (Step 0).
