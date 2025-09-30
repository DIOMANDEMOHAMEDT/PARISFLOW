export type ColumnId = 'shortlist' | 'form_check' | 'odds_check' | 'final_selection' | 'archived';

export interface Match {
  id: string;
  matchDate: string;
  teamA: string;
  teamB: string;
  league: string;
  over25Probability: number;
  avgGoals: number;
  bttsProbability: number;
  avgXG: number;
  avgXGA: number;
  recentOver25Count: number;
  odds: number;
  status: ColumnId;
  aiAnalysis?: {
    isGoodCandidate: boolean;
    analysis: string;
  };
  oddsAnalysis?: {
    isGoodValue: boolean;
    analysis: string;
  };
}

export interface Column {
  id: ColumnId;
  title: string;
  description: string;
}

export interface Bet {
  id: string;
  matches: Match[];
  stake: number;
  totalOdds: number;
  date: string;
  result: 'pending' | 'won' | 'lost';
}