---
name: tui-developer
description: >
  Build Angular apps and UI with Taiga UI (`@taiga-ui/*`). Use when a project depends on or imports `@taiga-ui/*`,
  when a template contains `tui*` selectors/directives or `<tui-root>` / `provideTaiga`, or when asked to scaffold
  a Taiga app, create components, build forms and inputs, wire validation, open dialogs and notifications, or set
  up theming and dark mode. Teaches the durable method, architecture, and verification workflow, and deliberately
  delegates exact component APIs, imports, and selectors to the always-fresh live source (the Taiga UI MCP server
  or `llms-full.txt`) because Taiga UI evolves quickly and model recall is usually a major version behind.
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

## Step 0 — Pin the version and the live source of truth (do this first)

Model recall of Taiga UI is usually a major version behind, so before writing any code:

1. **Detect the installed major.** Read the project's `package.json` (or run `npm ls @taiga-ui/core @taiga-ui/kit`)
   to see which `@taiga-ui/*` versions are actually present, and branch on it — the wiring and APIs differ across
   majors (v4 configured the library differently from v5). If Taiga isn't installed yet, you're scaffolding — go
   to [setup.md](references/setup.md).
2. **Establish the authoritative reference for that version.** If a Taiga UI MCP server is available, call its
   overview tool first (import map, code-generation checklist, common mistakes), then its list/example tools for
   the exact current API of each component you use. Otherwise read the project's `llms-full.txt`
   (`https://taiga-ui.dev/llms-full.txt`, or the `/next` variant for the upcoming major). Only if neither is
   reachable, fall back to `references/` (method) and the version-matched `references/v5/` (concrete facts).
3. **Confirm the owning package for every symbol you import.** Verify against the live source before asserting any
   exact component name, import path, selector, token, input/output, or version-specific behaviour — never invent
   one. If a live source and this skill disagree, the live source wins.

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

## Capability map (intent → family; confirm exact names live)

Pick by behaviour, not by looks. This maps a need to the **family** to reach for; get the exact selector, import,
and package for that family from the live source (Step 0) before writing markup.

| Need | Reach for (confirm exact names live) |
|---|---|
| Single-line text / number / masked input | textfield wrapper + a `tui*` control directive on a native `<input>` |
| Multi-line input | textfield wrapper + the textarea control directive |
| Pick one from a list / autocomplete | a select / combobox control + a data-list dropdown |
| On/off toggle | a checkbox or switch CVA directive (driven through a form control) |
| One-of-many choice | a radio group or a segmented control |
| Button / async action | the button directive (+ the loading directive for pending state) |
| Modal / side sheet with custom content | the dialog service + Polymorpheus content |
| Ask the user to confirm | a confirm dialog token opened through the dialog service |
| Transient success / error message | the notification service (an injected service — **not** an alert-by-analogy) |
| Dark / light theme | the dark-mode token the root provider syncs to the theme attribute |

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

## Angular fundamentals (compose, don't re-teach)

This skill is **Taiga-specific** and assumes idiomatic modern Angular: standalone components,
`ChangeDetectionStrategy.OnPush`, reactive forms, signals for local state and `computed` for derived, logic in
`.ts` / template in `.html` / styles in the stylesheet, and `[class.x]` / `[style.p]` over `ngClass` / `ngStyle`.
It does **not** re-teach these — pair it with a general Angular skill (e.g. `angular-developer`) for framework
fundamentals, and detect the project's Angular major the same way you detect the Taiga major (Step 0).

## Maintenance contract

Keep the backbone (SKILL.md + method references) free of volatile facts — component lists, import tables,
token/pipe/service names, version numbers. Those belong to the live source and, as an offline fallback only, to
`references/v5/`. When a new major ships, regenerate `references/v5/` (treat it like a migration) and leave the
backbone untouched unless the *method* itself changed.
