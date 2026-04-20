import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueService } from '../../../../core/services/venue/venue.service';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @keyframes pulse-optimal {
      0%, 100% { fill: rgba(16, 185, 129, 0.05); filter: drop-shadow(0 0 2px rgba(16,185,129,0.1)); }
      50% { fill: rgba(16, 185, 129, 0.25); filter: drop-shadow(0 0 8px rgba(16,185,129,0.4)); }
    }
    @keyframes pulse-busy {
      0%, 100% { fill: rgba(249, 115, 22, 0.15); filter: drop-shadow(0 0 4px rgba(249,115,22,0.2)); }
      50% { fill: rgba(249, 115, 22, 0.45); filter: drop-shadow(0 0 12px rgba(249,115,22,0.6)); }
    }
    @keyframes pulse-crowded {
      0%, 100% { fill: rgba(239, 68, 68, 0.3); filter: drop-shadow(0 0 6px rgba(239,68,68,0.4)); }
      50% { fill: rgba(239, 68, 68, 0.7); filter: drop-shadow(0 0 20px rgba(239,68,68,0.9)); }
    }
    .zone-optimal {
      animation: pulse-optimal 4s ease-in-out infinite;
    }
    .zone-busy {
      animation: pulse-busy 2s ease-in-out infinite;
    }
    .zone-crowded {
      animation: pulse-crowded 1s ease-in-out infinite;
    }
  `],
  template: `
    <div class="glass-panel-sm p-6 h-full flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-mono text-xs uppercase tracking-wider text-white/60">Live Venue Heatmap</h3>
        <div class="flex items-center gap-2">
          @if (venueService.currentEvent()) {
            @if (venueService.currentEvent()?.matchStatus === 'Upcoming') {
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span class="text-xs text-amber-400/80 font-mono">UPCOMING</span>
            } @else if (venueService.currentEvent()?.matchStatus === 'Final' || venueService.currentEvent()?.matchStatus === 'Match Finished') {
              <span class="w-2 h-2 rounded-full bg-slate-500"></span>
              <span class="text-xs text-slate-400/80 font-mono">FINISHED</span>
            } @else {
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span class="text-xs text-red-400/80 font-mono">LIVE</span>
            }
          } @else {
            <span class="w-2 h-2 rounded-full bg-white/30"></span>
            <span class="text-xs text-white/40 font-mono">STANDBY</span>
          }
        </div>
      </div>
      
      <div class="flex-1 relative bg-black/20 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-4">
        <!-- Abstract Stadium SVG -->
        <svg viewBox="0 0 400 300" class="w-full h-full max-w-md drop-shadow-2xl">
          <!-- Field -->
          <rect x="100" y="75" width="200" height="150" rx="10" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
          <line x1="200" y1="75" x2="200" y2="225" stroke="#333" stroke-width="2"/>
          <circle cx="200" cy="150" r="25" fill="none" stroke="#333" stroke-width="2"/>
          
          <!-- Stands / Zones -->
          <!-- North -->
          <path d="M 80 50 Q 200 10 320 50 L 300 70 Q 200 40 100 70 Z" 
                [ngClass]="getZoneClass('north')"/>
          <text x="200" y="40" fill="white" font-size="9" font-family="monospace" text-anchor="middle" opacity="0.4">GATES</text>
          
          <!-- South -->
          <path d="M 80 250 Q 200 290 320 250 L 300 230 Q 200 260 100 230 Z" 
                [ngClass]="getZoneClass('south')"/>
          <text x="200" y="270" fill="white" font-size="9" font-family="monospace" text-anchor="middle" opacity="0.4">FOOD & BEV</text>
          
          <!-- West -->
          <path d="M 50 80 Q 10 150 50 220 L 70 200 Q 40 150 70 100 Z" 
                [ngClass]="getZoneClass('west')"/>
          <text x="40" y="150" fill="white" font-size="9" font-family="monospace" text-anchor="middle" opacity="0.4" transform="rotate(-90, 40, 150)">RESTROOMS</text>
          
          <!-- East -->
          <path d="M 350 80 Q 390 150 350 220 L 330 200 Q 360 150 330 100 Z" 
                [ngClass]="getZoneClass('east')"/>
          <text x="360" y="150" fill="white" font-size="9" font-family="monospace" text-anchor="middle" opacity="0.4" transform="rotate(90, 360, 150)">EXITS</text>
                
          <!-- User Location Indicator (Outside Stadium) -->
          <g transform="translate(30, 30)">
            <circle cx="0" cy="0" r="4" fill="#00E5FF"/>
            <circle cx="0" cy="0" r="10" fill="none" stroke="#00E5FF" stroke-width="1" class="animate-ping" style="animation-duration: 2s;"/>
            <text x="8" y="4" fill="#00E5FF" font-size="8" font-family="monospace" font-weight="bold">YOU ({{venueService.selectedSection()}})</text>
          </g>
        </svg>
      </div>
    </div>
  `
})
export class HeatmapComponent {
  venueService = inject(VenueService);
  
  getZoneClass(zone: 'north' | 'south' | 'west' | 'east'): string {
    const crowd = this.venueService.crowdData();
    let status = 'optimal';
    
    switch (zone) {
      case 'north': status = crowd.gate.status; break;
      case 'south': status = crowd.food.status; break;
      case 'west': status = crowd.restroom.status; break;
      case 'east': status = crowd.exit.status; break;
    }
    
    return `zone-${status}`;
  }
}
