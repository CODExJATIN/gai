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
    return {};
  }
}

export function setConfig(key, value) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const config = getConfig();
  config[key] = value;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}
