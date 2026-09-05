# Setup

Prefer the official schematic; it installs the packages and wires everything for the *installed* version, so you
never hardcode version-specific names.

## The one command

```
ng add taiga-ui
```

(For Nx: `nx g taiga-ui:ng-add`.) It installs the core packages, adds the root provider, the theme + fonts
stylesheets, the icon assets glob, and wraps the root template in the root component.

After it runs, confirm from the live source (the getting-started section) exactly what it added — the provider
name, the root wrapper tag, the stylesheet paths, and the icon assets glob — rather than assuming.

## If the schematic fails

The schematic can fail to complete in some environments (package nesting, or a missing migration in the published
collection). If it does, replicate what it does **manually**. The exact symbol / stylesheet / glob names for the
current major are in [v5/facts.md](v5/facts.md) or the live source:

1. Install the core packages (core, cdk, kit, icons) at matching versions; **pin `@angular/cdk` to your Angular
   major** if the resolver drags in a newer one.
2. Add the root provider to the app config.
3. Add the theme + fonts stylesheets to the build `styles`.
4. Add the icon assets glob.
5. Wrap the root template in the root component.

## Dark mode, i18n, SSR

The dark/light theme is driven by a writable signal plus a theme attribute the root provider syncs onto the
document; i18n and SSR have first-class support. Confirm the exact token / attribute names from the live source or
[v5/facts.md](v5/facts.md).
