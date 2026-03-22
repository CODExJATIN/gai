import { getAI } from '../ai/index.js';
import { getConfig } from '../utils/config.js';
import React from 'react';
import { render } from 'ink';
import { show } from '../ui/prompt.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import Alert from '../ui/Alert.jsx';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

export default function explainCommand(program) {
  program
    .command('explain [input...]')
    .description('explain an error or log via AI')
    .action(async (inputParts) => {
      let input = inputParts.length ? inputParts.join(' ') : '';

      if (!input && !process.stdin.isTTY) {
        input = await readStdin();
      }

      input = input.trim();

      if (!input) {
        await show(Alert, { type: 'error', title: 'Error', children: 'Provide input or pipe data' });
        setTimeout(() => process.exit(1), 100);
        return;
      }

      const prompt = `Explain the following error in simple terms and suggest a fix:

${input}`;

      const config = getConfig();
      const ai = getAI(config);

      let response;
      try {
        const spinner = render(React.createElement(LoadingSpinner, { message: 'Analyzing error...' }));
        response = await ai.generate(prompt);
        spinner.unmount();
      } catch (err) {
        await show(Alert, { type: 'error', title: 'AI Error', children: err.message || err });
        setTimeout(() => process.exit(1), 100);
        return;
      }

      if (!response) {
        await show(Alert, { type: 'warning', children: 'Empty response from AI' });
        setTimeout(() => process.exit(1), 100);
        return;
      }

      await show(Alert, { type: 'success', title: 'Explanation', children: response });
    });
}
