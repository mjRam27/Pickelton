export type Sport = "Pickleball" | "Badminton";

export type Screen = 
  | "home" 
  | "groups" 
  | "live" 
  | "live-telecast" 
  | "book" 
  | "profile" 
  | "feed" 
  | "create-club-1" 
  | "create-club-2" 
  | "create-club-3";

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  sport: Sport;
  image: string;
  trending?: boolean;
  live?: boolean;
  activity?: string;
}

export interface Court {
  id: string;
  name: string;
  type: string;
  price: number;
  distance: string;
  image: string;
  courts: number;
  premium?: boolean;
}

export interface Match {
  id: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  sport: Sport;
  court: string;
  live: boolean;
}
