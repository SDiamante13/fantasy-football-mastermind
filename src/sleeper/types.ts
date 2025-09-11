export type User = {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
};

export type League = {
  league_id: string;
  name: string;
  season: string;
  status: string;
  total_rosters: number;
  settings: {
    type: number;
    leg?: number;
  };
  scoring_settings: {
    rec?: number;
  };
};

export type Roster = {
  roster_id: number;
  owner_id: string;
  players?: string[];
  starters?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
  };
};

export type Player = {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team?: string;
  position: string;
  active: boolean;
  years_exp?: number;
  age?: number;
  height?: string;
  weight?: string;
};

export type Transaction = {
  type: string;
  drops?: Record<string, string>;
  creator: string;
};
