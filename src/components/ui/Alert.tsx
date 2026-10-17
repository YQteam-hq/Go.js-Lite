import type { HTMLAttributes } from 'react';

type AlertVariant = 'default' | 'destructive' | 'warning' | 'success';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantStyles: Record<AlertVariant, string> = {
  default: 'bg-info-soft border-info/30 text-fg',
  destructive: 'bg-danger-soft border-danger/30 text-fg',
  warning: 'bg-warning-soft border-warning/30 text-fg',
  success: 'bg-success-soft border-success/30 text-fg'
};

export function Alert({ variant = 'default', className = '', children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}
