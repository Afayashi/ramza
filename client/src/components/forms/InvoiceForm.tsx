/*
 * نموذج الفاتورة - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { FileText, DollarSign } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface InvoiceFormProps {
  invoice?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const INVOICE_TYPES = [
  { value: 'rent', label: 'إيجار' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'service', label: 'خدمات' },
  { value: 'penalty', label: 'غرامة' },
  { value: 'other', label: 'أخرى' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'sent', label: 'مرسلة' },
  { value: 'paid', label: 'مدفوعة' },
  { value: 'overdue', label: 'متأخرة' },
  { value: 'cancelled', label: 'ملغية' },
];

const defaultData = {
  invoiceNumber: '', invoiceType: 'rent', status: 'draft',
  tenantId: '', tenantName: '', propertyId: '', propertyName: '',
  issueDate: new Date().toISOString().split('T')[0], dueDate: '',
  amount: '', taxAmount: '', totalAmount: '', discount: '',
  description: '', notes: '',
};

export default function InvoiceForm({ invoice, isOpen, onClose, onSubmit }: InvoiceFormProps) {
  const [form, setForm] = useState<any>(invoice ? { ...defaultData, ...invoice } : { ...defaultData });
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
      title={invoice ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة'}
      icon={<FileText size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={invoice ? 'تحديث' : 'إنشاء'} size="md"
    >
      <FormSection title="بيانات الفاتورة" icon={<FileText size={14} />}>
        <FormRow cols={3}>
          <FormInput label="رقم الفاتورة" name="invoiceNumber" value={form.invoiceNumber} onChange={set} />
          <FormSelect label="نوع الفاتورة" name="invoiceType" value={form.invoiceType} onChange={set} options={INVOICE_TYPES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormRow>
          <FormSelect label="المستأجر" name="tenantId" value={form.tenantId} onChange={set} options={tenantOpts} required />
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} />
        </FormRow>
        <FormRow>
          <FormInput label="تاريخ الإصدار" name="issueDate" value={form.issueDate} onChange={set} type="date" required />
          <FormInput label="تاريخ الاستحقاق" name="dueDate" value={form.dueDate} onChange={set} type="date" required />
        </FormRow>
      </FormSection>

      <FormSection title="المبالغ" icon={<DollarSign size={14} />}>
        <FormRow cols={4}>
          <FormInput label="المبلغ" name="amount" value={form.amount} onChange={set} type="number" required />
          <FormInput label="الضريبة" name="taxAmount" value={form.taxAmount} onChange={set} type="number" />
          <FormInput label="الخصم" name="discount" value={form.discount} onChange={set} type="number" />
          <FormInput label="الإجمالي" name="totalAmount" value={form.totalAmount} onChange={set} type="number" />
        </FormRow>
      </FormSection>

      <FormTextarea label="الوصف" name="description" value={form.description} onChange={set} fullWidth />
      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
