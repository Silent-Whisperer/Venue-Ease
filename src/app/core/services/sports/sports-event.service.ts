import { Injectable } from '@angular/core';
import { VenueEvent } from '../../models/venue.model';

@Injectable({ providedIn: 'root' })
export class SportsEventService {
  
  // Cache API response for 5 minutes
  private cache = new Map<string, { data: VenueEvent | null, timestamp: number }>();

  async fetchTodayEvent(venueName: string, stateName = ''): Promise<VenueEvent | null> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${venueName}-${stateName}-${today}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        console.log(`[Sports API] Returning cached API response for ${venueName}`);
        return cached.data;
      }
    }

    try {
      console.log(`[Sports API] Calling SerpApi for ${venueName}, ${stateName}`);
      
      const queryStr = `IPL match today at ${venueName} in ${stateName}`;
      const query = encodeURIComponent(queryStr);
      const apiKey = 'a4b0d98b7c8a022378e1114eae1859031dbad8be41191f3b888180816b108855';
      const serpApiUrl = `https://serpapi.com/search.json?q=${query}&api_key=${apiKey}`;
      const proxyUrl = `/api/sports-proxy?url=${encodeURIComponent(serpApiUrl)}`;
      
      const serpRes = await fetch(proxyUrl);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let eventMatch: any = null;

      if (serpRes.ok) {
        const serpData = await serpRes.json();
        
        // Try extracting from sports_results first
        if (serpData.sports_results?.game_spotlight) {
          const sport = serpData.sports_results;
          const teams = sport.game_spotlight.teams || [];
          eventMatch = {
            strEvent: sport.title || 'Live Match',
            strHomeTeam: teams[0]?.name || 'Home Team',
            strAwayTeam: teams[1]?.name || 'Away Team',
            intHomeScore: teams[0]?.score || null,
            intAwayScore: teams[1]?.score || null,
            strStatus: sport.game_spotlight.stage || 'Live',
            strVenue: venueName,
            dateEvent: today,
            strTime: sport.game_spotlight.time || '18:00:00'
          };
        } else if (serpData.sports_results?.matches?.[0]) {
          const match = serpData.sports_results.matches[0];
          const teams = match.teams || [];
          eventMatch = {
            strEvent: match.title || 'IPL Match',
            strHomeTeam: teams[0]?.name || 'Home Team',
            strAwayTeam: teams[1]?.name || 'Away Team',
            intHomeScore: teams[0]?.score || null,
            intAwayScore: teams[1]?.score || null,
            strStatus: match.status || 'Live',
            strVenue: venueName,
            dateEvent: today,
            strTime: match.time || '18:00:00'
          };
        }
      }

      // If SerpApi failed or returned no match, fall back to randomized data
      if (!eventMatch) {
        console.warn(`[Sports API] No live data found. Generating randomized demonstration data.`);
        eventMatch = this.generateRandomEvent(venueName);
      }

      const finalEvent = this.parseEventMatch(eventMatch);
      this.cache.set(cacheKey, { data: finalEvent, timestamp: Date.now() });
      return finalEvent;

    } catch (error) {
      console.error('[Sports API] Critical failure:', error);
      const fallback = this.parseEventMatch(this.generateRandomEvent(venueName));
      return fallback;
    }
  }

  private generateRandomEvent(venueName: string) {
    const today = new Date().toISOString().split('T')[0];
    const teamPool = [
      { name: 'Mumbai Indians', short: 'MI' },
      { name: 'Chennai Super Kings', short: 'CSK' },
      { name: 'Royal Challengers Bengaluru', short: 'RCB' },
      { name: 'Kolkata Knight Riders', short: 'KKR' },
      { name: 'Gujarat Titans', short: 'GT' },
      { name: 'Rajasthan Royals', short: 'RR' },
      { name: 'Lucknow Super Giants', short: 'LSG' },
      { name: 'Delhi Capitals', short: 'DC' }
    ];
    
    // Pick two random different teams
    const idx1 = Math.floor(Math.random() * teamPool.length);
    let idx2 = Math.floor(Math.random() * teamPool.length);
    while (idx1 === idx2) idx2 = Math.floor(Math.random() * teamPool.length);

    const teamA = teamPool[idx1];
    const teamB = teamPool[idx2];
    
    const isLive = Math.random() > 0.3;

    return {
      strEvent: 'IPL 2024: T20 Series',
      strHomeTeam: teamA.name,
      strAwayTeam: teamB.name,
      intHomeScore: isLive ? `${Math.floor(Math.random() * 200)}/${Math.floor(Math.random() * 10)}` : '',
      intAwayScore: isLive ? `${Math.floor(Math.random() * 50)}/${Math.floor(Math.random() * 3)}` : '',
      strStatus: isLive ? 'Live' : 'Upcoming',
      strVenue: venueName,
      dateEvent: today,
      strTime: '18:30:00'
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseEventMatch(eventMatch: any): VenueEvent | null {
    if (!eventMatch) return null;

    let startTime = new Date();
    if (eventMatch.strTime && eventMatch.dateEvent) {
       const timeString = eventMatch.strTime;
       if (timeString.includes('PM') || timeString.includes('AM')) {
         startTime = new Date(`${eventMatch.dateEvent} ${timeString}`);
       } else {
         startTime = new Date(`${eventMatch.dateEvent}T${timeString.padStart(8, '0')}`);
       }
       if (isNaN(startTime.getTime())) {
          startTime = new Date(new Date().getTime() + 60 * 60000); 
       }
    } else {
       startTime = new Date(new Date().getTime() + 60 * 60000);
    }

    const breakTime = new Date(startTime.getTime() + 90 * 60000);
    const endTime = new Date(startTime.getTime() + 180 * 60000);

    let matchStatus = eventMatch.strStatus || 'Upcoming';
    const sLower = matchStatus.toLowerCase();
    
    if (sLower.includes('not started') || sLower.includes('upcoming')) matchStatus = 'Upcoming';
    else if (sLower.includes('finished') || sLower.includes('final') || sLower.includes('ft')) matchStatus = 'Match Finished';

    return {
      name: eventMatch.strEvent || `${eventMatch.strHomeTeam} vs ${eventMatch.strAwayTeam}`,
      teamA: { 
        name: eventMatch.strHomeTeam || 'Home', 
        short: (eventMatch.strHomeTeam || 'HOM').substring(0, 3).toUpperCase(), 
        score: eventMatch.intHomeScore || ''
      },
      teamB: { 
        name: eventMatch.strAwayTeam || 'Away', 
        short: (eventMatch.strAwayTeam || 'AWA').substring(0, 3).toUpperCase(), 
        score: eventMatch.intAwayScore || ''
      },
      matchStatus,
      startTime,
      breakTime,
      endTime
    };
  }
}
