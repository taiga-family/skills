<!-- VERSION-SCOPED: Taiga UI v5 (Angular 19+). Regenerate this folder per major version — treat it like a migration. -->
<!-- The live MCP / llms-full.txt is authoritative. If anything here disagrees with the live source, trust the live source. -->

# Taiga UI v5 — concrete facts (offline safety net)

Load-bearing specifics for **v5**. Use them only when no live source is reachable; otherwise confirm against the
MCP / `llms-full.txt`.

## Setup

- Root provider: `provideTaiga()` (`@taiga-ui/core`) — wires event plugins + dark-mode sync. Do **not** add
  `NG_EVENT_PLUGINS` / `provideEventPlugins()` or `provideAnimations()` yourself (that is v4).
- Root wrapper: `<tui-root>` (`TuiRoot`, core).
- Styles: `@taiga-ui/styles/taiga-ui-theme.less` + `@taiga-ui/styles/taiga-ui-fonts.less`.
- Icons: assets glob from `@taiga-ui/icons/src`, referenced by name as `@tui.<name>` (e.g. `@tui.search`).
- **`ng add taiga-ui` may fail on a fresh app**: npm nests `@taiga-ui/cdk` under the `taiga-ui` meta package so the
  schematic collection path doesn't resolve, and the published `@taiga-ui/cdk` collection references a missing
  `migrate-tui-let` migration. Manual fallback: install `@taiga-ui/{core,cdk,kit,icons}` directly (hoists cdk),
  **pin `@angular/cdk` to your Angular 19 major**, then add `provideTaiga()`, the two stylesheets, the icons glob,
  and `<tui-root>` by hand.

## Package boundaries (easy to get backwards)

> These package assignments are correct for v5 — **trust them over your own recollection.** Importing a symbol
> from the wrong package is the #1 build error, and a wrong guess will still *look* plausible.

- **core:** `TuiButton`, `TuiIcon`, `TuiLink`, `TuiError`, `TuiInput`, `TuiCheckbox`, `TuiRadio`, `TuiDataList`,
  `TuiDialogService`, `TuiNotificationService`, `provideTaiga`, `TuiRoot`, `tuiValidationErrorsProvider`,
  `TUI_DARK_MODE`, `TuiButtonX` (close "X").
- **kit:** the `tuiInput*` family, `TuiSelect`, `TuiComboBox`, `TuiTextarea`, `TuiInputDate`, `TuiChevron`,
  `TuiDataListWrapper`, `TuiButtonLoading`, `TuiSwitch`, `TuiSegmented`, `TuiTabs`, `TUI_CONFIRM`, `TuiConfirmData`.
- **cdk:** `TuiControl`, `TuiValueTransformer`, `TuiDay`, `TuiTime`, `tuiMarkControlAsTouchedAndValidate`.
- **polymorpheus (`@taiga-ui/polymorpheus`):** `PolymorpheusComponent`, `injectContext`, `PolymorpheusContent`.

## Forms

- The base text input is **`<input tuiInput>`** (barrel `TuiInput`, core) — **not** `<input tuiTextfield>`
  (`tuiTextfield` is the `<tui-textfield>` wrapper plus its size / cleaner / appearance options).
- `<tui-error formControlName="x" />` renders messages on its own via `tuiValidationErrorsProvider` (**core**).
  There is **no `TuiFieldErrorPipe` / `tuiFieldError` pipe** and no `[error]="[] | tuiFieldError | async"` — those
  were removed in v5.
- Button `[loading]` needs `TuiButtonLoading` (**kit**) in addition to `TuiButton`.
- `tuiCheckbox` / `tuiSwitch` / `tuiSelect` etc. are CVA directives — bind `[(ngModel)]` / `formControl`, never
  `[checked]` / `[value]` (native attribute → renders disabled).

## Dialogs, confirms, notifications

- Notifications: **`TuiNotificationService`** (core). `TuiAlertService` is an abstract base and is **not provided** —
  injecting it throws `NullInjectorError` at runtime (it *compiles*, then the app is a blank page). Use
  `TuiNotificationService`.
- Dialogs: `TuiDialogService.open<Result>(new PolymorpheusComponent(Cmp), {data})`. Inside the dialog read input
  via `injectContext<TuiDialogContext<Result, Data>>()` and return with `context.completeWith(result)`. There is
  **no `TUI_DIALOG_DATA`** token.
- Confirm: `TUI_CONFIRM` (kit) with `TuiConfirmData` → `open<boolean>(TUI_CONFIRM, {data})`.

## Theming

- `TUI_DARK_MODE` (core) is a writable signal; `provideTaiga()` syncs it to `body[tuiTheme]`. Toggle it with a
  `TuiSwitch`.

## Value transformers

- To reshape a control's value, subclass the abstract `TuiValueTransformer` (`@taiga-ui/cdk`) and provide it via
  the control's options. There is **no `TUI_VALUE_TRANSFORMER` token and no `provideValueTransformer`**.
