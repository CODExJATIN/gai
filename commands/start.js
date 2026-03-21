import readline from 'readline';
import { setConfig } from '../utils/config.js';

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

export default function startCommand(program) {
  program
    .command('start')
    .description('configure ai provider and credentials')
    .action(async () => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

      const provider = (await ask(rl, 'provider (gemini/ollama): ')).toLowerCase() || 'gemini';

      if (provider === 'gemini') {
        const apiKey = await ask(rl, 'api key: ');
        if (!apiKey) {
          console.log('api key is required');
          rl.close();
          process.exit(1);
        }
        const model = (await ask(rl, 'model (gemini-2.0-flash): ')) || 'gemini-2.0-flash';
        setConfig('provider', provider);
        setConfig('gemini.apiKey', apiKey);
        setConfig('gemini.model', model);
      } else if (provider === 'ollama') {
        const model = (await ask(rl, 'model (llama3): ')) || 'llama3';
        const endpoint = (await ask(rl, 'endpoint (http://localhost:11434): ')) || 'http://localhost:11434';
        setConfig('provider', provider);
        setConfig('ollama.model', model);
        setConfig('ollama.endpoint', endpoint);
      } else {
        console.log('unknown provider: ' + provider);
        rl.close();
        process.exit(1);
      }

      rl.close();
      console.log('config saved');
    });
}
