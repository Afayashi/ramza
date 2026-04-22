/*
 * نموذج المستأجر - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { User, Phone, MapPin, Briefcase } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface TenantFormProps {
  tenant?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const ID_TYPES = [
  { value: 'national_id', label: 'هوية وطنية' },
  { value: 'iqama', label: 'إقامة' },
  { value: 'passport', label: 'جواز سفر' },
  { value: 'commercial_reg', label: 'سجل تجاري' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'blacklisted', label: 'محظور' },
];

const defaultData = {
  name: '', idType: 'national_id', nationalId: '', nationality: 'سعودي',
  phone: '', email: '', emergencyContact: '', emergencyPhone: '',
  city: '', district: '', address: '',
  employer: '', jobTitle: '', workPhone: '',
  unitId: '', moveInDate: '', moveOutDate: '',
  status: 'active', notes: '',
};

export default function TenantForm({ tenant, isOpen, onClose, onSubmit }: TenantFormProps) {
  const [form, setForm] = useState<any>(tenant ? { ...defaultData, ...tenant } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      base44.entities.Unit.list().then((data: any) => setUnits(data)).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const unitOptions = units.map((u: any) => ({
    value: u.id,
    label: `${u.unitNumber || u.id} - ${u.propertyName || ''}`.trim()
  }));

  return (
    <FormModal
      title={tenant ? 'تعديل المستأجر' : 'إضافة مستأجر جديد'}
      icon={<User size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={tenant ? 'تحديث' : 'إضافة'} size="lg"
    >
      {/* البيانات الشخصية */}
      <FormSection title="البيانات الشخصية" icon={<User size={14} />}>
        <FormRow>
          <FormInput label="الاسم الكامل" name="name" value={form.name} onChange={set} required />
          <FormSelect label="نوع الهوية" name="idType" value={form.idType} onChange={set} options={ID_TYPES} />
        </FormRow>
        <FormRow>
          <FormInput label="رقم الهوية" name="nationalId" value={form.nationalId} onChange={set} required />
          <FormInput label="الجنسية" name="nationality" value={form.nationality} onChange={set} />
        </FormRow>
        <FormRow>
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
      </FormSection>

      {/* التواصل */}
      <FormSection title="التواصل" icon={<Phone size={14} />}>
        <FormRow>
          <FormInput label="الجوال" name="phone" value={form.phone} onChange={set} required />
          <FormInput label="البريد الإلكتروني" name="email" value={form.email} onChange={set} type="email" />
        </FormRow>
        <FormRow>
          <FormInput label="جهة اتصال الطوارئ" name="emergencyContact" value={form.emergencyContact} onChange={set} />
          <FormInput label="هاتف الطوارئ" name="emergencyPhone" value={form.emergencyPhone} onChange={set} />
        </FormRow>
      </FormSection>

      {/* العنوان */}
      <FormSection title="العنوان" icon={<MapPin size={14} />} defaultOpen={false}>
        <FormRow cols={3}>
          <FormInput label="المدينة" name="city" value={form.city} onChange={set} />
          <FormInput label="الحي" name="district" value={form.district} onChange={set} />
          <FormInput label="العنوان" name="address" value={form.address} onChange={set} />
        </FormRow>
      </FormSection>

      {/* العمل */}
      <FormSection title="بيانات العمل" icon={<Briefcase size={14} />} defaultOpen={false}>
        <FormRow cols={3}>
          <FormInput label="جهة العمل" name="employer" value={form.employer} onChange={set} />
          <FormInput label="المسمى الوظيفي" name="jobTitle" value={form.jobTitle} onChange={set} />
          <FormInput label="هاتف العمل" name="workPhone" value={form.workPhone} onChange={set} />
        </FormRow>
      </FormSection>

      {/* الوحدة */}
      <FormSection title="بيانات السكن" icon={<MapPin size={14} />} defaultOpen={false}>
        <FormRow>
          <FormSelect label="الوحدة" name="unitId" value={form.unitId} onChange={set} options={unitOptions} />
          <FormInput label="تاريخ الدخول" name="moveInDate" value={form.moveInDate} onChange={set} type="date" />
        </FormRow>
        <FormRow>
          <FormInput label="تاريخ الخروج" name="moveOutDate" value={form.moveOutDate} onChange={set} type="date" />
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
