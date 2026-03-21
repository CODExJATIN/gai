import axios from 'axios';

export default class Ollama {
  constructor(config) {
    this.model = config.model || 'llama3';
    this.endpoint = config.endpoint || 'http://localhost:11434';
  }

  async generate(prompt) {
    const res = await axios.post(`${this.endpoint}/api/generate`, {
      model: this.model,
      prompt,
      stream: false
    });
    const text = res.data?.response;
    return text ? text.trim() : '';
  }
}
