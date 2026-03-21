import { getAI } from '../ai/index.js';
import { getConfig } from '../utils/config.js';

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
        console.log('provide input or pipe data');
        process.exit(1);
      }

      const prompt = `Explain the following error in simple terms and suggest a fix:

${input}`;

      const config = getConfig();
      const ai = getAI(config);

      let response;
      try {
        response = await ai.generate(prompt);
      } catch (err) {
        console.log('ai error: ' + (err.message || err));
        process.exit(1);
      }

      if (!response) {
        console.log('empty response from ai');
        process.exit(1);
      }

      console.log(response);
    });
}
