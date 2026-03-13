#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { scanCommand } from './commands/scan.js';
import { fixCommand } from './commands/fix.js';
import { initCommand } from './commands/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

program
  .name('hauntr')
  .description('Your AI codebase engineer')
  .version(pkg.version);

program.addCommand(scanCommand);
program.addCommand(fixCommand);
program.addCommand(initCommand);

program.parse();
