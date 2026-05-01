import React, { useState } from 'react';
import { base44 } from '@/lib/base44Client';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Save, Loader2, CheckCircle, AlertCircle, ChevronRight, ChevronLeft,
  Building2, MapPin, FileText, Layers, BarChart2, User, Users, Briefcase, MessageSquare,
  Wrench, DollarSign, TrendingUp, TrendingDown, ClipboardList, Zap, Droplets, ShieldCheck,
  AlertTriangle, PlusCircle, Trash2, Printer
} from 'lucide-react';

const GOLD = '#C8A951';
const DARK = '#111111';

// ── Field primitives ────────────────────────────────────────────────────────────
const F = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-1.5">
      {label}{required && <span className="text-red-500 mr-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 bg-white transition";

const Input = ({ label, required, type = 'text', placeholder, value, onChange }: {
  label: string; required?: boolean; type?: string; placeholder?: string; value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <F label={label} required={required}>
    <input type={type} placeholder={placeholder} value={value || ''} onChange={onChange} className={inputCls} />
  </F>
);

const Select = ({ label, required, options, value, onChange }: {
  label: string; required?: boolean; options: string[]; value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <F label={label} required={required}>
    <select value={value || ''} onChange={onChange} className={inputCls}>
      <option value="">اختر...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </F>
);

const Textarea = ({ label, required, placeholder, value, onChange, rows = 3 }: {
  label: string; required?: boolean; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number;
}) => (
  <F label={label} required={required}>
    <textarea rows={rows} placeholder={placeholder} value={value || ''} onChange={onChange} className={`${inputCls} resize-none`} />
  </F>
);

const Grid = ({ cols = 2, children }: { cols?: number; children: React.ReactNode }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>{children}</div>
);

// ── Steps config ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, icon: Building2,    label: 'البيانات الأساسية' },
  { id: 2, icon: MapPin,       label: 'الموقع' },
  { id: 3, icon: FileText,     label: 'الصك والسجل' },
  { id: 4, icon: Layers,       label: 'المبنى والمرافق' },
  { id: 5, icon: BarChart2,    label: 'الوحدات والعقود' },
  { id: 6, icon: User,         label: 'المالك' },
  { id: 7, icon: Users,        label: 'اتحاد الملاك' },
  { id: 8, icon: Briefcase,    label: 'الوسيط' },
  { id: 9, icon: Wrench,         label: 'الصيانة' },
  { id: 10, icon: DollarSign,   label: 'التكاليف' },
  { id: 11, icon: ClipboardList,label: 'تقرير العقار' },
  { id: 12, icon: MessageSquare,label: 'الملاحظات' },
];

type FormData = Record<string, string | number>;

const EMPTY: FormData = {
  'اسم_العقار': '', 'تاريخ_التقرير': '', 'نوع_العقار': 'سكني', 'حالة_العقار': 'نشط', 'رابط_صورة_العقار': '',
  'المنطقة': '', 'المدينة': '', 'الحي': '', 'العنوان': '', 'العنوان_الوطني': '', 'إحداثيات_الموقع': '', 'رابط_الموقع_على_الخرائط': '',
  'رقم_وثيقة_الملكية': '', 'نوع_وثيقة_الملكية': '', 'تاريخ_إصدار_الوثيقة': '', 'جهة_إصدار_الصك': '',
  'رقم_المستند': '', 'رقم_القطعة': '', 'رقم_المخطط': '', 'مساحة_الصك': '',
  'رقم_التسجيل_العيني': '', 'تاريخ_التسجيل_العيني': '', 'حالة_التسجيل_العيني': '',
  'نوع_المبنى': '', 'نوع_استخدام_العقار': 'سكني', 'الغرض_من_الاستخدام': '',
  'عدد_الطوابق': '', 'عدد_الوحدات': '', 'عدد_المصاعد': '', 'عدد_المواقف': '',
  'المرافق': '', 'نوع_المفتاح': '', 'عدد_المفاتيح': '',
  'إجمالي_الوحدات': '', 'الوحدات_المحجوزة': '', 'الوحدات_المؤجرة': '', 'الوحدات_المتاحة': '',
  'إجمالي_العقود': '', 'إجمالي_مبلغ_العقود_في_العقار': '', 'إجمالي_رسوم_التوثيق_في_العقار': '', 'إجمالي_رسوم_السعي': '',
  'اسم_المالك': '', 'هوية_المالك': '', 'جنسية_المالك': '', 'نسبة_الملكية': '', 'مساحة_الملكية': '', 'نوع_المالك': 'فرد',
  'اسم_جمعية_اتحاد_الملاك': '', 'رقم_تسجيل_الجمعية': '', 'الرقم_الموحد_للجمعية': '',
  'حالة_الجمعية': '', 'تاريخ_سريان_الجمعية': '', 'تاريخ_انتهاء_الجمعية': '',
  'اسم_رئيس_الجمعية': '', 'جوال_رئيس_الجمعية': '', 'اسم_مدير_العقار': '', 'جوال_مدير_العقار': '',
  'إجمالي_رسوم_التصويت': '', 'عدد_المصوتين': '', 'نسبة_القبول': '', 'عدد_غير_المصوتين': '',
  'اسم_منشأة_الوسيط_العقاري': '', 'السجل_التجاري_للوسيط': '',
  // Step 9 — الصيانة
  'حالة_الصيانة_العامة': 'جيدة', 'آخر_صيانة_شاملة': '', 'الصيانة_القادمة': '',
  'عدد_طلبات_الصيانة_المفتوحة': '', 'عدد_طلبات_الصيانة_المغلقة': '',
  'تكلفة_الصيانة_هذا_الشهر': '', 'تكلفة_الصيانة_هذا_العام': '',
  'مزود_خدمة_الصيانة': '', 'جوال_مزود_الصيانة': '',
  'حالة_المصعد': '', 'حالة_نظام_الحريق': '', 'حالة_الكهرباء': '', 'حالة_السباكة': '',
  'ملاحظات_الصيانة': '',
  // Step 10 — التكاليف والمصروفات
  'إيرادات_الإيجار_الشهرية': '', 'إيرادات_الإيجار_السنوية': '',
  'مصروف_الكهرباء_الشهري': '', 'مصروف_الماء_الشهري': '',
  'مصروف_الصيانة_الشهري': '', 'مصروف_الأمن_الشهري': '',
  'مصروف_النظافة_الشهري': '', 'مصروف_الإدارة_الشهري': '',
  'مصاريف_أخرى': '', 'إجمالي_المصروفات_الشهرية': '',
  'صافي_الدخل_التشغيلي': '', 'عائد_الاستثمار': '',
  'قيمة_العقار_السوقية': '', 'تاريخ_آخر_تقييم': '',
  'جهة_التقييم': '', 'رقم_شهادة_التقييم': '',
  'ملاحظات_مالية': '',
  'ملاحظات': '',
};

export default function PropertyFormPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...EMPTY });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (!form['اسم_العقار'] || String(form['اسم_العقار']).length < 3) return 'اسم العقار مطلوب (3 أحرف على الأقل)';
    if (!form['المدينة']) return 'المدينة مطلوبة';
    if (!form['العنوان']) return 'العنوان مطلوب';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); setStep(1); return; }
    setLoading(true); setError(null);
    try {
      await (base44 as any).entities.Property.create(form);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setStep(1); setForm({ ...EMPTY }); navigate('/properties'); }, 2500);
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء الحفظ');
    }
    setLoading(false);
  };

  const totalUnits = Number(form['إجمالي_الوحدات']) || 0;
  const rentedUnits = Number(form['الوحدات_المؤجرة']) || 0;
  const occupancy = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

  // Financial calcs
  const revenue = Number(form['إيرادات_الإيجار_الشهرية']) || 0;
  const expenses = [
    Number(form['مصروف_الكهرباء_الشهري']),
    Number(form['مصروف_الماء_الشهري']),
    Number(form['مصروف_الصيانة_الشهري']),
    Number(form['مصروف_الأمن_الشهري']),
    Number(form['مصروف_النظافة_الشهري']),
    Number(form['مصروف_الإدارة_الشهري']),
    Number(form['مصاريف_أخرى']),
  ].reduce((a, b) => a + b, 0);
  const noi = revenue - expenses;
  const roiVal = form['قيمة_العقار_السوقية'] ? ((noi * 12) / Number(form['قيمة_العقار_السوقية'])) * 100 : 0;

  return (
    <DashboardLayout pageTitle="إضافة عقار جديد">
      <div dir="rtl" className="min-h-screen" style={{ background: '#f5f3ef' }}>

        {/* ── Top Header ── */}
        <div className="sticky top-0 z-30 shadow-md" style={{ background: DARK }}>
          <div className="h-1" style={{ background: `linear-gradient(90deg,${GOLD},#d4a574,${GOLD})` }} />
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-white leading-none">نموذج إضافة عقار جديد</h1>
              <p className="text-xs mt-0.5" style={{ color: `${GOLD}99` }}>Ramz Property Cloud — Property Onboarding Form</p>
            </div>
            <div className="text-right text-xs" style={{ color: '#888' }}>
              <div>خطوة {step} من {STEPS.length}</div>
              <div className="mt-1 h-1.5 w-32 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(step / STEPS.length) * 100}%`, background: GOLD }} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* ── Step Nav ── */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
            {STEPS.map(s => {
              const Icon = s.icon;
              const active = s.id === step;
              const done = s.id < step;
              return (
                <button key={s.id} onClick={() => setStep(s.id)}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold shrink-0 transition"
                  style={{
                    background: active ? DARK : done ? `${GOLD}20` : '#fff',
                    color: active ? GOLD : done ? GOLD : '#888',
                    border: `1.5px solid ${active ? GOLD : done ? `${GOLD}40` : '#e5e7eb'}`,
                    minWidth: '80px',
                  }}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block text-center leading-tight">{s.label}</span>
                  <span className="text-xs opacity-60">{s.id}</span>
                </button>
              );
            })}
          </div>

          {/* ── Alerts ── */}
          {success && (
            <div className="mb-4 flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-black text-emerald-900 text-sm">تم حفظ العقار بنجاح!</p>
                <p className="text-emerald-700 text-xs">جاري التوجيه إلى قائمة العقارات...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* ── Step Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: DARK, borderColor: `${GOLD}20` }}>
              {React.createElement(STEPS[step - 1].icon, { className: 'w-5 h-5', style: { color: GOLD } })}
              <h2 className="font-black text-white">{STEPS[step - 1].label}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full mr-auto" style={{ background: `${GOLD}20`, color: GOLD }}>
                {step} / {STEPS.length}
              </span>
            </div>

            <div className="p-6">
              {/* STEP 1 */}
              {step === 1 && (
                <Grid cols={2}>
                  <Input label="اسم العقار" required value={String(form['اسم_العقار'])} onChange={set('اسم_العقار')} placeholder="مثال: برج السلام السكني" />
                  <Input label="تاريخ التقرير" type="date" value={String(form['تاريخ_التقرير'])} onChange={set('تاريخ_التقرير')} />
                  <Select label="نوع العقار" required options={['سكني','تجاري','مختلط','صناعي']} value={String(form['نوع_العقار'])} onChange={set('نوع_العقار')} />
                  <Select label="حالة العقار" options={['نشط','غير_نشط','مباع']} value={String(form['حالة_العقار'])} onChange={set('حالة_العقار')} />
                  <div className="md:col-span-2">
                    <Input label="رابط الصورة الرئيسية" placeholder="https://..." value={String(form['رابط_صورة_العقار'])} onChange={set('رابط_صورة_العقار')} />
                  </div>
                  {form['رابط_صورة_العقار'] && (
                    <div className="md:col-span-2">
                      <img src={String(form['رابط_صورة_العقار'])} alt="preview" className="w-full h-40 object-cover rounded-xl border border-gray-200"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </Grid>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <Grid cols={2}>
                  <Input label="المنطقة" value={String(form['المنطقة'])} onChange={set('المنطقة')} placeholder="الرياض" />
                  <Input label="المدينة" required value={String(form['المدينة'])} onChange={set('المدينة')} placeholder="الرياض" />
                  <Input label="الحي" value={String(form['الحي'])} onChange={set('الحي')} placeholder="حي النرجس" />
                  <Input label="العنوان" required value={String(form['العنوان'])} onChange={set('العنوان')} placeholder="شارع التحلية..." />
                  <Input label="العنوان الوطني" value={String(form['العنوان_الوطني'])} onChange={set('العنوان_الوطني')} />
                  <Input label="إحداثيات الموقع" placeholder="24.7136, 46.6753" value={String(form['إحداثيات_الموقع'])} onChange={set('إحداثيات_الموقع')} />
                  <div className="md:col-span-2">
                    <Input label="رابط الموقع على الخرائط" placeholder="https://maps.google.com/..." value={String(form['رابط_الموقع_على_الخرائط'])} onChange={set('رابط_الموقع_على_الخرائط')} />
                  </div>
                </Grid>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">بيانات الصك</p>
                  <Grid cols={2}>
                    <Input label="رقم وثيقة الملكية" value={String(form['رقم_وثيقة_الملكية'])} onChange={set('رقم_وثيقة_الملكية')} />
                    <Input label="نوع وثيقة الملكية" placeholder="صك / وثيقة" value={String(form['نوع_وثيقة_الملكية'])} onChange={set('نوع_وثيقة_الملكية')} />
                    <Input label="تاريخ إصدار الوثيقة" type="date" value={String(form['تاريخ_إصدار_الوثيقة'])} onChange={set('تاريخ_إصدار_الوثيقة')} />
                    <Input label="جهة الإصدار" value={String(form['جهة_إصدار_الصك'])} onChange={set('جهة_إصدار_الصك')} />
                    <Input label="رقم المستند" value={String(form['رقم_المستند'])} onChange={set('رقم_المستند')} />
                    <Input label="رقم القطعة" value={String(form['رقم_القطعة'])} onChange={set('رقم_القطعة')} />
                    <Input label="رقم المخطط" value={String(form['رقم_المخطط'])} onChange={set('رقم_المخطط')} />
                    <Input label="مساحة الصك (م²)" type="number" value={String(form['مساحة_الصك'])} onChange={set('مساحة_الصك')} />
                  </Grid>
                  <div className="border-t border-gray-100 my-5" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">السجل العيني</p>
                  <Grid cols={3}>
                    <Input label="رقم التسجيل العيني" value={String(form['رقم_التسجيل_العيني'])} onChange={set('رقم_التسجيل_العيني')} />
                    <Input label="تاريخ التسجيل" type="date" value={String(form['تاريخ_التسجيل_العيني'])} onChange={set('تاريخ_التسجيل_العيني')} />
                    <Input label="حالة التسجيل" value={String(form['حالة_التسجيل_العيني'])} onChange={set('حالة_التسجيل_العيني')} />
                  </Grid>
                </>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <Grid cols={2}>
                  <Input label="نوع المبنى" value={String(form['نوع_المبنى'])} onChange={set('نوع_المبنى')} placeholder="عمارة / فيلا / مجمع..." />
                  <Select label="نوع استخدام العقار" options={['سكني','تجاري','صناعي','مختلط']} value={String(form['نوع_استخدام_العقار'])} onChange={set('نوع_استخدام_العقار')} />
                  <Input label="الغرض من الاستخدام" value={String(form['الغرض_من_الاستخدام'])} onChange={set('الغرض_من_الاستخدام')} />
                  <Input label="عدد الطوابق" type="number" value={String(form['عدد_الطوابق'])} onChange={set('عدد_الطوابق')} />
                  <Input label="عدد الوحدات" type="number" value={String(form['عدد_الوحدات'])} onChange={set('عدد_الوحدات')} />
                  <Input label="عدد المصاعد" type="number" value={String(form['عدد_المصاعد'])} onChange={set('عدد_المصاعد')} />
                  <Input label="عدد المواقف" type="number" value={String(form['عدد_المواقف'])} onChange={set('عدد_المواقف')} />
                  <Input label="نوع المفتاح" placeholder="ميكانيكي / إلكتروني / بطاقة" value={String(form['نوع_المفتاح'])} onChange={set('نوع_المفتاح')} />
                  <Input label="عدد المفاتيح" type="number" value={String(form['عدد_المفاتيح'])} onChange={set('عدد_المفاتيح')} />
                  <div className="md:col-span-2">
                    <Textarea label="مرافق العقار" placeholder="مسبح، صالة رياضية، حراسة أمنية..." value={String(form['المرافق'])} onChange={set('المرافق')} />
                  </div>
                </Grid>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">إجماليات الوحدات</p>
                  <Grid cols={4}>
                    <Input label="إجمالي الوحدات" type="number" value={String(form['إجمالي_الوحدات'])} onChange={set('إجمالي_الوحدات')} />
                    <Input label="المحجوزة" type="number" value={String(form['الوحدات_المحجوزة'])} onChange={set('الوحدات_المحجوزة')} />
                    <Input label="المؤجرة" type="number" value={String(form['الوحدات_المؤجرة'])} onChange={set('الوحدات_المؤجرة')} />
                    <Input label="المتاحة" type="number" value={String(form['الوحدات_المتاحة'])} onChange={set('الوحدات_المتاحة')} />
                  </Grid>
                  {totalUnits > 0 && (
                    <div className="my-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-gray-600">نسبة الإشغال</span>
                        <span style={{ color: GOLD }}>{occupancy}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${occupancy}%`, background: GOLD }} />
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-100 my-4" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">العقود والرسوم</p>
                  <Grid cols={2}>
                    <Input label="إجمالي العقود" type="number" value={String(form['إجمالي_العقود'])} onChange={set('إجمالي_العقود')} />
                    <Input label="إجمالي مبلغ العقود (ر.س)" type="number" value={String(form['إجمالي_مبلغ_العقود_في_العقار'])} onChange={set('إجمالي_مبلغ_العقود_في_العقار')} />
                    <Input label="إجمالي رسوم التوثيق (ر.س)" type="number" value={String(form['إجمالي_رسوم_التوثيق_في_العقار'])} onChange={set('إجمالي_رسوم_التوثيق_في_العقار')} />
                    <Input label="إجمالي رسوم السعي (ر.س)" type="number" value={String(form['إجمالي_رسوم_السعي'])} onChange={set('إجمالي_رسوم_السعي')} />
                  </Grid>
                </>
              )}

              {/* STEP 6 */}
              {step === 6 && (
                <Grid cols={2}>
                  <Input label="اسم المالك" value={String(form['اسم_المالك'])} onChange={set('اسم_المالك')} />
                  <Input label="هوية المالك" value={String(form['هوية_المالك'])} onChange={set('هوية_المالك')} />
                  <Input label="جنسية المالك" value={String(form['جنسية_المالك'])} onChange={set('جنسية_المالك')} />
                  <Input label="نسبة الملكية" placeholder="مثال: 100%" value={String(form['نسبة_الملكية'])} onChange={set('نسبة_الملكية')} />
                  <Input label="مساحة الملكية (م²)" type="number" value={String(form['مساحة_الملكية'])} onChange={set('مساحة_الملكية')} />
                  <Select label="نوع المالك" options={['فرد','شركة','جهة حكومية','أخرى']} value={String(form['نوع_المالك'])} onChange={set('نوع_المالك')} />
                </Grid>
              )}

              {/* STEP 7 */}
              {step === 7 && (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">بيانات الجمعية</p>
                  <Grid cols={2}>
                    <Input label="اسم الجمعية" value={String(form['اسم_جمعية_اتحاد_الملاك'])} onChange={set('اسم_جمعية_اتحاد_الملاك')} />
                    <Input label="رقم التسجيل" value={String(form['رقم_تسجيل_الجمعية'])} onChange={set('رقم_تسجيل_الجمعية')} />
                    <Input label="الرقم الموحد" value={String(form['الرقم_الموحد_للجمعية'])} onChange={set('الرقم_الموحد_للجمعية')} />
                    <Input label="حالة الجمعية" value={String(form['حالة_الجمعية'])} onChange={set('حالة_الجمعية')} />
                    <Input label="تاريخ السريان" type="date" value={String(form['تاريخ_سريان_الجمعية'])} onChange={set('تاريخ_سريان_الجمعية')} />
                    <Input label="تاريخ الانتهاء" type="date" value={String(form['تاريخ_انتهاء_الجمعية'])} onChange={set('تاريخ_انتهاء_الجمعية')} />
                    <Input label="اسم رئيس الجمعية" value={String(form['اسم_رئيس_الجمعية'])} onChange={set('اسم_رئيس_الجمعية')} />
                    <Input label="جوال رئيس الجمعية" value={String(form['جوال_رئيس_الجمعية'])} onChange={set('جوال_رئيس_الجمعية')} />
                    <Input label="اسم مدير العقار" value={String(form['اسم_مدير_العقار'])} onChange={set('اسم_مدير_العقار')} />
                    <Input label="جوال مدير العقار" value={String(form['جوال_مدير_العقار'])} onChange={set('جوال_مدير_العقار')} />
                  </Grid>
                  <div className="border-t border-gray-100 my-4" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">نتائج التصويت والرسوم</p>
                  <Grid cols={4}>
                    <Input label="إجمالي الرسوم (ر.س)" type="number" value={String(form['إجمالي_رسوم_التصويت'])} onChange={set('إجمالي_رسوم_التصويت')} />
                    <Input label="عدد المصوتين" type="number" value={String(form['عدد_المصوتين'])} onChange={set('عدد_المصوتين')} />
                    <Input label="نسبة القبول" placeholder="مثال: 95%" value={String(form['نسبة_القبول'])} onChange={set('نسبة_القبول')} />
                    <Input label="غير المصوتين" type="number" value={String(form['عدد_غير_المصوتين'])} onChange={set('عدد_غير_المصوتين')} />
                  </Grid>
                </>
              )}

              {/* STEP 8 */}
              {step === 8 && (
                <Grid cols={2}>
                  <Input label="اسم المنشأة الوسيطة" value={String(form['اسم_منشأة_الوسيط_العقاري'])} onChange={set('اسم_منشأة_الوسيط_العقاري')} />
                  <Input label="السجل التجاري للوسيط" value={String(form['السجل_التجاري_للوسيط'])} onChange={set('السجل_التجاري_للوسيط')} />
                </Grid>
              )}

              {/* STEP 9 — الصيانة */}
              {step === 9 && (
                <div className="space-y-6">
                  {/* الحالة العامة */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">الحالة العامة</p>
                    <Grid cols={3}>
                      <Select label="حالة الصيانة العامة" options={['ممتازة','جيدة','متوسطة','تحتاج تدخل','حرجة']} value={String(form['حالة_الصيانة_العامة'])} onChange={set('حالة_الصيانة_العامة')} />
                      <Input label="آخر صيانة شاملة" type="date" value={String(form['آخر_صيانة_شاملة'])} onChange={set('آخر_صيانة_شاملة')} />
                      <Input label="الصيانة القادمة" type="date" value={String(form['الصيانة_القادمة'])} onChange={set('الصيانة_القادمة')} />
                    </Grid>
                  </div>

                  {/* حالة الأنظمة */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">حالة الأنظمة</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { key: 'حالة_المصعد', label: 'المصعد', icon: '🛗' },
                        { key: 'حالة_نظام_الحريق', label: 'نظام الحريق', icon: '🧯' },
                        { key: 'حالة_الكهرباء', label: 'الكهرباء', icon: '⚡' },
                        { key: 'حالة_السباكة', label: 'السباكة', icon: '🔧' },
                      ].map(({ key, label, icon }) => (
                        <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-lg mb-1">{icon}</p>
                          <p className="text-xs font-bold text-gray-600 mb-2">{label}</p>
                          <select value={String(form[key]) || ''} onChange={set(key)}
                            className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-yellow-500">
                            <option value="">اختر...</option>
                            {['يعمل بشكل جيد','يحتاج صيانة','معطل','لا ينطبق'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* طلبات الصيانة */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">طلبات الصيانة</p>
                    <Grid cols={2}>
                      <Input label="الطلبات المفتوحة" type="number" value={String(form['عدد_طلبات_الصيانة_المفتوحة'])} onChange={set('عدد_طلبات_الصيانة_المفتوحة')} />
                      <Input label="الطلبات المغلقة" type="number" value={String(form['عدد_طلبات_الصيانة_المغلقة'])} onChange={set('عدد_طلبات_الصيانة_المغلقة')} />
                      <Input label="تكلفة الصيانة هذا الشهر (ر.س)" type="number" value={String(form['تكلفة_الصيانة_هذا_الشهر'])} onChange={set('تكلفة_الصيانة_هذا_الشهر')} />
                      <Input label="تكلفة الصيانة هذا العام (ر.س)" type="number" value={String(form['تكلفة_الصيانة_هذا_العام'])} onChange={set('تكلفة_الصيانة_هذا_العام')} />
                    </Grid>
                  </div>

                  {/* مزود الخدمة */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">مزود خدمة الصيانة</p>
                    <Grid cols={2}>
                      <Input label="اسم الشركة / المقاول" value={String(form['مزود_خدمة_الصيانة'])} onChange={set('مزود_خدمة_الصيانة')} placeholder="شركة الصيانة المتكاملة" />
                      <Input label="جوال التواصل" type="tel" value={String(form['جوال_مزود_الصيانة'])} onChange={set('جوال_مزود_الصيانة')} placeholder="05XXXXXXXX" />
                    </Grid>
                  </div>

                  <Textarea label="ملاحظات الصيانة" rows={3} placeholder="أي ملاحظات خاصة بالصيانة..." value={String(form['ملاحظات_الصيانة'])} onChange={set('ملاحظات_الصيانة')} />
                </div>
              )}

              {/* STEP 10 — التكاليف والمصروفات */}
              {step === 10 && (
                <div className="space-y-6">
                  {/* الإيرادات */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">الإيرادات</p>
                    </div>
                    <Grid cols={2}>
                      <Input label="الإيرادات الشهرية (ر.س)" type="number" value={String(form['إيرادات_الإيجار_الشهرية'])} onChange={set('إيرادات_الإيجار_الشهرية')} placeholder="0" />
                      <Input label="الإيرادات السنوية (ر.س)" type="number" value={String(form['إيرادات_الإيجار_السنوية'])} onChange={set('إيرادات_الإيجار_السنوية')} placeholder="0" />
                    </Grid>
                  </div>

                  {/* المصروفات الشهرية */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">المصروفات الشهرية</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'مصروف_الكهرباء_الشهري', label: 'الكهرباء', icon: '⚡' },
                        { key: 'مصروف_الماء_الشهري', label: 'الماء', icon: '💧' },
                        { key: 'مصروف_الصيانة_الشهري', label: 'الصيانة', icon: '🔧' },
                        { key: 'مصروف_الأمن_الشهري', label: 'الأمن والحراسة', icon: '🛡️' },
                        { key: 'مصروف_النظافة_الشهري', label: 'النظافة', icon: '🧹' },
                        { key: 'مصروف_الإدارة_الشهري', label: 'الإدارة', icon: '📋' },
                      ].map(({ key, label, icon }) => (
                        <div key={key} className="relative">
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            <span className="ml-1">{icon}</span>{label} (ر.س)
                          </label>
                          <input type="number" min="0" placeholder="0"
                            value={String(form[key]) || ''}
                            onChange={set(key)}
                            className={inputCls} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Input label="مصاريف أخرى (ر.س)" type="number" placeholder="0" value={String(form['مصاريف_أخرى'])} onChange={set('مصاريف_أخرى')} />
                    </div>
                  </div>

                  {/* الملخص المالي التلقائي */}
                  <div className="rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-5 py-3 font-black text-sm flex items-center gap-2" style={{ background: DARK, color: GOLD }}>
                      <BarChart2 className="w-4 h-4" /> الملخص المالي التلقائي
                    </div>
                    <div className="p-5 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">الإيرادات الشهرية</p>
                        <p className="text-xl font-black text-emerald-600">{revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">ر.س</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">إجمالي المصروفات</p>
                        <p className="text-xl font-black text-red-500">{expenses.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">ر.س</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">صافي الدخل</p>
                        <p className={`text-xl font-black ${noi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{noi.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">ر.س</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {revenue > 0 && (
                      <div className="px-5 pb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">نسبة المصروفات من الإيرادات</span>
                          <span className="font-bold" style={{ color: GOLD }}>{Math.min(100, Math.round((expenses / revenue) * 100))}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round((expenses / revenue) * 100))}%`, background: expenses > revenue ? '#ef4444' : GOLD }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* التقييم */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">التقييم العقاري</p>
                    <Grid cols={2}>
                      <Input label="القيمة السوقية للعقار (ر.س)" type="number" value={String(form['قيمة_العقار_السوقية'])} onChange={set('قيمة_العقار_السوقية')} />
                      <Input label="تاريخ آخر تقييم" type="date" value={String(form['تاريخ_آخر_تقييم'])} onChange={set('تاريخ_آخر_تقييم')} />
                      <Input label="جهة التقييم" value={String(form['جهة_التقييم'])} onChange={set('جهة_التقييم')} />
                      <Input label="رقم شهادة التقييم" value={String(form['رقم_شهادة_التقييم'])} onChange={set('رقم_شهادة_التقييم')} />
                    </Grid>
                    {roiVal > 0 && (
                      <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                        <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs text-amber-700">العائد السنوي على الاستثمار</p>
                          <p className="text-lg font-black text-amber-800">{roiVal.toFixed(2)}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Textarea label="ملاحظات مالية" rows={2} value={String(form['ملاحظات_مالية'])} onChange={set('ملاحظات_مالية')} />
                </div>
              )}

              {/* STEP 11 — تقرير العقار الكامل */}
              {step === 11 && (
                <div className="space-y-5" dir="rtl">
                  {/* بطاقة هوية العقار */}
                  <div className="rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-5 py-3 flex items-center justify-between" style={{ background: DARK }}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" style={{ color: GOLD }} />
                        <span className="font-black text-white text-sm">بطاقة تعريف العقار</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${GOLD}25`, color: GOLD }}>
                        {String(form['نوع_العقار']) || 'عقار'}
                      </span>
                    </div>
                    {form['رابط_صورة_العقار'] && (
                      <img src={String(form['رابط_صورة_العقار'])} alt="" className="w-full h-36 object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {([
                        ['🏢 اسم العقار', form['اسم_العقار']],
                        ['📍 المدينة / الحي', `${form['المدينة']} — ${form['الحي']}`],
                        ['📋 رقم الصك', form['رقم_وثيقة_الملكية']],
                        ['👤 المالك', form['اسم_المالك']],
                        ['🏗️ نوع المبنى', form['نوع_المبنى']],
                        ['📐 مساحة الصك', form['مساحة_الصك'] ? `${form['مساحة_الصك']} م²` : '—'],
                      ] as [string, string | number][]).map(([lbl, v]) => (
                        <div key={lbl} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-0.5">{lbl}</p>
                          <p className="text-sm font-black text-gray-800">{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* مؤشرات الأداء */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'نسبة الإشغال', value: `${occupancy}%`, sub: `${rentedUnits} / ${totalUnits} وحدة`, color: occupancy >= 80 ? '#059669' : occupancy >= 50 ? GOLD : '#ef4444', bg: 'bg-emerald-50' },
                      { label: 'صافي الدخل / شهر', value: `${noi.toLocaleString()}`, sub: 'ر.س', color: noi >= 0 ? '#059669' : '#ef4444', bg: 'bg-blue-50' },
                      { label: 'عائد الاستثمار', value: roiVal > 0 ? `${roiVal.toFixed(1)}%` : '—', sub: 'سنوياً', color: GOLD, bg: 'bg-amber-50' },
                      { label: 'حالة الصيانة', value: String(form['حالة_الصيانة_العامة']) || '—', sub: String(form['عدد_طلبات_الصيانة_المفتوحة']) ? `${form['عدد_طلبات_الصيانة_المفتوحة']} طلب مفتوح` : '', color: DARK, bg: 'bg-gray-50' },
                    ].map(kpi => (
                      <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-4 border border-white`}>
                        <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                        <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* جدول المصروفات */}
                  {expenses > 0 && (
                    <div className="rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="px-5 py-3 font-black text-sm flex items-center gap-2" style={{ background: '#fafaf9' }}>
                        <TrendingDown className="w-4 h-4 text-red-500" /> توزيع المصروفات الشهرية
                      </div>
                      <div className="p-4 space-y-2">
                        {[
                          { label: 'الكهرباء ⚡', key: 'مصروف_الكهرباء_الشهري' },
                          { label: 'الماء 💧', key: 'مصروف_الماء_الشهري' },
                          { label: 'الصيانة 🔧', key: 'مصروف_الصيانة_الشهري' },
                          { label: 'الأمن 🛡️', key: 'مصروف_الأمن_الشهري' },
                          { label: 'النظافة 🧹', key: 'مصروف_النظافة_الشهري' },
                          { label: 'الإدارة 📋', key: 'مصروف_الإدارة_الشهري' },
                          { label: 'أخرى', key: 'مصاريف_أخرى' },
                        ].filter(r => Number(form[r.key]) > 0).map(r => {
                          const val = Number(form[r.key]);
                          const pct = expenses > 0 ? Math.round((val / expenses) * 100) : 0;
                          return (
                            <div key={r.key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 font-bold">{r.label}</span>
                                <span className="font-black text-gray-800">{val.toLocaleString()} ر.س <span className="text-gray-400">({pct}%)</span></span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GOLD }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* حالة الأنظمة */}
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-bold text-gray-400 mb-3">حالة الأنظمة الفنية</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: 'المصعد 🛗', key: 'حالة_المصعد' },
                        { label: 'الحريق 🧯', key: 'حالة_نظام_الحريق' },
                        { label: 'الكهرباء ⚡', key: 'حالة_الكهرباء' },
                        { label: 'السباكة 🔧', key: 'حالة_السباكة' },
                      ].map(sys => {
                        const v = String(form[sys.key]);
                        const color = v === 'يعمل بشكل جيد' ? '#059669' : v === 'يحتاج صيانة' ? GOLD : v === 'معطل' ? '#ef4444' : '#9ca3af';
                        return (
                          <div key={sys.key} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                            <div>
                              <p className="text-xs font-bold text-gray-700">{sys.label}</p>
                              <p className="text-xs" style={{ color }}>{v || '—'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 12 — الملاحظات */}
              {step === 12 && (
                <div className="space-y-5">
                  <Textarea label="الملاحظات الإضافية" rows={4} placeholder="أضف أي ملاحظات حول العقار..." value={String(form['ملاحظات'])} onChange={set('ملاحظات')} />
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 font-black text-sm" style={{ background: DARK, color: GOLD }}>
                      ملخص البيانات النهائي
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {([
                        ['اسم العقار', form['اسم_العقار']],
                        ['نوع العقار', form['نوع_العقار']],
                        ['المدينة', form['المدينة']],
                        ['الحي', form['الحي']],
                        ['رقم الصك', form['رقم_وثيقة_الملكية']],
                        ['المالك', form['اسم_المالك']],
                        ['إجمالي الوحدات', form['إجمالي_الوحدات']],
                        ['المؤجرة', form['الوحدات_المؤجرة']],
                        ['حالة العقار', form['حالة_العقار']],
                        ['الإيرادات الشهرية', form['إيرادات_الإيجار_الشهرية'] ? `${Number(form['إيرادات_الإيجار_الشهرية']).toLocaleString()} ر.س` : '—'],
                        ['إجمالي المصروفات', expenses > 0 ? `${expenses.toLocaleString()} ر.س` : '—'],
                        ['صافي الدخل', noi !== 0 ? `${noi.toLocaleString()} ر.س` : '—'],
                      ] as [string, string | number][]).map(([lbl, v]) => (
                        <div key={lbl} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">{lbl}</p>
                          <p className="text-sm font-black text-gray-800">{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-5 gap-3">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition">
              <ChevronRight className="w-4 h-4" /> السابق
            </button>

            <div className="flex gap-1">
              {STEPS.map(s => (
                <div key={s.id} className="w-2 h-2 rounded-full transition-all"
                  style={{ background: s.id === step ? GOLD : s.id < step ? `${GOLD}60` : '#e5e7eb' }} />
              ))}
            </div>

            {step < STEPS.length ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition"
                style={{ background: DARK }}>
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white disabled:opacity-60 transition"
                style={{ background: '#059669' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'جاري الحفظ...' : 'حفظ العقار'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
