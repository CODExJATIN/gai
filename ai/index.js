import Gemini from './gemini.js';
import Ollama from './ollama.js';

const providers = {
  gemini: Gemini,
  ollama: Ollama
};

export function getAI(config) {
  const name = config.provider || 'gemini';
  const Provider = providers[name];
  if (!Provider) {
    throw new Error(`unknown provider: ${name}`);
  }
  return new Provider(config);
}
