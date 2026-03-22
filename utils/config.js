import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.gai');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      provider: 'gemini',
      gemini: {
        model: 'gemini-2.5-flash'
      },
      ollama: {
        model: 'llama3',
        endpoint: 'http://localhost:11434'
      }
    };
  }
}

export function setConfig(keyPath, value) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const config = getConfig();

  const parts = keyPath.split('.');
  let current = config;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}
