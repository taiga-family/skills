---
max_turns: 12
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the source file the task asks for."
---
Add a pure TypeScript utility function `slugify(input: string): string` in a new file `src/app/slugify.ts`. It should lowercase the input, trim it, and replace runs of non-alphanumeric characters with a single hyphen. This is plain string logic with no UI.
