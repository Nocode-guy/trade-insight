import { Trade, DailyStats, TickerStats, OverallStats } from '@/types/trade';
import { differenceInMinutes, format, parseISO, startOfDay } from 'date-fns';

export function calculateTradeMetrics(trade: Omit<Trade, 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'> & { id?: string }): Pick<Trade, 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'> {
  const multiplier = trade.side === 'LONG' ? 1 : -1;
  const priceDiff = trade.exitPrice - trade.entryPrice;
  const grossPnl = multiplier * priceDiff * trade.qty;
  const netPnl = grossPnl - trade.fees;
  const pnlPercent = (multiplier * priceDiff / trade.entryPrice) * 100;
  
  const openDateTime = trade.timeOpen 
    ? new Date(`${format(trade.dateOpen, 'yyyy-MM-dd')}T${trade.timeOpen}`)
    : trade.dateOpen;
  const closeDateTime = trade.timeClose
    ? new Date(`${format(trade.dateClose, 'yyyy-MM-dd')}T${trade.timeClose}`)
    : trade.dateClose;
  
  const holdTime = differenceInMinutes(closeDateTime, openDateTime);
  
  let outcome: Trade['outcome'] = 'BREAKEVEN';
  if (netPnl > 0.01) outcome = 'WIN';
  else if (netPnl < -0.01) outcome = 'LOSS';
  
  return { grossPnl, netPnl, pnlPercent, holdTime, outcome };
}

export function calculateOverallStats(trades: Trade[]): OverallStats {
  if (trades.length === 0) {
    return {
      netPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      expectancy: 0,
      totalTrades: 0,
      maxDrawdown: 0,
      bestDay: 0,
      worstDay: 0,
      avgHoldTime: 0,
    };
  }

  const wins = trades.filter(t => t.outcome === 'WIN');
  const losses = trades.filter(t => t.outcome === 'LOSS');
  
  const totalNetPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);
  const winRate = (wins.length / trades.length) * 100;
  
  const grossWins = wins.reduce((sum, t) => sum + t.netPnl, 0);
  const grossLosses = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;
  
  const avgWin = wins.length > 0 ? grossWins / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLosses / losses.length : 0;
  const expectancy = totalNetPnl / trades.length;
  
  // Calculate daily P&L for drawdown
  const dailyPnl = getDailyStats(trades);
  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;
  
  dailyPnl.forEach(day => {
    cumulative += day.netPnl;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  
  const bestDay = dailyPnl.length > 0 ? Math.max(...dailyPnl.map(d => d.netPnl)) : 0;
  const worstDay = dailyPnl.length > 0 ? Math.min(...dailyPnl.map(d => d.netPnl)) : 0;
  
  const avgHoldTime = trades.reduce((sum, t) => sum + t.holdTime, 0) / trades.length;
  
  return {
    netPnl: totalNetPnl,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    expectancy,
    totalTrades: trades.length,
    maxDrawdown,
    bestDay,
    worstDay,
    avgHoldTime,
  };
}

export function getDailyStats(trades: Trade[]): DailyStats[] {
  const dailyMap = new Map<string, DailyStats>();
  
  trades.forEach(trade => {
    const dateKey = format(trade.dateClose, 'yyyy-MM-dd');
    const existing = dailyMap.get(dateKey);
    
    if (existing) {
      existing.netPnl += trade.netPnl;
      existing.trades += 1;
      if (trade.outcome === 'WIN') existing.wins += 1;
      else if (trade.outcome === 'LOSS') existing.losses += 1;
    } else {
      dailyMap.set(dateKey, {
        date: startOfDay(trade.dateClose),
        netPnl: trade.netPnl,
        trades: 1,
        wins: trade.outcome === 'WIN' ? 1 : 0,
        losses: trade.outcome === 'LOSS' ? 1 : 0,
      });
    }
  });
  
  return Array.from(dailyMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getTickerStats(trades: Trade[]): TickerStats[] {
  const tickerMap = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    const existing = tickerMap.get(trade.symbol);
    if (existing) {
      existing.push(trade);
    } else {
      tickerMap.set(trade.symbol, [trade]);
    }
  });
  
  return Array.from(tickerMap.entries()).map(([symbol, symbolTrades]) => {
    const wins = symbolTrades.filter(t => t.outcome === 'WIN');
    const losses = symbolTrades.filter(t => t.outcome === 'LOSS');
    
    const netPnl = symbolTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const winRate = (wins.length / symbolTrades.length) * 100;
    
    const grossWins = wins.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLosses = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;
    
    const avgWin = wins.length > 0 ? grossWins / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLosses / losses.length : 0;
    const expectancy = netPnl / symbolTrades.length;
    
    const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.netPnl)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.netPnl)) : 0;
    
    const avgHoldTime = symbolTrades.reduce((sum, t) => sum + t.holdTime, 0) / symbolTrades.length;
    
    return {
      symbol,
      trades: symbolTrades.length,
      netPnl,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      expectancy,
      largestWin,
      largestLoss,
      avgHoldTime,
    };
  }).sort((a, b) => b.netPnl - a.netPnl);
}

export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `${value < 0 ? '-' : '+'}$${(absValue / 1000).toFixed(2)}k`;
  }
  return `${value < 0 ? '-' : value > 0 ? '+' : ''}$${absValue.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatHoldTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
  return `${(minutes / 1440).toFixed(1)}d`;
}

export function parseCSV(csvText: string): Omit<Trade, 'id' | 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    
    return {
      dateOpen: parseISO(row.date_open || row.dateopen),
      timeOpen: row.time_open || row.timeopen || undefined,
      dateClose: parseISO(row.date_close || row.dateclose),
      timeClose: row.time_close || row.timeclose || undefined,
      symbol: (row.symbol || row.ticker || '').toUpperCase(),
      side: (row.side || 'LONG').toUpperCase() as 'LONG' | 'SHORT',
      qty: parseFloat(row.qty || row.quantity || '0'),
      entryPrice: parseFloat(row.entry_price || row.entryprice || row.entry || '0'),
      exitPrice: parseFloat(row.exit_price || row.exitprice || row.exit || '0'),
      fees: parseFloat(row.fees || row.commission || '0'),
      strategyTag: row.strategy_tag || row.strategy || row.tag || undefined,
      notes: row.notes || undefined,
    };
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
