---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for."
---
Taiga UI is already installed and wired in this project. Create a new standalone component `VolumeControl` in `src/app/volume-control/` with a slider the user can drag from 0 to 100, bound to a signal that holds the current value. Use the Taiga UI slider component.
