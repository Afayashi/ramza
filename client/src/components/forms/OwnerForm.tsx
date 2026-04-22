/*
 * نموذج المالك - رمز الإبداع
 */
import { useState, FormEvent } from 'react';
import { User, Phone, MapPin } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';

interface OwnerFormProps {
  owner?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const OWNER_TYPES = [
  { value: 'individual', label: 'فرد' },
  { value: 'company', label: 'شركة' },
  { value: 'government', label: 'جهة حكومية' },
];

const defaultData = {
  name: '', idNumber: '', nationality: 'سعودي', ownerType: 'individual',
  phone: '', email: '', address: '', city: '',
  bankName: '', iban: '', accountName: '',
  commercialReg: '', taxNumber: '',
  notes: '',
};

export default function OwnerForm({ owner, isOpen, onClose, onSubmit }: OwnerFormProps) {
  const [form, setForm] = useState<any>(owner ? { ...defaultData, ...owner } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <FormModal
      title={owner ? 'تعديل المالك' : 'إضافة مالك جديد'}
      icon={<User size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={owner ? 'تحديث' : 'إضافة'} size="md"
    >
      <FormSection title="البيانات الشخصية" icon={<User size={14} />}>
        <FormRow>
          <FormInput label="الاسم الكامل" name="name" value={form.name} onChange={set} required />
          <FormInput label="رقم الهوية" name="idNumber" value={form.idNumber} onChange={set} required />
        </FormRow>
        <FormRow>
          <FormSelect label="نوع المالك" name="ownerType" value={form.ownerType} onChange={set} options={OWNER_TYPES} />
          <FormInput label="الجنسية" name="nationality" value={form.nationality} onChange={set} />
        </FormRow>
      </FormSection>

      <FormSection title="التواصل" icon={<Phone size={14} />}>
        <FormRow>
          <FormInput label="الجوال" name="phone" value={form.phone} onChange={set} />
          <FormInput label="البريد الإلكتروني" name="email" value={form.email} onChange={set} type="email" />
        </FormRow>
        <FormRow>
          <FormInput label="المدينة" name="city" value={form.city} onChange={set} />
          <FormInput label="العنوان" name="address" value={form.address} onChange={set} />
        </FormRow>
      </FormSection>

      <FormSection title="البيانات البنكية" icon={<MapPin size={14} />} defaultOpen={false}>
        <FormRow>
          <FormInput label="اسم البنك" name="bankName" value={form.bankName} onChange={set} />
          <FormInput label="رقم الآيبان" name="iban" value={form.iban} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="اسم الحساب" name="accountName" value={form.accountName} onChange={set} />
          <FormInput label="السجل التجاري" name="commercialReg" value={form.commercialReg} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="الرقم الضريبي" name="taxNumber" value={form.taxNumber} onChange={set} />
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
