'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve, dirname, basename } = require('node:path');
const { spawnSync } = require('node:child_process');

const cli = resolve(__dirname, '../bin/install.cjs');
const source = readFileSync(resolve(__dirname, '../AGENTS.md'));
const sentinel = 'Preserve existing project instructions.\n';

function fixture(t) {
  const parent = resolve(tmpdir());
  const dir = mkdtempSync(join(parent, 'codex-guidelines-test-'));
  t.after(() => {
    const target = resolve(dir);
    if (dirname(target) !== parent || !basename(target).startsWith('codex-guidelines-test-')) {
      throw new Error('Refusing cleanup outside the test temporary directory.');
    }
    rmSync(target, { recursive: true, force: true });
  });
  return dir;
}

const run = (dir, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8', windowsHide: true });

test('installs the bundled file in a project path containing spaces and Unicode', t => {
  const dir = join(fixture(t), 'project 한글');
  mkdirSync(dir);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readFileSync(join(dir, 'AGENTS.md')), source);
  assert.deepEqual(readdirSync(dir), ['AGENTS.md']);
  assert.match(result.stdout, /Installed AGENTS\.md\./);
  const repeat = run(dir);
  assert.equal(repeat.status, 1);
  assert.deepEqual(readFileSync(join(dir, 'AGENTS.md')), source);
});

for (const name of ['AGENTS.md', 'AGENTS.override.md']) {
  test(`preserves an existing ${name}`, t => {
    const dir = fixture(t);
    writeFileSync(join(dir, name), sentinel);
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.equal(readFileSync(join(dir, name), 'utf8'), sentinel);
    assert.deepEqual(readdirSync(dir), [name]);
  });
}

test('does not write inside an existing AGENTS.md directory', t => {
  const dir = fixture(t);
  mkdirSync(join(dir, 'AGENTS.md'));
  assert.equal(run(dir).status, 1);
  assert.deepEqual(readdirSync(join(dir, 'AGENTS.md')), []);
});

test('help does not change the project', t => {
  const dir = fixture(t);
  assert.equal(run(dir, '--help').status, 0);
  assert.deepEqual(readdirSync(dir), []);
});

test('rejects unsupported flags without writing', t => {
  const dir = fixture(t);
  assert.equal(run(dir, '--force').status, 1);
  assert.deepEqual(readdirSync(dir), []);
});
