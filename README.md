# Taiga UI Agent Skills

Agent skills for working with [Taiga UI](https://github.com/taiga-family/taiga-ui) — a set of Angular UI components.

## Installation

Uses [`npx skills`](https://github.com/vercel-labs/skills) — no setup required.

```bash
# Install a specific skill into your project:
npx skills add taiga-family/skills --skill tui-migration

# Install all skills:
npx skills add taiga-family/skills --all
```

Skills are installed into your agent's skills directory and auto-trigger based on context.

## Available skills

| Skill | Description |
|---|---|
| [tui-setup](tui-setup/SKILL.md) | Set up Taiga UI in an Angular project (`ng add taiga-ui`, root, styles, providers) |
| [tui-developer](tui-developer/SKILL.md) | Build with Taiga UI once it's installed — components, forms, dialogs, overlays, theming (defers install to `tui-setup`) |
| [tui-migration](tui-migration/SKILL.md) | Safely resolve Taiga UI schematics migration TODOs without breaking behavior |

## Evals

Skills are checked with [`claude plugin eval`](https://code.claude.com/docs): each case in [`evals/`](evals) runs with and without the skill and compares scores.

```bash
npm run eval                              # full suite
npm run eval -- --runs 1 --case '01*'     # single case, one run
```

A full run writes [`evals/report.html`](evals/report.html) — commit it; on merge to `main` it is published to [GitHub Pages](https://taiga-family.github.io/skills/). Filtered runs go to the ignored `evals/results/`.
