import { format } from 'date-fns';
import { Trade } from '@/types/trade';
import { formatCurrency } from '@/lib/tradeUtils';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const recentTrades = trades.slice(0, 3);

  // Generate sample sparkline data for each trade (would be real price data)
  const generateSparklineData = (trade: Trade) => {
    const points = 20;
    const isProfit = trade.netPnl >= 0;
    const data: number[] = [];
    let current = trade.entryPrice;
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const target = trade.exitPrice;
      const variance = (Math.random() - 0.5) * 2;
      current = trade.entryPrice + (target - trade.entryPrice) * progress + variance;
      data.push(current);
    }
    
    return data;
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 animate-fade-in">
      <h3 className="text-sm text-muted-foreground mb-4">Your recent shared trades</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentTrades.map((trade) => {
          const sparklineData = generateSparklineData(trade);
          
          return (
            <div
              key={trade.id}
              className="trade-card group"
            >
              <p className="text-xs text-muted-foreground mb-2">
                {format(trade.dateClose, 'MMM d, yyyy HH:mm')}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {trade.symbol}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      trade.netPnl >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {formatCurrency(trade.netPnl)}
                  </p>
                </div>
                
                <div className="w-24 h-12">
                  <Sparkline
                    data={sparklineData}
                    color={trade.netPnl >= 0 ? 'profit' : 'loss'}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
