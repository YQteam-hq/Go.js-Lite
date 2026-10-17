import { memo, useId, useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  max?: number;
  className?: string;
}

type Geometry =
  { kind: 'empty' } | { kind: 'single' } | { kind: 'series'; line: string; area: string };

export const Sparkline = memo(function Sparkline({
  data,
  color = 'text-accent',
  height = 48,
  max,
  className = '',
}: SparklineProps) {
  const gradId = useId();
  const W = 120;
  const H = height;
  const pad = 3;

  // The point/area geometry only depends on the data, height and the optional
  // fixed max, so it is memoized; the early-return branches stay pure renders.
  const geometry = useMemo<Geometry>(() => {
    if (!data || data.length === 0) return { kind: 'empty' };
    const values = data.map(v => (typeof v === 'number' && Number.isFinite(v) ? v : 0));
    if (values.length === 1) return { kind: 'single' };

    const min = Math.min(...values);
    const maxValue = max !== undefined && max > min ? max : Math.max(...values);
    const range = maxValue - min || 1;
    const stepX = W / (values.length - 1);
    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    const line = points.join(' ');
    const area = `0,${height} ${line} ${W},${height}`;
    return { kind: 'series', line, area };
  }, [data, height, max]);

  if (geometry.kind === 'empty') {
    return (
      <div
        style={{ height }}
        className={`flex items-center justify-center text-2xs text-fg-subtle ${className}`}
      >
        —
      </div>
    );
  }

  if (geometry.kind === 'single') {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ height }}
        className={`w-full ${color} ${className}`}
        aria-hidden="true"
      >
        <circle cx={W / 2} cy={H / 2} r={2.5} fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      className={`w-full ${color} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={geometry.area} fill={`url(#${gradId})`} />
      <polyline
        points={geometry.line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
});
