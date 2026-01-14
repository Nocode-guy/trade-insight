import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DailyStats } from '@/types/trade';
import { formatCurrency } from '@/lib/tradeUtils';
import { useState } from 'react';

interface CalendarStripProps {
  dailyStats: DailyStats[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export function CalendarStrip({ dailyStats, selectedDate, onDateSelect }: CalendarStripProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getStatsForDate = (date: Date) => {
    return dailyStats.find(s => isSameDay(s.date, date));
  };

  const goToPreviousWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(weekStart, 'MMMM, yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => {
          const stats = getStatsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isFuture = day > new Date();

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(day)}
              disabled={isFuture}
              className={cn(
                'calendar-day text-left transition-all',
                isSelected && 'calendar-day-active',
                isToday && 'ring-1 ring-accent/50',
                isFuture && 'opacity-40 cursor-not-allowed'
              )}
            >
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-foreground">
                  {format(day, 'd')}
                </span>
                <span className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE')}
                </span>
              </div>
              
              {stats ? (
                <>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      stats.netPnl >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {formatCurrency(stats.netPnl)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.trades} trade{stats.trades !== 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">$0</p>
                  <p className="text-xs text-muted-foreground">0 trades</p>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
