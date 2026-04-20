import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueService } from './core/services/venue/venue.service';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, OnboardingComponent, DashboardComponent],
  template: `
    <main class="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      @if (!venueService.selectedVenue()) {
        <app-onboarding></app-onboarding>
      } @else {
        <app-dashboard></app-dashboard>
      }
    </main>
  `,
})
export class App {
  venueService = inject(VenueService);
}

