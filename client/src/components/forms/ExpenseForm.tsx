/*
 * نموذج المصروفات - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { Receipt, Calendar } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea, FormCheckbox } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface ExpenseFormProps {
  expense?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CATEGORIES = [
  { value: 'electricity', label: 'كهرباء' },
  { value: 'water', label: 'مياه' },
  { value: 'maintenance', label: 'صيانة دورية' },
  { value: 'taxes', label: 'ضرائب ورسوم' },
  { value: 'government_fees', label: 'رسوم حكومية' },
  { value: 'insurance', label: 'تأمين' },
  { value: 'cleaning', label: 'نظافة' },
  { value: 'security', label: 'أمن وحراسة' },
  { value: 'management', label: 'إدارة' },
  { value: 'repairs', label: 'إصلاحات' },
  { value: 'other', label: 'أخرى' },
];

const PAY_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'check', label: 'شيك' },
  { value: 'card', label: 'بطاقة' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'مدفوع' },
  { value: 'pending', label: 'معلق' },
  { value: 'cancelled', label: 'ملغي' },
];

const RECURRING_PERIODS = [
  { value: 'monthly', label: 'شهري' },
  { value: 'quarterly', label: 'ربع سنوي' },
  { value: 'yearly', label: 'سنوي' },
];

const defaultData = {
  title: '', category: 'electricity', amount: '',
  date: new Date().toISOString().split('T')[0],
  propertyId: '', vendor: '', invoiceNumber: '',
  paymentMethod: 'bank_transfer', status: 'paid',
  isRecurring: false, recurringPeriod: 'monthly',
  notes: '',
};

export default function ExpenseForm({ expense, isOpen, onClose, onSubmit }: ExpenseFormProps) {
  const [form, setForm] = useState<any>(expense ? { ...defaultData, ...expense } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      base44.entities.Property.list().then((data: any) => setProperties(data)).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const propOpts = properties.map((p: any) => ({ value: p.id, label: p.name || p.id }));

  return (
    <FormModal
      title={expense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
      icon={<Receipt size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={expense ? 'تحديث' : 'إضافة'} size="md"
    >
      <FormSection title="بيانات المصروف" icon={<Receipt size={14} />}>
        <FormRow>
          <FormInput label="العنوان" name="title" value={form.title} onChange={set} required />
          <FormSelect label="التصنيف" name="category" value={form.category} onChange={set} options={CATEGORIES} required />
        </FormRow>
        <FormRow>
          <FormInput label="المبلغ (ر.س)" name="amount" value={form.amount} onChange={set} type="number" required />
          <FormInput label="التاريخ" name="date" value={form.date} onChange={set} type="date" required />
        </FormRow>
        <FormRow>
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} required />
          <FormInput label="المورد" name="vendor" value={form.vendor} onChange={set} />
        </FormRow>
      </FormSection>

      <FormSection title="بيانات الدفع" icon={<Calendar size={14} />}>
        <FormRow cols={3}>
          <FormInput label="رقم الفاتورة" name="invoiceNumber" value={form.invoiceNumber} onChange={set} />
          <FormSelect label="طريقة الدفع" name="paymentMethod" value={form.paymentMethod} onChange={set} options={PAY_METHODS} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormRow>
          <FormCheckbox label="مصروف متكرر" name="isRecurring" checked={form.isRecurring} onChange={set} />
          {form.isRecurring && (
            <FormSelect label="فترة التكرار" name="recurringPeriod" value={form.recurringPeriod} onChange={set} options={RECURRING_PERIODS} />
          )}
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
