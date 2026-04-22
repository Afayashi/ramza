/*
 * نموذج العقار - رمز الإبداع
 * يدعم الإضافة والتعديل مع أقسام قابلة للطي
 */
import { useState, FormEvent } from 'react';
import { Building2, MapPin, FileText, User, Settings } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';

interface PropertyFormProps {
  property?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const PROPERTY_TYPES = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'land', label: 'أرض' },
  { value: 'industrial', label: 'صناعي' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'sold', label: 'مباع' },
  { value: 'under_construction', label: 'تحت الإنشاء' },
];

const DEED_TYPES = [
  { value: 'electronic', label: 'إلكتروني' },
  { value: 'paper', label: 'ورقي' },
];

const USAGE_TYPES = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'office', label: 'مكتبي' },
  { value: 'mixed', label: 'مختلط' },
];

const REGIONS = [
  { value: 'الرياض', label: 'الرياض' },
  { value: 'مكة المكرمة', label: 'مكة المكرمة' },
  { value: 'المدينة المنورة', label: 'المدينة المنورة' },
  { value: 'القصيم', label: 'القصيم' },
  { value: 'المنطقة الشرقية', label: 'المنطقة الشرقية' },
  { value: 'عسير', label: 'عسير' },
  { value: 'تبوك', label: 'تبوك' },
  { value: 'حائل', label: 'حائل' },
  { value: 'الحدود الشمالية', label: 'الحدود الشمالية' },
  { value: 'جازان', label: 'جازان' },
  { value: 'نجران', label: 'نجران' },
  { value: 'الباحة', label: 'الباحة' },
  { value: 'الجوف', label: 'الجوف' },
];

const defaultData = {
  name: '', type: 'residential', status: 'active', reportDate: '',
  city: '', district: '', region: '', address: '', nationalAddress: '',
  deedNumber: '', deedType: '', deedIssueDate: '', deedIssuer: '', deedArea: '',
  plotNumber: '', planNumber: '',
  realEstateRegNumber: '', realEstateRegDate: '',
  propertyUsageType: '', buildingType: '',
  floorsCount: '', unitCount: '', elevatorsCount: '', parkingCount: '',
  ownerName: '', ownerId: '', ownerNationality: '', ownershipPercentage: '',
  brokerName: '', brokerCommercialReg: '',
  notes: '',
};

export default function PropertyForm({ property, isOpen, onClose, onSubmit }: PropertyFormProps) {
  const [form, setForm] = useState<any>(property ? { ...defaultData, ...property } : { ...defaultData });
  const [loading, setLoading] = useState(false);

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      title={property ? 'تعديل العقار' : 'إضافة عقار جديد'}
      icon={<Building2 size={16} className="text-[#C8A951]" />}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={property ? 'تحديث' : 'إضافة'}
      size="lg"
    >
      {/* البيانات الأساسية */}
      <FormSection title="البيانات الأساسية" icon={<Building2 size={14} />}>
        <FormRow>
          <FormInput label="اسم العقار" name="name" value={form.name} onChange={set} required />
          <FormInput label="تاريخ التقرير" name="reportDate" value={form.reportDate} onChange={set} type="date" />
        </FormRow>
        <FormRow>
          <FormSelect label="نوع العقار" name="type" value={form.type} onChange={set} options={PROPERTY_TYPES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormRow>
          <FormSelect label="نوع الاستخدام" name="propertyUsageType" value={form.propertyUsageType} onChange={set} options={USAGE_TYPES} />
          <FormInput label="نوع المبنى" name="buildingType" value={form.buildingType} onChange={set} />
        </FormRow>
      </FormSection>

      {/* الموقع */}
      <FormSection title="الموقع" icon={<MapPin size={14} />}>
        <FormRow cols={3}>
          <FormSelect label="المنطقة" name="region" value={form.region} onChange={set} options={REGIONS} />
          <FormInput label="المدينة" name="city" value={form.city} onChange={set} />
          <FormInput label="الحي" name="district" value={form.district} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="العنوان" name="address" value={form.address} onChange={set} fullWidth />
        </FormRow>
        <FormRow>
          <FormInput label="العنوان الوطني" name="nationalAddress" value={form.nationalAddress} onChange={set} fullWidth />
        </FormRow>
      </FormSection>

      {/* وثيقة الملكية */}
      <FormSection title="وثيقة الملكية" icon={<FileText size={14} />} defaultOpen={false}>
        <FormRow>
          <FormInput label="رقم الصك" name="deedNumber" value={form.deedNumber} onChange={set} />
          <FormSelect label="نوع الصك" name="deedType" value={form.deedType} onChange={set} options={DEED_TYPES} />
        </FormRow>
        <FormRow>
          <FormInput label="تاريخ الإصدار" name="deedIssueDate" value={form.deedIssueDate} onChange={set} type="date" />
          <FormInput label="جهة الإصدار" name="deedIssuer" value={form.deedIssuer} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="مساحة الصك (م²)" name="deedArea" value={form.deedArea} onChange={set} type="number" />
          <FormInput label="رقم القطعة" name="plotNumber" value={form.plotNumber} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="رقم المخطط" name="planNumber" value={form.planNumber} onChange={set} />
          <FormInput label="رقم السجل العقاري" name="realEstateRegNumber" value={form.realEstateRegNumber} onChange={set} />
        </FormRow>
      </FormSection>

      {/* تفاصيل المبنى */}
      <FormSection title="تفاصيل المبنى" icon={<Settings size={14} />} defaultOpen={false}>
        <FormRow cols={4}>
          <FormInput label="عدد الأدوار" name="floorsCount" value={form.floorsCount} onChange={set} type="number" />
          <FormInput label="عدد الوحدات" name="unitCount" value={form.unitCount} onChange={set} type="number" />
          <FormInput label="عدد المصاعد" name="elevatorsCount" value={form.elevatorsCount} onChange={set} type="number" />
          <FormInput label="عدد المواقف" name="parkingCount" value={form.parkingCount} onChange={set} type="number" />
        </FormRow>
      </FormSection>

      {/* بيانات المالك */}
      <FormSection title="بيانات المالك" icon={<User size={14} />} defaultOpen={false}>
        <FormRow>
          <FormInput label="اسم المالك" name="ownerName" value={form.ownerName} onChange={set} />
          <FormInput label="هوية المالك" name="ownerId" value={form.ownerId} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="الجنسية" name="ownerNationality" value={form.ownerNationality} onChange={set} />
          <FormInput label="نسبة الملكية (%)" name="ownershipPercentage" value={form.ownershipPercentage} onChange={set} type="number" />
        </FormRow>
      </FormSection>

      {/* ملاحظات */}
      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
