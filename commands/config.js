import { getConfig, setConfig } from '../utils/config.js';

export default function configCommand(program) {
  const configCmd = program
    .command('config')
    .description('manage ai settings (provider, keys, models)');

  configCmd
    .command('set <key> <value>')
    .description('set a config value (e.g., config set model llama3)')
    .action((key, value) => {
      const config = getConfig();
      const provider = config.provider || 'gemini';
      
      // If key doesn't have a dot and is provider-specific, prefix it
      let fullKey = key;
      if (!key.includes('.')) {
        if (['model', 'apiKey', 'endpoint'].includes(key)) {
          fullKey = `${provider}.${key}`;
        }
      }

      setConfig(fullKey, value);
      console.log(`config saved: ${fullKey} = ${value}`);
    });

  configCmd
    .command('get [key]')
    .description('get a config value or view all if no key provided')
    .action((key) => {
      const config = getConfig();
      if (key) {
        // Handle namespaced keys in get
        const parts = key.split('.');
        let val = config;
        for (const p of parts) { val = val?.[p]; }
        console.log(val || '');
      } else {
        console.log(JSON.stringify(config, null, 2));
      }
    });

  configCmd
    .command('switch <provider>')
    .description('switch the active ai provider (e.g., config switch gemini)')
    .action((provider) => {
      const p = provider.toLowerCase();
      if (p !== 'gemini' && p !== 'ollama') {
        console.log('unknown provider. supported: gemini, ollama');
        process.exit(1);
      }
      setConfig('provider', p);
      console.log(`switched active provider to: ${p}`);
      
      const config = getConfig();
      if (p === 'gemini' && (!config.gemini || !config.gemini.apiKey)) {
        console.log('\nnote: gemini requires an api key. run: gai config set apiKey <your-key>');
      }
    });
}
