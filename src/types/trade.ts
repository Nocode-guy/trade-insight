export interface Trade {
  id: string;
  dateOpen: Date;
  timeOpen?: string;
  dateClose: Date;
  timeClose?: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  qty: number;
  entryPrice: number;
  exitPrice: number;
  fees: number;
  strategyTag?: string;
  notes?: string;
  screenshot?: string;
  
  // Computed fields
  grossPnl: number;
  netPnl: number;
  pnlPercent: number;
  holdTime: number; // in minutes
  outcome: 'WIN' | 'LOSS' | 'BREAKEVEN';
}

export interface DailyStats {
  date: Date;
  netPnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface TickerStats {
  symbol: string;
  trades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  avgHoldTime: number;
}

export interface OverallStats {
  netPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  totalTrades: number;
  maxDrawdown: number;
  bestDay: number;
  worstDay: number;
  avgHoldTime: number;
}

export type DateRange = '30' | '60' | '90' | 'custom';
