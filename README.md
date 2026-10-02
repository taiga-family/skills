# Taiga UI Agent Skills

Agent skills for working with [Taiga UI](https://github.com/taiga-family/taiga-ui) — a set of Angular UI components.

## Installation

Uses [`npx skills`](https://github.com/vercel-labs/skills) — no setup required.

```bash
# Install a specific skill into your project:
npx skills add taiga-family/skills --skill taiga-ui-migration

# Install all skills:
npx skills add taiga-family/skills --all
```

Skills are installed into your agent's skills directory and auto-trigger based on context.

## Available skills

| Skill | Description |
|---|---|
| [taiga-ui](taiga-ui/SKILL.md) | Build with Taiga UI once it's installed — components, forms, dialogs, overlays, theming (defers install to `taiga-ui-setup`) |
| [taiga-ui-setup](taiga-ui-setup/SKILL.md) | Set up Taiga UI in an Angular project (`ng add taiga-ui`, root, styles, providers) |
| [taiga-ui-migration](taiga-ui-migration/SKILL.md) | Safely resolve Taiga UI schematics migration TODOs without breaking behavior |

Skills on `main` target the current Taiga UI major. Support for an older major lives on its own git
branch (`v4` and so on), so no skill carries version switches inside it.

## Evals

Skills are checked with [`claude plugin eval`](https://code.claude.com/docs): each case in [`evals/`](evals)
is scored by grep-style graders over what the agent wrote.

```bash
npm run eval                              # both arms: with the skill and without it
npm run eval:quick                        # with-skill arm only — ~45% cheaper
npm run eval:smoke                        # haiku, 1 run, no baseline — "did I break the suite?"
npm run eval -- --runs 1 --case '12*'     # one case, one run
npm run lint:evals                        # free: catch malformed cases before paying
npm run eval:clean                        # delete the kept working dirs (--dry-run to list)
```

**Use `eval:quick` while iterating on a skill.** The baseline (no-skill) arm is 44% of the spend and it
cannot move when you edit a skill — only a model change shifts it. Run the full `npm run eval` when you
need the Δ numbers: before a PR, or after a model or Taiga bump.

**The suite pins `--model sonnet`** rather than inheriting your `~/.claude` default, so scores are
comparable between machines and runs. Δ is a property of the model as much as of the skill: a weaker
model fails more without the skill, so the same skill shows a bigger lift. Record the model alongside
any number you quote, and override deliberately: `EVAL_MODEL=opus npm run eval`.

Every run keeps each agent's working dir (`--keep-temp`), so [`evals/tier1`](evals/tier1) can afterwards
rebuild the generated code against real dependencies — a build check that costs no tokens and catches
wrong-package imports the graders miss (`npm run tier1 <kept-dir>`). Those dirs stay in the temp dir
until you clear them with `npm run eval:clean`, so run it once you're done with a batch.

A full run writes [`evals/report.html`](evals/report.html) — commit it; on merge to `main` it is published to [GitHub Pages](https://taiga-family.github.io/skills/). Filtered runs go to the ignored `evals/results/`.
