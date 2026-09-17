#!/usr/bin/env node
// Copyright (c) 2026 donghwa-kang. MIT License. See LICENSE.
'use strict';

const { constants, copyFileSync, lstatSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

function install() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Run without arguments in the target project to install AGENTS.md and THIRD_PARTY_NOTICES.md. Existing files are never overwritten.');
    return;
  }
  if (args.length > 0) throw new Error('No arguments are supported. Run in the target project, or use --help.');

  for (const name of ['AGENTS.md', 'AGENTS.override.md', 'THIRD_PARTY_NOTICES.md']) {
    let exists = false;
    try {
      lstatSync(join(process.cwd(), name));
      exists = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (exists) throw new Error(`Existing ${name} found. Merge the guidelines manually; nothing was changed.`);
  }

  const files = ['THIRD_PARTY_NOTICES.md', 'AGENTS.md'];
  // Validate both payloads before publishing either file.
  for (const name of files) {
    if (readFileSync(join(__dirname, '..', name)).length === 0) {
      throw new Error(`The bundled ${name} is empty; nothing was installed.`);
    }
  }
  copyFileSync(join(__dirname, '..', files[0]), join(process.cwd(), files[0]), constants.COPYFILE_EXCL);
  try {
    copyFileSync(join(__dirname, '..', files[1]), join(process.cwd(), files[1]), constants.COPYFILE_EXCL);
  } catch (error) {
    throw new Error(`Could not finish installation. THIRD_PARTY_NOTICES.md was preserved; inspect the project files before retrying. ${error.message}`);
  }
  console.log('Installed AGENTS.md. Notices saved as THIRD_PARTY_NOTICES.md. Start a new Codex task or CLI session in this project.');
}

try {
  install();
} catch (error) {
  console.error(`Installation failed: ${error.message}`);
  process.exitCode = 1;
}
