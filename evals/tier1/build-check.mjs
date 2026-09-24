#!/usr/bin/env node
// Tier-1 workability check: does the agent's generated Angular+Taiga source
// actually compile? Tier-0 graders grep the written files; they cannot see an
// import↔usage mismatch or a wrong-package import. This overlays the agent's
// `src/` onto a fixture with real, installed dependencies and runs `ng build`.
//
// Usage:
//   node build-check.mjs <input> [<input> ...]
//
// Each <input> is resolved to a source tree, trying in order:
//   <input>/sealed/home/cwd/src   (a `claude plugin eval --keep-temp` dir)
//   <input>/src                   (a project dir)
//   <input>                       (already a src/ dir)
//
// Env:
//   TIER1_FIXTURE  installed fixture to build against (default: /tmp/tier1-fixture)
//                  Create it once: mkdir -p "$F" && cd "$F" &&
//                  evals/_fixtures/scaffold-taiga.sh && npm install
//
// Exit code: 0 if every input builds, 1 if any fails (or setup is missing).

import {execFileSync, execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const FIXTURE = process.env.TIER1_FIXTURE || '/tmp/tier1-fixture';

function fail(msg) {
  console.error(`tier1: ${msg}`);
  process.exit(1);
}

if (process.argv.length < 3) {
  fail('no inputs. Usage: node build-check.mjs <keep-temp-dir | project-dir | src-dir> ...');
}
if (!fs.existsSync(path.join(FIXTURE, 'node_modules'))) {
  fail(`fixture not installed at ${FIXTURE} (no node_modules). See header for setup, or set TIER1_FIXTURE.`);
}

function resolveSrc(input) {
  const candidates = [
    path.join(input, 'sealed', 'home', 'cwd', 'src'),
    path.join(input, 'src'),
    input,
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'main.ts')) || fs.existsSync(path.join(c, 'app'))) {
      return c;
    }
  }
  return null;
}

// Angular's tsconfig may not permit a chmod-sealed kept dir; work on a private copy.
function buildOne(input) {
  const label = path.basename(input.replace(/\/+$/, ''));
  const src = resolveSrc(input);
  if (!src) return {label, ok: false, reason: `no src/ found under ${input}`};

  const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tier1-build-'));
  try {
    // Copy fixture (config + tsconfig + public) but NOT its heavy node_modules,
    // .angular cache, or a stale dist; symlink node_modules from the fixture.
    execSync(
      `rsync -a --exclude=node_modules --exclude=.angular --exclude=dist ${JSON.stringify(FIXTURE + '/')} ${JSON.stringify(buildDir + '/')}`,
    );
    fs.symlinkSync(path.join(FIXTURE, 'node_modules'), path.join(buildDir, 'node_modules'));

    // Replace the fixture's src with the agent's full src tree.
    fs.rmSync(path.join(buildDir, 'src'), {recursive: true, force: true});
    execSync(`rsync -a ${JSON.stringify(src + '/')} ${JSON.stringify(path.join(buildDir, 'src') + '/')}`);

    let output = '';
    try {
      output = execFileSync(
        path.join(buildDir, 'node_modules', '.bin', 'ng'),
        ['build', '--configuration', 'development'],
        {cwd: buildDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
      );
      return {label, ok: true, output};
    } catch (e) {
      output = `${e.stdout || ''}${e.stderr || ''}`;
      return {label, ok: false, output};
    }
  } finally {
    fs.rmSync(buildDir, {recursive: true, force: true});
  }
}

// Compiler diagnostics worth surfacing on failure.
function errorLines(output) {
  return (output || '')
    .split('\n')
    .filter((l) => /error|TS\d{3,}|NG\d{3,}|has no exported member|Cannot find/i.test(l))
    .slice(0, 8);
}

const results = [];
for (const input of process.argv.slice(2)) {
  process.stderr.write(`tier1: building ${path.basename(input)} ...\n`);
  results.push(buildOne(input));
}

console.log('\nTIER-1  ng build');
console.log('─'.repeat(60));
let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? '✓ PASS' : '✗ FAIL'}  ${r.label}`);
  if (!r.ok) {
    failed++;
    for (const l of errorLines(r.output)) console.log(`         ${l.trim()}`);
    if (r.reason) console.log(`         ${r.reason}`);
  }
}
console.log('─'.repeat(60));
console.log(`${results.length - failed}/${results.length} built`);
process.exit(failed ? 1 : 0);
