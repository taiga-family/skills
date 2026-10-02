#!/usr/bin/env node
// Static checks on the eval suite — run before paying for a run.
//
// Catches the mistakes that cost a whole run to discover:
//   * a regex in double-quoted YAML carrying an escape YAML rejects (\[ , \( , \w …).
//     `claude plugin eval` then refuses the whole case: "invalid YAML frontmatter".
//   * a `plugins:` path that does not resolve to a skill directory.
//   * a `name:` in case.yaml that disagrees with its directory, so --case lies.
//   * a grader regex that does not compile.
//
// Usage: npm run lint:evals   (exit 1 on any finding)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVALS = path.join(ROOT, 'evals');
const findings = [];

const rel = (p) => path.relative(ROOT, p);

function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  return end === -1 ? null : text.slice(4, end);
}

// YAML double-quoted scalars allow only these escapes; a regex like "\[x\]" is a parse error.
const LEGAL = /\\(?!["\\/bfnrtv0 NLPuxU])/g;

function scalar(line) {
  const dq = line.match(/^\s*([\w-]+):\s*"((?:[^"\\]|\\.)*)"/);
  if (dq) return {key: dq[1], value: dq[2].replace(/\\"/g, '"'), quote: 'double'};
  const sq = line.match(/^\s*([\w-]+):\s*'((?:[^']|'')*)'/);
  if (sq) return {key: sq[1], value: sq[2].replace(/''/g, "'"), quote: 'single'};
  const bare = line.match(/^\s*([\w-]+):\s*([^'"#\s][^#]*?)\s*(?:#.*)?$/);
  if (bare) return {key: bare[1], value: bare[2], quote: 'none'};
  return null;
}

function checkFile(file) {
  const fm = frontmatter(file);
  if (fm === null) return;
  for (const line of fm.split('\n')) {
    const field = scalar(line);
    if (!field) continue;

    if (field.quote === 'double') {
      const illegal = line.match(LEGAL);
      if (illegal) {
        findings.push(
          `${rel(file)}: ${field.key} uses ${illegal.join(' ')} inside double quotes — ` +
            `YAML rejects it, the case will not load. Use single quotes.`,
        );
      }
    }

    if (field.key === 'input_match' || field.key === 'pattern') {
      try {
        new RegExp(field.value);
      } catch (e) {
        findings.push(`${rel(file)}: ${field.key} is not a valid regex — ${e.message}`);
      }
    }

    if (field.key === 'plugins') {
      for (const entry of field.value.replace(/[[\]]/g, '').split(',')) {
        const target = entry.trim();
        if (!target) continue;
        const resolved = path.resolve(path.dirname(file), target);
        if (!fs.existsSync(path.join(resolved, 'SKILL.md'))) {
          findings.push(`${rel(file)}: plugins entry "${target}" has no SKILL.md (${rel(resolved)})`);
        }
      }
    }
  }
}

const caseDirs = fs
  .readdirSync(EVALS, {withFileTypes: true})
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(EVALS, e.name, 'case.yaml')))
  .map((e) => path.join(EVALS, e.name));

for (const dir of caseDirs) {
  const files = [
    path.join(dir, 'case.yaml'),
    path.join(dir, 'prompt.md'),
    ...(fs.existsSync(path.join(dir, 'graders'))
      ? fs.readdirSync(path.join(dir, 'graders')).map((f) => path.join(dir, 'graders', f))
      : []),
  ].filter((f) => fs.existsSync(f));

  for (const file of files) checkFile(file);

  const fm = frontmatter(path.join(dir, 'case.yaml')) || '';
  const name = fm.match(/^name:\s*(\S+)/m)?.[1];
  if (name && name !== path.basename(dir)) {
    findings.push(`${rel(dir)}/case.yaml: name "${name}" does not match the directory`);
  }
  if (!fs.existsSync(path.join(dir, 'graders'))) {
    findings.push(`${rel(dir)}: no graders/ directory`);
  }
}

console.log(`checked ${caseDirs.length} eval case(s)`);
if (findings.length) {
  for (const f of findings) console.error(`  ✗ ${f}`);
  console.error(`\n${findings.length} finding(s)`);
  process.exit(1);
}
console.log('no findings');
