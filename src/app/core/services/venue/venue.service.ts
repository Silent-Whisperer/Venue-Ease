import { Injectable, signal, inject } from '@angular/core';
import { SportsEventService } from '../sports/sports-event.service';
import { Venue, CrowdData, VenueEvent } from '../../models/venue.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  selectedVenue = signal<Venue|null>(null);
  selectedSection = signal<string>('');
  scanMessage = signal<string|null>(null);
  
  currentEvent = signal<VenueEvent|null>(null);
  
  crowdData = signal<CrowdData>({
    gate: { name: 'Main Gate', waitTime: 0, status: 'optimal' },
    food: { name: 'All Concessions', waitTime: 0, status: 'optimal' },
    restroom: { name: 'All Restrooms', waitTime: 0, status: 'optimal' },
    exit: { name: 'All Exits', waitTime: 0, status: 'optimal' },
    healthScore: 100,
    congestionAlert: null
  });

  private simulationIntervalId: ReturnType<typeof setInterval>;
  private apiRefreshIntervalId: ReturnType<typeof setInterval>;
  private sportsEventService = inject(SportsEventService);

  constructor() {
    this.updateSimulation();
    
    // Check internal fast crowd sim loop every 5s
    this.simulationIntervalId = setInterval(() => this.updateSimulation(), 5000);
    
    // Refresh strictly real-time events from API every 5 minutes
    this.apiRefreshIntervalId = setInterval(() => {
      this.refreshLiveEventData();
    }, 5 * 60 * 1000);
  }

  private async refreshLiveEventData() {
    const venue = this.selectedVenue();
    if (!venue) return;
    
    // Silent refresh in the background without causing the loading spinner
    const liveEvent = await this.sportsEventService.fetchTodayEvent(venue.name, venue.state);
    this.currentEvent.set(liveEvent);
    this.updateSimulation();
  }

  private updateSimulation() {
    const venue = this.selectedVenue();
    if (!venue) return;

    const event = this.currentEvent();

    if (!event || this.scanMessage() !== null) {
      this.crowdData.set({
        gate: { name: 'Main Gate', waitTime: this.jitter(1), status: 'optimal' },
        food: { name: 'All Concessions', waitTime: this.jitter(1), status: 'optimal' },
        restroom: { name: 'All Restrooms', waitTime: this.jitter(0), status: 'optimal' },
        exit: { name: 'All Exits', waitTime: 0, status: 'optimal' },
        healthScore: 99,
        congestionAlert: null
      });
      return;
    }

    const now = new Date().getTime();
    const start = event.startTime.getTime();
    const breakT = event.breakTime.getTime();
    const end = event.endTime.getTime();

    // Determine crowd phases based on exact timings
    let mStatus = event.matchStatus || 'Upcoming';
    if (!event.matchStatus || event.matchStatus === 'Upcoming' || event.matchStatus === 'Match Finished') {
       if (now < start) mStatus = 'Upcoming';
       else if (now >= start && now < end) mStatus = 'Live';
       else mStatus = 'Final';
    }

    const updatedEvent = { 
      ...event, 
      matchStatus: mStatus
    };
    this.currentEvent.set(updatedEvent);

    let gateW = 0, foodW = 0, restW = 0, exitW = 0;
    let health = 100;
    let alert = null;

    if (now < start - 120 * 60000) {
      gateW = 2; foodW = 1; restW = 1; exitW = 0; health = 98;
    } else if (now >= start - 120 * 60000 && now < start) {
      const progress = (now - (start - 120 * 60000)) / (120 * 60000);
      gateW = 5 + progress * 35;
      foodW = 2 + progress * 10;
      restW = 1 + progress * 5;
      exitW = 0;
      health = 100 - progress * 20;
      if (gateW > 25) alert = 'Heavy traffic at main gates. Consider alternate entries.';
    } else if (now >= start && now < breakT - 5 * 60000) {
      gateW = 5; foodW = 10; restW = 5; exitW = 0; health = 90;
    } else if (now >= breakT - 5 * 60000 && now < breakT + 20 * 60000) {
      const progress = (now - (breakT - 5 * 60000)) / (25 * 60000);
      gateW = 2; 
      foodW = 15 + Math.sin(progress * Math.PI) * 30;
      restW = 5 + Math.sin(progress * Math.PI) * 20;
      exitW = 2;
      health = 90 - Math.sin(progress * Math.PI) * 30;
      if (foodW > 30) alert = 'Concessions are extremely crowded during the break.';
    } else if (now >= breakT + 20 * 60000 && now < end) {
      gateW = 2; foodW = 8; restW = 4; exitW = 5; health = 92;
    } else if (now >= end && now < end + 60 * 60000) {
      const progress = (now - end) / (60 * 60000);
      gateW = 0; foodW = 2; restW = 10; 
      exitW = 10 + Math.sin(progress * Math.PI) * 40;
      health = 90 - Math.sin(progress * Math.PI) * 35;
      if (exitW > 30) alert = 'High exit congestion. Use recommended safe routes.';
    } else {
      gateW = 0; foodW = 0; restW = 1; exitW = 2; health = 95;
    }

    this.crowdData.set({
      gate: { name: 'Gate 4', waitTime: this.jitter(gateW), status: this.getStatus(gateW) },
      food: { name: 'Level 2 Concourse', waitTime: this.jitter(foodW), status: this.getStatus(foodW) },
      restroom: { name: 'Block B Restrooms', waitTime: this.jitter(restW), status: this.getStatus(restW) },
      exit: { name: 'East Exit', waitTime: this.jitter(exitW), status: this.getStatus(exitW) },
      healthScore: Math.max(0, Math.min(100, Math.round(health))),
      congestionAlert: alert
    });
  }

  private jitter(base: number): number {
    if (base === 0) return 0;
    const variation = base * 0.1;
    const val = base + (Math.random() * variation * 2 - variation);
    return Math.max(0, Math.round(val));
  }

  private getStatus(waitTime: number): 'optimal' | 'busy' | 'crowded' {
    if (waitTime < 10) return 'optimal';
    if (waitTime < 25) return 'busy';
    return 'crowded';
  }

  async setVenue(venueName: string, state: string, section: string) {
    const venue: Venue = { id: 'manual', name: venueName, state };
    this.selectedVenue.set(venue);
    this.selectedSection.set(section);
    
    this.currentEvent.set(null);
    this.scanMessage.set('Analyzing venue activity...');
    
    const messages = ['Analyzing venue activity...', 'Fetching live event data...', 'Predicting crowd density...'];
    let msgIndex = 0;
    const progressInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      this.scanMessage.set(messages[msgIndex]);
    }, 1500);

    let liveEvent = await this.sportsEventService.fetchTodayEvent(venue.name, venue.state);
    
    // Randomization for demo purposes: if no event found or 30% chance to randomize for variety
    if (!liveEvent || Math.random() < 0.3) {
      console.log('[Demo] Randomizing event status for variety');
      const randomState = Math.random();
      if (randomState < 0.33) {
        // Live Event
        const now = new Date();
        liveEvent = {
          name: 'IPL Match: T20 Series',
          teamA: { name: 'Warriors', short: 'WAR', score: '142/4' },
          teamB: { name: 'Titans', short: 'TTN', score: '12/0' },
          matchStatus: 'Live',
          startTime: new Date(now.getTime() - 90 * 60000),
          breakTime: new Date(now.getTime() + 10 * 60000),
          endTime: new Date(now.getTime() + 120 * 60000)
        };
      } else if (randomState < 0.66) {
        // Upcoming Event
        const now = new Date();
        liveEvent = {
          name: 'Stadium Mega Event',
          teamA: { name: 'Team Alpha', short: 'ALP', score: '' },
          teamB: { name: 'Team Beta', short: 'BET', score: '' },
          matchStatus: 'Upcoming',
          startTime: new Date(now.getTime() + 45 * 60000),
          breakTime: new Date(now.getTime() + 135 * 60000),
          endTime: new Date(now.getTime() + 240 * 60000)
        };
      } else {
        // No Event
        liveEvent = null;
      }
    }
    
    clearInterval(progressInterval);
    this.currentEvent.set(liveEvent);
    this.scanMessage.set(null);
    this.updateSimulation();
  }

  reset() {
    this.selectedVenue.set(null);
    this.selectedSection.set('');
  }
}
