import { Injectable, inject } from '@angular/core';
import { VenueService } from '../venue/venue.service';

@Injectable({ providedIn: 'root' })
export class EventMcp {
  venueService = inject(VenueService);

  checkEvent() {
    const event = this.venueService.currentEvent();
    const venue = this.venueService.selectedVenue();
    
    if (!event) {
      return { 
        hasEvent: false, 
        stadium: venue?.name,
        message: 'No active event today.'
      };
    }
    
    return { 
      hasEvent: true, 
      stadium: venue?.name,
      eventName: event.name,
      homeTeam: event.teamA.name,
      awayTeam: event.teamB.name,
      matchStatus: event.matchStatus,
      homeScore: event.teamA.score,
      awayScore: event.teamB.score,
      startTime: event.startTime.toISOString(), 
      breakTime: event.breakTime.toISOString(), 
      endTime: event.endTime.toISOString() 
    };
  }
}
