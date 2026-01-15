import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  LineChart,
  BookOpen,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onImportClick: () => void;
  onNewTradeClick: () => void;
}

const navItems = [
  { path: '/gex', icon: Zap, label: 'GEX Dashboard' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/trades', icon: LineChart, label: 'Trades' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/account', icon: User, label: 'Account' },
];

export function Sidebar({ onImportClick, onNewTradeClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-foreground">TradeLog</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'nav-item',
                isActive && 'nav-item-active',
                collapsed && 'justify-center px-0'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Actions */}
      <div className="px-3 py-4 space-y-2 border-t border-sidebar-border">
        <Button
          onClick={onNewTradeClick}
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50',
            collapsed && 'justify-center px-0'
          )}
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span>New Trade</span>}
        </Button>
        
        <Button
          onClick={onImportClick}
          className={cn(
            'w-full gap-3 bg-primary hover:bg-primary/90',
            collapsed && 'px-0'
          )}
        >
          <Upload className="w-5 h-5" />
          {!collapsed && <span>Import Trades</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
