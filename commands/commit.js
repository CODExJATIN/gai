import { execSync } from 'child_process';
import React from 'react';
import { render } from 'ink';
import { getAI } from '../ai/index.js';
import { getConfig } from '../utils/config.js';
import StagingPrompt from '../ui/StagingPrompt.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import ConfirmCommit from '../ui/ConfirmCommit.jsx';

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

      // Get unstaged & untracked files
      const statusOutput = execSync('git status -s', { encoding: 'utf-8' });
      const files = statusOutput
        .split('\n')
        .filter(Boolean)
        .map(line => {
          // git status -s is exactly 2 chars of status, 1 space, then the filename
          const status = line.substring(0, 2);
          let file = line.substring(3).trim();
          // Remove surrounding quotes if git added them
          if (file.startsWith('"') && file.endsWith('"')) {
             file = file.slice(1, -1);
          }
          return { name: file, message: `${status} ${file}` };
        });

      if (files.length > 0) {
        // Only run interactive prompt if we're in a TTY
        if (process.stdin.isTTY) {
          try {
            let selectedFiles = [];
            await new Promise((resolve, reject) => {
              const { unmount } = render(
                React.createElement(StagingPrompt, {
                  files,
                  onConfirm: (names) => {
                    selectedFiles = names;
                    unmount();
                    resolve();
                  }
                })
              );
            });
            
            if (selectedFiles.length > 0) {
              execSync(`git add ${selectedFiles.map(f => `"${f}"`).join(' ')}`);
              console.log(`staged ${selectedFiles.length} file(s)`);
            }
          } catch (err) {
            if (err) {
              console.log('error during prompt: ' + (err.message || err));
            }
            process.exit(err ? 1 : 0);
          }
        }
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
- DO NOT use markdown code blocks or triple backticks (\`\`\`)
- Output ONLY the raw commit message

Diff:
${truncated}`;

      const config = getConfig();
      const ai = getAI(config);

      let message;
      try {
        const { unmount } = render(React.createElement(LoadingSpinner, { message: 'Generating commit message...' }));
        message = await ai.generate(prompt);
        unmount();
        if (message) {
          // Strip markdown code blocks
          message = message.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '').replace(/^```/g, '').replace(/```$/g, '').trim();
          // Force single line (take first non-empty line)
          message = message.split('\n').map(line => line.trim()).filter(Boolean)[0] || message;
        }
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

      console.log('');
      await new Promise((resolve) => {
        const { unmount } = render(
          React.createElement(ConfirmCommit, {
            message,
            onConfirm: () => {
              unmount();
              execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
              resolve();
            },
            onCancel: () => {
              unmount();
              console.log('commit aborted');
              resolve();
            }
          })
        );
      });
    });
}
