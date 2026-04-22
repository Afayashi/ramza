/*
 * نموذج الشكوى - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface ComplaintFormProps {
  complaint?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const COMPLAINT_TYPES = [
  { value: 'noise', label: 'إزعاج' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'neighbor', label: 'جار' },
  { value: 'parking', label: 'مواقف' },
  { value: 'cleanliness', label: 'نظافة' },
  { value: 'security', label: 'أمن' },
  { value: 'service', label: 'خدمات' },
  { value: 'other', label: 'أخرى' },
];

const PRIORITIES = [
  { value: 'low', label: 'منخفضة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'high', label: 'عالية' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'مفتوحة' },
  { value: 'in_progress', label: 'قيد المعالجة' },
  { value: 'resolved', label: 'تم الحل' },
  { value: 'closed', label: 'مغلقة' },
];

const defaultData = {
  subject: '', complaintType: 'other', priority: 'medium', status: 'open',
  tenantId: '', tenantName: '', propertyId: '', unitId: '',
  date: new Date().toISOString().split('T')[0],
  description: '', resolution: '', notes: '',
};

export default function ComplaintForm({ complaint, isOpen, onClose, onSubmit }: ComplaintFormProps) {
  const [form, setForm] = useState<any>(complaint ? { ...defaultData, ...complaint } : { ...defaultData });
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

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const tenantOpts = tenants.map((t: any) => ({ value: t.id, label: t.name || t.id }));
  const propOpts = properties.map((p: any) => ({ value: p.id, label: p.name || p.id }));

  return (
    <FormModal
      title={complaint ? 'تعديل الشكوى' : 'تسجيل شكوى جديدة'}
      icon={<MessageSquare size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={complaint ? 'تحديث' : 'تسجيل'} size="md"
    >
      <FormSection title="بيانات الشكوى" icon={<MessageSquare size={14} />}>
        <FormRow>
          <FormInput label="الموضوع" name="subject" value={form.subject} onChange={set} required />
          <FormSelect label="النوع" name="complaintType" value={form.complaintType} onChange={set} options={COMPLAINT_TYPES} />
        </FormRow>
        <FormRow cols={3}>
          <FormSelect label="الأولوية" name="priority" value={form.priority} onChange={set} options={PRIORITIES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
          <FormInput label="التاريخ" name="date" value={form.date} onChange={set} type="date" />
        </FormRow>
        <FormTextarea label="الوصف" name="description" value={form.description} onChange={set} fullWidth required />
      </FormSection>

      <FormSection title="المقدم والموقع" icon={<AlertTriangle size={14} />}>
        <FormRow>
          <FormSelect label="المستأجر" name="tenantId" value={form.tenantId} onChange={set} options={tenantOpts} />
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} />
        </FormRow>
      </FormSection>

      {form.status === 'resolved' || form.status === 'closed' ? (
        <FormTextarea label="الحل" name="resolution" value={form.resolution} onChange={set} fullWidth />
      ) : null}

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
