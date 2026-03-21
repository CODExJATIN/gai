import { GoogleGenAI } from '@google/genai';

export default class Gemini {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.5-flash-lite';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generate(prompt) {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });
    return response.text ? response.text.trim() : '';
  }
}
