#!/usr/bin/env node

import { Command } from 'commander';
import { getBanner } from '../utils/banner.js';
import commitCommand from '../commands/commit.js';
import configCommand from '../commands/config.js';
import explainCommand from '../commands/explain.js';
import initCommand from '../commands/init.js';
import startCommand from '../commands/start.js';

// Fix typical typos for single dash commands
if (process.argv.includes('-version')) {
  process.argv[process.argv.indexOf('-version')] = '--version';
}
if (process.argv.includes('-help')) {
  process.argv[process.argv.indexOf('-help')] = '--help';
}

const program = new Command();

program
  .name('gai')
  .description('git + ai cli tool')
  .addHelpText('beforeAll', getBanner())
  .version(`${getBanner()}\nv1.0.0`, '-v, --version', 'output the current version');

initCommand(program);
startCommand(program);
configCommand(program);
commitCommand(program);
explainCommand(program);

program.parse();
