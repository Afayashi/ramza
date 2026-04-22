/*
 * نموذج الوثيقة - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { FolderOpen, Calendar } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface DocumentFormProps {
  document?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const DOC_TYPES = [
  { value: 'contract', label: 'عقد' },
  { value: 'deed', label: 'صك ملكية' },
  { value: 'invoice', label: 'فاتورة' },
  { value: 'receipt', label: 'إيصال' },
  { value: 'id_copy', label: 'صورة هوية' },
  { value: 'license', label: 'رخصة' },
  { value: 'report', label: 'تقرير' },
  { value: 'letter', label: 'خطاب' },
  { value: 'other', label: 'أخرى' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'expired', label: 'منتهي' },
  { value: 'archived', label: 'مؤرشف' },
];

const defaultData = {
  title: '', documentType: 'other', status: 'active',
  propertyId: '', tenantId: '',
  issueDate: '', expiryDate: '', referenceNumber: '',
  fileUrl: '', description: '', notes: '',
};

export default function DocumentForm({ document, isOpen, onClose, onSubmit }: DocumentFormProps) {
  const [form, setForm] = useState<any>(document ? { ...defaultData, ...document } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        base44.entities.Property.list(),
        base44.entities.Tenant.list(),
      ]).then(([p, t]: any) => { setProperties(p); setTenants(t); }).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const propOpts = properties.map((p: any) => ({ value: p.id, label: p.name || p.id }));
  const tenantOpts = tenants.map((t: any) => ({ value: t.id, label: t.name || t.id }));

  return (
    <FormModal
      title={document ? 'تعديل الوثيقة' : 'إضافة وثيقة جديدة'}
      icon={<FolderOpen size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={document ? 'تحديث' : 'إضافة'} size="md"
    >
      <FormSection title="بيانات الوثيقة" icon={<FolderOpen size={14} />}>
        <FormRow>
          <FormInput label="عنوان الوثيقة" name="title" value={form.title} onChange={set} required />
          <FormSelect label="نوع الوثيقة" name="documentType" value={form.documentType} onChange={set} options={DOC_TYPES} />
        </FormRow>
        <FormRow>
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
          <FormInput label="الرقم المرجعي" name="referenceNumber" value={form.referenceNumber} onChange={set} />
        </FormRow>
      </FormSection>

      <FormSection title="الربط" icon={<Calendar size={14} />}>
        <FormRow>
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} />
          <FormSelect label="المستأجر" name="tenantId" value={form.tenantId} onChange={set} options={tenantOpts} />
        </FormRow>
        <FormRow>
          <FormInput label="تاريخ الإصدار" name="issueDate" value={form.issueDate} onChange={set} type="date" />
          <FormInput label="تاريخ الانتهاء" name="expiryDate" value={form.expiryDate} onChange={set} type="date" />
        </FormRow>
        <FormRow>
          <FormInput label="رابط الملف" name="fileUrl" value={form.fileUrl} onChange={set} fullWidth placeholder="أدخل رابط الملف أو ارفعه لاحقاً" />
        </FormRow>
      </FormSection>

      <FormTextarea label="الوصف" name="description" value={form.description} onChange={set} fullWidth />
      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
