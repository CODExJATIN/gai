import readline from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from 'ink';
import { prompt, show } from '../ui/prompt.jsx';
import TextPrompt from '../ui/TextPrompt.jsx';
import ConfirmPrompt from '../ui/ConfirmPrompt.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import Alert from '../ui/Alert.jsx';
import { getAI } from '../ai/index.js';
import { getConfig } from '../utils/config.js';

function listFiles(dir, prefix = '', maxEntries = 100) {
  const entries = [];
  const skip = new Set(['.git', 'node_modules', '.gai']);

  function walk(currentDir, currentPrefix) {
    if (entries.length >= maxEntries) return;
    let items;
    try { items = fs.readdirSync(currentDir); } catch { return; }
    for (const item of items) {
      if (entries.length >= maxEntries) break;
      if (skip.has(item)) continue;
      const full = path.join(currentDir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        entries.push(currentPrefix + item + '/');
        walk(full, currentPrefix + '  ');
      } else {
        entries.push(currentPrefix + item);
      }
    }
  }

  walk(dir, prefix);
  return entries.join('\n');
}

export default function initCommand(program) {
  program
    .command('init')
    .description('initialize a new git repository')
    .action(async () => {
      let name = await prompt(TextPrompt, { message: 'Repo name (leave empty for current):' });
      if (!name) name = '.';

      const dir = path.resolve(name);
      const isCurrent = dir === process.cwd();

      if (!isCurrent && fs.existsSync(dir)) {
        await show(Alert, { type: 'error', title: 'Error', children: 'Directory already exists: ' + name });
        setTimeout(() => process.exit(1), 100);
        return;
      }

      if (!isCurrent) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(path.join(dir, '.git'))) {
        execSync('git init', { cwd: dir, stdio: 'ignore' });
        await show(Alert, { type: 'success', children: 'Repo initialized: ' + (isCurrent ? 'current directory' : name) });
      } else {
        await show(Alert, { type: 'info', children: 'Git repo already exists in ' + (isCurrent ? 'current directory' : name) });
      }

      // .gitignore prompt
      const gitignorePath = path.join(dir, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        const wantIgnore = await prompt(ConfirmPrompt, { message: 'Create .gitignore?' });

        if (wantIgnore) {
          const config = getConfig();
          if (!config.provider) {
            await show(Alert, { type: 'error', children: 'No ai provider configured. Run "gai start" first.' });
            setTimeout(() => process.exit(1), 100);
            return;
          }

          const fileList = listFiles(dir);
          const ai = getAI(config);
          const prompt = `Analyze this file structure and generate an appropriate .gitignore file.

File structure:
${fileList || '(empty project)'}

Rules:
- Identify the project type and include standard ignore patterns (node_modules, dist, .env, etc.)
- ONLY output the raw file content
- DO NOT use markdown code blocks or triple backticks (\`\`\`)
- Ensure source files like .js and .json are NOT ignored`;

          try {
            const spinner = render(React.createElement(LoadingSpinner, { message: 'Analyzing project...' }));
            let content = await ai.generate(prompt);
            spinner.unmount();
            if (content) {
              // strip markdown fencing if AI included it
              content = content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '').trim();
              fs.writeFileSync(gitignorePath, content + '\n');
              await show(Alert, { type: 'success', children: '.gitignore created' });
            } else {
              await show(Alert, { type: 'warning', children: 'Empty response from AI' });
            }
          } catch (err) {
            await show(Alert, { type: 'error', title: 'AI Error', children: err.message || err });
          }
        }
      }

      // Create initial commit if there are files
      try {
        execSync('git add .', { cwd: dir, stdio: 'ignore' });
        const hasStaged = execSync('git diff --staged', { cwd: dir, encoding: 'utf-8' }).trim().length > 0;
        if (hasStaged) {
          execSync('git commit -m "chore: initial commit"', { cwd: dir, stdio: 'ignore' });
          await show(Alert, { type: 'success', children: 'Created initial commit' });
        }
      } catch (err) {
        // ignore commit errors (e.g. if nothing to commit)
      }

      // GitHub repo creation prompt
      const wantGitHub = await prompt(ConfirmPrompt, { message: 'Create GitHub repository?' });

      if (wantGitHub) {
        try {
          execSync('gh --version', { stdio: 'ignore' });
          const isPublic = await prompt(ConfirmPrompt, { message: 'Public repository?' });
          const visibility = isPublic ? '--public' : '--private';
          
          await show(Alert, { type: 'info', children: `Creating ${isPublic ? 'public' : 'private'} GitHub repository...` });
          execSync(`gh repo create ${name === '.' ? path.basename(process.cwd()) : name} ${visibility} --source=. --remote=origin --push`, { 
            cwd: dir, 
            stdio: 'ignore' 
          });
          await show(Alert, { type: 'success', children: 'GitHub repository created and pushed' });
        } catch (err) {
          await show(Alert, { type: 'error', title: 'Error', children: 'Could not create GitHub repository. Ensure "gh" CLI is installed and authenticated.' });
        }
      }

      await show(Alert, { type: 'info', children: 'Run "gai start" to configure AI provider' });
    });
}
