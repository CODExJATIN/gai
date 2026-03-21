import readline from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getAI } from '../ai/index.js';
import { getConfig } from '../utils/config.js';

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

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
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

      let name = await ask(rl, 'repo name (leave empty for current): ');
      if (!name) name = '.';

      const dir = path.resolve(name);
      const isCurrent = dir === process.cwd();

      if (!isCurrent && fs.existsSync(dir)) {
        console.log('directory already exists: ' + name);
        rl.close();
        process.exit(1);
      }

      if (!isCurrent) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(path.join(dir, '.git'))) {
        execSync('git init', { cwd: dir, stdio: 'inherit' });
        console.log('repo initialized: ' + (isCurrent ? 'current directory' : name));
      } else {
        console.log('git repo already exists in ' + (isCurrent ? 'current directory' : name));
      }

      // .gitignore prompt
      const gitignorePath = path.join(dir, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        const wantIgnore = (await ask(rl, 'create .gitignore? (y/n) ')).toLowerCase();

        if (wantIgnore === 'y') {
          const config = getConfig();
          if (!config.provider) {
            console.log('no ai provider configured\nrun "gai start" first');
            rl.close();
            process.exit(1);
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
            console.log('analyzing project...');
            let content = await ai.generate(prompt);
            if (content) {
              // strip markdown fencing if AI included it
              content = content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '').trim();
              fs.writeFileSync(gitignorePath, content + '\n');
              console.log('.gitignore created');
            } else {
              console.log('empty response from ai');
            }
          } catch (err) {
            console.log('ai error: ' + (err.message || err));
          }
        }
      }

      // Create initial commit if there are files
      try {
        execSync('git add .', { cwd: dir, stdio: 'ignore' });
        const hasStaged = execSync('git diff --staged', { cwd: dir, encoding: 'utf-8' }).trim().length > 0;
        if (hasStaged) {
          execSync('git commit -m "chore: initial commit"', { cwd: dir, stdio: 'ignore' });
          console.log('created initial commit');
        }
      } catch (err) {
        // ignore commit errors (e.g. if nothing to commit)
      }

      rl.close();

      // GitHub repo creation prompt
      const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
      const wantGitHub = (await ask(rl2, 'create GitHub repository? (y/n) ')).toLowerCase();

      if (wantGitHub === 'y') {
        try {
          execSync('gh --version', { stdio: 'ignore' });
          const isPublic = (await ask(rl2, 'public repository? (y/n) ')).toLowerCase() === 'y';
          const visibility = isPublic ? '--public' : '--private';
          
          console.log(`creating ${isPublic ? 'public' : 'private'} GitHub repository...`);
          execSync(`gh repo create ${name === '.' ? path.basename(process.cwd()) : name} ${visibility} --source=. --remote=origin --push`, { 
            cwd: dir, 
            stdio: 'inherit' 
          });
          console.log('GitHub repository created and pushed');
        } catch (err) {
          console.log('could not create GitHub repository. ensure "gh" CLI is installed and authenticated.');
        }
      }

      rl2.close();
      console.log('run "gai start" to configure ai provider');
    });
}
