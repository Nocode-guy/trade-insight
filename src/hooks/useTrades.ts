import { useState, useCallback, useMemo, useEffect } from 'react';
import { Trade, DateRange } from '@/types/trade';
import { calculateTradeMetrics, calculateOverallStats, getDailyStats, getTickerStats, generateId, parseCSV } from '@/lib/tradeUtils';
import { subDays, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { getAuthToken, getTrades as apiGetTrades, createTrade as apiCreateTrade, deleteTrade as apiDeleteTrade, importTrades as apiImportTrades, ApiTrade } from '@/lib/api';

// Convert API trade to local Trade format
function apiTradeToTrade(apiTrade: ApiTrade): Trade {
  const dateOpen = new Date(apiTrade.entry_time);
  const dateClose = apiTrade.exit_time ? new Date(apiTrade.exit_time) : dateOpen;

  const baseTrade = {
    id: apiTrade.id,
    dateOpen,
    timeOpen: format(dateOpen, 'HH:mm:ss'),
    dateClose,
    timeClose: apiTrade.exit_time ? format(dateClose, 'HH:mm:ss') : undefined,
    symbol: apiTrade.symbol,
    side: apiTrade.side.toUpperCase() as 'LONG' | 'SHORT',
    qty: apiTrade.quantity,
    entryPrice: apiTrade.entry_price,
    exitPrice: apiTrade.exit_price || apiTrade.entry_price,
    fees: 0,
    strategyTag: apiTrade.tags?.[0],
    notes: apiTrade.notes?.[0]?.content,
  };

  const metrics = calculateTradeMetrics(baseTrade);
  return { ...baseTrade, ...metrics };
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load trades from API if authenticated
  const loadTrades = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const apiTrades = await apiGetTrades({ limit: 1000 });
      const convertedTrades = apiTrades.map(apiTradeToTrade);
      setTrades(convertedTrades.sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime()));
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load trades on mount if authenticated
  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          loadTrades();
        } else {
          setTrades([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadTrades]);

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

  const addTrade = useCallback(async (tradeData: Omit<Trade, 'id' | 'grossPnl' | 'netPnl' | 'pnlPercent' | 'holdTime' | 'outcome'>) => {
    const metrics = calculateTradeMetrics({ ...tradeData, id: '' });
    const newTrade: Trade = {
      ...tradeData,
      ...metrics,
      id: generateId(),
    };

    // Add to local state immediately
    setTrades(prev => [newTrade, ...prev].sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime()));

    // Sync to API if authenticated
    const token = getAuthToken();
    if (token) {
      try {
        await apiCreateTrade({
          symbol: tradeData.symbol,
          side: tradeData.side.toLowerCase(),
          quantity: tradeData.qty,
          entry_price: tradeData.entryPrice,
          entry_time: format(tradeData.dateOpen, "yyyy-MM-dd'T'HH:mm:ss"),
          exit_price: tradeData.exitPrice,
          exit_time: format(tradeData.dateClose, "yyyy-MM-dd'T'HH:mm:ss"),
          notes: tradeData.notes,
          tags: tradeData.strategyTag ? [tradeData.strategyTag] : undefined,
        });
        // Reload to get server-generated ID
        loadTrades();
      } catch (error) {
        console.error('Failed to sync trade to server:', error);
      }
    }

    return newTrade;
  }, [loadTrades]);

  const importTrades = useCallback(async (csvText: string) => {
    const parsedTrades = parseCSV(csvText);
    const newTrades = parsedTrades.map(trade => {
      const metrics = calculateTradeMetrics({ ...trade, id: '' });
      return {
        ...trade,
        ...metrics,
        id: generateId(),
      };
    });

    // Add to local state immediately
    setTrades(prev => [...newTrades, ...prev].sort((a, b) => b.dateClose.getTime() - a.dateClose.getTime()));

    // Sync to API if authenticated
    const token = getAuthToken();
    if (token && newTrades.length > 0) {
      try {
        const apiTrades = newTrades.map(trade => ({
          symbol: trade.symbol,
          side: trade.side.toLowerCase(),
          quantity: trade.qty,
          entry_price: trade.entryPrice,
          entry_time: format(trade.dateOpen, "yyyy-MM-dd'T'HH:mm:ss"),
          exit_price: trade.exitPrice,
          exit_time: format(trade.dateClose, "yyyy-MM-dd'T'HH:mm:ss"),
          notes: trade.notes,
          tags: trade.strategyTag ? [trade.strategyTag] : undefined,
        }));

        await apiImportTrades(apiTrades);
        // Reload to get server data
        loadTrades();
      } catch (error) {
        console.error('Failed to sync imported trades to server:', error);
      }
    }

    return newTrades.length;
  }, [loadTrades]);

  const deleteTrade = useCallback(async (id: string) => {
    // Remove from local state immediately
    setTrades(prev => prev.filter(t => t.id !== id));

    // Sync to API if authenticated
    const token = getAuthToken();
    if (token) {
      try {
        await apiDeleteTrade(id);
      } catch (error) {
        console.error('Failed to delete trade from server:', error);
        // Reload to restore if delete failed
        loadTrades();
      }
    }
  }, [loadTrades]);

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
    isLoading,
    refreshTrades: loadTrades,
  };
}
