import { useMemo } from 'react';
import { DailyStats } from '@/types/trade';
import { formatCurrency } from '@/lib/tradeUtils';
import { format } from 'date-fns';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface EquityCurveProps {
  dailyStats: DailyStats[];
}

export function EquityCurve({ dailyStats }: EquityCurveProps) {
  const chartData = useMemo(() => {
    let cumulative = 0;
    return dailyStats.map((day) => {
      cumulative += day.netPnl;
      return {
        date: format(day.date, 'MMM d'),
        pnl: day.netPnl,
        equity: cumulative,
      };
    });
  }, [dailyStats]);

  const finalEquity = chartData[chartData.length - 1]?.equity ?? 0;
  const isPositive = finalEquity >= 0;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Equity Curve</h3>
        <span className={isPositive ? 'text-profit font-semibold' : 'text-loss font-semibold'}>
          {formatCurrency(finalEquity)}
        </span>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? 'hsl(160, 84%, 39%)' : 'hsl(0, 72%, 51%)'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? 'hsl(160, 84%, 39%)' : 'hsl(0, 72%, 51%)'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 12%)',
                border: '1px solid hsl(220, 14%, 18%)',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(210, 20%, 98%)' }}
              formatter={(value: number) => [formatCurrency(value), 'Equity']}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke={isPositive ? 'hsl(160, 84%, 39%)' : 'hsl(0, 72%, 51%)'}
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
