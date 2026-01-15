import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { TradesPage } from '@/pages/Trades';
import { CalendarPage } from '@/pages/CalendarPage';
import { ReportsPage } from '@/pages/Reports';
import { JournalPage } from '@/pages/Journal';
import { GexDashboardPage } from '@/pages/GexDashboard';
import { AccountPage } from '@/pages/Account';
import { useTrades } from '@/hooks/useTrades';

const Index = () => {
  const {
    trades,
    dailyStats,
    tickerStats,
    overallStats,
    dateRange,
    setDateRange,
    customDateRange,
    setCustomDateRange,
    addTrade,
    importTrades,
    deleteTrade,
  } = useTrades();

  return (
    <AppLayout onImport={importTrades} onAddTrade={addTrade}>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              trades={trades}
              dailyStats={dailyStats}
              tickerStats={tickerStats}
              overallStats={overallStats}
              dateRange={dateRange}
              setDateRange={setDateRange}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
            />
          }
        />
        <Route path="/calendar" element={<CalendarPage dailyStats={dailyStats} trades={trades} />} />
        <Route path="/reports" element={<ReportsPage trades={trades} />} />
        <Route path="/trades" element={<TradesPage trades={trades} onDelete={deleteTrade} />} />
        <Route path="/journal" element={<JournalPage trades={trades} />} />
        <Route path="/gex" element={<GexDashboardPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default Index;
