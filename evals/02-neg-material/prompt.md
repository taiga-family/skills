---
max_turns: 12
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill, "Bash(npx ng add:*)", "Bash(ng add:*)", "Bash(node_modules/.bin/ng add:*)"]
runs: 3
plugins: [../../taiga-ui-setup]
append_system_prompt: "You are running in a sandbox. If a command fails or is denied, do not debug the environment or retry variations — stop and tell the user the exact command to run."
---
Add Angular Material to this project.
