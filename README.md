# Taiga UI Agent Skills

Agent skills for working with [Taiga UI](https://github.com/taiga-family/taiga-ui) — a set of Angular UI components.

## Installation

Uses [`npx skills`](https://github.com/vercel-labs/skills) — no setup required.

```bash
# Install a specific skill into your project:
npx skills add taiga-family/skills --skill tui-write-migration

# Install all skills:
npx skills add taiga-family/skills --all
```

Skills are installed into your agent's skills directory and auto-trigger based on context.

## Available skills

| Skill | Description |
|---|---|
| [tui-write-migration](./dev/tui-write-migration/SKILL.md) | Write and review Taiga UI schematics migrations |
| [tui-migration](./general/tui-migration/SKILL.md) | Safely resolve Taiga UI schematics migration TODOs without breaking behavior |
| [tui-developer](./general/tui-developer/SKILL.md) | Build Angular apps and UI with Taiga UI — setup, components, forms, dialogs, theming |
