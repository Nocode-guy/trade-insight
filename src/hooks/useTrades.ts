import { useState, useCallback, useMemo } from 'react';
import { Trade, DateRange } from '@/types/trade';
import { calculateTradeMetrics, calculateOverallStats, getDailyStats, getTickerStats, generateId, parseCSV } from '@/lib/tradeUtils';
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// Sample data for demo
const generateSampleTrades = (): Trade[] => {
  const symbols = ['AAPL', 'NVDA', 'TSLA', 'META', 'MSFT', 'GOOGL', 'AMD', 'SPY', 'QQQ', 'AMZN'];
  const trades: Trade[] = [];
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const dateOpen = subDays(new Date(), daysAgo);
    const dateClose = dateOpen;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    const entryPrice = 100 + Math.random() * 400;
    const priceChange = (Math.random() - 0.4) * 10;
    const exitPrice = entryPrice + priceChange;
    const qty = Math.floor(Math.random() * 100) + 10;
    const fees = qty * 0.01;
    
    const baseTrade = {
      id: generateId(),
      dateOpen,
      timeOpen: `${9 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
      dateClose,
      timeClose: `${10 + Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
      symbol,
      side: side as 'LONG' | 'SHORT',
      qty,
      entryPrice,
      exitPrice,
      fees,
      strategyTag: ['breakout', 'reversal', 'momentum', 'scalp'][Math.floor(Math.random() * 4)],
    };
    
    const metrics = calculateTradeMetrics(baseTrade);
    trades.push({ ...baseTrade, ...metrics });
  }
  
  return trades.sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime());
};

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(generateSampleTrades);
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  
  const filteredTrades = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);
    
    if (dateRange === 'custom' && customDateRange) {
      startDate = startOfDay(customDateRange.start);
      endDate = endOfDay(customDateRange.end);
    } else {
      const days = parseInt(dateRange);
      startDate = startOfDay(subDays(now, days));
    }
    
    return trades.filter(trade => 
      isWithinInterval(trade.dateClose, { start: startDate, end: endDate })
    );
  }, [trades, dateRange, customDateRange]);
  
  const overallStats = useMemo(() => calculateOverallStats(filteredTrades), [filteredTrades]);
  const dailyStats = useMemo(() => getDailyStats(filteredTrades), [filteredTrades]);
  const tickerStats = useMemo(() => getTickerStats(filteredTrades), [filteredTrades]);
  
  const addTrade = useCallback((tradeData: Omit<Trade, 'id' | 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'>) => {
    const metrics = calculateTradeMetrics({ ...tradeData, id: '' });
    const newTrade: Trade = {
      ...tradeData,
      ...metrics,
      id: generateId(),
    };
    setTrades(prev => [newTrade, ...prev].sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime()));
    return newTrade;
  }, []);
  
  const importTrades = useCallback((csvText: string) => {
    const parsedTrades = parseCSV(csvText);
    const newTrades = parsedTrades.map(trade => {
      const metrics = calculateTradeMetrics({ ...trade, id: '' });
      return {
        ...trade,
        ...metrics,
        id: generateId(),
      };
    });
    setTrades(prev => [...newTrades, ...prev].sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime()));
    return newTrades.length;
  }, []);
  
  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return {
    trades: filteredTrades,
    allTrades: trades,
    overallStats,
    dailyStats,
    tickerStats,
    dateRange,
    setDateRange,
    customDateRange,
    setCustomDateRange,
    addTrade,
    importTrades,
    deleteTrade,
  };
}
