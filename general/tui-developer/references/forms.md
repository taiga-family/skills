# Forms and validation (the pattern)

Reactive forms are the default. This file describes the **stable shape**; confirm the exact directive / symbol
names from the live source (or [v5/facts.md](v5/facts.md) offline).

## The form-field shape

Every text-like field is the same shape: a **required textfield wrapper** enclosing a **native element that carries
a `tui*` control directive**, an optional label, and a sibling **error element** bound to the control. The control
directive does **not** work outside its wrapper — render and import **both** the wrapper and the directive (they
are separate symbols). Confirm the exact names from the live source; for v5 they're `<tui-textfield>` +
`<input tuiInput>`, both from `@taiga-ui/core`.

## Bind controls through Angular forms — never the native attribute

Taiga form controls are **ControlValueAccessor directives**. Drive them through Angular forms —
`[formControl]` / `formControlName` / `[(ngModel)]`. **Do not** use the native `[checked]` / `[value]` to reflect
state: without a bound `NgControl` the control has no value accessor wired and renders **disabled / inert**. This
is the single most common "the control shows but I can't interact with it" bug, and it *compiles cleanly* — only
the running app reveals it.

```html
<!-- right: bound through a form control -->
<input tuiCheckbox type="checkbox" [(ngModel)]="task.done" />

<!-- wrong: native attribute -> the control renders disabled -->
<input tuiCheckbox type="checkbox" [checked]="task.done" />
```

## Validation messages render from a provider

The error element reads the bound control and shows a message when it is invalid and touched. Register the
messages **once** via a provider, keyed by Angular's own error keys (`required`, `email`, `minlength`, …). No
per-field pipe is needed for the common case. Confirm the provider + error-element names live.

## Showing errors on a disabled submit

If the submit button is `[disabled]="form.invalid"`, the user can't click it to touch the fields, so errors never
appear. Either keep the button enabled and guard inside the handler, or mark every control touched on the blocked
submit attempt (there is a CDK helper for this — confirm its name live). Marking-touched is the robust pattern.

## Accessibility

Associate each label with its input via `for` / `id`. Taiga's label directive renders a real `<label>`; adding
`for="…"` on it and a matching `id` on the input satisfies the "no associated label" a11y audit that the bare
textfield wrapper otherwise trips.
