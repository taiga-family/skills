---
name: tui-developer
description: >
  Use this skill when building an Angular application or UI with Taiga UI (`@taiga-ui/*`) — scaffolding an app,
  creating components, building forms and inputs, wiring validation, opening dialogs and notifications, theming
  and dark mode. It teaches the durable method and architecture for working with Taiga UI and how to verify what
  you generate; it deliberately delegates exact component APIs to the always-fresh live source (the Taiga UI MCP
  server or `llms-full.txt`), because Taiga UI evolves quickly and model recall is usually a major version behind.
---

## What this skill is (and is not)

This skill is the **version-independent method** for building apps with Taiga UI: how the library is shaped, the
workflow to follow, and the mistakes to avoid. It intentionally holds **no** exhaustive component lists, import
tables, or per-symbol API — those change every release and live in an always-fresh source you consult live
(Step 0). Treat this as the "how to think and what to verify" layer.

Concrete, version-scoped facts that are genuinely load-bearing offline live in a **fenced, clearly-versioned**
folder (`references/v5/`). They are a safety net, not the backbone — **when a live source is available, prefer it
over anything baked into this skill.**

> The single most common failure is generating Taiga UI code from memory that reflects an older major or an
> invented API. Everything below exists to prevent that.

## Step 0 — Establish the live source of truth (do this first)

Before writing any Taiga UI code, wire up the authoritative reference for the *installed* version:

1. **If a Taiga UI MCP server is available**, call its overview tool first (import map, code-generation checklist,
   common mistakes), then its list/example tools to pull the exact current API of each component you use.
2. **Otherwise** read the project's `llms-full.txt` (`https://taiga-ui.dev/llms-full.txt`, or the `/next` variant
   for the upcoming major) — the same content the MCP indexes.
3. Only if neither is reachable, fall back to `references/` (method) and `references/v5/` (concrete facts).
4. **Confirm the owning package for every symbol you import.** Never invent an import path, token, pipe, or API.
   If a live source and this skill disagree, the live source wins.

## Architecture (the shape — confirm exact names live)

- **Form controls are directives on native elements, wrapped by a textfield container** — not custom tags. A
  `tui*` directive goes on a native `<input>` / `<textarea>` inside a wrapper element. Confirm the exact directive
  and wrapper names from the live source.
- **DI-first.** Behaviour is configured through providers and injected **services**, not ad-hoc markup. Imperative
  UI (dialogs, notifications, confirms) is opened through injected services — confirm the concrete service names
  live, and never assume a name by analogy to another library (there is no Material-style `*_DATA` token).
- **Many exports are barrel arrays of directives**, not single classes — import the whole exported symbol.
- **Validation messages** come from a provider you register once, plus an error element bound to the control.
- **The app is wrapped in a root component**; portalled UI (dialogs, dropdowns, hints, notifications) renders into
  it. **One root provider** wires the library. The setup schematic sets both up.
- **Dynamic content** (dialog bodies, dropdown content) flows through Polymorpheus (`@taiga-ui/polymorpheus`).

## Building: the workflow

1. Set up the app with the official schematic (`ng add`) rather than by hand — see [setup.md](references/setup.md).
2. For each component, pull its exact current API and a canonical snippet from the live source **before** writing
   markup. Confirm the package for every imported symbol.
3. Build forms with the textfield + control-directive + error-element pattern — see [forms.md](references/forms.md).
4. Open dialogs/notifications through the injected services; fetch their exact options live.
5. Run the mistake checklist before finishing — see [pitfalls.md](references/pitfalls.md).

## References

- [setup.md](references/setup.md) — install via the schematic; root provider, wrapper, styles, icons, dark mode.
- [forms.md](references/forms.md) — the form-field pattern, validation messages, disabled-submit, control binding.
- [pitfalls.md](references/pitfalls.md) — the anti-hallucination checklist (durable categories).
- [v5/facts.md](references/v5/facts.md) — **version-scoped** concrete facts for Taiga UI v5 (offline safety net).

## Angular conventions (version-independent)

Standalone components; `ChangeDetectionStrategy.OnPush`; reactive forms; signals for local state and `computed`
for derived; logic in `.ts`, template in `.html`, styles in the stylesheet; `[class.x]` / `[style.p]` not
`ngClass` / `ngStyle`.

## Maintenance contract

Keep the backbone (SKILL.md + method references) free of volatile facts — component lists, import tables,
token/pipe/service names, version numbers. Those belong to the live source and, as an offline fallback only, to
`references/v5/`. When a new major ships, regenerate `references/v5/` (treat it like a migration) and leave the
backbone untouched unless the *method* itself changed.
