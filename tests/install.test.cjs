'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve, dirname, basename } = require('node:path');
const { spawnSync } = require('node:child_process');

const cli = resolve(__dirname, '../bin/install.cjs');
const source = readFileSync(resolve(__dirname, '../AGENTS.md'));
const notices = readFileSync(resolve(__dirname, '../THIRD_PARTY_NOTICES.md'));
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
  assert.deepEqual(readFileSync(join(dir, 'THIRD_PARTY_NOTICES.md')), notices);
  assert.deepEqual(readdirSync(dir), ['AGENTS.md', 'THIRD_PARTY_NOTICES.md']);
  assert.match(result.stdout, /Installed AGENTS\.md\./);
  const repeat = run(dir);
  assert.equal(repeat.status, 1);
  assert.deepEqual(readFileSync(join(dir, 'AGENTS.md')), source);
  assert.deepEqual(readFileSync(join(dir, 'THIRD_PARTY_NOTICES.md')), notices);
});

for (const name of ['AGENTS.md', 'AGENTS.override.md', 'THIRD_PARTY_NOTICES.md']) {
  test(`preserves an existing ${name}`, t => {
    const dir = fixture(t);
    writeFileSync(join(dir, name), sentinel);
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.equal(readFileSync(join(dir, name), 'utf8'), sentinel);
    assert.deepEqual(readdirSync(dir), [name]);
  });
}

for (const name of ['AGENTS.md', 'AGENTS.override.md', 'THIRD_PARTY_NOTICES.md']) {
  test(`does not write inside an existing ${name} directory`, t => {
    const dir = fixture(t);
    mkdirSync(join(dir, name));
    assert.equal(run(dir).status, 1);
    assert.deepEqual(readdirSync(join(dir, name)), []);
    assert.deepEqual(readdirSync(dir), [name]);
  });
}

for (const name of ['AGENTS.md', 'THIRD_PARTY_NOTICES.md']) {
  for (const defect of ['missing', 'empty']) {
    test(`installs nothing when bundled ${name} is ${defect}`, t => {
      const root = fixture(t);
      const bundle = join(root, 'bundle');
      const project = join(root, 'project');
      mkdirSync(join(bundle, 'bin'), { recursive: true });
      mkdirSync(project);
      writeFileSync(join(bundle, 'bin/install.cjs'), readFileSync(cli));
      for (const [file, content] of [['AGENTS.md', source], ['THIRD_PARTY_NOTICES.md', notices]]) {
        if (file === name && defect === 'missing') continue;
        writeFileSync(join(bundle, file), file === name ? '' : content);
      }
      const result = spawnSync(process.execPath, [join(bundle, 'bin/install.cjs')], { cwd: project, encoding: 'utf8', windowsHide: true });
      assert.equal(result.status, 1);
      assert.deepEqual(readdirSync(project), []);
    });
  }
}

test('help does not change the project', t => {
  const dir = fixture(t);
  assert.equal(run(dir, '--help').status, 0);
  assert.deepEqual(readdirSync(dir), []);
});

for (const name of ['AGENTS.md', 'THIRD_PARTY_NOTICES.md']) {
  test(`preserves a ${name} created while installation is in progress`, t => {
    const root = fixture(t);
    const project = join(root, 'project');
    mkdirSync(project);
    const hook = join(root, 'concurrent-write.cjs');
    writeFileSync(hook, `
      const fs = require('node:fs');
      const path = require('node:path');
      const copy = fs.copyFileSync;
      fs.copyFileSync = (source, destination, flags) => {
        if (path.basename(destination) === ${JSON.stringify(name)}) {
          fs.writeFileSync(destination, ${JSON.stringify(sentinel)}, { flag: 'wx' });
        }
        return copy(source, destination, flags);
      };
    `);
    const result = spawnSync(process.execPath, ['--require', hook, cli], { cwd: project, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 1);
    assert.equal(readFileSync(join(project, name), 'utf8'), sentinel);
    if (name === 'AGENTS.md') {
      assert.deepEqual(readFileSync(join(project, 'THIRD_PARTY_NOTICES.md')), notices);
      assert.match(result.stderr, /THIRD_PARTY_NOTICES.md was preserved/);
    } else {
      assert.deepEqual(readdirSync(project), ['THIRD_PARTY_NOTICES.md']);
    }
  });
}

test('rejects unsupported flags without writing', t => {
  const dir = fixture(t);
  assert.equal(run(dir, '--force').status, 1);
  assert.deepEqual(readdirSync(dir), []);
});
