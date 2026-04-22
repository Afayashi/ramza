/*
 * بطاقة الإحصائيات - رمز الإبداع
 * تعرض رقم إحصائي مع أيقونة ونسبة تغيير
 */
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, change, changeLabel, className }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-4 card-hover',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon size={20} className="text-primary" />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            isPositive ? 'bg-green-500/10 text-green-400' : '',
            isNegative ? 'bg-red-500/10 text-red-400' : '',
            !isPositive && !isNegative ? 'bg-muted text-muted-foreground' : ''
          )}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-foreground mb-1">
        {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
      </p>
      <p className="text-xs text-muted-foreground">{title}</p>
      {changeLabel && (
        <p className="text-[10px] text-muted-foreground/70 mt-1">{changeLabel}</p>
      )}
    </div>
  );
}
