/*
 * نموذج الوحدة - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { Home, FileText, Settings } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface UnitFormProps {
  unit?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const UNIT_TYPES = [
  { value: 'apartment', label: 'شقة' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل' },
  { value: 'warehouse', label: 'مستودع' },
  { value: 'villa', label: 'فيلا' },
  { value: 'studio', label: 'استوديو' },
  { value: 'room', label: 'غرفة' },
  { value: 'parking', label: 'موقف' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'متاحة' },
  { value: 'occupied', label: 'مؤجرة' },
  { value: 'reserved', label: 'محجوزة' },
  { value: 'maintenance', label: 'صيانة' },
];

const FURNISHING = [
  { value: 'furnished', label: 'مفروشة' },
  { value: 'semi_furnished', label: 'نصف مفروشة' },
  { value: 'unfurnished', label: 'غير مفروشة' },
];

const defaultData = {
  propertyId: '', propertyName: '', unitNumber: '', status: 'available',
  unitType: '', area: '', furnishingStatus: 'unfurnished',
  amenities: '', unitServices: '', deedNumber: '',
  region: '', city: '', notes: '',
};

export default function UnitForm({ unit, isOpen, onClose, onSubmit }: UnitFormProps) {
  const [form, setForm] = useState<any>(unit ? { ...defaultData, ...unit } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      base44.entities.Property.list().then((data: any) => setProperties(data)).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => {
    if (name === 'propertyId') {
      const prop = properties.find((p: any) => p.id === value);
      setForm((p: any) => ({ ...p, propertyId: value, propertyName: prop?.name || '', deedNumber: prop?.deedNumber || '' }));
    } else {
      setForm((p: any) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const propertyOptions = properties.map((p: any) => ({ value: p.id, label: p.name || `عقار ${p.id}` }));

  return (
    <FormModal
      title={unit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
      icon={<Home size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={unit ? 'تحديث' : 'إضافة'} size="md"
    >
      <FormSection title="البيانات الأساسية" icon={<Home size={14} />}>
        <FormRow>
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propertyOptions} required />
          <FormInput label="رقم الوحدة" name="unitNumber" value={form.unitNumber} onChange={set} required />
        </FormRow>
        <FormRow>
          <FormSelect label="نوع الوحدة" name="unitType" value={form.unitType} onChange={set} options={UNIT_TYPES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormRow>
          <FormInput label="المساحة (م²)" name="area" value={form.area} onChange={set} type="number" />
          <FormSelect label="التأثيث" name="furnishingStatus" value={form.furnishingStatus} onChange={set} options={FURNISHING} />
        </FormRow>
      </FormSection>

      <FormSection title="تفاصيل إضافية" icon={<Settings size={14} />} defaultOpen={false}>
        <FormRow>
          <FormInput label="الخدمات" name="unitServices" value={form.unitServices} onChange={set} />
          <FormInput label="المرافق" name="amenities" value={form.amenities} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="المنطقة" name="region" value={form.region} onChange={set} />
          <FormInput label="المدينة" name="city" value={form.city} onChange={set} />
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
