import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('stat-card animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              'text-2xl font-bold tracking-tight',
              trend === 'up' && 'text-profit',
              trend === 'down' && 'text-loss',
              trend === 'neutral' && 'text-foreground'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              trend === 'up' && 'bg-profit/10',
              trend === 'down' && 'bg-loss/10',
              trend === 'neutral' && 'bg-secondary'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                trend === 'up' && 'text-profit',
                trend === 'down' && 'text-loss',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
