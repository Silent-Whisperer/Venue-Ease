import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

// Declared as a global via angular.json "define" to stay GitHub-friendly
declare const GEMINI_API_KEY: string;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: any;
  private model: any;
  
  messages = signal<ChatMessage[]>([
    { role: 'model', text: 'Welcome to VenueFlow AI. I am your personal stadium concierge. How can I assist you today?' }
  ]);
  
  isTyping = signal<boolean>(false);

  constructor() {
    // Initialize using the build-time global constant
    try {
      if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        this.model = this.ai.models.get({ model: 'gemini-1.5-flash' });
      }
    } catch (e) {
      console.warn('AI initialization skipped: GEMINI_API_KEY not found.');
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.model) {
      this.messages.update(msgs => [...msgs, 
        { role: 'user', text },
        { role: 'model', text: 'AI configuration missing. Please ensure the API key is set in angular.json.' }
      ]);
      return;
    }

    this.messages.update(msgs => [...msgs, { role: 'user', text }]);
    this.isTyping.set(true);

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: {
            parts: [{
              text: 'You are VenueFlow AI, a premium stadium concierge. Keep responses helpful, concise (under 2 sentences), and professional.'
            }]
          }
        }
      });

      const responseText = result.text;
      
      if (responseText) {
        this.messages.update(msgs => [...msgs, { role: 'model', text: responseText }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      this.messages.update(msgs => [...msgs, { 
        role: 'model', 
        text: 'I am sorry, I encountered a brief connection issue. Please try saying hi again.' 
      }]);
    } finally {
      this.isTyping.set(false);
    }
  }
}
