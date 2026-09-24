# Capability map — intent → family

Pick by behaviour, not by looks. This maps a need to the **family** to reach for; get the exact selector,
import, and package from the live source (MCP / `llms-full.txt`) before writing markup. Concrete v5
symbols are in [v5/facts.md](v5/facts.md).

| Need | Reach for (confirm exact names live) |
|---|---|
| Single-line text / number / masked input | textfield wrapper + a `tui*` control directive on a native `<input>` |
| Multi-line input | textfield wrapper + the textarea control directive |
| Pick one from a list / autocomplete | a select / combobox control + a data-list dropdown |
| On/off toggle | a checkbox or switch CVA directive (driven through a form control) |
| One-of-many choice | a radio group or a segmented control |
| Range / seek value | the range-slider directive on a native `<input type="range">` |
| Progress / seek display | the progress-bar directive on a native element |
| Button / async action | the button directive (+ the loading directive for pending state) |
| Modal / side sheet with custom content | the dialog service + Polymorpheus content — see [overlays.md](overlays.md) |
| Ask the user to confirm | the confirm dialog token opened through the dialog service — see [overlays.md](overlays.md) |
| Transient success / error message | the notification service — an injected service, **not** an alert-by-analogy — see [overlays.md](overlays.md) |
| Dropdown / hint attached to an element | the dropdown / hint directive — see [overlays.md](overlays.md) |
| Dark / light theme | the dark-mode token the root provider syncs to the theme attribute |

If you can't find a family for a need, assume Taiga has it and search the live source before hand-rolling
markup and CSS — "if you think Taiga can't do something, you're probably wrong." Then style it with the
ladder in [styling.md](styling.md), not bespoke CSS.
