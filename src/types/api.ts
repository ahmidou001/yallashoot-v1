export interface Competitor {
  id: number;
  name: string;
  nameForURL?: string;
  score: number; // -1 if not started
  type?: number;
}

export interface Competition {
  id: number;
  name: string;
  imageVersion?: number;
  countryId?: number;
}

export interface Game {
  id: number;
  competitionId: number;
  startTime: string; // ISO Timestamp
  statusGroup: number; // 3=Live, 4=Finished, etc.
  statusText: string; // Localized match status string (e.g. "90'", "مباشر", "لم تبدأ")
  gameTime: number; // Elapsed minutes
  homeCompetitor: Competitor;
  awayCompetitor: Competitor;
  hasStream?: boolean;
}

export interface GamesResponse {
  competitions: Competition[];
  games: Game[];
  countries?: any[];
}

// Game Details & Lineups
export interface PlayerPosition {
  id: number;
  name: string;
}

export interface YardFormation {
  line: number; // row coordinate on pitch (1 to 5)
  fieldPosition: number; // col coordinate on pitch
  fieldLine: number;
  fieldSide: number;
}

export interface LineupMember {
  id: number;
  status: number; // 1 = Starter, 2 = Substitute
  position: PlayerPosition;
  yardFormation?: YardFormation;
  shirtNumber?: number | string;
  stats?: Array<{
    typeId: number;
    value: string;
  }>;
}

export interface Lineup {
  formation: string; // e.g. "4-2-3-1"
  members: LineupMember[];
}

export interface MatchEvent {
  eventType: {
    id: number; // 1=goal, 2=yellow, 3=red, 7/1000=sub
    name: string;
  };
  gameTime: number;
  gameTimeDisplay?: string;
  playerId: number;
  extraPlayers?: number[]; // [replacedPlayerId] or [assistingPlayerId]
}

export interface Member {
  id: number;
  name: string;
  imageVersion?: number;
  athleteId?: number;
}

export interface Period {
  periodNum: number;
  homeScore: number;
  awayScore: number;
}

export interface GameDetails {
  id: number;
  competitionId: number;
  statusGroup: number;
  statusText: string;
  gameTime: number;
  startTime: string;
  periods?: Period[];
  homeCompetitor: {
    id: number;
    name: string;
    score: number;
    lineups?: Lineup;
    type?: number;
  };
  awayCompetitor: {
    id: number;
    name: string;
    score: number;
    lineups?: Lineup;
    type?: number;
  };
  members?: Member[];
  events?: MatchEvent[];
  tvNetworks?: Array<{
    id: number;
    name: string;
    type?: number;
    countryId?: number;
    imageVersion?: number;
  }>;
}

export interface GameDetailsResponse {
  game: GameDetails;
  members?: Member[];
  competitions?: Competition[];
}

// Match Statistics
export interface StatMetric {
  id: number; // e.g. 10=possession, 14=corners
  name: string; // e.g. "الاستحواذ"
  value: string | number; // e.g. "55%" or "8"
  competitorId: number;
  categoryId: number;
  isMajor: boolean;
}

export interface StatsResponse {
  statistics: StatMetric[];
}

// Head to Head
export interface HistoricalGame {
  id: number;
  startTime: string;
  statusText: string;
  homeCompetitor: {
    id: number;
    name: string;
    score: number;
  };
  awayCompetitor: {
    id: number;
    name: string;
    score: number;
  };
  competitionName: string;
  winnerId: number;
}

export interface H2HResponse {
  game: {
    homeCompetitor: {
      recentGames: HistoricalGame[];
    };
    h2hGames?: HistoricalGame[];
  };
}

// Competition Standings
export interface StandingDestination {
  num: number;
  color: string;
  guaranteedText: string;
}

export interface StandingRow {
  position: number;
  competitor: {
    id: number;
    name: string;
  };
  gamePlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesEven: number;
  for: number;
  against: number;
  ratio: number;
  points: number;
  destinationNum?: number;
  recentForm: string[];
  groupNum?: number;
}

export interface StandingTable {
  displayName: string;
  destinations?: StandingDestination[];
  rows: StandingRow[];
  groups?: Array<{ num: number; name: string }>;
}

export interface StandingsResponse {
  standings: StandingTable[];
}

// Current Stage Utility
export interface CurrentStageGame {
  stageNum: number;
  seasonNum: number;
}

export interface CurrentStageResponse {
  games: CurrentStageGame[];
}
