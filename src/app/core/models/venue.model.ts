export interface Venue {
  id: string;
  name: string;
  state: string;
}

export interface CrowdData {
  gate: { name: string; waitTime: number; status: 'optimal' | 'busy' | 'crowded' };
  food: { name: string; waitTime: number; status: 'optimal' | 'busy' | 'crowded' };
  restroom: { name: string; waitTime: number; status: 'optimal' | 'busy' | 'crowded' };
  exit: { name: string; waitTime: number; status: 'optimal' | 'busy' | 'crowded' };
  healthScore: number;
  congestionAlert: string | null;
}

export interface VenueEvent {
  name: string;
  teamA: { name: string; short: string; score: string };
  teamB: { name: string; short: string; score: string };
  matchStatus: string;
  startTime: Date;
  breakTime: Date;
  endTime: Date;
}
