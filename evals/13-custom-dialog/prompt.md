---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for."
---
Taiga UI is already installed and wired in this project. Create a new standalone component `EditName` in `src/app/edit-name/` with an "Edit name" button. Clicking it opens a Taiga UI dialog that renders a separate custom dialog component; that dialog receives the current name as its input data, lets the user type a new name, and returns the new name to the caller when confirmed. Use Taiga UI's dialog service.
