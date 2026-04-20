import { Injectable, inject } from '@angular/core';
import { VenueService } from '../venue/venue.service';

@Injectable({ providedIn: 'root' })
export class CrowdMcp {
  venueService = inject(VenueService);

  getLiveCongestion() {
    const crowd = this.venueService.crowdData();
    const section = this.venueService.selectedSection();
    
    return { 
      currentSection: section,
      overallHealthScore: crowd.healthScore,
      zones: {
        gate: crowd.gate.status,
        food: crowd.food.status,
        restroom: crowd.restroom.status,
        exit: crowd.exit.status
      }
    };
  }
}
