/*
 * نموذج الدفعة - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { DollarSign, Calendar, CreditCard } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface PaymentFormProps {
  payment?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'check', label: 'شيك' },
  { value: 'card', label: 'بطاقة ائتمان' },
  { value: 'mada', label: 'مدى' },
  { value: 'sadad', label: 'سداد' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'مدفوع' },
  { value: 'pending', label: 'معلق' },
  { value: 'overdue', label: 'متأخر' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'partial', label: 'جزئي' },
];

const PAYMENT_TYPES = [
  { value: 'rent', label: 'إيجار' },
  { value: 'deposit', label: 'تأمين' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'service', label: 'خدمات' },
  { value: 'penalty', label: 'غرامة' },
  { value: 'other', label: 'أخرى' },
];

const defaultData = {
  tenantName: '', tenantId: '', propertyName: '', propertyId: '',
  unitNumber: '', unitId: '', leaseId: '',
  amount: '', paidAmount: '', remainingAmount: '',
  paymentType: 'rent', paymentMethod: 'bank_transfer', status: 'pending',
  dueDate: '', paymentDate: '', receiptNumber: '',
  checkNumber: '', bankName: '', transferReference: '',
  notes: '',
};

export default function PaymentForm({ payment, isOpen, onClose, onSubmit }: PaymentFormProps) {
  const [form, setForm] = useState<any>(payment ? { ...defaultData, ...payment } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        base44.entities.Tenant.list(),
        base44.entities.Property.list(),
      ]).then(([t, p]: any) => { setTenants(t); setProperties(p); }).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => {
    if (name === 'tenantId') {
      const t = tenants.find((x: any) => x.id === value);
      setForm((p: any) => ({ ...p, tenantId: value, tenantName: t?.name || '' }));
    } else if (name === 'propertyId') {
      const pr = properties.find((x: any) => x.id === value);
      setForm((p: any) => ({ ...p, propertyId: value, propertyName: pr?.name || '' }));
    } else {
      setForm((p: any) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const tenantOpts = tenants.map((t: any) => ({ value: t.id, label: t.name || t.id }));
  const propOpts = properties.map((p: any) => ({ value: p.id, label: p.name || p.id }));

  return (
    <FormModal
      title={payment ? 'تعديل الدفعة' : 'تسجيل دفعة جديدة'}
      icon={<DollarSign size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={payment ? 'تحديث' : 'تسجيل'} size="lg"
    >
      {/* بيانات الدفعة */}
      <FormSection title="بيانات الدفعة" icon={<DollarSign size={14} />}>
        <FormRow cols={3}>
          <FormSelect label="نوع الدفعة" name="paymentType" value={form.paymentType} onChange={set} options={PAYMENT_TYPES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
          <FormInput label="رقم الإيصال" name="receiptNumber" value={form.receiptNumber} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="المبلغ" name="amount" value={form.amount} onChange={set} type="number" required />
          <FormInput label="المبلغ المدفوع" name="paidAmount" value={form.paidAmount} onChange={set} type="number" />
          <FormInput label="المتبقي" name="remainingAmount" value={form.remainingAmount} onChange={set} type="number" />
        </FormRow>
      </FormSection>

      {/* التواريخ وطريقة الدفع */}
      <FormSection title="التواريخ وطريقة الدفع" icon={<Calendar size={14} />}>
        <FormRow cols={3}>
          <FormInput label="تاريخ الاستحقاق" name="dueDate" value={form.dueDate} onChange={set} type="date" required />
          <FormInput label="تاريخ الدفع" name="paymentDate" value={form.paymentDate} onChange={set} type="date" />
          <FormSelect label="طريقة الدفع" name="paymentMethod" value={form.paymentMethod} onChange={set} options={PAYMENT_METHODS} />
        </FormRow>
      </FormSection>

      {/* المستأجر والعقار */}
      <FormSection title="المستأجر والعقار" icon={<CreditCard size={14} />}>
        <FormRow>
          <FormSelect label="المستأجر" name="tenantId" value={form.tenantId} onChange={set} options={tenantOpts} />
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} />
        </FormRow>
        <FormRow>
          <FormInput label="رقم الوحدة" name="unitNumber" value={form.unitNumber} onChange={set} />
          <FormInput label="رقم العقد" name="leaseId" value={form.leaseId} onChange={set} />
        </FormRow>
      </FormSection>

      {/* بيانات بنكية */}
      <FormSection title="بيانات بنكية" icon={<CreditCard size={14} />} defaultOpen={false}>
        <FormRow cols={3}>
          <FormInput label="رقم الشيك" name="checkNumber" value={form.checkNumber} onChange={set} />
          <FormInput label="اسم البنك" name="bankName" value={form.bankName} onChange={set} />
          <FormInput label="مرجع التحويل" name="transferReference" value={form.transferReference} onChange={set} />
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
