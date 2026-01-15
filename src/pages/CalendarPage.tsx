import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyStats, Trade } from '@/types/trade';
import { formatCurrency } from '@/lib/tradeUtils';
import { cn } from '@/lib/utils';

interface CalendarPageProps {
  dailyStats: DailyStats[];
  trades: Trade[];
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarPage({ dailyStats, trades }: CalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getStatsForDate = (date: Date) => {
    return dailyStats.find((s) => isSameDay(s.date, date));
  };

  const selectedDayTrades = useMemo(() => {
    if (!selectedDate) return [];
    return trades.filter((t) => isSameDay(t.dateClose, selectedDate));
  }, [selectedDate, trades]);

  const monthStats = useMemo(() => {
    const monthTrades = trades.filter(
      (t) => t.dateClose >= monthStart && t.dateClose <= monthEnd
    );
    const netPnl = monthTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const tradingDays = new Set(monthTrades.map((t) => format(t.dateClose, 'yyyy-MM-dd'))).size;
    const wins = monthTrades.filter((t) => t.outcome === 'WIN').length;
    return { netPnl, trades: monthTrades.length, tradingDays, wins };
  }, [trades, monthStart, monthEnd]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-semibold min-w-40 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Month P&L</p>
          <p className={cn('text-2xl font-bold', monthStats.netPnl >= 0 ? 'text-profit' : 'text-loss')}>
            {formatCurrency(monthStats.netPnl)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Trades</p>
          <p className="text-2xl font-bold text-foreground">{monthStats.trades}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Trading Days</p>
          <p className="text-2xl font-bold text-foreground">{monthStats.tradingDays}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Wins</p>
          <p className="text-2xl font-bold text-profit">{monthStats.wins}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 p-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const stats = getStatsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            const hasProfit = stats && stats.netPnl > 0;
            const hasLoss = stats && stats.netPnl < 0;

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'aspect-square p-2 rounded-lg text-left transition-all flex flex-col',
                  isCurrentMonth ? 'bg-secondary/30 hover:bg-secondary/60' : 'opacity-30',
                  isCurrentMonth && hasProfit && 'bg-profit/20 hover:bg-profit/30 border border-profit/30',
                  isCurrentMonth && hasLoss && 'bg-loss/20 hover:bg-loss/30 border border-loss/30',
                  isToday && 'ring-1 ring-accent',
                  isSelected && 'ring-2 ring-primary'
                )}
              >
                <span className={cn('text-sm font-medium', isCurrentMonth ? 'text-foreground' : 'text-muted-foreground')}>
                  {format(day, 'd')}
                </span>
                {stats && (
                  <div className="mt-auto">
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        stats.netPnl >= 0 ? 'text-profit' : 'text-loss'
                      )}
                    >
                      {formatCurrency(stats.netPnl)}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {stats.trades} trade{stats.trades !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day trades */}
      {selectedDate && (
        <div className="bg-card rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Trades on {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {selectedDayTrades.length > 0 ? (
            <div className="space-y-3">
              {selectedDayTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground">{trade.symbol}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        trade.side === 'LONG' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                      )}
                    >
                      {trade.side}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {trade.timeOpen?.slice(0, 5)} - {trade.timeClose?.slice(0, 5)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'font-semibold',
                      trade.netPnl >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {formatCurrency(trade.netPnl)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No trades on this day</p>
          )}
        </div>
      )}
    </div>
  );
}
