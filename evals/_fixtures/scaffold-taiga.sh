#!/usr/bin/env bash
# Angular 22 project WITH Taiga UI already installed and wired, shared across the
# tui-developer cases. No npm install: those cases grade the generated source
# (symbols in the files the agent writes), not a build.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Base minimal Angular app, then overlay the Taiga wiring (deps in package.json,
# provideTaiga(), <tui-root>, theme styles). The overlay files overwrite their
# counterparts from the base.
cp -R "$HERE/angular-no-taiga"/. .
cp -R "$HERE/angular-taiga-overlay"/. .
