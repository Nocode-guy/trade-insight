interface WinLossRingProps {
  wins: number;
  losses: number;
  label: string;
  size?: number;
}

export function WinLossRing({ wins, losses, label, size = 100 }: WinLossRingProps) {
  const total = wins + losses || 1;
  const winPercent = wins / total;
  const lossPercent = losses / total;

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const winDash = circumference * winPercent;
  const lossDash = circumference * lossPercent;
  const gap = 4;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      
      <div className="flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Win segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--profit))"
            strokeWidth="10"
            strokeDasharray={`${winDash - gap} ${circumference - winDash + gap}`}
            strokeLinecap="round"
          />
          
          {/* Loss segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--loss))"
            strokeWidth="10"
            strokeDasharray={`${lossDash - gap} ${circumference - lossDash + gap}`}
            strokeDashoffset={-winDash}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">
            {((wins / total) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-profit" />
          <span className="text-xs text-muted-foreground">{wins}W</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-loss" />
          <span className="text-xs text-muted-foreground">{losses}L</span>
        </div>
      </div>
    </div>
  );
}
