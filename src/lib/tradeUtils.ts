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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseRobinhoodAmount(amount: string): number {
  if (!amount) return 0;
  const cleaned = amount.replace(/[$,]/g, '').replace(/[()]/g, m => m === '(' ? '-' : '');
  return parseFloat(cleaned) || 0;
}

function parseRobinhoodDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(dateStr);
}

export function parseCSV(csvText: string): Omit<Trade, 'id' | 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'>[] {
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));

  // Detect Robinhood format
  const isRobinhood = headers.includes('activity date') && headers.includes('trans code');

  if (isRobinhood) {
    return parseRobinhoodCSV(lines, headers);
  }

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });

      // Get date values with fallbacks
      const dateOpenStr = row.date_open || row.dateopen || row['date open'] || '';
      const dateCloseStr = row.date_close || row.dateclose || row['date close'] || '';

      // Skip rows without required date fields
      if (!dateOpenStr || !dateCloseStr) {
        return null;
      }

      return {
        dateOpen: parseISO(dateOpenStr),
        timeOpen: row.time_open || row.timeopen || row['time open'] || undefined,
        dateClose: parseISO(dateCloseStr),
        timeClose: row.time_close || row.timeclose || row['time close'] || undefined,
        symbol: (row.symbol || row.ticker || '').toUpperCase(),
        side: (row.side || 'LONG').toUpperCase() as 'LONG' | 'SHORT',
        qty: parseFloat(row.qty || row.quantity || '0'),
        entryPrice: parseFloat(row.entry_price || row.entryprice || row.entry || '0'),
        exitPrice: parseFloat(row.exit_price || row.exitprice || row.exit || '0'),
        fees: parseFloat(row.fees || row.commission || '0'),
        strategyTag: row.strategy_tag || row.strategy || row.tag || undefined,
        notes: row.notes || undefined,
      };
    })
    .filter((trade): trade is NonNullable<typeof trade> => trade !== null);
}

function parseRobinhoodCSV(lines: string[], headers: string[]): Omit<Trade, 'id' | 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'>[] {
  const trades: Omit<Trade, 'id' | 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'>[] = [];

  // Group transactions by description (option contract)
  const transactionsByContract = new Map<string, Array<{
    date: Date;
    transCode: string;
    quantity: number;
    price: number;
    amount: number;
    symbol: string;
    description: string;
  }>>();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const transCode = row['trans code'];
    const description = row['description'];
    const instrument = row['instrument'];

    // Process BTO/STC (long options) and STO/BTC (short options)
    if (!['BTO', 'STC', 'STO', 'BTC'].includes(transCode)) continue;
    if (!instrument || !description) continue;

    const dateStr = row['activity date'];
    if (!dateStr) continue;

    const transaction = {
      date: parseRobinhoodDate(dateStr),
      transCode,
      quantity: parseInt(row['quantity']) || 1,
      price: parseRobinhoodAmount(row['price']),
      amount: parseRobinhoodAmount(row['amount']),
      symbol: instrument,
      description,
    };

    const key = description;
    if (!transactionsByContract.has(key)) {
      transactionsByContract.set(key, []);
    }
    transactionsByContract.get(key)!.push(transaction);
  }

  // Match opening with closing transactions
  transactionsByContract.forEach((transactions, contract) => {
    // BTO/STC = long options, STO/BTC = short options
    const longOpens = transactions.filter(t => t.transCode === 'BTO').sort((a, b) => a.date.getTime() - b.date.getTime());
    const longCloses = transactions.filter(t => t.transCode === 'STC').sort((a, b) => a.date.getTime() - b.date.getTime());
    const shortOpens = transactions.filter(t => t.transCode === 'STO').sort((a, b) => a.date.getTime() - b.date.getTime());
    const shortCloses = transactions.filter(t => t.transCode === 'BTC').sort((a, b) => a.date.getTime() - b.date.getTime());

    // Process long options (BTO -> STC)
    let openIdx = 0;
    let openQtyRemaining = longOpens[openIdx]?.quantity || 0;
    let openAmountPerUnit = longOpens[openIdx] ? Math.abs(longOpens[openIdx].amount) / longOpens[openIdx].quantity : 0;

    for (const close of longCloses) {
      let closeQtyRemaining = close.quantity;
      const closeAmountPerUnit = close.amount / close.quantity;

      while (closeQtyRemaining > 0 && openIdx < longOpens.length) {
        const open = longOpens[openIdx];
        const matchQty = Math.min(closeQtyRemaining, openQtyRemaining);

        if (matchQty > 0) {
          const isPut = contract.toLowerCase().includes('put');
          // Use amounts for accurate P&L (already includes fees)
          // entryPrice = cost per unit, exitPrice = proceeds per unit
          trades.push({
            dateOpen: open.date,
            timeOpen: undefined,
            dateClose: close.date,
            timeClose: undefined,
            symbol: close.symbol,
            side: 'LONG',
            qty: matchQty,
            entryPrice: openAmountPerUnit,
            exitPrice: closeAmountPerUnit,
            fees: 0, // Already included in amounts
            strategyTag: isPut ? 'put' : 'call',
            notes: contract,
          });
        }

        closeQtyRemaining -= matchQty;
        openQtyRemaining -= matchQty;

        if (openQtyRemaining <= 0) {
          openIdx++;
          openQtyRemaining = longOpens[openIdx]?.quantity || 0;
          openAmountPerUnit = longOpens[openIdx] ? Math.abs(longOpens[openIdx].amount) / longOpens[openIdx].quantity : 0;
        }
      }
    }

    // Process short options (STO -> BTC)
    openIdx = 0;
    openQtyRemaining = shortOpens[openIdx]?.quantity || 0;
    let shortOpenAmountPerUnit = shortOpens[openIdx] ? shortOpens[openIdx].amount / shortOpens[openIdx].quantity : 0;

    for (const close of shortCloses) {
      let closeQtyRemaining = close.quantity;
      const closeAmountPerUnit = Math.abs(close.amount) / close.quantity;

      while (closeQtyRemaining > 0 && openIdx < shortOpens.length) {
        const open = shortOpens[openIdx];
        const matchQty = Math.min(closeQtyRemaining, openQtyRemaining);

        if (matchQty > 0) {
          const isPut = contract.toLowerCase().includes('put');
          // For shorts: STO gives credit (positive), BTC costs money (negative)
          // P&L = credit received - cost to close
          trades.push({
            dateOpen: open.date,
            timeOpen: undefined,
            dateClose: close.date,
            timeClose: undefined,
            symbol: close.symbol,
            side: 'SHORT',
            qty: matchQty,
            entryPrice: closeAmountPerUnit, // Cost to close
            exitPrice: shortOpenAmountPerUnit, // Credit received
            fees: 0,
            strategyTag: isPut ? 'put' : 'call',
            notes: contract,
          });
        }

        closeQtyRemaining -= matchQty;
        openQtyRemaining -= matchQty;

        if (openQtyRemaining <= 0) {
          openIdx++;
          openQtyRemaining = shortOpens[openIdx]?.quantity || 0;
          shortOpenAmountPerUnit = shortOpens[openIdx] ? shortOpens[openIdx].amount / shortOpens[openIdx].quantity : 0;
        }
      }
    }
  });

  return trades.sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime());
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
