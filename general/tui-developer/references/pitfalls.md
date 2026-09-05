# Pitfalls: the anti-hallucination checklist (durable categories)

Run through this before finishing any Taiga UI code. These are durable *classes* of error; the concrete v5
instances live in [v5/facts.md](v5/facts.md), but always prefer the live source.

1. **Wrong package for a symbol.** The #1 compile error. Confirm every import against the import map
   (`get_overview` / `llms-full.txt`). Symbols move between packages across versions — never guess.
2. **A control written as a custom tag instead of a directive on a native element.** A sign of recalling an older
   major.
3. **A barrel array imported as if it were a single class** — the label / clear button / dropdown then silently
   don't work.
4. **Native attribute instead of a form binding on a control.** `[checked]` / `[value]` on a Taiga control leaves
   it inert / disabled — bind `[formControl]` / `[(ngModel)]` (see forms.md).
5. **Inventing a token, pipe, or service** by analogy to another library or an older major (e.g. a `*_DATA` dialog
   token, a field-error pipe). Confirm it exists before using it.
6. **Copying demo-only imports** (internal `@demo/*` helpers) from documentation examples into a real app.
7. **Missing app-level prerequisites** (root wrapper, root provider, icon assets) when nothing renders or
   portalled UI never appears.
8. **"Compiles" is not "works".** Some wrong choices type-check but fail at runtime — a service that isn't provided
   throws `NullInjectorError` (blank page); an unbound control renders disabled. Run the app, not just the build.
9. **Heavy logic / arrow functions in templates.** Move it to the class (a signal, a `computed`, or a method).
