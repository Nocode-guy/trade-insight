import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  displayValue: string;
  size?: number;
}

export function GaugeChart({ value, max = 3, label, displayValue, size = 120 }: GaugeChartProps) {
  const percentage = Math.min(value / max, 1);
  const isGood = value >= 1;
  
  const { strokeDasharray, strokeDashoffset } = useMemo(() => {
    const radius = (size - 16) / 2;
    const circumference = radius * Math.PI; // Half circle
    const offset = circumference * (1 - percentage);
    return {
      strokeDasharray: circumference,
      strokeDashoffset: offset,
    };
  }, [size, percentage]);

  const radius = (size - 16) / 2;
  const center = size / 2;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      
      <div className="flex flex-col items-center">
        <svg width={size} height={size / 2 + 10} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke={isGood ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out',
              transformOrigin: 'center',
            }}
          />
          
          {/* Indicator dot */}
          <circle
            cx={center - radius + (2 * radius * percentage)}
            cy={center - Math.sin(Math.PI * percentage) * radius}
            r="6"
            fill="hsl(var(--foreground))"
            className="drop-shadow-lg"
          />
        </svg>
        
        <p className="text-3xl font-bold text-foreground -mt-2">{displayValue}</p>
      </div>
    </div>
  );
}
