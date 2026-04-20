import { Injectable, inject } from '@angular/core';
import { VenueService } from '../venue/venue.service';

@Injectable({ providedIn: 'root' })
export class MapsMcp {
  venueService = inject(VenueService);

  getBestRoute(args: { destinationType: string }) {
    const crowd = this.venueService.crowdData();
    const type = args.destinationType as 'gate' | 'food' | 'restroom' | 'exit';
    
    if (crowd[type]) {
      return {
        destination: type,
        recommendedPath: crowd[type].name,
        estimatedWaitTimeMinutes: crowd[type].waitTime,
        status: crowd[type].status
      };
    }
    return { error: 'Unknown destination type. Valid types are: gate, food, restroom, exit.' };
  }
}
