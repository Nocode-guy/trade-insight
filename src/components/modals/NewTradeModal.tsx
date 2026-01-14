import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NewTradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (trade: any) => void;
}

export function NewTradeModal({ open, onOpenChange, onSubmit }: NewTradeModalProps) {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [qty, setQty] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [fees, setFees] = useState('0');
  const [dateOpen, setDateOpen] = useState<Date>(new Date());
  const [dateClose, setDateClose] = useState<Date>(new Date());
  const [timeOpen, setTimeOpen] = useState('09:30');
  const [timeClose, setTimeClose] = useState('10:00');
  const [strategyTag, setStrategyTag] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate P&L preview
  const entry = parseFloat(entryPrice) || 0;
  const exit = parseFloat(exitPrice) || 0;
  const quantity = parseFloat(qty) || 0;
  const fee = parseFloat(fees) || 0;
  
  const multiplier = side === 'LONG' ? 1 : -1;
  const grossPnl = multiplier * (exit - entry) * quantity;
  const netPnl = grossPnl - fee;
  const pnlPercent = entry > 0 ? (multiplier * (exit - entry) / entry) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !qty || !entryPrice || !exitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit({
      symbol: symbol.toUpperCase(),
      side,
      qty: quantity,
      entryPrice: entry,
      exitPrice: exit,
      fees: fee,
      dateOpen,
      dateClose,
      timeOpen: `${timeOpen}:00`,
      timeClose: `${timeClose}:00`,
      strategyTag: strategyTag || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setSymbol('');
    setQty('');
    setEntryPrice('');
    setExitPrice('');
    setFees('0');
    setStrategyTag('');
    setNotes('');
    
    toast.success('Trade added successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Trade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left column - Trade details */}
            <div className="space-y-4">
              {/* Symbol */}
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Side */}
              <div className="space-y-2">
                <Label>Side *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={side === 'LONG' ? 'default' : 'outline'}
                    onClick={() => setSide('LONG')}
                    className={cn(
                      'flex-1 gap-2',
                      side === 'LONG' && 'bg-profit hover:bg-profit/90'
                    )}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Long
                  </Button>
                  <Button
                    type="button"
                    variant={side === 'SHORT' ? 'default' : 'outline'}
                    onClick={() => setSide('SHORT')}
                    className={cn(
                      'flex-1 gap-2',
                      side === 'SHORT' && 'bg-loss hover:bg-loss/90'
                    )}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Short
                  </Button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity *</Label>
                <Input
                  id="qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="100"
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Entry/Exit prices */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="entry">Entry Price *</Label>
                  <Input
                    id="entry"
                    type="number"
                    step="0.01"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="150.00"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exit">Exit Price *</Label>
                  <Input
                    id="exit"
                    type="number"
                    step="0.01"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    placeholder="152.50"
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              {/* Fees */}
              <div className="space-y-2">
                <Label htmlFor="fees">Fees</Label>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  placeholder="0.00"
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>

            {/* Right column - Dates and notes */}
            <div className="space-y-4">
              {/* Open date/time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Open Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-secondary/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateOpen, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border">
                      <Calendar
                        mode="single"
                        selected={dateOpen}
                        onSelect={(d) => d && setDateOpen(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeOpen">Open Time</Label>
                  <Input
                    id="timeOpen"
                    type="time"
                    value={timeOpen}
                    onChange={(e) => setTimeOpen(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              {/* Close date/time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Close Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-secondary/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateClose, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border">
                      <Calendar
                        mode="single"
                        selected={dateClose}
                        onSelect={(d) => d && setDateClose(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeClose">Close Time</Label>
                  <Input
                    id="timeClose"
                    type="time"
                    value={timeClose}
                    onChange={(e) => setTimeClose(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              {/* Strategy tag */}
              <div className="space-y-2">
                <Label htmlFor="strategy">Strategy Tag</Label>
                <Input
                  id="strategy"
                  value={strategyTag}
                  onChange={(e) => setStrategyTag(e.target.value)}
                  placeholder="breakout, reversal, etc."
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Trade notes..."
                  rows={3}
                  className="bg-secondary/50 border-border resize-none"
                />
              </div>

              {/* P&L Preview */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Trade Preview</p>
                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      'text-2xl font-bold',
                      netPnl >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      pnlPercent >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {netPnl > 0 ? 'WIN' : netPnl < 0 ? 'LOSS' : 'BREAKEVEN'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
