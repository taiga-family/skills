---
name: tui-testing
description: Write or repair tests for Angular application code that uses Taiga UI. Use for TestBed setup, Taiga component harnesses, forms, dialogs, dropdowns, notifications, and Playwright interactions. For changes inside the taiga-family/taiga-ui monorepo, use tui-contributor instead.
---

# Testing applications that use Taiga UI

Test the application's behavior at the lowest layer that can prove it. Add Taiga-specific infrastructure only when the behavior actually depends on Taiga rendering, forms, or portals.

## Inspect before choosing an approach

1. Detect the installed Angular and `@taiga-ui/*` majors from `package.json` or the lock file.
2. Identify the project's test runner, DOM environment, existing setup files, and nearby test style.
3. Check whether the matching version of `@taiga-ui/testing` is installed and whether it exports a harness for the component under test. Never invent a harness name.
4. Read the component, its template, providers, and closest tests before adding global setup.

Installed package exports and adjacent tests are authoritative. Taiga component names, providers, and harness coverage change between majors.

## Pick the test layer

| What must be proved                                     | Preferred layer                                               |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| Pure mapping, validator, formatter, or state transition | Plain unit test without TestBed                               |
| Component output, form binding, disabled/loading state  | Angular component test                                        |
| Interaction with a supported Taiga primitive            | CDK/Taiga component harness when available                    |
| Dialog, dropdown, hint, focus, or portal integration    | Component integration test with the real root/provider wiring |
| Cross-component user flow or visual behavior            | Playwright                                                    |

Do not render the whole application to test a pure function. Do not mock Taiga internals when a public service boundary or real lightweight integration is clearer.

## Angular component tests

- Import standalone components through `TestBed.configureTestingModule({imports: [...]})` and follow the repository's existing runner APIs.
- Trigger change detection deliberately after changing inputs, signals, form values, or service state.
- Exercise form controls through Angular forms or user interaction. Assert the resulting value, validation, and disabled behavior rather than a Taiga private field.
- Prefer semantic queries, labels, roles, visible text, or a public harness. Use CSS selectors only for stable application-owned markup.
- Avoid assertions on Taiga's internal DOM nesting and implementation classes unless that structure is the explicit compatibility contract under test.

### Harnesses

When the installed `@taiga-ui/testing` version exports the needed harness, use it with the Angular CDK testing environment:

```ts
const loader = TestbedHarnessEnvironment.loader(fixture);
const button = await loader.getHarness(
  TuiButtonHarness.with({ selector: '[data-test="save"]' }),
);
```

Confirm the actual harness methods from the installed typings. If no harness exists, interact through the native element or an application-owned page object; do not create a fake API that resembles a harness.

For portalled content attached outside the fixture root, use the testing environment's document-root loader when the project's setup supports it. If the test renders `<tui-root>` inside the fixture, a fixture loader may be sufficient. Choose based on the actual DOM target, not by habit.

### Dialogs, dropdowns, hints, and notifications

Choose one of two boundaries:

- To test application orchestration, replace the injected service/token with a typed fake and assert the public call and handled result.
- To test real rendering, include the version-correct Taiga root component and providers, open the portal through the public API, then assert user-visible content and focus/close behavior.

Do not combine a mocked service with assertions about real overlay DOM. Clean up subscriptions, timers, and fixtures using the runner's lifecycle so one portal cannot leak into the next test.

### Async behavior

- Prefer observable state changes, harness stabilization, or the runner's supported fake-timer utilities.
- Do not add fixed delays.
- Flush only timers owned by the behavior under test; blanket flushing can hide leaked intervals or animations.
- If the DOM environment cannot implement required layout, focus, observers, or pointer behavior faithfully, move that assertion to Playwright instead of adding unrealistic mocks.

## Playwright

- Reuse the repository's Playwright config, fixtures, base URL, locale, timezone, and reduced-motion policy.
- Prefer role, label, and visible-text locators. Use the project's test-id convention only when the accessible surface is insufficient.
- Wait for the observable UI state, not network-idle folklore or a timeout.
- Cover keyboard navigation and focus for dropdowns/dialogs when those are part of the bug.
- Use screenshots only for genuinely visual contracts. Keep the clip or component scope narrow and review the image diff.

## Verification

Run the closest existing test command first, then expand only if shared setup or public behavior changed. Also run type checking or build when the test compiles through a different configuration than production.

Report the exact commands and results. If a browser, native dependency, or DOM limitation prevents a check, identify the missing capability instead of weakening the assertion until it passes.
