import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { TickerStats } from '@/types/trade';
import { formatCurrency, formatPercent, formatHoldTime } from '@/lib/tradeUtils';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TickerTableProps {
  tickers: TickerStats[];
}

type SortKey = 'netPnl' | 'expectancy' | 'profitFactor' | 'winRate';

export function TickerTable({ tickers }: TickerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('netPnl');
  const [sortDesc, setSortDesc] = useState(true);

  const sortedTickers = [...tickers].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return sortDesc ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDesc ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Ticker Performance</h3>
      
      <div className="rounded-lg overflow-hidden border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-muted-foreground font-medium">Symbol</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Trades</TableHead>
              <TableHead 
                className="text-muted-foreground font-medium text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('netPnl')}
              >
                <span className="inline-flex items-center gap-1">
                  Net P&L <SortIcon column="netPnl" />
                </span>
              </TableHead>
              <TableHead 
                className="text-muted-foreground font-medium text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('winRate')}
              >
                <span className="inline-flex items-center gap-1">
                  Win Rate <SortIcon column="winRate" />
                </span>
              </TableHead>
              <TableHead 
                className="text-muted-foreground font-medium text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('profitFactor')}
              >
                <span className="inline-flex items-center gap-1">
                  Profit Factor <SortIcon column="profitFactor" />
                </span>
              </TableHead>
              <TableHead 
                className="text-muted-foreground font-medium text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('expectancy')}
              >
                <span className="inline-flex items-center gap-1">
                  Expectancy <SortIcon column="expectancy" />
                </span>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Avg Hold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickers.map((ticker) => (
              <TableRow 
                key={ticker.symbol} 
                className="hover:bg-secondary/30 transition-colors border-border/30 cursor-pointer"
              >
                <TableCell className="font-semibold text-foreground">
                  {ticker.symbol}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {ticker.trades}
                </TableCell>
                <TableCell className={cn(
                  'text-right font-medium',
                  ticker.netPnl >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {formatCurrency(ticker.netPnl)}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  {ticker.winRate.toFixed(0)}%
                </TableCell>
                <TableCell className={cn(
                  'text-right',
                  ticker.profitFactor >= 1 ? 'text-profit' : 'text-loss'
                )}>
                  {ticker.profitFactor === Infinity ? '∞' : ticker.profitFactor.toFixed(2)}
                </TableCell>
                <TableCell className={cn(
                  'text-right',
                  ticker.expectancy >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {formatCurrency(ticker.expectancy)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatHoldTime(ticker.avgHoldTime)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
