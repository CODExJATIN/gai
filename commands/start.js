import { setConfig } from '../utils/config.js';
import React from 'react';
import { prompt, show } from '../ui/prompt.jsx';
import SelectPrompt from '../ui/SelectPrompt.jsx';
import TextPrompt from '../ui/TextPrompt.jsx';
import Alert from '../ui/Alert.jsx';
import { getBanner } from '../utils/banner.js';

export default function startCommand(program) {
  program
    .command('start')
    .description('configure ai provider and credentials')
    .action(async () => {
      console.log(getBanner());
      const providerItem = await prompt(SelectPrompt, {
        message: 'Select AI Provider',
        items: [
          { label: 'Gemini (Google)', value: 'gemini' },
          { label: 'Ollama (Local)', value: 'ollama' }
        ]
      });
      const provider = providerItem.value;

      if (provider === 'gemini') {
        const apiKey = await prompt(TextPrompt, {
          message: 'API Key:',
          isSecret: true
        });
        if (!apiKey) {
          await show(Alert, { type: 'error', title: 'Error', children: 'API key is required' });
          setTimeout(() => process.exit(1), 100);
          return;
        }
        const model = await prompt(TextPrompt, {
          message: 'Model (leave blank for gemini-2.5-flash):',
          defaultValue: 'gemini-2.5-flash'
        });
        setConfig('provider', provider);
        setConfig('gemini.apiKey', apiKey);
        setConfig('gemini.model', model);
      } else if (provider === 'ollama') {
        const model = await prompt(TextPrompt, {
          message: 'Model (leave blank for llama3):',
          defaultValue: 'llama3'
        });
        const endpoint = await prompt(TextPrompt, {
          message: 'Endpoint (leave blank for http://localhost:11434):',
          defaultValue: 'http://localhost:11434'
        });
        setConfig('provider', provider);
        setConfig('ollama.model', model);
        setConfig('ollama.endpoint', endpoint);
      } else {
        await show(Alert, { type: 'error', title: 'Error', children: 'Unknown provider' });
        setTimeout(() => process.exit(1), 100);
        return;
      }

      await show(Alert, { type: 'success', title: 'Success', children: 'Configuration explicitly saved' });
    });
}
