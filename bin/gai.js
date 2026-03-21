#!/usr/bin/env node

import { Command } from 'commander';
import commitCommand from '../commands/commit.js';
import configCommand from '../commands/config.js';
import explainCommand from '../commands/explain.js';
import initCommand from '../commands/init.js';
import startCommand from '../commands/start.js';

const program = new Command();

program
  .name('gai')
  .description('git + ai cli tool')
  .version('1.0.0');

initCommand(program);
startCommand(program);
configCommand(program);
commitCommand(program);
explainCommand(program);

program.parse();
