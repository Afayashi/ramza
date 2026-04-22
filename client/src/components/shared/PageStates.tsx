/*
 * حالات الصفحة - رمز الإبداع
 * مكونات التحميل والحالة الفارغة والخطأ
 */
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingState({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'لا توجد بيانات',
  description,
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663078821712/Zm2JEbmeVFTJRp6HMZVTym/empty-state-Sq3NBpCqRd537bzdY2kFzF.webp"
        alt="فارغ"
        className="w-28 h-28 mb-4 opacity-40"
      />
      <h3 className="font-heading text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          <Plus size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message = 'حدث خطأ أثناء تحميل البيانات',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle size={40} className="text-destructive mb-4" />
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
