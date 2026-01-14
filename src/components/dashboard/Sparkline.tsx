import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color: 'profit' | 'loss';
  width?: number;
  height?: number;
}

export function Sparkline({ data, color, width = 96, height = 48 }: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <path
        d={path}
        className={color === 'profit' ? 'sparkline-profit' : 'sparkline-loss'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
