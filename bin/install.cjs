#!/usr/bin/env node
// Copyright (c) 2026 donghwa-kang. MIT License. See LICENSE.
'use strict';

const { constants, copyFileSync, lstatSync } = require('node:fs');
const { join } = require('node:path');

function install() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Run without arguments in the target project to install AGENTS.md. Existing instructions are never overwritten.');
    return;
  }
  if (args.length > 0) throw new Error('No arguments are supported. Run in the target project, or use --help.');

  for (const name of ['AGENTS.md', 'AGENTS.override.md']) {
    let exists = false;
    try {
      lstatSync(join(process.cwd(), name));
      exists = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (exists) throw new Error(`Existing ${name} found. Merge the guidelines manually; nothing was changed.`);
  }

  copyFileSync(join(__dirname, '..', 'AGENTS.md'), join(process.cwd(), 'AGENTS.md'), constants.COPYFILE_EXCL);
  console.log('Installed AGENTS.md. Start a new Codex task or CLI session in this project.');
}

try {
  install();
} catch (error) {
  console.error(`Installation failed: ${error.message}`);
  process.exitCode = 1;
}
