---
name: tui-migration
description: >
  Use this skill when working with Taiga UI migration TODOs, whether after running `ng update` schematics or while
  manually reviewing migration comments left in code. Also invoke when asked to fix TODOs, clean up migration notes,
  or resolve deprecation warnings in a Taiga UI project. Resolve every actionable TODO only when the surrounding code
  proves the fix is safe; otherwise inspect more context or ask the user before changing behavior, templates, styles,
  or scripts.
---

## Goal

Handle post-schematics TODOs without breaking runtime behavior, template output, styles, or build tooling.

## Core rules

- TODOs are not permission to guess. They are a prompt to verify what is actually safe to change.
- Fix all actionable TODOs in scope, but only after proving each fix from nearby code and usage.
- Prefer the smallest possible change that preserves current behavior.
- Never remove a deprecated package, import, or utility just because a TODO suggests it unless the codebase proves it is unused.
- If a fix could change logic, generated markup, CSS application, or script behavior, validate the surrounding usage first.
- If the safe fix is unclear, ask the user instead of inventing code.

## Workflow

1. Identify the TODO and classify what it affects.
   - Template and directive usage.
   - TypeScript logic, dependency injection, or lifecycle behavior.
   - Styles, class names, or imported style packages.
   - Package removal, exports, or generated migration scripts.
   - Warning-only TODOs that should remain visible until a human decides.
     Classification examples:
   - `TODO: replace TuiButtonModule with TuiButton` -> **Template/DI** (high priority, usually safe)
   - `TODO: remove @taiga-ui/styles import` -> **Style package** (STOP, check usage first)
   - `TODO: migrate to standalone component API` -> **TypeScript** (medium priority, check consumers)
   - `TODO: this API was removed, no direct replacement` -> **Warning-only** (ask user)

2. Trace real usage before editing anything.
   - Search the current component, template, styles, and nearby files for direct references.
   - For style-related TODOs, also grep for CSS class names that originate from the affected package across all `.html`, `.scss`, `.less`, and `.css` files.
   - Confirm whether the TODO targets one site or a broader pattern.
3. Decide whether the TODO is safely actionable.
   - If there is a one-to-one replacement and it preserves behavior, apply it.
   - If a deprecated package is mentioned, check whether any runtime, template, or style usage still depends on it before deleting it.
   - If multiple replacements are plausible, or the fix depends on dynamic bindings or generated output, stop and ask the user.
4. Apply the smallest safe fix.
   - Keep changes localized.
   - Avoid broad refactors unless they are required to preserve behavior.
   - Do not remove imports, packages, or scripts unless the surrounding evidence supports that removal.
5. Verify the result.
   - Re-read the touched area to make sure logic, classes, and selectors still line up.
   - Run the narrowest available check for the affected slice when possible.
   - If the change still feels ambiguous after verification, do not expand the patch; ask the user.

## Style package removal - extra caution

When a TODO suggests removing a style import or style package:

1. Search the entire project for class names that originate from that package.
2. Check templates for attribute-based styles (for example `appearance="textfield"`).
3. Check whether the replacement package re-exports the same CSS classes.
4. Remove the import only if all three checks pass.
5. If any check is inconclusive, ask the user.

## When to ask the user

Ask a clarification question when any of these are true:

- The TODO suggests removing something, but other code may still depend on it.
- The only apparent replacement would change behavior, styling, or generated markup.
- The fix depends on a guess about how an older component, class, or script was intended to work.
- More than one valid migration path exists and the code does not reveal which one is correct.
- The TODO is about a deprecated styles or utility package, but class-based or imported styles may still be in use.

## What not to do

- Do not hardcode a fix based only on the TODO text.
- Do not delete deprecated dependencies first and discover breakage later.
- Do not rewrite unrelated code while chasing a migration TODO.
- Do not suppress TODOs with a new warning if the actual fix is already known and safe.
- Do not continue if you cannot explain why the change is safe from the local code context.

## Practical priority

1. Resolve template and runtime-breaking TODOs first.
2. Then handle TypeScript and DI changes.
3. Then review styles, exports, and package cleanup.
4. Leave warning-only TODOs or ambiguous cases for explicit user confirmation.
