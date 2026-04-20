import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel-sm p-3 flex flex-col h-full relative overflow-hidden group cursor-pointer hover:bg-white/[0.05] transition-colors border-l-2"
         [ngClass]="{
           'border-emerald-500/50': status === 'optimal',
           'border-orange-500/50': status === 'busy',
           'border-red-500/50': status === 'crowded'
         }">
           
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-1.5 text-white/50">
          <span class="material-icons text-base">{{ icon }}</span>
          <span class="font-mono text-[10px] uppercase tracking-wider">{{ title }}</span>
        </div>
        <div class="w-1.5 h-1.5 rounded-full"
             [ngClass]="{
               'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]': status === 'optimal',
               'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]': status === 'busy',
               'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]': status === 'crowded'
             }"></div>
      </div>
      
      <div class="mt-auto space-y-1">
        <div class="font-display text-sm font-semibold text-white/90 truncate leading-tight">{{ value }}</div>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-1 text-[11px] text-white/60">
            <span class="material-icons text-[12px] text-white/30">schedule</span>
            {{ waitTime }}m
          </div>
          <div class="text-[10px] font-mono text-white/30 uppercase tracking-tighter">
            {{ status }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActionCardComponent {
  @Input() title = '';
  @Input() icon = '';
  @Input() value = '';
  @Input() waitTime = 0;
  @Input() status: 'optimal' | 'busy' | 'crowded' = 'optimal';
}
