import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { VenueService } from '../../core/services/venue/venue.service';
import { ActionCardComponent } from '../../shared/components/action-card/action-card.component';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { ChatComponent } from './components/chat/chat.component';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ActionCardComponent, HeatmapComponent, ChatComponent],
  template: `
    <!-- Full Screen Loading Overlay -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl transition-all duration-700 ease-in-out"
         [class.opacity-0]="!venueService.scanMessage()"
         [class.pointer-events-none]="!venueService.scanMessage()">
      <div class="flex flex-col items-center gap-6 p-8 rounded-3xl"
           [class.scale-95]="!venueService.scanMessage()"
           [class.scale-100]="venueService.scanMessage()"
           style="transition: transform 700ms ease-in-out">
        
        <div class="relative w-20 h-20 flex items-center justify-center">
          <div class="absolute inset-0 border-t-2 border-r-2 border-emerald-500/80 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
          <div class="absolute inset-2 border-b-2 border-l-2 border-blue-500/80 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
          <span class="material-icons text-white/90 text-2xl">stadium</span>
        </div>
        
        <div class="text-center">
          <h2 class="font-display text-2xl font-semibold mb-3 text-white/90">Entering {{ venueService.selectedVenue()?.name }}</h2>
          <div class="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span class="material-icons text-white/40 text-[14px] animate-pulse">radar</span>
            <span class="text-white/60 font-mono text-sm tracking-wide">{{ venueService.scanMessage() || 'Loading completed' }}</span>
            <span class="flex gap-0.5 ml-1 text-white/50 relative top-[-2px]">
              <span class="animate-bounce" style="animation-delay: 0ms">.</span>
              <span class="animate-bounce" style="animation-delay: 150ms">.</span>
              <span class="animate-bounce" style="animation-delay: 300ms">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed top-0 left-0 right-0 z-[100] bg-purple-600/90 text-white text-[9px] font-mono uppercase tracking-[0.2em] py-0.5 text-center backdrop-blur-sm border-b border-purple-400/30">
      Preview Mode • For Demonstration Purposes Only
    </div>

    <div class="min-h-screen p-2 pt-6 md:p-3 md:pt-8 lg:p-4 lg:pt-10 max-w-7xl mx-auto flex flex-col gap-3 md:gap-4" id="dashboard-container">
      
      <!-- Compact Header -->
      <header class="flex flex-wrap items-center justify-between gap-3 glass-panel px-4 py-2.5 animate-item">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <h1 class="font-display text-base md:text-lg font-bold text-white/90 leading-none">
              {{ venueService.selectedVenue()?.name }}
            </h1>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                {{ venueService.selectedVenue()?.state }}
              </span>
              <span class="w-1 h-1 rounded-full bg-white/20"></span>
              <span class="text-[10px] font-mono text-emerald-400 uppercase font-medium">
                Section {{ venueService.selectedSection() }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-4 ml-auto">
          <!-- Live Status Badge -->
          @if (venueService.scanMessage()) {
            <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
              <span class="material-icons text-blue-400 text-[12px] animate-spin">sync</span>
              <span class="text-[9px] font-mono uppercase text-blue-400 font-bold hidden sm:inline">{{ venueService.scanMessage() }}</span>
            </div>
          } @else if (venueService.currentEvent()) {
            <div class="flex items-center gap-1.5 px-2 py-1 rounded border transition-all"
                 [ngClass]="venueService.currentEvent()?.matchStatus === 'Live' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'">
              <span class="w-1.5 h-1.5 rounded-full bg-current" [class.animate-pulse]="venueService.currentEvent()?.matchStatus === 'Live'"></span>
              <span class="text-[9px] font-mono uppercase font-bold">{{ venueService.currentEvent()?.matchStatus }}</span>
            </div>
          }

          <!-- Health Score -->
          <div class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10 group cursor-help">
            <div class="text-[9px] font-mono uppercase tracking-wider text-white/40 leading-none mr-1">Crowd health</div>
            <div class="font-display text-lg font-bold leading-none" 
                 [ngClass]="venueService.crowdData().healthScore > 80 ? 'text-emerald-400' : 'text-orange-400'">
              {{ venueService.crowdData().healthScore }}<span class="text-[10px] text-white/30 ml-0.5">%</span>
            </div>
          </div>
          
          <button (click)="venueService.reset()" class="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span class="material-icons text-white/70 text-base">logout</span>
          </button>
        </div>
      </header>

      <!-- Horizontal Info Strip (New Row) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 animate-item">
        <!-- Weather (Simulated) -->
        <div class="glass-panel-sm px-3 py-2 flex items-center gap-3">
          <span class="material-icons text-blue-400 text-lg">wb_sunny</span>
          <div>
            <div class="text-[9px] font-mono text-white/40 uppercase">Weather</div>
            <div class="text-xs font-semibold">28°C • Clear</div>
          </div>
        </div>
        <!-- Trend -->
        <div class="glass-panel-sm px-3 py-2 flex items-center gap-3">
          <span class="material-icons text-emerald-400 text-lg">trending_up</span>
          <div>
            <div class="text-[9px] font-mono text-white/40 uppercase">Queue Trends</div>
            <div class="text-xs font-semibold text-emerald-400">Stable (-2 mins)</div>
          </div>
        </div>
        <!-- Density -->
        <div class="glass-panel-sm px-3 py-2 flex items-center gap-3">
          <span class="material-icons text-purple-400 text-lg">groups</span>
          <div>
            <div class="text-[9px] font-mono text-white/40 uppercase">Global Density</div>
            <div class="text-xs font-semibold">Moderate • 68%</div>
          </div>
        </div>
        <!-- Connectivity -->
        <div class="glass-panel-sm px-3 py-2 flex items-center gap-3">
          <span class="material-icons text-amber-400 text-lg">wifi</span>
          <div>
            <div class="text-[9px] font-mono text-white/40 uppercase">Network</div>
            <div class="text-xs font-semibold">High • 5G Optimized</div>
          </div>
        </div>
      </div>

      <!-- Integrated Scoreboard Row -->
      @if (venueService.currentEvent()) {
        <div class="glass-panel p-4 flex flex-col md:flex-row items-center gap-4 animate-item">
          <!-- Home Team -->
          <div class="flex items-center gap-4 flex-1 justify-center md:justify-end">
            <div class="text-right">
              <div class="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">HOME</div>
              <div class="font-display text-lg font-bold">{{ venueService.currentEvent()?.teamA?.name }}</div>
            </div>
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-600/40 border border-white/10 flex items-center justify-center font-display font-black text-xl text-white/90 italic">
              {{ venueService.currentEvent()?.teamA?.short }}
            </div>
          </div>

          <!-- Score Center -->
          <div class="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-8 py-2 relative overflow-hidden min-w-[180px]">
            <div class="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
            <div class="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em] mb-1">SCOREBOARD</div>
            <div class="flex items-center gap-6">
              <span class="font-display text-4xl font-black text-white leading-none tabular-nums">{{ venueService.currentEvent()?.teamA?.score || '0' }}</span>
              <span class="text-white/20 font-light text-2xl">-</span>
              <span class="font-display text-4xl font-black text-white leading-none tabular-nums">{{ venueService.currentEvent()?.teamB?.score || '0' }}</span>
            </div>
            <div class="mt-2 flex flex-col items-center gap-1">
              <div class="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 animate-pulse" style="width: 65%"></div>
              </div>
              <div class="text-[9px] font-mono text-white/40 uppercase">Overs: 14.2/20 • Ends {{ venueService.currentEvent()?.endTime | date:'shortTime' }}</div>
            </div>
          </div>

          <!-- Away Team -->
          <div class="flex items-center gap-4 flex-1 justify-center md:justify-start">
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-600/20 to-red-600/40 border border-white/10 flex items-center justify-center font-display font-black text-xl text-white/90 italic">
              {{ venueService.currentEvent()?.teamB?.short }}
            </div>
            <div class="text-left">
              <div class="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">AWAY</div>
              <div class="font-display text-lg font-bold">{{ venueService.currentEvent()?.teamB?.name }}</div>
            </div>
          </div>
        </div>
      }

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        <!-- Center-Left: Simulation & Heatmap -->
        <div class="lg:col-span-8 flex flex-col gap-4">
          
          <!-- Alert Banner (Compact) -->
          @if (venueService.crowdData().congestionAlert) {
            <div class="bg-orange-500/10 border border-orange-500/30 rounded px-3 py-2 flex items-center gap-3 animate-item">
              <span class="material-icons text-orange-400 text-lg">campaign</span>
              <div class="flex-1">
                <p class="text-orange-400/90 text-[11px] font-medium leading-tight">
                  <span class="font-bold uppercase mr-1">Alert:</span>
                  {{ venueService.crowdData().congestionAlert }}
                </p>
              </div>
            </div>
          }

          <!-- Utility Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 animate-item">
            <app-action-card 
              title="Best Entrance" icon="login"
              [value]="venueService.crowdData().gate.name"
              [waitTime]="venueService.crowdData().gate.waitTime"
              [status]="venueService.crowdData().gate.status">
            </app-action-card>
            
            <app-action-card 
              title="Concessions" icon="restaurant"
              [value]="venueService.crowdData().food.name"
              [waitTime]="venueService.crowdData().food.waitTime"
              [status]="venueService.crowdData().food.status">
            </app-action-card>
            
            <app-action-card 
              title="Restrooms" icon="wc"
              [value]="venueService.crowdData().restroom.name"
              [waitTime]="venueService.crowdData().restroom.waitTime"
              [status]="venueService.crowdData().restroom.status">
            </app-action-card>
            
            <app-action-card 
              title="Direct Exit" icon="directions_run"
              [value]="venueService.crowdData().exit.name"
              [waitTime]="venueService.crowdData().exit.waitTime"
              [status]="venueService.crowdData().exit.status">
            </app-action-card>
          </div>

          <!-- Heatmap Container -->
          <div class="flex-1 min-h-[350px] animate-item relative glass-panel overflow-hidden">
            <app-heatmap></app-heatmap>
            <!-- Map Overlay UI for density -->
            <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded border border-white/5 flex items-center gap-3">
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span><span class="text-[8px] font-mono text-white/50 uppercase">Optimal</span></div>
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.5)]"></span><span class="text-[8px] font-mono text-white/50 uppercase">Busy</span></div>
              <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></span><span class="text-[8px] font-mono text-white/50 uppercase">Crowded</span></div>
            </div>
          </div>
          
        </div>
        
        <!-- Right Column: Assistant (Sticky-ish) -->
        <div class="lg:col-span-4 flex flex-col animate-item">
          <div class="glass-panel flex-1 overflow-hidden flex flex-col h-[400px] lg:h-full">
            <app-chat></app-chat>
          </div>
        </div>
        
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  venueService = inject(VenueService);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const items = Array.from(document.querySelectorAll('.animate-item'));
        animate(items, 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { transform: ['translateY(20px)', 'translateY(0px)'], opacity: [0, 1] } as any, 
          { delay: stagger(0.1), duration: 0.6, ease: 'easeOut' }
        );
      }, 50);
    }
  }
}
