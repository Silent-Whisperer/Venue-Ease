import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../../core/services/ai/ai.service';
import { VenueService } from '../../../../core/services/venue/venue.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel-sm flex flex-col h-full overflow-hidden">
      <div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span class="material-icons text-white text-sm">auto_awesome</span>
          </div>
          <div>
            <h3 class="font-display text-sm font-medium">VenueFlow Assistant</h3>
            <p class="text-[10px] font-mono text-emerald-400">Online</p>
          </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-10" #scrollContainer>
        @for (msg of aiService.messages(); track $index) {
          <div class="flex" [ngClass]="msg.role === 'user' ? 'justify-end' : 'justify-start'">
            <div class="max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm transition-all duration-300"
                 [ngClass]="msg.role === 'user' ? 'bg-white text-black rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm backdrop-blur-md border border-white/5'">
              {{ msg.text }}
            </div>
          </div>
        }
        @if (aiService.isTyping()) {
          <div class="flex justify-start">
            <div class="bg-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 backdrop-blur-md border border-white/5">
              <div class="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        }
      </div>
      
      <div class="p-3 border-t border-white/10 bg-black/20">
        <form (ngSubmit)="sendMessage()" class="relative">
          <input type="text" [(ngModel)]="inputText" name="message" 
                 placeholder="Ask about food, exits, or wait times..." 
                 class="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 placeholder:text-white/30">
          <button type="submit" [disabled]="!inputText.trim() || aiService.isTyping()"
                  class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="material-icons text-sm">arrow_upward</span>
          </button>
        </form>
      </div>
    </div>
  `
})
export class ChatComponent implements AfterViewChecked {
  aiService = inject(AiService);
  venueService = inject(VenueService);
  inputText = '';
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch { 
      // ignore 
    }
  }

  sendMessage() {
    if (!this.inputText.trim() || this.aiService.isTyping()) return;
    
    const text = this.inputText;
    this.inputText = '';
    
    this.aiService.sendMessage(text);
  }
}
