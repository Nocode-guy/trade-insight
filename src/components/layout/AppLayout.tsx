import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ImportModal } from '@/components/modals/ImportModal';
import { NewTradeModal } from '@/components/modals/NewTradeModal';

interface AppLayoutProps {
  children: React.ReactNode;
  onImport: (csvText: string) => number;
  onAddTrade: (trade: any) => void;
}

export function AppLayout({ children, onImport, onAddTrade }: AppLayoutProps) {
  const [showImport, setShowImport] = useState(false);
  const [showNewTrade, setShowNewTrade] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        onImportClick={() => setShowImport(true)}
        onNewTradeClick={() => setShowNewTrade(true)}
      />
      
      <main className="pl-[72px] lg:pl-[240px] transition-all duration-300">
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      <ImportModal
        open={showImport}
        onOpenChange={setShowImport}
        onImport={onImport}
      />
      
      <NewTradeModal
        open={showNewTrade}
        onOpenChange={setShowNewTrade}
        onSubmit={onAddTrade}
      />
    </div>
  );
}
