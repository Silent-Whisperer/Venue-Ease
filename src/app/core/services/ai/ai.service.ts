import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../../environments/environment';

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
    // Initialize the Gemini SDK using the environment-based API key
    if (environment.geminiApiKey) {
      this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
      this.model = this.ai.models.get({ model: 'gemini-1.5-flash' });
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!environment.geminiApiKey) {
      this.messages.update(msgs => [...msgs, 
        { role: 'user', text },
        { role: 'model', text: 'AI configuration missing. Please add your Gemini API key to environment.ts.' }
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
