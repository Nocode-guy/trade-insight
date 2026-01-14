import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, Trash2 } from 'lucide-react';
import { Trade } from '@/types/trade';
import { formatCurrency, formatPercent, formatHoldTime } from '@/lib/tradeUtils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TradesPageProps {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export function TradesPage({ trades, onDelete }: TradesPageProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Trade>('dateClose');
  const [sortDesc, setSortDesc] = useState(true);

  const filteredTrades = trades.filter(
    (trade) =>
      trade.symbol.toLowerCase().includes(search.toLowerCase()) ||
      trade.strategyTag?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal instanceof Date && bVal instanceof Date) {
      return sortDesc ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDesc ? bVal - aVal : aVal - bVal;
    }
    return 0;
  });

  const handleSort = (key: keyof Trade) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Trades</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search symbol or strategy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64 bg-secondary/50 border-border"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead
                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort('dateClose')}
              >
                Date <ArrowUpDown className="inline w-3 h-3 ml-1" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">Symbol</TableHead>
              <TableHead className="text-muted-foreground font-medium">Side</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Qty</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Entry</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Exit</TableHead>
              <TableHead
                className="text-muted-foreground font-medium text-right cursor-pointer hover:text-foreground"
                onClick={() => handleSort('netPnl')}
              >
                Net P&L <ArrowUpDown className="inline w-3 h-3 ml-1" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">%</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Hold</TableHead>
              <TableHead className="text-muted-foreground font-medium">Strategy</TableHead>
              <TableHead className="text-muted-foreground font-medium w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrades.map((trade) => (
              <TableRow
                key={trade.id}
                className="hover:bg-secondary/30 transition-colors border-border/30"
              >
                <TableCell className="text-muted-foreground">
                  {format(trade.dateClose, 'MMM d, yyyy')}
                  <br />
                  <span className="text-xs">{trade.timeClose?.slice(0, 5)}</span>
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {trade.symbol}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      trade.side === 'LONG'
                        ? 'bg-profit/10 text-profit'
                        : 'bg-loss/10 text-loss'
                    )}
                  >
                    {trade.side}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {trade.qty}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ${trade.entryPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ${trade.exitPrice.toFixed(2)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold',
                    trade.netPnl >= 0 ? 'text-profit' : 'text-loss'
                  )}
                >
                  {formatCurrency(trade.netPnl)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right text-sm',
                    trade.pnlPercent >= 0 ? 'text-profit' : 'text-loss'
                  )}
                >
                  {formatPercent(trade.pnlPercent)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatHoldTime(trade.holdTime)}
                </TableCell>
                <TableCell>
                  {trade.strategyTag && (
                    <span className="px-2 py-0.5 rounded bg-secondary text-xs text-muted-foreground">
                      {trade.strategyTag}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-50 hover:opacity-100 hover:text-loss"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this {trade.symbol} trade? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(trade.id)}
                          className="bg-loss hover:bg-loss/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sortedTrades.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>No trades found</p>
          </div>
        )}
      </div>
    </div>
  );
}
