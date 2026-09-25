---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for."
---
Taiga UI is already installed and wired in this project. Create a new standalone component `DangerZone` in `src/app/danger-zone/` for an account-settings page. It shows a "Danger zone" section, set clearly apart from the rest of the page as risky, with a short warning line, a primary "Delete account" button that reads as a destructive action, and a low-emphasis "Cancel" button beside it. Use Taiga UI.
