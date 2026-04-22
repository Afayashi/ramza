/*
 * مكونات حقول النماذج المشتركة - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 */
import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ====== FormSection: قسم قابل للطي ======
interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function FormSection({ title, icon, children, defaultOpen = true, className }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 bg-sidebar/50 text-right hover:bg-sidebar/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#C8A951]">{icon}</span>}
          <span className="font-bold text-xs text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-3 sm:p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ====== FormRow: صف من الحقول ======
interface FormRowProps {
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export function FormRow({ cols = 2, children, className }: FormRowProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return <div className={cn('grid gap-3', colsClass[cols], className)}>{children}</div>;
}

// ====== FormInput: حقل إدخال نصي ======
interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function FormInput({
  label, name, value, onChange, type = 'text',
  required = false, placeholder, disabled = false, className, fullWidth
}: FormInputProps) {
  return (
    <div className={cn(fullWidth && 'sm:col-span-2 lg:col-span-3', className)}>
      <label className="block text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-input bg-background',
          'text-foreground placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-2 focus:ring-[#C8A951]/40 focus:border-[#C8A951]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
      />
    </div>
  );
}

// ====== FormSelect: قائمة منسدلة ======
interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function FormSelect({
  label, name, value, onChange, options,
  required = false, placeholder = 'اختر...', disabled = false, className, fullWidth
}: FormSelectProps) {
  return (
    <div className={cn(fullWidth && 'sm:col-span-2 lg:col-span-3', className)}>
      <label className="block text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-input bg-background',
          'text-foreground appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-[#C8A951]/40 focus:border-[#C8A951]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ====== FormTextarea: حقل نص متعدد الأسطر ======
interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
}

export function FormTextarea({
  label, name, value, onChange, rows = 3,
  required = false, placeholder, className, fullWidth
}: FormTextareaProps) {
  return (
    <div className={cn(fullWidth && 'sm:col-span-2 lg:col-span-3', className)}>
      <label className="block text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-input bg-background',
          'text-foreground placeholder:text-muted-foreground/50 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[#C8A951]/40 focus:border-[#C8A951]',
          'transition-colors'
        )}
      />
    </div>
  );
}

// ====== FormCheckbox: مربع اختيار ======
interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (name: string, value: boolean) => void;
  className?: string;
}

export function FormCheckbox({ label, name, checked, onChange, className }: FormCheckboxProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <input
        type="checkbox"
        name={name}
        checked={checked ?? false}
        onChange={(e) => onChange(name, e.target.checked)}
        className="w-4 h-4 rounded border-input text-[#C8A951] focus:ring-[#C8A951]/40"
      />
      <span className="text-xs sm:text-sm text-foreground">{label}</span>
    </label>
  );
}
