import axios from 'axios';

export default class Gemini {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.0-flash';
  }

  async generate(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : '';
  }
}
