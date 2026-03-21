import { execSync } from 'child_process';
import readline from 'readline';
import { getAI } from '../ai/index.js';
import { getConfig } from '../utils/config.js';

const MAX_DIFF_LENGTH = 10000;

function isGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getStagedDiff() {
  return execSync('git diff --staged', { encoding: 'utf-8' });
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export default function commitCommand(program) {
  program
    .command('commit')
    .description('generate a commit message from staged changes')
    .option('-y, --yes', 'skip confirmation and auto-commit')
    .action(async (opts) => {
      if (!isGitRepo()) {
        console.log('not a git repository\nrun "gai init" to set up');
        process.exit(1);
      }

      const diff = getStagedDiff();
      if (!diff.trim()) {
        console.log('no staged changes');
        process.exit(0);
      }

      const truncated = diff.length > MAX_DIFF_LENGTH
        ? diff.slice(0, MAX_DIFF_LENGTH) + '\n[truncated]'
        : diff;

      const prompt = `Generate a concise git commit message.

Rules:
- Use conventional commits (feat, fix, chore, etc.)
- Max 1 line
- No explanation

Diff:
${truncated}`;

      const config = getConfig();
      const ai = getAI(config);

      let message;
      try {
        message = await ai.generate(prompt);
      } catch (err) {
        console.log('ai error: ' + (err.message || err));
        process.exit(1);
      }

      if (!message) {
        console.log('empty response from ai');
        process.exit(1);
      }

      if (opts.yes) {
        execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
        return;
      }

      console.log('\n' + message + '\n');
      const answer = await ask('commit? (y/n) ');

      if (answer === 'y') {
        execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
      }
    });
}
