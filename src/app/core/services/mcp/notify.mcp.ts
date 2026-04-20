import { Injectable, inject } from '@angular/core';
import { VenueService } from '../venue/venue.service';

@Injectable({ providedIn: 'root' })
export class NotifyMcp {
  venueService = inject(VenueService);

  getAlerts() {
    const alert = this.venueService.crowdData().congestionAlert;
    
    return { 
      hasActiveAlerts: !!alert,
      activeAlert: alert || 'No current congestion alerts.'
    };
  }
}
