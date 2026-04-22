/*
 * نموذج الصيانة - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { Wrench, Calendar, AlertTriangle } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface MaintenanceFormProps {
  maintenance?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CATEGORIES = [
  { value: 'plumbing', label: 'سباكة' },
  { value: 'electrical', label: 'كهرباء' },
  { value: 'ac', label: 'تكييف' },
  { value: 'painting', label: 'دهان' },
  { value: 'carpentry', label: 'نجارة' },
  { value: 'cleaning', label: 'نظافة' },
  { value: 'elevator', label: 'مصاعد' },
  { value: 'structural', label: 'إنشائي' },
  { value: 'other', label: 'أخرى' },
];

const PRIORITIES = [
  { value: 'low', label: 'منخفضة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'high', label: 'عالية' },
  { value: 'urgent', label: 'عاجلة' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

const defaultData = {
  title: '', description: '', unitId: '', propertyId: '',
  category: 'other', priority: 'medium', status: 'pending',
  requestDate: new Date().toISOString().split('T')[0],
  completionDate: '', cost: '', contractor: '',
  tenantName: '', tenantPhone: '', notes: '',
};

export default function MaintenanceForm({ maintenance, isOpen, onClose, onSubmit }: MaintenanceFormProps) {
  const [form, setForm] = useState<any>(maintenance ? { ...defaultData, ...maintenance } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        base44.entities.Unit.list(),
        base44.entities.Property.list(),
      ]).then(([u, p]: any) => { setUnits(u); setProperties(p); }).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const unitOpts = units.map((u: any) => ({ value: u.id, label: `${u.unitNumber || u.id} - ${u.propertyName || ''}` }));
  const propOpts = properties.map((p: any) => ({ value: p.id, label: p.name || p.id }));

  return (
    <FormModal
      title={maintenance ? 'تعديل طلب الصيانة' : 'طلب صيانة جديد'}
      icon={<Wrench size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={maintenance ? 'تحديث' : 'إنشاء'} size="md"
    >
      <FormSection title="بيانات الطلب" icon={<Wrench size={14} />}>
        <FormRow>
          <FormInput label="عنوان الطلب" name="title" value={form.title} onChange={set} required />
          <FormSelect label="التصنيف" name="category" value={form.category} onChange={set} options={CATEGORIES} />
        </FormRow>
        <FormRow>
          <FormSelect label="الأولوية" name="priority" value={form.priority} onChange={set} options={PRIORITIES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormTextarea label="الوصف" name="description" value={form.description} onChange={set} fullWidth rows={3} />
      </FormSection>

      <FormSection title="الموقع" icon={<AlertTriangle size={14} />}>
        <FormRow>
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} />
          <FormSelect label="الوحدة" name="unitId" value={form.unitId} onChange={set} options={unitOpts} />
        </FormRow>
        <FormRow>
          <FormInput label="اسم المستأجر" name="tenantName" value={form.tenantName} onChange={set} />
          <FormInput label="هاتف المستأجر" name="tenantPhone" value={form.tenantPhone} onChange={set} />
        </FormRow>
      </FormSection>

      <FormSection title="التنفيذ" icon={<Calendar size={14} />}>
        <FormRow cols={3}>
          <FormInput label="تاريخ الطلب" name="requestDate" value={form.requestDate} onChange={set} type="date" />
          <FormInput label="تاريخ الإنجاز" name="completionDate" value={form.completionDate} onChange={set} type="date" />
          <FormInput label="التكلفة (ر.س)" name="cost" value={form.cost} onChange={set} type="number" />
        </FormRow>
        <FormRow>
          <FormInput label="المقاول / الفني" name="contractor" value={form.contractor} onChange={set} />
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
