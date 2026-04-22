/*
 * مكون النافذة المنبثقة للنماذج - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL, متجاوب مع الجوال
 */
import { ReactNode, FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormModalProps {
  title: string;
  icon?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  loading?: boolean;
  submitLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
};

export default function FormModal({
  title, icon, isOpen, onClose, onSubmit, children,
  loading = false, submitLabel = 'حفظ', size = 'md'
}: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" dir="rtl">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={cn(
        'relative w-full bg-card border border-border rounded-xl shadow-2xl flex flex-col',
        'max-h-[95vh] sm:max-h-[92vh]',
        sizeMap[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0 bg-sidebar rounded-t-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                {icon}
              </div>
            )}
            <h2 className="text-sm sm:text-base font-bold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-border shrink-0 bg-sidebar/50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs sm:text-sm">
              إلغاء
            </Button>
            <Button type="submit" disabled={loading} className="text-xs sm:text-sm bg-[#C8A951] hover:bg-[#b89841] text-black">
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin ml-1" />
                  جاري الحفظ...
                </>
              ) : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
