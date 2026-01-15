import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Clock,
  Zap,
  Activity,
  Calendar,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { CalendarStrip } from '@/components/dashboard/CalendarStrip';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { GaugeChart } from '@/components/dashboard/GaugeChart';
import { WinLossRing } from '@/components/dashboard/WinLossRing';
import { TickerTable } from '@/components/dashboard/TickerTable';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { EquityCurve } from '@/components/dashboard/EquityCurve';
import { Trade, DailyStats, TickerStats, OverallStats, DateRange } from '@/types/trade';

interface CustomDateRange {
  start: Date;
  end: Date;
}
import { formatCurrency, formatPercent, formatHoldTime } from '@/lib/tradeUtils';

interface DashboardProps {
  trades: Trade[];
  dailyStats: DailyStats[];
  tickerStats: TickerStats[];
  overallStats: OverallStats;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  customDateRange?: CustomDateRange | null;
  setCustomDateRange?: (range: CustomDateRange) => void;
}

export function Dashboard({
  trades,
  dailyStats,
  tickerStats,
  overallStats,
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
}: DashboardProps) {
  const wins = trades.filter(t => t.outcome === 'WIN').length;
  const losses = trades.filter(t => t.outcome === 'LOSS').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          customDateRange={customDateRange}
          onCustomDateChange={setCustomDateRange}
        />
      </div>

      {/* Calendar strip */}
      <CalendarStrip dailyStats={dailyStats} />

      {/* Recent trades */}
      <RecentTrades trades={trades} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net P&L"
          value={formatCurrency(overallStats.netPnl)}
          icon={overallStats.netPnl >= 0 ? TrendingUp : TrendingDown}
          trend={overallStats.netPnl >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Win Rate"
          value={`${overallStats.winRate.toFixed(1)}%`}
          subtitle={`${wins}W / ${losses}L`}
          icon={Target}
          trend={overallStats.winRate >= 50 ? 'up' : 'down'}
        />
        <StatCard
          title="Total Trades"
          value={overallStats.totalTrades.toString()}
          icon={BarChart3}
          trend="neutral"
        />
        <StatCard
          title="Avg Hold Time"
          value={formatHoldTime(overallStats.avgHoldTime)}
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <GaugeChart
          value={overallStats.profitFactor}
          max={3}
          label="Profit Factor"
          displayValue={overallStats.profitFactor === Infinity ? '∞' : overallStats.profitFactor.toFixed(2)}
        />
        <WinLossRing
          wins={wins}
          losses={losses}
          label="Winning VS Losing Trades"
        />
        <StatCard
          title="Avg Win vs Avg Loss"
          value={`${(overallStats.avgWin / (overallStats.avgLoss || 1)).toFixed(2)}`}
          subtitle={`${formatCurrency(overallStats.avgWin)} / ${formatCurrency(-overallStats.avgLoss)}`}
          icon={Activity}
          trend={overallStats.avgWin > overallStats.avgLoss ? 'up' : 'down'}
        />
        <StatCard
          title="Expectancy"
          value={formatCurrency(overallStats.expectancy)}
          subtitle="Per trade"
          icon={Zap}
          trend={overallStats.expectancy >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Best/Worst and Drawdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Best Day"
          value={formatCurrency(overallStats.bestDay)}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Worst Day"
          value={formatCurrency(overallStats.worstDay)}
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Max Drawdown"
          value={formatCurrency(-overallStats.maxDrawdown)}
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Largest Win"
          value={formatCurrency(Math.max(...trades.map(t => t.netPnl), 0))}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Equity Curve */}
      <EquityCurve dailyStats={dailyStats} />

      {/* Ticker table */}
      <TickerTable tickers={tickerStats} />
    </div>
  );
}
