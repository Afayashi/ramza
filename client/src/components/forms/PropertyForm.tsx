/*
 * نموذج العقار - رمز الإبداع
 * يدعم الإضافة والتعديل مع أقسام قابلة للطي
 */
import { useState, FormEvent } from 'react';
import { Building2, MapPin, FileText, User, Settings, Shield, Users } from 'lucide-react';
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
  { value: 'نشط', label: 'نشط' },
  { value: 'غير نشط', label: 'غير نشط' },
  { value: 'sold', label: 'مباع' },
  { value: 'تحت الإنشاء', label: 'تحت الإنشاء' },
];

const DOC_TYPES = [
  { value: 'صك', label: 'صك' },
  { value: 'وثيقة', label: 'وثيقة' },
  { value: 'إلكتروني', label: 'إلكتروني' },
  { value: 'ورقي', label: 'ورقي' },
];

const USAGE_TYPES = [
  { value: 'سكني', label: 'سكني' },
  { value: 'تجاري', label: 'تجاري' },
  { value: 'مكتبي', label: 'مكتبي' },
  { value: 'مختلط', label: 'مختلط' },
  { value: 'استثماري', label: 'استثماري' },
];

const FEASIBILITY_OPTIONS = [
  { value: 'مرتفع', label: 'مرتفع' },
  { value: 'متوسط', label: 'متوسط' },
  { value: 'منخفض', label: 'منخفض' },
];

const KEY_TYPE_OPTIONS = [
  { value: 'تقليدي', label: 'تقليدي' },
  { value: 'ذكي', label: 'ذكي' },
  { value: 'مختلط', label: 'مختلط' },
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
  'اسم_العقار': '',
  'نوع_العقار': 'residential',
  'رقم_العقار_الداخلي': '',
  'رقم_الأصل': '',
  'رقم_الوحدة': '',
  'حالة_العقار': 'نشط',
  'الغرض': '',
  'تصنيف_الجدوى': '',
  'سنة_البناء': '',
  'المساحة': '',
  'المساحة_التأجيرية': '',
  'رقم_العداد': '',
  'رقم_اللوحة': '',
  'رابط_الصورة_الرئيسية': '',
  'البرج_المرجعي': '',
  'الوصف': '',
  'المميزات': '',
  'حالة_المرافق': '',
  'مستوى_التشطيب': '',
  'تاريخ_بدء_الإدارة': '',
  'رقم_الصك': '',

  'المنطقة': '',
  'المدينة': '',
  'الحي': '',
  'الشارع': '',
  'العنوان': '',
  'العنوان_الوطني': '',
  'الرمز_البريدي': '',
  'الإحداثيات': '',
  'رابط_الخريطة': '',
  'ملاحظات_الموقع': '',

  'رقم_وثيقة_الملكية': '',
  'نوع_الوثيقة': '',
  'جهة_الإصدار': '',
  'تاريخ_إصدار_الوثيقة': '',
  'رقم_المستند': '',
  'رقم_المخطط': '',
  'رقم_القطعة': '',
  'مساحة_الصك': '',
  'السجل_العيني': '',
  'رقم_التسجيل_العيني': '',
  'تاريخ_التسجيل': '',
  'حالة_التسجيل': '',
  'تاريخ_انتهاء_الوثيقة': '',

  'عدد_الطوابق': '',
  'عدد_الوحدات': '',
  'عدد_المصاعد': '',
  'عدد_المواقف': '',
  'نوع_المفتاح': '',
  'عدد_المفاتيح': '',

  'اسم_المالك': '',
  'رقم_هوية_المالك': '',
  'جنسية_المالك': '',
  'نسبة_الملكية': '',
  'نوع_المالك': '',
  'رقم_جوال_المالك': '',
  'رقم_هاتف_المالك': '',
  'البريد_الإلكتروني_للمالك': '',

  'اسم_جمعية_الملاك': '',
  'رقم_جمعية_الملاك': '',
  'حالة_جمعية_الملاك': '',
  'تاريخ_سريان_الجمعية': '',
  'تاريخ_انتهاء_الجمعية': '',
  'رئيس_الجمعية': '',
  'جوال_رئيس_الجمعية': '',
  'مدير_العقار': '',
  'جوال_مدير_العقار': '',
  'مبلغ_اشتراك_الجمعية': '',
  'تاريخ_دفع_الاشتراك': '',
  'إجمالي_رسوم_الجمعية': '',
  'عدد_المصوتين': '',
  'غير_المصوتين': '',
  'نسبة_قبول_الجمعية': '',
  'ملاحظات_الجمعية': '',

  'ملاحظات': '',
};

function toInitialForm(property?: any) {
  if (!property) return { ...defaultData };

  return {
    ...defaultData,
    ...property,
    'اسم_العقار': property['اسم_العقار'] ?? property.name ?? '',
    'نوع_العقار': property['نوع_العقار'] ?? property.type ?? 'residential',
    'حالة_العقار': property['حالة_العقار'] ?? property.status ?? 'نشط',
    'الغرض': property['الغرض'] ?? property.propertyUsageType ?? '',
    'المدينة': property['المدينة'] ?? property.city ?? '',
    'الحي': property['الحي'] ?? property.district ?? '',
    'المنطقة': property['المنطقة'] ?? property.region ?? '',
    'العنوان': property['العنوان'] ?? property.address ?? '',
    'العنوان_الوطني': property['العنوان_الوطني'] ?? property.nationalAddress ?? '',
    'رقم_الصك': property['رقم_الصك'] ?? property.deedNumber ?? '',
    'نوع_الوثيقة': property['نوع_الوثيقة'] ?? property.deedType ?? '',
    'تاريخ_إصدار_الوثيقة': property['تاريخ_إصدار_الوثيقة'] ?? property.deedIssueDate ?? '',
    'جهة_الإصدار': property['جهة_الإصدار'] ?? property.deedIssuer ?? '',
    'مساحة_الصك': property['مساحة_الصك'] ?? property.deedArea ?? '',
    'رقم_القطعة': property['رقم_القطعة'] ?? property.plotNumber ?? '',
    'رقم_المخطط': property['رقم_المخطط'] ?? property.planNumber ?? '',
    'رقم_التسجيل_العيني': property['رقم_التسجيل_العيني'] ?? property.realEstateRegNumber ?? '',
    'تاريخ_التسجيل': property['تاريخ_التسجيل'] ?? property.realEstateRegDate ?? '',
    'عدد_الطوابق': property['عدد_الطوابق'] ?? property.floorsCount ?? '',
    'عدد_الوحدات': property['عدد_الوحدات'] ?? property.unitCount ?? '',
    'عدد_المصاعد': property['عدد_المصاعد'] ?? property.elevatorsCount ?? '',
    'عدد_المواقف': property['عدد_المواقف'] ?? property.parkingCount ?? '',
    'اسم_المالك': property['اسم_المالك'] ?? property.ownerName ?? '',
    'رقم_هوية_المالك': property['رقم_هوية_المالك'] ?? property.ownerId ?? '',
    'جنسية_المالك': property['جنسية_المالك'] ?? property.ownerNationality ?? '',
    'نسبة_الملكية': property['نسبة_الملكية'] ?? property.ownershipPercentage ?? '',
  };
}

function buildPayload(form: any) {
  return {
    ...form,
    name: form['اسم_العقار'],
    type: form['نوع_العقار'],
    status: form['حالة_العقار'],
    city: form['المدينة'],
    district: form['الحي'],
    region: form['المنطقة'],
    address: form['العنوان'],
    nationalAddress: form['العنوان_الوطني'],
    propertyUsageType: form['الغرض'],
    deedNumber: form['رقم_الصك'],
    deedType: form['نوع_الوثيقة'],
    deedIssueDate: form['تاريخ_إصدار_الوثيقة'],
    deedIssuer: form['جهة_الإصدار'],
    deedArea: form['مساحة_الصك'],
    plotNumber: form['رقم_القطعة'],
    planNumber: form['رقم_المخطط'],
    realEstateRegNumber: form['رقم_التسجيل_العيني'],
    realEstateRegDate: form['تاريخ_التسجيل'],
    floorsCount: form['عدد_الطوابق'],
    unitCount: form['عدد_الوحدات'],
    elevatorsCount: form['عدد_المصاعد'],
    parkingCount: form['عدد_المواقف'],
    ownerName: form['اسم_المالك'],
    ownerId: form['رقم_هوية_المالك'],
    ownerNationality: form['جنسية_المالك'],
    ownershipPercentage: form['نسبة_الملكية'],
  };
}

export default function PropertyForm({ property, isOpen, onClose, onSubmit }: PropertyFormProps) {
  const [form, setForm] = useState<any>(toInitialForm(property));
  const [loading, setLoading] = useState(false);

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(buildPayload(form));
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
        <FormRow cols={3}>
          <FormInput label="اسم العقار" name="اسم_العقار" value={form['اسم_العقار']} onChange={set} required />
          <FormSelect label="نوع العقار" name="نوع_العقار" value={form['نوع_العقار']} onChange={set} options={PROPERTY_TYPES} />
          <FormInput label="رقم العقار الداخلي" name="رقم_العقار_الداخلي" value={form['رقم_العقار_الداخلي']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="رقم الوحدة / الأصل" name="رقم_الأصل" value={form['رقم_الأصل']} onChange={set} />
          <FormInput label="رقم الوحدة / الوحدة العقارية" name="رقم_الوحدة" value={form['رقم_الوحدة']} onChange={set} />
          <FormSelect label="حالة العقار" name="حالة_العقار" value={form['حالة_العقار']} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormRow cols={3}>
          <FormSelect label="الغرض من الاستخدام" name="الغرض" value={form['الغرض']} onChange={set} options={USAGE_TYPES} />
          <FormSelect label="تصنيف الجدوى" name="تصنيف_الجدوى" value={form['تصنيف_الجدوى']} onChange={set} options={FEASIBILITY_OPTIONS} />
          <FormInput label="سنة البناء" name="سنة_البناء" value={form['سنة_البناء']} onChange={set} type="number" />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="المساحة الإجمالية (م²)" name="المساحة" value={form['المساحة']} onChange={set} type="number" />
          <FormInput label="المساحة التأجيرية (م²)" name="المساحة_التأجيرية" value={form['المساحة_التأجيرية']} onChange={set} type="number" />
          <FormInput label="رقم العداد (كهرباء / ماء)" name="رقم_العداد" value={form['رقم_العداد']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="رقم لوحة المبنى" name="رقم_اللوحة" value={form['رقم_اللوحة']} onChange={set} />
          <FormInput label="رابط الصورة الرئيسية" name="رابط_الصورة_الرئيسية" value={form['رابط_الصورة_الرئيسية']} onChange={set} />
          <FormInput label="البرج السكني / المثال المرجعي" name="البرج_المرجعي" value={form['البرج_المرجعي']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="حالة المرافق" name="حالة_المرافق" value={form['حالة_المرافق']} onChange={set} />
          <FormInput label="مستوى التشطيب" name="مستوى_التشطيب" value={form['مستوى_التشطيب']} onChange={set} />
          <FormInput label="تاريخ بدء الإدارة" name="تاريخ_بدء_الإدارة" value={form['تاريخ_بدء_الإدارة']} onChange={set} type="date" />
        </FormRow>
        <FormTextarea label="وصف مختصر للعقار" name="الوصف" value={form['الوصف']} onChange={set} fullWidth />
        <FormTextarea label="مميزات العقار الأساسية" name="المميزات" value={form['المميزات']} onChange={set} fullWidth />
      </FormSection>

      {/* الموقع */}
      <FormSection title="الموقع" icon={<MapPin size={14} />}>
        <FormRow cols={3}>
          <FormSelect label="المنطقة" name="المنطقة" value={form['المنطقة']} onChange={set} options={REGIONS} />
          <FormInput label="المدينة" name="المدينة" value={form['المدينة']} onChange={set} />
          <FormInput label="الحي" name="الحي" value={form['الحي']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="الشارع" name="الشارع" value={form['الشارع']} onChange={set} />
          <FormInput label="الرمز البريدي" name="الرمز_البريدي" value={form['الرمز_البريدي']} onChange={set} />
          <FormInput label="الإحداثيات" name="الإحداثيات" value={form['الإحداثيات']} onChange={set} />
        </FormRow>
        <FormRow>
          <FormInput label="العنوان التفصيلي" name="العنوان" value={form['العنوان']} onChange={set} fullWidth />
        </FormRow>
        <FormRow>
          <FormInput label="العنوان الوطني" name="العنوان_الوطني" value={form['العنوان_الوطني']} onChange={set} fullWidth />
        </FormRow>
        <FormRow>
          <FormInput label="رابط الموقع على الخرائط" name="رابط_الخريطة" value={form['رابط_الخريطة']} onChange={set} fullWidth />
        </FormRow>
        <FormTextarea label="ملاحظات الموقع" name="ملاحظات_الموقع" value={form['ملاحظات_الموقع']} onChange={set} fullWidth />
      </FormSection>

      {/* الملكية والتوثيق */}
      <FormSection title="بيانات الملكية والتوثيق" icon={<Shield size={14} />} defaultOpen={false}>
        <FormRow cols={3}>
          <FormInput label="رقم الصك / الوثيقة" name="رقم_الصك" value={form['رقم_الصك']} onChange={set} />
          <FormInput label="رقم وثيقة الملكية" name="رقم_وثيقة_الملكية" value={form['رقم_وثيقة_الملكية']} onChange={set} />
          <FormSelect label="نوع الوثيقة" name="نوع_الوثيقة" value={form['نوع_الوثيقة']} onChange={set} options={DOC_TYPES} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="جهة الإصدار" name="جهة_الإصدار" value={form['جهة_الإصدار']} onChange={set} />
          <FormInput label="تاريخ إصدار الوثيقة" name="تاريخ_إصدار_الوثيقة" value={form['تاريخ_إصدار_الوثيقة']} onChange={set} type="date" />
          <FormInput label="تاريخ انتهاء الوثيقة" name="تاريخ_انتهاء_الوثيقة" value={form['تاريخ_انتهاء_الوثيقة']} onChange={set} type="date" />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="رقم المستند" name="رقم_المستند" value={form['رقم_المستند']} onChange={set} />
          <FormInput label="رقم المخطط" name="رقم_المخطط" value={form['رقم_المخطط']} onChange={set} />
          <FormInput label="رقم القطعة" name="رقم_القطعة" value={form['رقم_القطعة']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="مساحة الصك (م²)" name="مساحة_الصك" value={form['مساحة_الصك']} onChange={set} type="number" />
          <FormInput label="السجل العيني" name="السجل_العيني" value={form['السجل_العيني']} onChange={set} />
          <FormInput label="رقم التسجيل العيني" name="رقم_التسجيل_العيني" value={form['رقم_التسجيل_العيني']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="تاريخ التسجيل" name="تاريخ_التسجيل" value={form['تاريخ_التسجيل']} onChange={set} type="date" />
          <FormInput label="حالة التسجيل" name="حالة_التسجيل" value={form['حالة_التسجيل']} onChange={set} />
        </FormRow>
      </FormSection>

      {/* تفاصيل المبنى */}
      <FormSection title="تفاصيل المبنى" icon={<Settings size={14} />} defaultOpen={false}>
        <FormRow cols={4}>
          <FormInput label="عدد الطوابق" name="عدد_الطوابق" value={form['عدد_الطوابق']} onChange={set} type="number" />
          <FormInput label="عدد الوحدات" name="عدد_الوحدات" value={form['عدد_الوحدات']} onChange={set} type="number" />
          <FormInput label="عدد المصاعد" name="عدد_المصاعد" value={form['عدد_المصاعد']} onChange={set} type="number" />
          <FormInput label="عدد المواقف" name="عدد_المواقف" value={form['عدد_المواقف']} onChange={set} type="number" />
        </FormRow>
        <FormRow cols={3}>
          <FormSelect label="نوع المفتاح" name="نوع_المفتاح" value={form['نوع_المفتاح']} onChange={set} options={KEY_TYPE_OPTIONS} />
          <FormInput label="عدد المفاتيح" name="عدد_المفاتيح" value={form['عدد_المفاتيح']} onChange={set} type="number" />
          <FormInput label="حالة العقار العامة" name="حالة_العقار" value={form['حالة_العقار']} onChange={set} />
        </FormRow>
      </FormSection>

      {/* بيانات المالك */}
      <FormSection title="بيانات المالك" icon={<User size={14} />} defaultOpen={false}>
        <FormRow cols={3}>
          <FormInput label="اسم المالك" name="اسم_المالك" value={form['اسم_المالك']} onChange={set} />
          <FormInput label="هوية المالك" name="رقم_هوية_المالك" value={form['رقم_هوية_المالك']} onChange={set} />
          <FormInput label="جنسية المالك" name="جنسية_المالك" value={form['جنسية_المالك']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="نسبة الملكية (%)" name="نسبة_الملكية" value={form['نسبة_الملكية']} onChange={set} type="number" />
          <FormInput label="نوع المالك" name="نوع_المالك" value={form['نوع_المالك']} onChange={set} />
          <FormInput label="رقم الجوال" name="رقم_جوال_المالك" value={form['رقم_جوال_المالك']} onChange={set} />
        </FormRow>
        <FormRow cols={2}>
          <FormInput label="رقم الهاتف" name="رقم_هاتف_المالك" value={form['رقم_هاتف_المالك']} onChange={set} />
          <FormInput label="البريد الإلكتروني" name="البريد_الإلكتروني_للمالك" value={form['البريد_الإلكتروني_للمالك']} onChange={set} />
        </FormRow>
      </FormSection>

      <FormSection title="معلومات جمعية اتحاد الملاك" icon={<Users size={14} />} defaultOpen={false}>
        <FormRow cols={3}>
          <FormInput label="اسم الجمعية" name="اسم_جمعية_الملاك" value={form['اسم_جمعية_الملاك']} onChange={set} />
          <FormInput label="الرقم الموحد" name="رقم_جمعية_الملاك" value={form['رقم_جمعية_الملاك']} onChange={set} />
          <FormInput label="حالة الجمعية" name="حالة_جمعية_الملاك" value={form['حالة_جمعية_الملاك']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="تاريخ السريان" name="تاريخ_سريان_الجمعية" value={form['تاريخ_سريان_الجمعية']} onChange={set} type="date" />
          <FormInput label="تاريخ الانتهاء" name="تاريخ_انتهاء_الجمعية" value={form['تاريخ_انتهاء_الجمعية']} onChange={set} type="date" />
          <FormInput label="اسم رئيس الجمعية" name="رئيس_الجمعية" value={form['رئيس_الجمعية']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="جوال رئيس الجمعية" name="جوال_رئيس_الجمعية" value={form['جوال_رئيس_الجمعية']} onChange={set} />
          <FormInput label="اسم مدير العقار" name="مدير_العقار" value={form['مدير_العقار']} onChange={set} />
          <FormInput label="جوال مدير العقار" name="جوال_مدير_العقار" value={form['جوال_مدير_العقار']} onChange={set} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="مبلغ الاشتراك" name="مبلغ_اشتراك_الجمعية" value={form['مبلغ_اشتراك_الجمعية']} onChange={set} type="number" />
          <FormInput label="تاريخ دفع الاشتراك" name="تاريخ_دفع_الاشتراك" value={form['تاريخ_دفع_الاشتراك']} onChange={set} type="date" />
          <FormInput label="إجمالي الرسوم" name="إجمالي_رسوم_الجمعية" value={form['إجمالي_رسوم_الجمعية']} onChange={set} type="number" />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="عدد المصوتين" name="عدد_المصوتين" value={form['عدد_المصوتين']} onChange={set} type="number" />
          <FormInput label="غير المصوتين" name="غير_المصوتين" value={form['غير_المصوتين']} onChange={set} type="number" />
          <FormInput label="نسبة القبول (%)" name="نسبة_قبول_الجمعية" value={form['نسبة_قبول_الجمعية']} onChange={set} type="number" />
        </FormRow>
        <FormTextarea label="ملاحظات الجمعية" name="ملاحظات_الجمعية" value={form['ملاحظات_الجمعية']} onChange={set} fullWidth />
      </FormSection>

      {/* ملاحظات */}
      <FormTextarea label="ملاحظات" name="ملاحظات" value={form['ملاحظات']} onChange={set} fullWidth />
    </FormModal>
  );
}
