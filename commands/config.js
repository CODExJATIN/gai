import { getConfig, setConfig } from '../utils/config.js';
import React from 'react';
import { show } from '../ui/prompt.jsx';
import Alert from '../ui/Alert.jsx';

export default function configCommand(program) {
  const configCmd = program
    .command('config')
    .description('manage ai settings (provider, keys, models)');

  configCmd
    .command('set <key> <value>')
    .description('set a config value (e.g., config set model llama3)')
    .action(async (key, value) => {
      const config = getConfig();
      const provider = config.provider || 'gemini';
      
      // Normalize common keys
      const lowerKey = key.toLowerCase();
      let normalizedKey = key;
      if (lowerKey === 'apikey') normalizedKey = 'apiKey';
      if (lowerKey === 'model') normalizedKey = 'model';
      if (lowerKey === 'endpoint') normalizedKey = 'endpoint';

      // If key doesn't have a dot and is provider-specific, prefix it
      let fullKey = normalizedKey;
      if (!normalizedKey.includes('.')) {
        if (['model', 'apiKey', 'endpoint'].includes(normalizedKey)) {
          fullKey = `${provider}.${normalizedKey}`;
        }
      }

      setConfig(fullKey, value);
      await show(Alert, { type: 'success', children: `Config saved: ${fullKey} = ${value}` });
    });

  configCmd
    .command('get [key]')
    .description('get a config value or view all if no key provided')
    .action(async (key) => {
      const config = getConfig();
      if (key) {
        // Handle namespaced keys in get
        const parts = key.split('.');
        let val = config;
        for (const p of parts) { val = val?.[p]; }
        await show(Alert, { type: 'info', title: key, children: String(val || '') });
      } else {
        await show(Alert, { type: 'info', title: 'Configuration', children: JSON.stringify(config, null, 2) });
      }
    });

  configCmd
    .command('switch <provider>')
    .description('switch the active ai provider (e.g., config switch gemini)')
    .action(async (provider) => {
      const p = provider.toLowerCase();
      if (p !== 'gemini' && p !== 'ollama') {
        await show(Alert, { type: 'error', children: 'Unknown provider. Supported: gemini, ollama' });
        setTimeout(() => process.exit(1), 100);
        return;
      }
      setConfig('provider', p);
      await show(Alert, { type: 'success', children: `Switched active provider to: ${p}` });
      
      const config = getConfig();
      if (p === 'gemini' && (!config.gemini || !config.gemini.apiKey)) {
        await show(Alert, { type: 'warning', title: 'Note', children: 'Gemini requires an API key. Run: gai config set apiKey <your-key>' });
      }
    });
}
