import { useMemo } from 'react';
import { format, getDay, getHours } from 'date-fns';
import { Trade } from '@/types/trade';
import { formatCurrency } from '@/lib/tradeUtils';
import { cn } from '@/lib/utils';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

interface ReportsPageProps {
  trades: Trade[];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 8 }, (_, i) => i + 9); // 9 AM to 4 PM

export function ReportsPage({ trades }: ReportsPageProps) {
  const pnlByDay = useMemo(() => {
    const dayMap = new Map<number, number>();
    trades.forEach((trade) => {
      const day = getDay(trade.dateClose);
      dayMap.set(day, (dayMap.get(day) || 0) + trade.netPnl);
    });
    return dayNames.map((name, i) => ({
      day: name,
      pnl: dayMap.get(i) || 0,
    }));
  }, [trades]);

  const pnlByHour = useMemo(() => {
    const hourMap = new Map<number, number>();
    trades.forEach((trade) => {
      if (trade.timeClose) {
        const hour = parseInt(trade.timeClose.split(':')[0]);
        hourMap.set(hour, (hourMap.get(hour) || 0) + trade.netPnl);
      }
    });
    return hours.map((hour) => ({
      hour: `${hour}:00`,
      pnl: hourMap.get(hour) || 0,
    }));
  }, [trades]);

  const pnlBySide = useMemo(() => {
    const longs = trades.filter((t) => t.side === 'LONG');
    const shorts = trades.filter((t) => t.side === 'SHORT');
    return [
      { side: 'Long', pnl: longs.reduce((sum, t) => sum + t.netPnl, 0), trades: longs.length },
      { side: 'Short', pnl: shorts.reduce((sum, t) => sum + t.netPnl, 0), trades: shorts.length },
    ];
  }, [trades]);

  const pnlByStrategy = useMemo(() => {
    const strategyMap = new Map<string, { pnl: number; trades: number }>();
    trades.forEach((trade) => {
      const strategy = trade.strategyTag || 'Untagged';
      const existing = strategyMap.get(strategy) || { pnl: 0, trades: 0 };
      strategyMap.set(strategy, {
        pnl: existing.pnl + trade.netPnl,
        trades: existing.trades + 1,
      });
    });
    return Array.from(strategyMap.entries())
      .map(([strategy, data]) => ({ strategy, ...data }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L by Day of Week */}
        <div className="bg-card rounded-xl border border-border/50 p-5">
          <h3 className="text-lg font-semibold mb-4">P&L by Day of Week</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlByDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 18%, 12%)',
                    border: '1px solid hsl(220, 14%, 18%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {pnlByDay.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? 'hsl(160, 84%, 39%)' : 'hsl(0, 72%, 51%)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P&L by Hour */}
        <div className="bg-card rounded-xl border border-border/50 p-5">
          <h3 className="text-lg font-semibold mb-4">P&L by Hour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlByHour} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 18%, 12%)',
                    border: '1px solid hsl(220, 14%, 18%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {pnlByHour.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? 'hsl(160, 84%, 39%)' : 'hsl(0, 72%, 51%)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P&L by Side */}
        <div className="bg-card rounded-xl border border-border/50 p-5">
          <h3 className="text-lg font-semibold mb-4">P&L by Side</h3>
          <div className="space-y-4">
            {pnlBySide.map((item) => (
              <div key={item.side} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <span className="font-semibold text-foreground">{item.side}</span>
                  <span className="text-sm text-muted-foreground ml-2">({item.trades} trades)</span>
                </div>
                <span className={cn('font-bold text-lg', item.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                  {formatCurrency(item.pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* P&L by Strategy */}
        <div className="bg-card rounded-xl border border-border/50 p-5">
          <h3 className="text-lg font-semibold mb-4">P&L by Strategy</h3>
          <div className="space-y-3">
            {pnlByStrategy.map((item) => (
              <div key={item.strategy} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <span className="font-medium text-foreground capitalize">{item.strategy}</span>
                  <span className="text-sm text-muted-foreground ml-2">({item.trades} trades)</span>
                </div>
                <span className={cn('font-semibold', item.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                  {formatCurrency(item.pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
