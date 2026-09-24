---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for."
---
Taiga UI is already installed and wired in this project. Create a new standalone component `SignUp` in `src/app/sign-up/` with a reactive form that has a single email field. The field is required and must be a valid email address, and an inline validation message appears under it when the input is invalid. Use Taiga UI form components.
