import { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trade } from '@/types/trade';
import { formatCurrency } from '@/lib/tradeUtils';
import { cn } from '@/lib/utils';

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood?: 'good' | 'neutral' | 'bad';
}

interface JournalPageProps {
  trades: Trade[];
}

export function JournalPage({ trades }: JournalPageProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: new Date(),
      content: 'Great trading day today. Stuck to my rules and avoided revenge trading after the first loss. The NVDA breakout setup was textbook.',
      mood: 'good',
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000),
      content: 'Struggled with patience today. Entered AAPL too early before confirmation. Need to wait for the setup to come to me.',
      mood: 'bad',
    },
  ]);
  const [newEntry, setNewEntry] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    
    setEntries([
      {
        id: Date.now().toString(),
        date: new Date(),
        content: newEntry,
        mood: 'neutral',
      },
      ...entries,
    ]);
    setNewEntry('');
    setIsWriting(false);
  };

  // Get today's trades summary
  const todayTrades = trades.filter(
    (t) => format(t.dateClose, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const todayPnl = todayTrades.reduce((sum, t) => sum + t.netPnl, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Journal</h1>
        <Button onClick={() => setIsWriting(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Today's summary */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium text-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Today's P&L</p>
            <p className={cn('text-2xl font-bold', todayPnl >= 0 ? 'text-profit' : 'text-loss')}>
              {formatCurrency(todayPnl)}
            </p>
          </div>
          <div className="text-center p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Trades</p>
            <p className="text-2xl font-bold text-foreground">{todayTrades.length}</p>
          </div>
          <div className="text-center p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-foreground">
              {todayTrades.length > 0
                ? Math.round((todayTrades.filter((t) => t.outcome === 'WIN').length / todayTrades.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* New entry form */}
      {isWriting && (
        <div className="bg-card rounded-xl border border-border/50 p-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">New Journal Entry</h3>
          <Textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="What did you learn today? What went well? What could you improve?"
            rows={6}
            className="bg-secondary/50 border-border resize-none mb-4"
          />
          <div className="flex gap-3">
            <Button onClick={addEntry}>Save Entry</Button>
            <Button variant="outline" onClick={() => setIsWriting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Journal entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  entry.mood === 'good' && 'bg-profit',
                  entry.mood === 'bad' && 'bg-loss',
                  entry.mood === 'neutral' && 'bg-muted-foreground'
                )}
              />
              <span className="text-sm text-muted-foreground">
                {format(entry.date, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 && !isWriting && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No journal entries yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start documenting your trading journey
          </p>
        </div>
      )}
    </div>
  );
}
