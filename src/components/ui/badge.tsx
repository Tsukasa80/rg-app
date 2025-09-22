import { cn } from '../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'positive' | 'negative';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variants: Record<Required<BadgeProps>['variant'], string> = {
    default: 'bg-slate-800 text-slate-100',
    outline: 'border border-slate-700 text-slate-200',
    positive: 'bg-green-500/20 text-green-200',
    negative: 'bg-red-500/20 text-red-200'
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
