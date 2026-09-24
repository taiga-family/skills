---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for."
---
Taiga UI is already installed and wired in this project. Create a new standalone component `SaveButton` in `src/app/save-button/` with a button that, when clicked, shows the user a transient success message that says "Saved". Use Taiga UI for both the button and the message.
