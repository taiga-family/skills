---
max_turns: 60
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
runs: 1
plugins: [../../tui-developer]
append_system_prompt: "You are running in a sandbox with dependencies NOT installed. Do not run install, build, or test commands — just create the component source files the task asks for and wire them into the app."
---
Taiga UI is already installed and wired in this project (`provideTaiga()` and `<tui-root>` are in place). Build a small single-screen **Contacts** manager (a mini-CRM) and wire it into the app's root route so it renders at `/`. Make it feel like a real, usable screen — use the UI library's own components for everything (modal dialogs, form fields, validation messages, dropdown/select, buttons, notifications) and prefer the library's primitives over hand-rolled HTML controls or custom CSS.

Features:

1. **Contact list.** Show a list of contacts, seeded with 2–3 examples. Each contact has a full name, an email, and a role (one of: Owner, Editor, Viewer). Show a friendly empty state when there are no contacts.

2. **Add contact (modal dialog with a form that returns a value).** An "Add contact" button opens a **modal dialog** containing a reactive form:
   - a name field,
   - an email field that is required and must be a valid email, showing an inline validation error message when invalid,
   - a role picker (a dropdown/select of the three roles).
   The dialog has "Save" and "Cancel". "Save" is blocked while the form is invalid; pressing it runs a simulated async save (~1 second) during which the Save button shows a **loading** state, then the dialog closes and **returns the new contact** to the caller, which appends it to the list. "Cancel" closes the dialog without changes.

3. **Delete with confirmation + notification.** Each contact row has a "Delete" action that first asks the user to **confirm** in a dialog; only on confirmation is the contact removed, after which a brief **success notification** is shown.

Keep everything in standalone components under `src/app/`. The result must compile and run.
