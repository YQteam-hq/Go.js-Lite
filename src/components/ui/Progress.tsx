import { memo, type HTMLAttributes } from 'react';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const Progress = memo(function Progress({
  value = 0,
  max = 100,
  className = '',
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuetext={`${Math.round(percentage)}%`}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-bg-sunken ${className}`}
      {...props}
    >
      <div className="h-full bg-accent transition-all" style={{ width: `${percentage}%` }} />
    </div>
  );
});
