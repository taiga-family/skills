---
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 3
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for."
---
Taiga UI is already installed and wired in this project. Create a new standalone component `TermsConsent` in `src/app/terms-consent/` with a checkbox labelled "I accept the terms" that the user can check and uncheck. The checked state must be bound to a signal that reflects whether the box is currently ticked, and toggling the box must update that signal. Use the Taiga UI checkbox component.
