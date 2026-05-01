/*
 * نموذج تقرير بيانات العقار الرسمي - رمز الإبداع لإدارة الأملاك
 * مهيأ للطباعة الورقية والحفظ بصيغة PDF لمالك العقار
 */
import { useMemo, useState, useRef } from 'react';
import {
  Building2, Printer, FileText, MapPin, Users, DollarSign,
  Wrench, TrendingUp, Home, Shield, CheckCircle2,
  AlertCircle, Star, ClipboardList, Download, Loader2, BarChart3, Award
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const LOGO_URL = '/brand/ramz-logo.svg';

// ─────────────────────────────────────────────
// مكوّن حقل إدخال بسيط للنموذج
// ─────────────────────────────────────────────
function Field({ label, value, span2 }: { label: string; value?: string | number; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1 print:text-[7pt]">{label}</div>
      <div className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 min-h-[30px] text-xs text-slate-800 font-medium print:text-[8pt] print:min-h-[20px] print:rounded print:px-2 print:py-1">
        {value || <span className="text-slate-300 font-normal">—</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// رأس قسم
// ─────────────────────────────────────────────
function SectionTitle({ num, title, icon: Icon }: { num: string; title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-3 mb-5 print:mb-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#C8A951] text-white text-xs font-bold shrink-0 print:w-6 print:h-6 print:rounded print:text-[8pt]">
        {num}
      </div>
      {Icon && (
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#C8A951]/10 print:hidden">
          <Icon size={14} className="text-[#C8A951]" />
        </div>
      )}
      <span className="font-bold text-sm text-slate-900 print:text-[10pt]">{title}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-[#C8A951]/30 to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────
// شبكة حقول
// ─────────────────────────────────────────────
function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className="grid gap-x-4 gap-y-3 print:gap-y-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// مؤشر أداء (KPI)
// ─────────────────────────────────────────────
function KPIBox({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3.5 text-center border print:p-2 print:rounded ${
      accent
        ? 'bg-[#C8A951] border-[#C8A951] text-white'
        : 'bg-white border-[#C8A951]/25 hover:border-[#C8A951]/50 transition-colors'
    }`}>
      <div className={`text-lg font-extrabold leading-none print:text-[13pt] ${accent ? 'text-white' : 'text-[#C8A951]'}`}>{value}</div>
      {sub && <div className={`text-[10px] mt-0.5 print:text-[7pt] ${accent ? 'text-white/80' : 'text-slate-400'}`}>{sub}</div>}
      <div className={`text-[10px] mt-1 font-medium print:text-[7pt] ${accent ? 'text-white/90' : 'text-slate-500'}`}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// الصفحة الرئيسية
// ─────────────────────────────────────────────
export default function PropertyOfficialReport() {
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { data, loading } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit' }, { name: 'Payment' },
    { name: 'Expense' }, { name: 'Maintenance' }, { name: 'Lease' },
    { name: 'Owner' }, { name: 'Tenant' }
  ]);

  const [selectedId, setSelectedId] = useState<string>('');
  const [reportDate] = useState(() => new Date().toLocaleDateString('ar-SA'));
  const [reportNum] = useState(() => `RPT-${Date.now().toString().slice(-6)}`);

  const properties = data.Property || [];
  const requestedPropertyId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('propertyId') || params.get('id') || '';
  }, []);

  const activePropertyId = useMemo(() => {
    if (selectedId && properties.some((property) => String(property.id) === selectedId)) {
      return selectedId;
    }

    if (requestedPropertyId) {
      const matchedProperty = properties.find((property) => String(property.id) === requestedPropertyId);
      if (matchedProperty) {
        return String(matchedProperty.id);
      }
    }

    return properties[0] ? String(properties[0].id) : '';
  }, [properties, requestedPropertyId, selectedId]);

  // ── حساب بيانات التقرير ──────────────────────
  const report = useMemo(() => {
    if (!activePropertyId) return null;
    const prop = properties.find(p => String(p.id) === activePropertyId);
    if (!prop) return null;

    const id = prop.id;
    const units = (data.Unit || []).filter(u => u['معرف_العقار'] === id || u.property_id === id);
    const leases = (data.Lease || []).filter(l => l['معرف_العقار'] === id || l.property_id === id);
    const payments = (data.Payment || []).filter(p => p['معرف_العقار'] === id || p.property_id === id);
    const expenses = (data.Expense || []).filter(e => e['معرف_العقار'] === id || e.property_id === id);
    const maint = (data.Maintenance || []).filter(m => m['معرف_العقار'] === id || m.property_id === id);
    const owner = (data.Owner || []).find(o => o.id === (prop['معرف_المالك'] || prop.owner_id));

    const rented = units.filter(u => ['مؤجرة', 'مشغولة', 'occupied'].includes(u['حالة_الوحدة'] || u.status || ''));
    const vacant = units.filter(u => ['شاغرة', 'vacant'].includes(u['حالة_الوحدة'] || u.status || ''));
    const reserved = units.filter(u => ['محجوزة', 'reserved'].includes(u['حالة_الوحدة'] || u.status || ''));

    const income = payments
      .filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || ''))
      .reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExp = expenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    const maintCost = maint.reduce((s, m) => s + Number(m['التكلفة'] || m.cost || 0), 0);
    const net = income - totalExp - maintCost;

    const occupancy = units.length > 0 ? Math.round((rented.length / units.length) * 100) : 0;

    const activeLeases = leases.filter(l => ['نشط', 'active'].includes(l['حالة_العقد'] || l.status || ''));
    const expectedIncome = activeLeases.reduce((s, l) => s + Number(l['قيمة_الإيجار'] || l.rent || 0), 0);
    const collectionRate = expectedIncome > 0 ? Math.min(100, Math.round((income / expectedIncome) * 100)) : 0;
    const overdueAmount = Math.max(expectedIncome - income, 0);
    const avgRent = activeLeases.length > 0
      ? Math.round(activeLeases.reduce((s, l) => s + Number(l['قيمة_الإيجار'] || l.rent || 0), 0) / activeLeases.length)
      : 0;
    const totalDocumentationFees = leases.reduce((s, l) => s + Number(l['رسوم_التوثيق'] || l.documentation_fees || 0), 0);
    const totalBrokerageFees = leases.reduce((s, l) => s + Number(l['رسوم_السعي'] || l.brokerage_fees || 0), 0);
    const avgLeaseMonths = activeLeases.length > 0
      ? Math.round(
          activeLeases.reduce((s, l) => {
            const start = new Date(l['تاريخ_بداية_العقد'] || l.start_date || '');
            const end = new Date(l['تاريخ_نهاية_العقد'] || l.end_date || '');
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return s;
            const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
            return s + months;
          }, 0) / activeLeases.length
        )
      : 0;

    return {
      prop, owner, units, leases, payments, expenses, maint,
      rented, vacant, reserved, income, totalExp, maintCost, net,
      occupancy, collectionRate, overdueAmount, activeLeases, avgRent,
      totalDocumentationFees, totalBrokerageFees, avgLeaseMonths,
    };
  }, [activePropertyId, data, properties]);

  // ── وظيفة الطباعة ─────────────────────────
  const handlePrint = () => window.print();

  // ── تصدير PDF فعلي ───────────────────────
  const handleExportPdf = async () => {
    if (!printRef.current || !report) {
      toast.error('اختر عقاراً أولاً قبل تصدير PDF');
      return;
    }

    try {
      setIsExporting(true);
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      const element = printRef.current;
      const exportPromise = toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fontEmbedCSS: '',
        style: {
          background: '#ffffff',
        },
      });

      const imgData = await Promise.race<string>([
        exportPromise,
        new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('انتهت مهلة تصدير PDF')), 30000);
        }),
      ]);

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('تعذر قراءة صورة التقرير'));
        img.src = imgData;
      });

      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (image.height * imgWidth) / image.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const propertyName = String(report.prop?.['اسم_العقار'] || report.prop?.name || 'property')
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '');

      pdf.save(`report-${propertyName}-${reportNum}.pdf`);
      toast.success('تم تصدير التقرير بصيغة PDF بنجاح');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('تعذر تصدير PDF، حاول مرة أخرى');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <DashboardLayout pageTitle="نموذج تقرير العقار الرسمي"><LoadingState /></DashboardLayout>;

  const prop = report?.prop;

  return (
    <DashboardLayout pageTitle="نموذج تقرير العقار الرسمي">
      {/* ── شريط الاختيار والأدوات (يُخفى عند الطباعة) ── */}
      <div className="print:hidden">
        <PageHeader
          title="نموذج تقرير بيانات العقار الرسمي"
          description="نسخة رسمية مهيأة للطباعة الورقية والحفظ بصيغة PDF لمالك العقار"
        />

        {/* اختيار العقار */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium">اختر العقار لإعداد التقرير:</p>
          <div className="flex flex-wrap gap-2">
            {properties.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(String(p.id))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${String(p.id) === activePropertyId
                    ? 'border-[#C8A951] bg-[#C8A951]/10 text-[#C8A951]'
                    : 'border-border bg-sidebar text-muted-foreground hover:border-[#C8A951]/40'}`}>
                <Building2 size={11} />
                {p['اسم_العقار'] || p.name || 'بدون اسم'}
              </button>
            ))}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        {report && (
          <div className="flex items-center gap-2 mb-4">
            <Button onClick={handlePrint} size="sm" className="bg-[#C8A951] text-black hover:bg-[#b8973f] gap-1.5 text-xs">
              <Printer size={13} /> طباعة
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-[#C8A951]/50 text-[#C8A951] hover:bg-[#C8A951]/10"
            >
              {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </Button>
            <button
              onClick={() => setLocation('/property-single-report')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:border-[#C8A951]/40 transition-all">
              <TrendingUp size={11} /> تقرير الأداء
            </button>
            <button
              onClick={() => setLocation('/properties')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:border-[#C8A951]/40 transition-all">
              <Building2 size={11} /> تعديل وحفظ بيانات العقار
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          محتوى التقرير القابل للطباعة
      ════════════════════════════════════════════ */}
      {!report ? (
        <div className="print:hidden bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <Building2 size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">اختر عقاراً لعرض نموذج التقرير الرسمي</p>
        </div>
      ) : (
        <div ref={printRef} className="official-report bg-white text-slate-900" dir="rtl">

          {/* ══ غلاف التقرير ══ */}
          <div className="official-cover mb-6 print:mb-4 overflow-hidden rounded-2xl shadow-lg border border-[#C8A951]/20 print:rounded-none print:shadow-none">
            {/* شريط علوي ذهبي */}
            <div className="bg-gradient-to-l from-[#1a1209] via-[#2d1f06] to-[#1a1209] px-8 py-7 print:px-6 print:py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/30 print:w-10 print:h-10 print:rounded-xl">
                    <img
                      src={LOGO_URL}
                      alt="شعار شركة رمز الإبداع"
                      className="h-9 w-9 object-contain print:h-7 print:w-7"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-[#C8A951] leading-tight print:text-[15pt]">رمز الإبداع لإدارة الأملاك</h1>
                    <p className="text-xs text-[#C8A951]/60 mt-0.5 print:text-[8pt]">Ramz Al-Ibdaa Property Management</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-[#C8A951]/60 print:text-[7pt]">رقم التقرير</div>
                  <div className="text-sm font-bold text-[#C8A951] print:text-[9pt]">{reportNum}</div>
                  <div className="text-[10px] text-[#C8A951]/60 mt-1 print:text-[7pt]">{reportDate}</div>
                </div>
              </div>
            </div>

            {/* عنوان التقرير */}
            <div className="bg-[#C8A951] px-8 py-4 print:px-6 print:py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white print:text-[14pt]">نموذج تقرير بيانات العقار الرسمي</h2>
                  <p className="text-xs text-white/80 mt-0.5 print:text-[8pt]">نسخة رسمية مهيأة للطباعة الورقية والحفظ بصيغة PDF</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 print:hidden">
                  <Award size={14} className="text-white" />
                  <span className="text-xs font-bold text-white">وثيقة رسمية معتمدة</span>
                </div>
              </div>
            </div>

            {/* معلومات التقرير */}
            <div className="bg-white px-8 py-5 print:px-6 print:py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:gap-3">
                {[
                  { label: 'اسم العقار', value: prop?.['اسم_العقار'] || prop?.name || '—' },
                  { label: 'اسم مالك العقار', value: report.owner?.['اسم_المالك'] || report.owner?.name || '—' },
                  { label: 'إعداد التقرير', value: 'مدير النظام' },
                  { label: 'تاريخ التقرير', value: reportDate },
                  { label: 'رقم التقرير', value: reportNum },
                  { label: 'الموقع الإلكتروني', value: 'ramzabdae.com' },
                ].map(item => (
                  <div key={item.label} className="group">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</div>
                    <div className="text-xs font-semibold text-slate-800 border-b-2 border-[#C8A951]/30 pb-1 group-hover:border-[#C8A951]/60 transition-colors">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* تنبيه رسمي */}
              <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 print:mt-3 print:p-2 print:rounded">
                <div className="w-5 h-5 rounded-full bg-[#C8A951] flex items-center justify-center shrink-0 mt-0.5 print:hidden">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed print:text-[7pt]">
                  <span className="font-bold text-[#C8A951]">تنبيه رسمي: </span>
                  تُستكمل البيانات الواردة في هذا النموذج قبل الاعتماد النهائي، وُيستخدم كمستند رسمي للطباعة والأرشفة
                  وتقديمه إلى مالك العقار ضمن ملفات إدارة الأملاك.
                </p>
              </div>
            </div>
          </div>

          {/* ══ جسم التقرير ══ */}
          <div className="space-y-5 print:space-y-3 px-1">

            {/* القسم 1: البيانات الأساسية للعقار */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="1" title="البيانات الأساسية للعقار" icon={Building2} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="اسم العقار" value={prop?.['اسم_العقار'] || prop?.name} />
                <Field label="نوع العقار" value={prop?.['نوع_العقار'] || prop?.type} />
                <Field label="رقم العقار الداخلي" value={prop?.id} />
                <Field label="رقم الوحدة / الأصل" value={prop?.['رقم_الأصل']} />
                <Field label="رقم الوحدة / الوحدة العقارية" value={prop?.['رقم_الوحدة']} />
                <Field label="حالة العقار" value={prop?.['حالة_العقار'] || 'نشط'} />
                <Field label="الغرض من الاستخدام" value={prop?.['الغرض'] || prop?.['نوع_العقار']} />
                <Field label="تصنيف الجدوى" value={prop?.['تصنيف_الجدوى'] || 'مرتفع'} />
                <Field label="سنة البناء" value={prop?.['سنة_البناء'] || prop?.year_built} />
                <Field label="عمر العقار (بالسنوات)" value={prop?.['سنة_البناء'] ? String(new Date().getFullYear() - Number(prop['سنة_البناء'])) : ''} />
                <Field label="المساحة الإجمالية (م²)" value={prop?.['المساحة'] || prop?.area} />
                <Field label="المساحة التأجيرية (م²)" value={prop?.['المساحة_التأجيرية']} />
                <Field label="رقم العداد (كهرباء / ماء)" value={prop?.['رقم_العداد']} />
                <Field label="رقم لوحة المبنى" value={prop?.['رقم_اللوحة']} />
                <Field label="رابط الصورة الرئيسية" value={prop?.['رابط_الصورة_الرئيسية']} />
                <Field label="البرج السكني / المثال المرجعي" value={prop?.['البرج_المرجعي']} />
                <Field label="وصف مختصر للعقار" value={prop?.['الوصف'] || prop?.description} span2 />
                <Field label="مميزات العقار الأساسية" value={prop?.['المميزات']} span2 />
                <Field label="حالة المرافق" value={prop?.['حالة_المرافق']} />
                <Field label="مستوى التشطيب" value={prop?.['مستوى_التشطيب']} />
                <Field label="تاريخ بدء الإدارة" value={prop?.['تاريخ_بدء_الإدارة']} />
                <Field label="رقم الصك / الوثيقة" value={prop?.['رقم_الصك']} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 2: بيانات الموقع الجغرافي */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="2" title="بيانات الموقع الجغرافي" icon={MapPin} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="المنطقة" value={prop?.['المنطقة']} />
                <Field label="المدينة" value={prop?.['المدينة'] || prop?.city} />
                <Field label="الحي" value={prop?.['الحي'] || prop?.neighborhood} />
                <Field label="الشارع" value={prop?.['الشارع']} />
                <Field label="العنوان التفصيلي" value={prop?.['العنوان'] || prop?.address} />
                <Field label="العنوان الوطني" value={prop?.['العنوان_الوطني']} />
                <Field label="الرمز البريدي" value={prop?.['الرمز_البريدي']} />
                <Field label="الإحداثيات" value={prop?.['الإحداثيات']} />
                <Field label="رابط الموقع على الخرائط" value={prop?.['رابط_الخريطة']} />
                <Field label="ملاحظات الموقع" value={prop?.['ملاحظات_الموقع']} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 3: بيانات الملكية والتوثيق */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="3" title="بيانات الملكية والتوثيق" icon={Shield} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="رقم وثيقة الملكية" value={prop?.['رقم_وثيقة_الملكية']} />
                <Field label="نوع الوثيقة" value={prop?.['نوع_الوثيقة'] || 'صك'} />
                <Field label="جهة الإصدار" value={prop?.['جهة_الإصدار'] || 'وزارة العدل'} />
                <Field label="تاريخ إصدار الوثيقة" value={prop?.['تاريخ_إصدار_الوثيقة']} />
                <Field label="رقم المستند" value={prop?.['رقم_المستند']} />
                <Field label="رقم المخطط" value={prop?.['رقم_المخطط']} />
                <Field label="رقم القطعة" value={prop?.['رقم_القطعة']} />
                <Field label="مساحة الصك (م²)" value={prop?.['مساحة_الصك']} />
                <Field label="السجل العيني" value={prop?.['السجل_العيني']} />
                <Field label="رقم التسجيل العيني" value={prop?.['رقم_التسجيل_العيني']} />
                <Field label="تاريخ التسجيل" value={prop?.['تاريخ_التسجيل']} />
                <Field label="حالة التسجيل" value={prop?.['حالة_التسجيل'] || 'مسجل'} />
                <Field label="رقم الصك" value={prop?.['رقم_الصك']} />
                <Field label="تاريخ انتهاء الوثيقة" value={prop?.['تاريخ_انتهاء_الوثيقة']} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 4: مواصفات المبنى */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="4" title="مواصفات المبنى" icon={Home} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="عدد الطوابق" value={prop?.['عدد_الطوابق']} />
                <Field label="عدد الوحدات" value={report.units.length || prop?.['عدد_الوحدات']} />
                <Field label="عدد المصاعد" value={prop?.['عدد_المصاعد']} />
                <Field label="عدد المواقف" value={prop?.['عدد_المواقف']} />
                <Field label="نوع المفتاح" value={prop?.['نوع_المفتاح']} />
                <Field label="عدد المفاتيح" value={prop?.['عدد_المفاتيح']} />
                <Field label="الغرض من الاستخدام" value={prop?.['نوع_العقار']} />
                <Field label="حالة العقار العامة" value={prop?.['حالة_العقار'] || 'ممتازة'} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 5: الملخص التنفيذي */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="5" title="الملخص التنفيذي" icon={FileText} />
              </div>
              <div className="p-5 print:p-3">
              <p className="text-xs text-slate-600 leading-relaxed print:text-[8pt]">
                يقدم هذا التقرير نظرة شاملة عن أداء عقار <strong className="text-slate-900">{prop?.['اسم_العقار'] || 'العقار'}</strong> خلال الفترة المحددة،
                ويعرض حالة الأصل العقاري من الناحية التشغيلية والاستثمارية والإدارية.
                تم إعداد البيانات بما يضمن وضوح الصورة لمالك العقار، مع التركيز على نسب الإشغال،
                كفاءة التحصيل، حالة المرافق، الأعمال المنفذة، وفرص تحسين الدخل وتعظيم العائد على الاستثمار.
              </p>
              </div>
            </div>

            {/* القسم 6: مؤشرات الأداء الرئيسية */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="6" title="مؤشرات الأداء الرئيسية" icon={BarChart3} />
              </div>
              <div className="p-5 print:p-3">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-2 print:grid-cols-5 print:gap-2">
                <KPIBox label="إجمالي الوحدات" value={report.units.length} />
                <KPIBox label="الوحدات المؤجرة" value={report.rented.length} accent />
                <KPIBox label="الوحدات المتاحة" value={report.vacant.length} />
                <KPIBox label="نسبة الإشغال" value={`${report.occupancy}%`} />
                <KPIBox label="معدل التحصيل" value={`${report.collectionRate}%`} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                <KPIBox label="الإيراد السنوي" value={`${report.income.toLocaleString('ar-SA')}`} sub="ريال سعودي" />
                <KPIBox label="المصروفات" value={`${(report.totalExp + report.maintCost).toLocaleString('ar-SA')}`} sub="ريال سعودي" />
                <KPIBox label="صافي الدخل" value={`${report.net.toLocaleString('ar-SA')}`} sub="ريال سعودي" accent />
                <KPIBox label="تصنيف الجدوى" value={report.occupancy >= 80 ? 'مرتفع' : report.occupancy >= 50 ? 'متوسط' : 'منخفض'} />
              </div>
              </div>
            </div>

            {/* القسم 7: تفاصيل الوحدات والعقود */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="7" title="تفاصيل الوحدات والعقود" icon={ClipboardList} />
              </div>
              <div className="p-5 print:p-3">
              <div className="overflow-x-auto rounded-xl border border-slate-200 print:rounded print:border-slate-300">
                <table className="w-full text-xs border-collapse print:text-[7pt]">
                  <thead>
                    <tr className="bg-[#1a1209]">
                      {['رقم الوحدة', 'نوع الوحدة', 'الحالة', 'المؤجر / الشاغر', 'القيمة الإيجارية', 'بداية العقد', 'نهاية العقد', 'ملاحظات'].map(h => (
                        <th key={h} className="px-2.5 py-2 text-right text-[10px] font-bold text-[#C8A951] print:px-1.5 print:py-1.5 first:rounded-tr-xl last:rounded-tl-xl">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.units.length > 0 ? report.units.slice(0, 20).map((unit, i) => {
                      const lease = report.leases.find(l => l['معرف_الوحدة'] === unit.id || l.unit_id === unit.id);
                      const tenant = lease ? (data.Tenant || []).find(t => t.id === (lease['معرف_المستأجر'] || lease.tenant_id)) : null;
                      return (
                        <tr key={unit.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 print:px-1.5 print:py-1">{unit['رقم_الوحدة'] || unit.id}</td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 print:px-1.5 print:py-1">{unit['نوع_الوحدة'] || '—'}</td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 print:px-1.5 print:py-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold print:px-1 ${
                              ['مؤجرة', 'occupied'].includes(unit['حالة_الوحدة'] || '') ? 'bg-emerald-100 text-emerald-700' :
                              ['شاغرة', 'vacant'].includes(unit['حالة_الوحدة'] || '') ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {unit['حالة_الوحدة'] || '—'}
                            </span>
                          </td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 print:px-1.5 print:py-1">{tenant?.['اسم_المستأجر'] || tenant?.name || '—'}</td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 font-medium text-[#C8A951] print:px-1.5 print:py-1">{lease ? `${Number(lease['قيمة_الإيجار'] || lease.rent || 0).toLocaleString('ar-SA')} ر.س` : '—'}</td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 print:px-1.5 print:py-1">{lease?.['تاريخ_بداية_العقد'] || lease?.start_date || '—'}</td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 print:px-1.5 print:py-1">{lease?.['تاريخ_نهاية_العقد'] || lease?.end_date || '—'}</td>
                          <td className="border-b border-slate-100 px-2.5 py-1.5 text-slate-500 print:px-1.5 print:py-1">{lease?.['ملاحظات'] || '—'}</td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={8} className="text-center py-6 text-slate-400 text-xs">لا توجد وحدات مسجلة</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ملخص العقود */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 print:gap-2 print:mt-3">
                <Field label="إجمالي مبلغ العقود (ر.س)" value={report.activeLeases.reduce((s, l) => s + Number(l['قيمة_الإيجار'] || l.rent || 0), 0).toLocaleString('ar-SA')} />
                <Field label="إجمالي عدد العقود" value={report.leases.length} />
                <Field label="إجمالي رسوم التوثيق (ر.س)" value={report.totalDocumentationFees.toLocaleString('ar-SA')} />
                <Field label="إجمالي رسوم السعي (ر.س)" value={report.totalBrokerageFees.toLocaleString('ar-SA')} />
                <Field label="متوسط الإيجار السنوي للوحدة" value={report.avgRent ? `${report.avgRent.toLocaleString('ar-SA')} ر.س` : '—'} />
                <Field label="متوسط مدة العقد (بالأشهر)" value={report.avgLeaseMonths || '—'} />
                <Field label="العقود النشطة" value={report.activeLeases.length} />
              </div>
              </div>
            </div>

            {/* القسم 8: التقرير المالي والاستثماري */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="8" title="التقرير المالي والاستثماري" icon={DollarSign} />
              </div>
              <div className="p-5 print:p-3">

              {/* مؤشرات مالية */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 print:grid-cols-3 print:gap-2 print:mb-3">
                <KPIBox label="إجمالي الدخل المتوقع" value={`${report.income.toLocaleString('ar-SA')}`} sub="ر.س" />
                <KPIBox label="المبالغ المحصلة" value={`${report.income.toLocaleString('ar-SA')}`} sub="ر.س" accent />
                <KPIBox label="المستحقات المتأخرة" value={`${report.overdueAmount.toLocaleString('ar-SA')}`} sub="ر.س" />
                <KPIBox label="القيمة السوقية التقديرية" value={`${(report.income * 15).toLocaleString('ar-SA')}`} sub="ر.س" />
                <KPIBox label="العائد الإجمالي" value={`${report.occupancy > 0 ? Math.round((report.net / Math.max(report.income * 15, 1)) * 100) : 0}%`} />
                <KPIBox label="صافي العائد ROI" value={`${report.income > 0 ? Math.round((report.net / Math.max(report.income, 1)) * 100) : 0}%`} accent />
              </div>

              {/* جدول مالي تفصيلي */}
              <div className="rounded-xl border border-slate-200 overflow-hidden print:rounded print:border-slate-300">
              <table className="w-full text-xs border-collapse print:text-[7pt]">
                <thead>
                  <tr className="bg-[#1a1209]">
                    <th className="px-3 py-2 text-right font-bold text-[#C8A951] print:px-2 print:py-1.5">البيان</th>
                    <th className="px-3 py-2 text-right font-bold text-[#C8A951] print:px-2 print:py-1.5">القيمة</th>
                    <th className="px-3 py-2 text-right font-bold text-[#C8A951] print:px-2 print:py-1.5">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'الإيجارات المستحقة للفترة', value: `${report.income.toLocaleString('ar-SA')} ر.س`, note: '' },
                    { label: 'المحصلات النقدية والتحويلات', value: `${report.income.toLocaleString('ar-SA')} ر.س`, note: 'إجمالي المدفوعات' },
                    { label: 'المصروفات التشغيلية', value: `${report.totalExp.toLocaleString('ar-SA')} ر.س`, note: '' },
                    { label: 'تكاليف الصيانة', value: `${report.maintCost.toLocaleString('ar-SA')} ر.س`, note: `${report.maint.length} طلب` },
                    { label: 'صافي الدخل التشغيلي', value: `${report.net.toLocaleString('ar-SA')} ر.س`, note: report.net >= 0 ? 'ربح' : 'خسارة', highlight: true },
                    { label: 'التكاليف الرأسمالية المتوقعة', value: '—', note: '' },
                    { label: 'معدل النمو المتوقع', value: '5%', note: 'تقديري' },
                    { label: 'صافي التدفق النقدي', value: `${report.net.toLocaleString('ar-SA')} ر.س`, note: '' },
                  ].map((row: any, i) => (
                    <tr key={i} className={row.highlight ? 'bg-[#C8A951]/8' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className={`border-b border-slate-100 px-3 py-1.5 print:px-2 print:py-1 ${row.highlight ? 'font-bold text-slate-900' : ''}`}>{row.label}</td>
                      <td className={`border-b border-slate-100 px-3 py-1.5 font-semibold print:px-2 print:py-1 ${row.highlight ? (report.net >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-[#C8A951]'}`}>{row.value}</td>
                      <td className="border-b border-slate-100 px-3 py-1.5 text-slate-400 print:px-2 print:py-1">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              </div>
            </div>

            {/* القسم 9: معلومات المالك */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="9" title="معلومات المالك" icon={Users} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="اسم المالك" value={report.owner?.['اسم_المالك'] || report.owner?.name} />
                <Field label="هوية المالك" value={report.owner?.['رقم_الهوية'] || report.owner?.national_id} />
                <Field label="جنسية المالك" value={report.owner?.['الجنسية'] || 'سعودي'} />
                <Field label="نسبة الملكية (%)" value={report.owner?.['نسبة_الملكية'] || '100'} />
                <Field label="نوع المالك" value={report.owner?.['نوع_المالك'] || 'فرد'} />
                <Field label="رقم الجوال" value={report.owner?.['رقم_الجوال'] || report.owner?.phone} />
                <Field label="رقم الهاتف" value={report.owner?.['رقم_الهاتف']} />
                <Field label="البريد الإلكتروني" value={report.owner?.['البريد_الإلكتروني'] || report.owner?.email} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 10: معلومات جمعية اتحاد الملاك */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="10" title="معلومات جمعية اتحاد الملاك" icon={Users} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="اسم الجمعية" value={prop?.['اسم_جمعية_الملاك']} />
                <Field label="الرقم الموحد" value={prop?.['رقم_جمعية_الملاك']} />
                <Field label="حالة الجمعية" value={prop?.['حالة_جمعية_الملاك']} />
                <Field label="تاريخ السريان" value={prop?.['تاريخ_سريان_الجمعية']} />
                <Field label="تاريخ الانتهاء" value={prop?.['تاريخ_انتهاء_الجمعية']} />
                <Field label="اسم رئيس الجمعية" value={prop?.['رئيس_الجمعية']} />
                <Field label="جوال رئيس الجمعية" value={prop?.['جوال_رئيس_الجمعية']} />
                <Field label="اسم مدير العقار" value={prop?.['مدير_العقار']} />
                <Field label="جوال مدير العقار" value={prop?.['جوال_مدير_العقار']} />
                <Field label="مبلغ الاشتراك (ر.س)" value={prop?.['مبلغ_اشتراك_الجمعية']} />
                <Field label="تاريخ دفع الاشتراك" value={prop?.['تاريخ_دفع_الاشتراك']} />
                <Field label="إجمالي الرسوم (ر.س)" value={prop?.['إجمالي_رسوم_الجمعية']} />
                <Field label="عدد المصوتين" value={prop?.['عدد_المصوتين']} />
                <Field label="غير المصوتين" value={prop?.['غير_المصوتين']} />
                <Field label="نسبة القبول (%)" value={prop?.['نسبة_قبول_الجمعية']} />
                <Field label="ملاحظات الجمعية" value={prop?.['ملاحظات_الجمعية']} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 11: طلبات الصيانة وأعمال التشغيل */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="11" title="طلبات الصيانة السابقة وأعمال التشغيل" icon={Wrench} />
              </div>
              <div className="p-5 print:p-3">
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5 print:rounded print:border-slate-300 print:mb-3">
                <table className="w-full text-xs border-collapse print:text-[7pt]">
                  <thead>
                    <tr className="bg-[#1a1209]">
                      {['تاريخ الطلب', 'نوع الصيانة', 'وصف الطلب', 'الأولوية', 'الحالة', 'الفني / المقاول', 'التكلفة (ر.س)', 'مدة التنفيذ', 'ملاحظات الصيانة'].map(h => (
                        <th key={h} className="px-2 py-2 text-right text-[10px] font-bold text-[#C8A951] print:px-1.5 print:py-1.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.maint.length > 0 ? report.maint.slice(0, 10).map((m, i) => (
                      <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['تاريخ_الطلب'] || m.created_date || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['نوع_الصيانة'] || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['وصف_الطلب'] || m.description || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['الأولوية'] || m.priority || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['الحالة'] || m.status || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['الفني'] || m.technician || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 font-medium text-[#C8A951] print:px-1.5 print:py-1">{m['التكلفة'] || m.cost || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 print:px-1.5 print:py-1">{m['مدة_التنفيذ'] || '—'}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 text-slate-400 print:px-1.5 print:py-1">{m['ملاحظات'] || '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={9} className="text-center py-6 text-slate-400 text-xs">لا توجد طلبات صيانة مسجلة</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:gap-2">
                <Field label="إجمالي تكاليف الصيانة" value={`${report.maintCost.toLocaleString('ar-SA')} ر.س`} />
                <Field label="عدد السجلات المدخلة" value={report.maint.length} />
                <Field label="متوسط تكلفة الطلب" value={report.maint.length > 0 ? `${Math.round(report.maintCost / report.maint.length).toLocaleString('ar-SA')} ر.س` : '—'} />
                <Field label="حالة ملفات الصيانة" value={report.maint.length > 0 ? 'مكتملة' : 'لا يوجد'} />
              </div>
              </div>
            </div>

            {/* القسم 12: الملاحظات العامة والتقييم الإداري */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="12" title="الملاحظات العامة والتقييم الإداري" icon={AlertCircle} />
              </div>
              <div className="p-5 print:p-3">
              <div className="space-y-2.5 text-xs print:text-[8pt]">
                {[
                  { label: 'المتابعة', value: 'يتم التواصل المستمر مع المستأجرين والمتعهدين لضمان انتظام السداد واستكمال الأعمال.' },
                  { label: 'الالتزام', value: `مستوى الالتزام العام في العقار ${report.occupancy >= 80 ? 'مرتفع' : 'متوسط'} وفق المؤشرات الحالية.` },
                  { label: 'التحديات', value: report.vacant.length > 0 ? `وجود ${report.vacant.length} وحدة شاغرة تحتاج تسويقاً` : 'لا توجد تحديات جوهرية حالياً.' },
                  { label: 'فرص التحسين وزيادة الدخل', value: 'مراجعة أسعار الإيجار وفق السوق الحالي، وتحسين المرافق لرفع قيمة الوحدات.' },
                  { label: 'المخاطر الاستثمارية', value: 'منخفضة - الإشغال مستقر والتدفق النقدي إيجابي.' },
                  { label: 'الملاحظات العامة', value: `إجمالي ${report.units.length} وحدة، ${report.rented.length} مؤجرة بنسبة إشغال ${report.occupancy}%` },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 print:rounded print:p-2">
                    <span className="font-bold text-[#C8A951] min-w-[130px] shrink-0 print:min-w-[100px]">• {item.label}:</span>
                    <span className="text-slate-600 leading-relaxed">{item.value}</span>
                  </div>
                ))}
              </div>
              </div>
            </div>

            {/* القسم 13: التوصيات المقترحة للمالك */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="13" title="التوصيات المقترحة للمالك" icon={Star} />
              </div>
              <div className="p-5 print:p-3">
              <ul className="space-y-2.5 text-xs print:text-[8pt]">
                {[
                  'تجديد عقود الصيانة الدورية للمرافق الحيوية مع متابعة الأداء التشغيلي بشكل شهري.',
                  'البدء في تسويق الوحدات الشاغرة أو المحجوزة غير المؤكدة بأسعار تنافسية لرفع نسبة الإشغال.',
                  'مراجعة فرص تحسين الدخل من خلال إعادة تسعير بعض الوحدات بعد تنفيذ التحسينات المناسبة.',
                  'تخصيص بند رأسمالي للأعمال التطويرية التي تدعم زيادة القيمة السوقية والعائد الاستثماري.',
                ].map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 bg-[#C8A951]/5 rounded-xl p-3 border border-[#C8A951]/15 print:rounded print:p-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C8A951] shrink-0 mt-0.5">
                      <CheckCircle2 size={11} className="text-white" />
                    </div>
                    <span className="text-slate-600 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>

            {/* القسم 14: ملخص البيانات النهائية */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="14" title="ملخص البيانات النهائية" icon={CheckCircle2} />
              </div>
              <div className="p-5 print:p-3">
              <FieldGrid cols={2}>
                <Field label="اسم العقار" value={prop?.['اسم_العقار'] || prop?.name} />
                <Field label="اسم المالك" value={report.owner?.['اسم_المالك'] || report.owner?.name} />
                <Field label="إجمالي الوحدات" value={report.units.length} />
                <Field label="نسبة الإشغال" value={`${report.occupancy}%`} />
                <Field label="الإيراد السنوي المتوقع" value={`${report.income.toLocaleString('ar-SA')} ر.س`} />
                <Field label="صافي الدخل التشغيلي" value={`${report.net.toLocaleString('ar-SA')} ر.س`} />
                <Field label="القيمة السوقية التقديرية" value={`${(report.income * 15).toLocaleString('ar-SA')} ر.س`} />
                <Field label="صافي العائد على الاستثمار ROI" value={`${report.income > 0 ? Math.round((report.net / Math.max(report.income, 1)) * 100) : 0}%`} />
                <Field label="حالة العقار" value={prop?.['حالة_العقار'] || 'ممتازة'} />
                <Field label="قرار الإدارة / التوصية النهائية" value={report.occupancy >= 80 ? 'الاستمرار في الإدارة مع التحسين' : 'تكثيف التسويق ورفع نسبة الإشغال'} />
              </FieldGrid>
              </div>
            </div>

            {/* القسم 15: قسم الاعتماد والتوثيق */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 print:px-3 print:py-2">
                <SectionTitle num="15" title="قسم الاعتماد والتوثيق" icon={Shield} />
              </div>
              <div className="p-5 print:p-3">
              <div className="grid grid-cols-2 gap-8 print:gap-6">
                {/* معد التقرير */}
                <div className="space-y-4 print:space-y-3">
                  <p className="text-xs font-bold text-slate-700 mb-3">معد التقرير</p>
                  <div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">الاسم</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-md h-8 print:h-6" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">رقم الهاتف</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-md h-8 print:h-6" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">البريد الإلكتروني</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-md h-8 print:h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">التوقيع</div>
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl h-20 print:h-14 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300">التوقيع هنا</span>
                    </div>
                  </div>
                </div>

                {/* المسؤول المعتمد */}
                <div className="space-y-4 print:space-y-3">
                  <p className="text-xs font-bold text-slate-700 mb-3">المسؤول المعتمد</p>
                  <div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">الاسم</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-md h-8 print:h-6" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">الختم الرسمي</div>
                      <div className="border-2 border-dashed border-[#C8A951]/40 rounded-full w-20 h-20 print:w-14 print:h-14 flex items-center justify-center">
                        <span className="text-[9px] text-[#C8A951]/40 font-medium">ختم</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1">التوقيع</div>
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl h-20 print:h-14 flex items-center justify-center">
                        <span className="text-[10px] text-slate-300">التوقيع هنا</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* تذييل التقرير */}
              <div className="mt-6 pt-4 border-t border-[#C8A951]/20 print:mt-4 print:pt-3">
                <div className="bg-gradient-to-l from-[#1a1209] via-[#2d1f06] to-[#1a1209] rounded-xl p-3 text-center print:rounded print:p-2">
                  <p className="text-[10px] text-[#C8A951]/80 print:text-[7pt]">
                    شركة رمز الإبداع لإدارة الأملاك &nbsp;|&nbsp; www.ramzabdae.com &nbsp;|&nbsp; نموذج رسمي للطباعة والأرشفة &nbsp;|&nbsp; سري وخاص بمالك العقار والجهات المعنية فقط
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── أنماط الطباعة ── */}
      <style>{`
        .official-report {
          background: #ffffff !important;
          color: #0f172a !important;
        }

        .official-report .bg-slate-50 {
          background: #f8fafc !important;
        }

        .official-report .bg-slate-50\\/70 {
          background: rgba(248,250,252,0.7) !important;
        }

        .official-report .text-slate-600,
        .official-report .text-slate-500,
        .official-report .text-slate-400 {
          color: #475569 !important;
        }

        .official-report .text-slate-900,
        .official-report .text-slate-800 {
          color: #0f172a !important;
        }

        .official-report table {
          background: #ffffff !important;
        }

        .official-report tr:nth-child(even) td {
          background: rgba(248,250,252,0.7);
        }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:rounded { border-radius: 4px !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-3 { padding: 0.75rem !important; }
          .print\\:p-2 { padding: 0.5rem !important; }
          .print\\:px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
          .print\\:py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .print\\:text-\\[7pt\\] { font-size: 7pt !important; }
          .print\\:text-\\[8pt\\] { font-size: 8pt !important; }
          .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .print\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .print\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </DashboardLayout>
  );
}
