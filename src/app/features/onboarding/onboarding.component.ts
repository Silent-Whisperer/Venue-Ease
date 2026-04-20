import { Component, inject, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../../core/services/venue/venue.service';
import { animate } from 'motion';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" id="onboarding-container">
      <!-- Atmospheric background -->
      <div class="absolute inset-0 z-0">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div class="glass-panel w-full max-w-md p-8 relative z-10 flex flex-col gap-8" id="onboarding-card">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <span class="material-icons text-3xl text-white">stadium</span>
          </div>
          <h1 class="font-display text-3xl font-semibold tracking-tight">VenueFlow <span class="text-white/50">AI</span></h1>
          <p class="text-white/60 text-sm">Your intelligent stadium concierge</p>
        </div>

        <div class="space-y-5">
          <div class="space-y-2">
            <label for="state-input" class="text-xs font-mono uppercase tracking-wider text-white/50 ml-1">State / Region</label>
            <div class="relative">
              <select id="state-input" [(ngModel)]="state" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/10 transition-all appearance-none cursor-pointer hover:bg-black/50">
                <option value="" disabled>Select State</option>
                <option *ngFor="let s of sortedStates" [value]="s">{{s}}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                <span class="material-icons text-xl">expand_more</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label for="venue-name" class="text-xs font-mono uppercase tracking-wider text-white/50 ml-1">Stadium/Venue Name</label>
            <input id="venue-name" type="text" [(ngModel)]="venueName" placeholder="e.g. Narendra Modi Stadium" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 hover:bg-black/50">
          </div>

          <div class="space-y-2">
            <label for="section-input" class="text-xs font-mono uppercase tracking-wider text-white/50 ml-1">Section / Block</label>
            <input id="section-input" type="text" [(ngModel)]="section" placeholder="e.g. 104A" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 hover:bg-black/50">
          </div>
        </div>

        <button 
          (click)="enterVenue()" 
          [disabled]="!venueName || !state || !section"
          class="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
          <span>Initialize Dashboard</span>
          <span class="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  `
})
export class OnboardingComponent implements AfterViewInit {
  venueService = inject(VenueService);
  venueName = '';
  state = '';
  section = '';

  states = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 
    'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  get sortedStates() {
    return [...this.states].sort();
  }

  platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const card = document.getElementById('onboarding-card');
      if (card) {
        animate(card, 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { transform: ['translateY(40px)', 'translateY(0px)'], opacity: [0, 1] } as any, 
          { duration: 0.8, ease: 'easeOut' }
        );
      }
    }
  }

  enterVenue() {
    if (this.venueName && this.state && this.section) {
      this.venueService.setVenue(this.venueName, this.state, this.section);
    }
  }
}
