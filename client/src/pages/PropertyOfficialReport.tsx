/*
 * تقرير العقار الشامل - رمز الإبداع لإدارة الأملاك والعقارات
 * مطابق للهوية البصرية الرسمية للشركة - قابل للطباعة وتصدير PDF
 */
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  Building2, Printer, Download, Loader2, MapPin, Users, DollarSign,
  Wrench, TrendingUp, Home, Shield, CheckCircle2, AlertCircle,
  Star, ClipboardList, BarChart3, Search, ChevronDown, X, FileText
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

// ─── هوية بصرية ────────────────────────────────
const GOLD   = '#C8A951';
const DARK   = '#1a1209';
const DARK2  = '#2d1f06';
const LOGO_URL = '/brand/ramz-logo.svg';

// ─── مكوّن حقل بيانات ───────────────────────────
function DataRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0 print:py-1">
      <span className="text-xs text-gray-500 shrink-0 min-w-[130px] print:text-[7pt] print:min-w-[100px]">{label}</span>
      <span className="text-xs font-semibold text-gray-900 text-left print:text-[7pt]">{value || '—'}</span>
    </div>
  );
}

// ─── رأس قسم بشريط ذهبي ────────────────────────
function SecHeader({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-3 print:mb-2">
      <div className="w-1 h-5 rounded-full print:h-4" style={{ background: GOLD }} />
      {Icon && <Icon size={14} style={{ color: GOLD }} className="shrink-0 print:hidden" />}
      <h3 className="font-black text-sm text-gray-900 print:text-[9pt]">{title}</h3>
    </div>
  );
}

// ─── بطاقة KPI ──────────────────────────────────
function KPI({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center border print:rounded print:p-1.5 ${highlight ? 'border-transparent' : 'border-gray-200 bg-white'}`}
      style={highlight ? { background: GOLD, borderColor: GOLD } : {}}>
      <div className="text-xl font-black leading-none print:text-[14pt]"
        style={{ color: highlight ? 'white' : GOLD }}>{value}</div>
      {sub && <div className="text-[9px] mt-0.5 print:text-[6pt]" style={{ color: highlight ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>{sub}</div>}
      <div className="text-[10px] font-semibold mt-1 print:text-[7pt]"
        style={{ color: highlight ? 'rgba(255,255,255,0.9)' : '#6b7280' }}>{label}</div>
    </div>
  );
}

// ─── جدول ────────────────────────────────────────
function ReportTable({ headers, rows, emptyMsg }: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  emptyMsg?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 print:rounded print:border-gray-300">
      <table className="w-full text-xs border-collapse print:text-[7pt]">
        <thead>
          <tr style={{ background: DARK }}>
            {headers.map(h => (
              <th key={h} className="px-2.5 py-2 text-right font-bold print:px-1.5 print:py-1.5" style={{ color: GOLD }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="py-5 text-center text-gray-400 text-xs">{emptyMsg || 'لا توجد بيانات'}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-gray-100 px-2.5 py-1.5 print:px-1.5 print:py-1">{cell ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── كارت قسم ────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm print:rounded print:shadow-none print:border-gray-300 print:mb-3 print-break-inside-avoid ${className}`}>
      {children}
    </div>
  );
}
function SectionBody({ children }: { children: React.ReactNode }) {
  return <div className="p-5 print:p-3">{children}</div>;
}

// ════════════════════════════════════════════════
export default function PropertyOfficialReport() {
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { data, loading } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit' }, { name: 'Payment' },
    { name: 'Expense' }, { name: 'Maintenance' }, { name: 'Lease' },
    { name: 'Owner' }, { name: 'Tenant' }
  ]);

  const allEjarContracts = useMemo(() => {
    try { const r = localStorage.getItem('real_contracts'); return r ? JSON.parse(r) : []; } catch { return []; }
  }, []);

  const [selectedId, setSelectedId] = useState('');
  const [reportDate] = useState(() => new Date().toLocaleDateString('ar-SA'));
  const [reportNum] = useState(() => `PRP-${Date.now().toString().slice(-12)}`);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const properties = data.Property || [];

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const filteredProperties = useMemo(() =>
    properties.filter(p => {
      const name = String(p['اسم_العقار'] || p.name || '').toLowerCase();
      const city = String(p['المدينة'] || p.city || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q) || city.includes(q);
    }), [properties, searchQuery]);

  const requestedPropertyId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('propertyId') || params.get('id') || '';
  }, []);

  const activePropertyId = useMemo(() => {
    if (selectedId && properties.some(p => String(p.id) === selectedId)) return selectedId;
    if (requestedPropertyId) {
      const m = properties.find(p => String(p.id) === requestedPropertyId);
      if (m) return String(m.id);
    }
    return properties[0] ? String(properties[0].id) : '';
  }, [properties, requestedPropertyId, selectedId]);

  // ── حساب التقرير ─────────────────────────────
  const report = useMemo(() => {
    if (!activePropertyId) return null;
    const prop = properties.find(p => String(p.id) === activePropertyId);
    if (!prop) return null;
    const id = prop.id;

    const units     = (data.Unit        || []).filter(u => u['معرف_العقار'] === id || u.property_id === id);
    const leases    = (data.Lease       || []).filter(l => l['معرف_العقار'] === id || l.property_id === id);
    const payments  = (data.Payment     || []).filter(p => p['معرف_العقار'] === id || p.property_id === id);
    const expenses  = (data.Expense     || []).filter(e => e['معرف_العقار'] === id || e.property_id === id);
    const maint     = (data.Maintenance || []).filter(m => m['معرف_العقار'] === id || m.property_id === id);
    const owner     = (data.Owner       || []).find(o => o.id === (prop['معرف_المالك'] || prop.owner_id));
    const owners    = (data.Owner       || []).filter(o => o.id === (prop['معرف_المالك'] || prop.owner_id) || !prop['معرف_المالك']);

    const rented   = units.filter(u => ['مؤجرة','مشغولة','occupied'].includes(u['حالة_الوحدة'] || u.status || ''));
    const vacant   = units.filter(u => ['شاغرة','vacant'].includes(u['حالة_الوحدة'] || u.status || ''));
    const inMaint  = units.filter(u => ['صيانة','maintenance'].includes(u['حالة_الوحدة'] || u.status || ''));
    const occupancy = units.length > 0 ? Math.round((rented.length / units.length) * 100) : 0;

    const activeLeases = leases.filter(l => ['نشط','active','ساري'].includes(l['حالة_العقد'] || l.status || ''));

    const totalContractValue = activeLeases.reduce((s, l) => s + Number(l['قيمة_الإيجار'] || l.rent || 0), 0);
    const totalInvoices      = payments.reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalCollected     = payments.filter(p => ['مدفوع','paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalOverdue       = payments.filter(p => ['متأخر','overdue','unpaid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExp           = expenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    const totalMaintCost     = maint.reduce((s, m) => s + Number(m['التكلفة'] || m.cost || 0), 0);
    const totalInsurance     = leases.reduce((s, l) => s + Number(l['مبلغ_التأمين'] || l.deposit || 0), 0);
    const totalDocFees       = leases.reduce((s, l) => s + Number(l['رسوم_التوثيق'] || l.documentation_fees || 0), 0);
    const totalBrokerageFees = leases.reduce((s, l) => s + Number(l['رسوم_السعي'] || l.brokerage_fees || 0), 0);

    const adminRate = Number(prop['رسوم_الإدارة'] || prop.management_fee || 0);
    const adminFees = adminRate > 0 ? Math.round(totalCollected * adminRate / 100) : 0;
    const netFlow   = totalCollected - totalExp - totalMaintCost - adminFees;

    const collectionRate = totalInvoices > 0 ? Math.min(100, Math.round((totalCollected / totalInvoices) * 100)) : 0;

    // مؤشر صحة العقار
    const dataFields = [prop['اسم_العقار']||prop.name, prop['المدينة']||prop.city, prop['العنوان']||prop.address, prop['رقم_الصك']||prop['رقم_وثيقة_الملكية'], owner?.['اسم_المالك']||owner?.name];
    const completeness = Math.round((dataFields.filter(Boolean).length / dataFields.length) * 100);
    const healthScore  = Math.min(100, Math.round(occupancy * 0.4 + collectionRate * 0.3 + completeness * 0.3));

    const monthlyRent = prop['الإيجار_الشهري'] || (totalContractValue > 0 ? Math.round(totalContractValue / 12) : 0);

    return {
      prop, owner, owners, units, leases, payments, expenses, maint,
      rented, vacant, inMaint, activeLeases,
      occupancy, collectionRate, healthScore, completeness,
      totalContractValue, totalInvoices, totalCollected, totalOverdue,
      totalExp, totalMaintCost, totalInsurance, totalDocFees, totalBrokerageFees,
      adminFees, adminRate, netFlow, monthlyRent,
    };
  }, [activePropertyId, data, properties]);

  const ejarContracts = useMemo(() => {
    if (!report?.prop) return allEjarContracts;
    const n = String(report.prop['اسم_العقار'] || report.prop.name || '').trim().toLowerCase();
    if (!n) return allEjarContracts;
    const filtered = allEjarContracts.filter((c: any) => {
      const cn = String(c['اسم_العقار'] || c.propertyName || c['العقار'] || '').toLowerCase();
      return cn.includes(n) || n.includes(cn);
    });
    return filtered.length > 0 ? filtered : allEjarContracts;
  }, [allEjarContracts, report]);

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    if (!printRef.current || !report) { toast.error('اختر عقاراً أولاً'); return; }
    try {
      setIsExporting(true);
      const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
      const imgData = await toPng(printRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' });
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = imgData;
      });
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ih = (img.height * pw) / img.width;
      let left = ih; let pos = 0;
      pdf.addImage(imgData, 'PNG', 0, pos, pw, ih, undefined, 'FAST');
      left -= ph;
      while (left > 0) {
        pos = left - ih; pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, pos, pw, ih, undefined, 'FAST');
        left -= ph;
      }
      const name = String(report.prop?.['اسم_العقار'] || report.prop?.name || 'property').replace(/\s+/g, '-').replace(/[^\w؀-ۿ-]/g, '');
      pdf.save(`${reportNum}-${name}.pdf`);
      toast.success('تم تصدير التقرير بنجاح');
    } catch { toast.error('تعذر تصدير PDF'); } finally { setIsExporting(false); }
  };

  if (loading) return <DashboardLayout pageTitle="تقرير العقار الشامل"><LoadingState /></DashboardLayout>;

  const prop = report?.prop;

  return (
    <DashboardLayout pageTitle="تقرير العقار الشامل">

      {/* ── شريط الأدوات (يُخفى عند الطباعة) ── */}
      <div className="print:hidden mb-5">
        {/* اختيار العقار */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
            <Building2 size={12} style={{ color: GOLD }} /> اختر العقار لإعداد التقرير الشامل
          </p>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => { setDropdownOpen(v => !v); setTimeout(() => searchRef.current?.focus(), 50); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-sidebar hover:border-[#C8A951]/50 transition-all text-right"
            >
              <Building2 size={15} style={{ color: GOLD }} className="shrink-0" />
              <span className={`flex-1 text-sm truncate ${activePropertyId ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {activePropertyId
                  ? (properties.find(p => String(p.id) === activePropertyId)?.['اسم_العقار'] || properties.find(p => String(p.id) === activePropertyId)?.name || 'بدون اسم')
                  : 'انقر لاختيار عقار...'}
              </span>
              <ChevronDown size={14} className={`text-muted-foreground shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-2 right-0 left-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2 bg-sidebar rounded-lg px-3 py-2">
                    <Search size={13} className="text-muted-foreground shrink-0" />
                    <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="ابحث باسم العقار أو المدينة..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" dir="rtl" />
                    {searchQuery && <button onClick={() => setSearchQuery('')}><X size={12} className="text-muted-foreground" /></button>}
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredProperties.map(p => {
                    const pid = String(p.id);
                    const isSelected = pid === activePropertyId;
                    const units = (data.Unit || []).filter(u => u['معرف_العقار'] === p.id || u.property_id === p.id);
                    const rented = units.filter(u => ['مؤجرة','مشغولة','occupied'].includes(u['حالة_الوحدة'] || u.status || ''));
                    const occ = units.length ? Math.round((rented.length / units.length) * 100) : 0;
                    return (
                      <button key={pid} onClick={() => { setSelectedId(pid); setDropdownOpen(false); setSearchQuery(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-sidebar transition-colors border-b border-border/40 last:border-0 ${isSelected ? 'bg-[#C8A951]/8' : ''}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#C8A951]' : 'bg-sidebar'}`}>
                          <Building2 size={13} className={isSelected ? 'text-white' : 'text-muted-foreground'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: isSelected ? GOLD : undefined }}>{p['اسم_العقار'] || p.name || 'بدون اسم'}</div>
                          <div className="text-[10px] text-muted-foreground">{p['المدينة'] || p.city || ''}{p['نوع_العقار'] ? ` · ${p['نوع_العقار']}` : ''}</div>
                        </div>
                        <div className="text-[10px] shrink-0">
                          <div className="text-muted-foreground">{units.length} وحدة</div>
                          <div className="font-bold" style={{ color: occ >= 80 ? '#059669' : occ >= 50 ? '#d97706' : '#dc2626' }}>{occ}%</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-border bg-sidebar/50 text-[10px] text-muted-foreground">{filteredProperties.length} عقار متاح</div>
              </div>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        {report && (
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handlePrint} size="sm" className="gap-1.5 text-xs" style={{ background: GOLD, color: '#000' }}>
              <Printer size={13} /> طباعة
            </Button>
            <Button onClick={handleExportPdf} disabled={isExporting} size="sm" variant="outline" className="gap-1.5 text-xs" style={{ borderColor: GOLD + '80', color: GOLD }}>
              {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </Button>
            <button onClick={() => setLocation('/property-single-report')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:border-[#C8A951]/40 transition-all">
              <TrendingUp size={11} /> تقرير الأداء
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          محتوى التقرير القابل للطباعة
      ════════════════════════════════════════════ */}
      {!report ? (
        <div className="print:hidden bg-card border border-dashed border-border rounded-xl p-14 text-center">
          <Building2 size={42} className="mx-auto text-muted-foreground/25 mb-3" />
          <p className="text-sm text-muted-foreground">اختر عقاراً لعرض التقرير الشامل</p>
        </div>
      ) : (
        <div ref={printRef} className="official-report bg-white text-gray-900 font-sans" dir="rtl">

          {/* ══ الغلاف ══ */}
          <div className="mb-6 print:mb-4">
            {/* شريط الشركة العلوي */}
            <div className="px-7 py-5 print:px-5 print:py-4" style={{ background: `linear-gradient(to left, ${DARK}, ${DARK2}, ${DARK})` }}>
              <div className="flex items-start justify-between gap-4">
                {/* معلومات الشركة */}
                <div>
                  <div className="text-xs font-black tracking-widest mb-2 print:text-[8pt]" style={{ color: GOLD }}>
                    RAMZ AL-EBDAA PROPERTY MANAGEMENT
                  </div>
                  <div className="space-y-0.5 text-[10px] print:text-[7pt]" style={{ color: `${GOLD}99` }}>
                    <div>www.ramzabdae.com</div>
                    <div>info@ramzabdae.com</div>
                    <div>920013517</div>
                  </div>
                </div>
                {/* شعار + اسم */}
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="text-xl font-black print:text-[16pt]" style={{ color: GOLD }}>شركة رمز الإبداع</div>
                    <div className="text-xs print:text-[8pt]" style={{ color: `${GOLD}80` }}>لإدارة الأملاك والعقارات</div>
                  </div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center border print:w-10 print:h-10" style={{ borderColor: `${GOLD}40`, background: `${GOLD}15` }}>
                    <img src={LOGO_URL} alt="شعار رمز الإبداع" className="h-9 w-9 object-contain print:h-7 print:w-7"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                </div>
              </div>
            </div>

            {/* شريط عنوان التقرير */}
            <div className="px-7 py-4 print:px-5 print:py-3" style={{ background: GOLD }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white print:text-[18pt]">تقرير العقار الشامل</h1>
                  <p className="text-xs text-white/80 mt-0.5 print:text-[8pt]">
                    تقرير مترابط دون تكرار للعقار {prop?.['اسم_العقار'] || prop?.name || ''}
                  </p>
                </div>
                <div className="text-left shrink-0 space-y-1">
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-[10px] font-bold print:text-[7pt]">رقم المستند</span>
                    <span className="text-xs font-black text-white print:text-[8pt]">{reportNum}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-[10px] font-bold print:text-[7pt]">التصنيف</span>
                    <span className="text-xs font-black text-white print:text-[8pt]">تقرير عقار شامل</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-[10px] font-bold print:text-[7pt]">تاريخ الإصدار</span>
                    <span className="text-xs font-black text-white print:text-[8pt]">{reportDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-1 print:space-y-3">

            {/* ══ الملخص التنفيذي ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="الملخص التنفيذي" icon={FileText} />
                <p className="text-xs text-gray-600 leading-relaxed print:text-[8pt]">
                  يعرض هذا التقرير الوضع التشغيلي والمالي للعقار{' '}
                  <strong className="text-gray-900">{prop?.['اسم_العقار'] || prop?.name || ''}</strong>{' '}
                  حتى تاريخ الإصدار. حالة المحفظة:{' '}
                  <strong style={{ color: GOLD }}>
                    {report.collectionRate >= 80 ? 'مستقرة مالياً' : report.collectionRate >= 50 ? 'تحتاج متابعة مالية' : 'تحتاج تدخل عاجل'}
                  </strong>
                  {' '}بنسبة إشغال <strong className="text-gray-900">{report.occupancy}%</strong>{' '}
                  ونسبة تحصيل <strong className="text-gray-900">{report.collectionRate}%</strong>.{' '}
                  صافي التدفق المسجل هو{' '}
                  <strong className="text-gray-900">{report.netFlow.toLocaleString('ar-SA')} ر.س</strong>{' '}
                  بعد المصروفات ورسوم الإدارة.
                </p>
              </SectionBody>
            </Section>

            {/* ══ مؤشر صحة العقار ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="مؤشر صحة العقار" icon={TrendingUp} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
                  {/* الدرجة الكبيرة */}
                  <div className="md:col-span-1 rounded-xl p-5 text-center print:p-3" style={{ background: DARK }}>
                    <div className="text-5xl font-black print:text-[36pt]" style={{ color: GOLD }}>{report.healthScore}</div>
                    <div className="text-xs mt-1 print:text-[7pt]" style={{ color: `${GOLD}80` }}>من 100 بناءً على الإشغال والتحصيل واكتمال البيانات</div>
                  </div>
                  {/* المؤشرات الفرعية */}
                  <div className="md:col-span-3 grid grid-cols-1 gap-3 print:gap-2">
                    {/* كفاءة التحصيل */}
                    <div className="rounded-lg border border-gray-200 p-3 print:p-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 print:text-[7pt]">كفاءة التحصيل</span>
                        <span className="text-xs font-black print:text-[8pt]" style={{ color: GOLD }}>{report.collectionRate}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden print:h-1.5">
                        <div className="h-full rounded-full" style={{ width: `${report.collectionRate}%`, background: GOLD }} />
                      </div>
                    </div>
                    {/* اكتمال البيانات */}
                    <div className="rounded-lg border border-gray-200 p-3 print:p-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 print:text-[7pt]">اكتمال البيانات</span>
                        <span className="text-xs font-black print:text-[8pt]" style={{ color: GOLD }}>{report.completeness}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden print:h-1.5">
                        <div className="h-full rounded-full" style={{ width: `${report.completeness}%`, background: GOLD }} />
                      </div>
                    </div>
                    {/* صافي التدفق */}
                    <div className="rounded-lg border border-gray-200 p-3 print:p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 print:text-[7pt]">صافي التدفق</span>
                        <div className="text-left">
                          <div className="text-sm font-black print:text-[9pt]" style={{ color: report.netFlow >= 0 ? '#059669' : '#dc2626' }}>
                            {report.netFlow.toLocaleString('ar-SA')} ر.س
                          </div>
                          <div className="text-[9px] print:text-[6pt]" style={{ color: report.collectionRate >= 50 ? '#d97706' : '#dc2626' }}>
                            {report.collectionRate >= 80 ? 'وضع مالي سليم' : report.collectionRate >= 50 ? 'تحتاج متابعة مالية' : 'تحتاج تدخل عاجل'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 print:gap-2 print:mt-3">
                  <KPI label="إجمالي الوحدات"  value={report.units.length} />
                  <KPI label="وحدات مؤجرة"     value={report.rented.length} highlight />
                  <KPI label="عقود نشطة"        value={report.activeLeases.length} />
                  <KPI label="نسبة الإشغال"     value={`${report.occupancy}%`} />
                  <KPI label="الإيراد الشهري"   value={`${Number(report.monthlyRent).toLocaleString('ar-SA')}`} sub="ر.س" />
                  <KPI label="إجمالي المحصل"    value={`${report.totalCollected.toLocaleString('ar-SA')}`} sub="ر.س" highlight />
                  <KPI label="إجمالي المتأخر"   value={`${report.totalOverdue.toLocaleString('ar-SA')}`} sub="ر.س" />
                  <KPI label="صيانة مفتوحة"     value={report.maint.filter(m => !['مغلق','مكتمل','closed','completed'].includes(m['الحالة']||m.status||'')).length} />
                </div>
              </SectionBody>
            </Section>

            {/* ══ بيانات العقار ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="بيانات العقار" icon={Building2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 print:grid-cols-2">
                  <div>
                    <DataRow label="اسم العقار"        value={prop?.['اسم_العقار'] || prop?.name} />
                    <DataRow label="نوع العقار"         value={prop?.['نوع_العقار'] || prop?.type} />
                    <DataRow label="نوع المبنى"         value={prop?.['نوع_المبنى'] || prop?.['نوع_العقار']} />
                    <DataRow label="الاستخدام"          value={prop?.['الغرض'] || prop?.['نوع_الاستخدام']} />
                    <DataRow label="الحالة"             value={prop?.['حالة_العقار']} />
                  </div>
                  <div>
                    <DataRow label="الإيجار الشهري"    value={report.monthlyRent ? `${Number(report.monthlyRent).toLocaleString('ar-SA')} ر.س` : undefined} />
                    <DataRow label="المرافق"            value={prop?.['المرافق'] || prop?.['حالة_المرافق']} />
                    <DataRow label="رسوم الإدارة"       value={prop?.['رسوم_الإدارة'] ? `${prop['رسوم_الإدارة']}%` : undefined} />
                    <DataRow label="سنة البناء"         value={prop?.['سنة_البناء'] || prop?.year_built} />
                    <DataRow label="المساحة الإجمالية" value={prop?.['المساحة'] ? `${prop['المساحة']} م²` : undefined} />
                  </div>
                </div>
              </SectionBody>
            </Section>

            {/* ══ الموقع والعنوان ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="الموقع والعنوان" icon={MapPin} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 print:grid-cols-2">
                  <div>
                    <DataRow label="العنوان"           value={prop?.['العنوان'] || prop?.address} />
                    <DataRow label="العنوان الوطني"    value={prop?.['العنوان_الوطني']} />
                    <DataRow label="المنطقة"           value={prop?.['المنطقة']} />
                    <DataRow label="المدينة"           value={prop?.['المدينة'] || prop?.city} />
                    <DataRow label="الحي"              value={prop?.['الحي'] || prop?.neighborhood} />
                  </div>
                  <div>
                    <DataRow label="الشارع"            value={prop?.['الشارع']} />
                    <DataRow label="الرمز البريدي"     value={prop?.['الرمز_البريدي']} />
                    <DataRow label="رقم المبنى"        value={prop?.['رقم_المبنى']} />
                    <DataRow label="الرقم الإضافي"     value={prop?.['الرقم_الإضافي']} />
                    <DataRow label="العنوان المختصر"   value={prop?.['العنوان_المختصر']} />
                  </div>
                </div>
              </SectionBody>
            </Section>

            {/* ══ بيانات الصك والملكية ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="بيانات الصك والملكية" icon={Shield} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 print:grid-cols-2">
                  <div>
                    <DataRow label="رقم الصك"         value={prop?.['رقم_الصك'] || prop?.['رقم_وثيقة_الملكية']} />
                    <DataRow label="نوع الوثيقة"       value={prop?.['نوع_الوثيقة'] || 'صك ملكية إلكتروني'} />
                    <DataRow label="تاريخ الإصدار"     value={prop?.['تاريخ_إصدار_الوثيقة']} />
                    <DataRow label="جهة الإصدار"       value={prop?.['جهة_الإصدار'] || 'وزارة العدل'} />
                  </div>
                  <div>
                    <DataRow label="رقم القطعة"        value={prop?.['رقم_القطعة']} />
                    <DataRow label="رقم المخطط"        value={prop?.['رقم_المخطط']} />
                    <DataRow label="المساحة"            value={prop?.['مساحة_الصك'] || prop?.['المساحة'] ? `${prop?.['مساحة_الصك'] || prop?.['المساحة']} م²` : undefined} />
                  </div>
                </div>
              </SectionBody>
            </Section>

            {/* ══ ملخص الوحدات ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="ملخص الوحدات" icon={Home} />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:grid-cols-5 print:gap-2">
                  <KPI label="الوحدات المؤجرة"       value={report.rented.length} highlight />
                  <KPI label="الوحدات الشاغرة"       value={report.vacant.length} />
                  <KPI label="تحت الصيانة"           value={report.inMaint.length} />
                  <KPI label="إجمالي الوحدات"        value={report.units.length} />
                  <KPI label="نسبة الإشغال"          value={`${report.occupancy}%`} />
                </div>
              </SectionBody>
            </Section>

            {/* ══ الوحدات العقارية ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="الوحدات العقارية" icon={ClipboardList} />
                <ReportTable
                  headers={['الوحدة', 'النوع', 'المساحة', 'الغرف', 'التأثيث', 'الحالة', 'المستأجر', 'القيمة السنوية']}
                  emptyMsg="لا توجد وحدات مسجلة"
                  rows={report.units.slice(0, 25).map(u => {
                    const lease = report.leases.find(l => l['معرف_الوحدة'] === u.id || l.unit_id === u.id);
                    const tenant = lease ? (data.Tenant || []).find(t => t.id === (lease['معرف_المستأجر'] || lease.tenant_id)) : null;
                    const annualRent = Number(lease?.['قيمة_الإيجار'] || lease?.rent || 0);
                    return [
                      u['رقم_الوحدة'] || u.id,
                      u['نوع_الوحدة'] || '—',
                      u['المساحة'] ? `${u['المساحة']} م²` : '—',
                      u['عدد_الغرف'] || u.rooms || '—',
                      u['التأثيث'] || (u['مؤثثة'] ? 'مؤثثة' : 'غير مؤثثة'),
                      u['حالة_الوحدة'] || u.status || '—',
                      tenant?.['اسم_المستأجر'] || tenant?.name || '—',
                      annualRent > 0 ? `${annualRent.toLocaleString('ar-SA')} ر.س` : '—',
                    ];
                  })}
                />
              </SectionBody>
            </Section>

            {/* ══ الأداء المالي والعقود ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="الأداء المالي والعقود" icon={DollarSign} />
                <p className="text-[10px] text-gray-400 mb-4 print:text-[7pt]">القيم مبنية على السجلات المرتبطة بالعقار</p>

                {/* الملخص المالي */}
                <div className="mb-4 print:mb-3">
                  <h4 className="text-xs font-black text-gray-700 mb-2 print:text-[8pt]">الملخص المالي</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 print:grid-cols-2 bg-gray-50 rounded-xl p-4 border border-gray-200 print:p-2 print:rounded">
                    <div>
                      <DataRow label="إجمالي قيمة العقود"  value={`${report.totalContractValue.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="إجمالي الفواتير"      value={`${report.totalInvoices.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="إجمالي المحصل"        value={`${report.totalCollected.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="إجمالي المتأخرات"     value={`${report.totalOverdue.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="نسبة التحصيل"         value={`${report.collectionRate}%`} />
                    </div>
                    <div>
                      <DataRow label="مبالغ التأمين"        value={`${report.totalInsurance.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="إجمالي المصروفات"     value={`${report.totalExp.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="رسوم الإدارة"         value={`${report.adminFees.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="رسوم التوثيق"         value={`${report.totalDocFees.toLocaleString('ar-SA')} ر.س`} />
                      <DataRow label="صافي التدفق"          value={`${report.netFlow.toLocaleString('ar-SA')} ر.س`} />
                    </div>
                  </div>
                </div>

                {/* العقود النشطة */}
                <div className="mb-4 print:mb-3">
                  <h4 className="text-xs font-black text-gray-700 mb-2 print:text-[8pt]">العقود النشطة</h4>
                  <ReportTable
                    headers={['رقم العقد', 'المستأجر', 'رقم الهوية', 'الوحدة', 'البداية', 'النهاية', 'القيمة', 'رسوم التوثيق', 'التأمين']}
                    emptyMsg="لا توجد عقود نشطة"
                    rows={report.activeLeases.slice(0, 10).map(l => {
                      const tenant = (data.Tenant || []).find(t => t.id === (l['معرف_المستأجر'] || l.tenant_id));
                      return [
                        l['رقم_العقد'] || l.id,
                        tenant?.['اسم_المستأجر'] || tenant?.name || l['اسم_المستأجر'] || '—',
                        tenant?.['رقم_الهوية'] || tenant?.national_id || '—',
                        l['رقم_الوحدة'] || l.unit_id || '—',
                        l['تاريخ_بداية_العقد'] || l.start_date || '—',
                        l['تاريخ_نهاية_العقد'] || l.end_date || '—',
                        Number(l['قيمة_الإيجار'] || l.rent || 0) > 0 ? `${Number(l['قيمة_الإيجار']||l.rent||0).toLocaleString('ar-SA')} ر.س` : '—',
                        Number(l['رسوم_التوثيق'] || l.documentation_fees || 0) > 0 ? `${Number(l['رسوم_التوثيق']||l.documentation_fees||0).toLocaleString('ar-SA')} ر.س` : '٠ ر.س',
                        Number(l['مبلغ_التأمين'] || l.deposit || 0) > 0 ? `${Number(l['مبلغ_التأمين']||l.deposit||0).toLocaleString('ar-SA')} ر.س` : '٠ ر.س',
                      ];
                    })}
                  />
                </div>

                {/* الفواتير والدفعات */}
                <div className="mb-4 print:mb-3">
                  <h4 className="text-xs font-black text-gray-700 mb-2 print:text-[8pt]">الفواتير والدفعات</h4>
                  <ReportTable
                    headers={['رقم الفاتورة', 'المستأجر', 'الوحدة', 'الاستحقاق', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة']}
                    emptyMsg="لا توجد فواتير"
                    rows={report.payments.slice(0, 15).map(p => {
                      const total = Number(p['مبلغ_الدفعة'] || p.amount || 0);
                      const isPaid = ['مدفوع','paid'].includes(p['حالة_الدفع'] || p.status || '');
                      const paid = isPaid ? total : 0;
                      const tenant = (data.Tenant || []).find(t => t.id === (p['معرف_المستأجر'] || p.tenant_id));
                      return [
                        p['رقم_الفاتورة'] || p.id,
                        tenant?.['اسم_المستأجر'] || tenant?.name || '—',
                        p['رقم_الوحدة'] || '—',
                        p['تاريخ_الاستحقاق'] || p.due_date || '—',
                        `${total.toLocaleString('ar-SA')} ر.س`,
                        `${paid.toLocaleString('ar-SA')} ر.س`,
                        `${(total - paid).toLocaleString('ar-SA')} ر.س`,
                        p['حالة_الدفع'] || p.status || '—',
                      ];
                    })}
                  />
                </div>

                {/* ملاك العقار المسجلون */}
                <div>
                  <h4 className="text-xs font-black text-gray-700 mb-2 print:text-[8pt]">ملاك العقار المسجلون</h4>
                  <ReportTable
                    headers={['#', 'اسم المالك', 'رقم الهوية', 'النوع', 'نسبة الملكية', 'المساحة', 'الجوال']}
                    emptyMsg="لا توجد بيانات ملاك"
                    rows={report.owners.length > 0
                      ? report.owners.map((o, i) => [
                          i + 1,
                          o['اسم_المالك'] || o.name || 'مالك',
                          o['رقم_الهوية'] || o.national_id || '—',
                          o['نوع_المالك'] || 'فرد',
                          `${o['نسبة_الملكية'] || 100}%`,
                          prop?.['المساحة'] ? `${prop['المساحة']} م²` : '—',
                          o['رقم_الجوال'] || o.phone || '—',
                        ])
                      : [[1, report.owner?.['اسم_المالك'] || report.owner?.name || 'مالك', report.owner?.['رقم_الهوية'] || '—', 'فرد', '100%', prop?.['المساحة'] ? `${prop['المساحة']} م²` : '—', report.owner?.['رقم_الجوال'] || report.owner?.phone || '—']]
                    }
                  />
                </div>
              </SectionBody>
            </Section>

            {/* ══ الحوكمة والتشغيل ══ */}
            <Section>
              <SectionBody>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
                    <h3 className="font-black text-sm text-gray-900 print:text-[9pt]">الحوكمة والتشغيل</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border print:text-[7pt]" style={{ borderColor: GOLD + '40', color: GOLD, background: GOLD + '10' }}>
                    اكتمال البيانات {report.completeness}%
                  </span>
                </div>

                {/* جمعية اتحاد الملاك */}
                <div className="mb-5 print:mb-3">
                  <SecHeader title="جمعية اتحاد الملاك" icon={Users} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 print:grid-cols-2">
                    <div>
                      <DataRow label="اسم الاتحاد"       value={prop?.['اسم_جمعية_الملاك']} />
                      <DataRow label="رقم التسجيل"       value={prop?.['رقم_جمعية_الملاك']} />
                      <DataRow label="رئيس الجمعية"      value={prop?.['رئيس_الجمعية']} />
                      <DataRow label="هاتف الرئيس"       value={prop?.['جوال_رئيس_الجمعية']} />
                    </div>
                    <div>
                      <DataRow label="عدد الأعضاء"       value={prop?.['عدد_أعضاء_الجمعية']} />
                      <DataRow label="تاريخ التأسيس"      value={prop?.['تاريخ_تأسيس_الجمعية']} />
                      <DataRow label="انتهاء الدورة"      value={prop?.['تاريخ_انتهاء_دورة_الجمعية']} />
                      <DataRow label="الحالة"             value={prop?.['حالة_جمعية_الملاك'] || 'لا توجد جمعية مسجلة'} />
                    </div>
                  </div>
                </div>

                {/* السجل العيني */}
                <div className="mb-5 print:mb-3">
                  <SecHeader title="السجل العيني" icon={Shield} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 print:grid-cols-2">
                    <div>
                      <DataRow label="رقم السجل"         value={prop?.['رقم_التسجيل_العيني']} />
                      <DataRow label="المعرف العقاري"     value={prop?.['المعرف_العقاري']} />
                      <DataRow label="تاريخ التسجيل"      value={prop?.['تاريخ_التسجيل']} />
                      <DataRow label="حالة التسجيل"       value={prop?.['حالة_التسجيل'] || 'مسجل'} />
                    </div>
                    <div>
                      <DataRow label="جهة التسجيل"       value={prop?.['جهة_التسجيل']} />
                      <DataRow label="رقم القطعة"         value={prop?.['رقم_القطعة']} />
                      <DataRow label="رقم المخطط"         value={prop?.['رقم_المخطط']} />
                      <DataRow label="ملاحظات"            value={prop?.['ملاحظات_السجل_العيني']} />
                    </div>
                  </div>
                </div>

                {/* طلبات الصيانة المرتبطة */}
                <div className="mb-5 print:mb-3">
                  <SecHeader title="طلبات الصيانة المرتبطة" icon={Wrench} />
                  <ReportTable
                    headers={['الطلب', 'الوحدة', 'التصنيف', 'الأولوية', 'الفني', 'التكلفة', 'الحالة']}
                    emptyMsg="لا توجد بيانات مرتبطة"
                    rows={report.maint.slice(0, 10).map(m => [
                      m['رقم_الطلب'] || m.id,
                      m['رقم_الوحدة'] || m.unit_id || '—',
                      m['نوع_الصيانة'] || '—',
                      m['الأولوية'] || m.priority || '—',
                      m['الفني'] || m.technician || '—',
                      Number(m['التكلفة'] || m.cost || 0) > 0 ? `${Number(m['التكلفة']||m.cost||0).toLocaleString('ar-SA')} ر.س` : '—',
                      m['الحالة'] || m.status || '—',
                    ])}
                  />
                </div>

                {/* المصروفات المرتبطة */}
                <div>
                  <SecHeader title="المصروفات المرتبطة" icon={DollarSign} />
                  <ReportTable
                    headers={['البيان', 'التصنيف', 'التاريخ', 'المبلغ']}
                    emptyMsg="لا توجد بيانات مرتبطة"
                    rows={report.expenses.slice(0, 10).map(e => [
                      e['البيان'] || e['الوصف'] || e.description || '—',
                      e['نوع_المصروف'] || e.category || '—',
                      e['التاريخ'] || e.date || e.created_date || '—',
                      Number(e['المبلغ'] || e.amount || 0) > 0 ? `${Number(e['المبلغ']||e.amount||0).toLocaleString('ar-SA')} ر.س` : '—',
                    ])}
                  />
                </div>
              </SectionBody>
            </Section>

            {/* ══ التوصيات والإجراءات المقترحة ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="التوصيات والإجراءات المقترحة" icon={Star} />
                <div className="space-y-2 print:space-y-1.5">
                  {(() => {
                    const recs = [];
                    if (report.totalOverdue > 0) recs.push(`متابعة متأخرات بقيمة ${report.totalOverdue.toLocaleString('ar-SA')} ر.س وربطها بخطة تحصيل.`);
                    if (report.vacant.length > 0) recs.push(`تسويق ${report.vacant.length} وحدة شاغرة لرفع نسبة الإشغال من ${report.occupancy}%.`);
                    if (report.completeness < 100) recs.push('استكمال بيانات العنوان الوطني والملكية لرفع موثوقية التقرير.');
                    if (report.maint.filter(m => !['مغلق','مكتمل','closed','completed'].includes(m['الحالة']||m.status||'')).length > 0) recs.push('متابعة طلبات الصيانة المفتوحة وإغلاقها في أسرع وقت.');
                    recs.push('مراجعة أسعار الإيجار وفق السوق الحالي لتعظيم العائد على الاستثمار.');
                    recs.push('تجديد عقود الصيانة الدورية للمرافق الحيوية مع متابعة الأداء التشغيلي.');
                    return recs.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-3 border print:p-2 print:rounded" style={{ borderColor: GOLD + '30', background: GOLD + '08' }}>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 print:hidden" style={{ background: GOLD }}>
                          <span className="text-white text-[9px] font-black">{i + 1}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed print:text-[7pt]"><strong className="print:hidden">{i + 1}. </strong>{rec}</p>
                      </div>
                    ));
                  })()}
                </div>
              </SectionBody>
            </Section>

            {/* ══ قسم الاعتماد والتوقيع ══ */}
            <Section>
              <SectionBody>
                <SecHeader title="قسم الاعتماد والتوثيق" icon={CheckCircle2} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6">
                  {/* معد التقرير */}
                  <div className="space-y-3 print:space-y-2">
                    <p className="text-xs font-black text-gray-700">معد التقرير</p>
                    <div><div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">الاسم</div><div className="h-8 bg-gray-50 border border-gray-200 rounded-lg print:h-5" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">رقم الهاتف</div><div className="h-8 bg-gray-50 border border-gray-200 rounded-lg print:h-5" /></div>
                      <div><div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">البريد الإلكتروني</div><div className="h-8 bg-gray-50 border border-gray-200 rounded-lg print:h-5" /></div>
                    </div>
                    <div><div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">التوقيع</div>
                      <div className="h-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center print:h-12 print:rounded">
                        <span className="text-[10px] text-gray-300 print:text-[7pt]">التوقيع هنا</span>
                      </div>
                    </div>
                  </div>
                  {/* المسؤول المعتمد */}
                  <div className="space-y-3 print:space-y-2">
                    <p className="text-xs font-black text-gray-700">المسؤول المعتمد</p>
                    <div><div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">الاسم</div><div className="h-8 bg-gray-50 border border-gray-200 rounded-lg print:h-5" /></div>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">الختم الرسمي</div>
                        <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center print:w-14 print:h-14" style={{ borderColor: GOLD + '50' }}>
                          <span className="text-[9px] font-medium print:text-[6pt]" style={{ color: GOLD + '50' }}>ختم</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide print:text-[6pt]">التوقيع</div>
                        <div className="h-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center print:h-12 print:rounded">
                          <span className="text-[10px] text-gray-300 print:text-[7pt]">التوقيع هنا</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* إخلاء مسؤولية */}
                <div className="mt-5 pt-4 border-t border-gray-100 print:mt-3 print:pt-2">
                  <p className="text-[9px] text-gray-400 text-center leading-relaxed print:text-[6pt]">
                    صدر هذا المستند إلكترونياً من نظام شركة رمز الإبداع لإدارة الأملاك، وتُراجع بياناته وفق السجلات المعتمدة في النظام.
                  </p>
                </div>
              </SectionBody>
            </Section>

          </div>

          {/* ══ تذييل التقرير ══ */}
          <div className="mt-6 px-1 print:mt-4">
            <div className="rounded-xl px-6 py-3 flex items-center justify-between print:rounded print:px-4 print:py-2" style={{ background: DARK }}>
              <span className="text-[10px] font-bold print:text-[7pt]" style={{ color: GOLD + '80' }}>
                الموقع <span style={{ color: GOLD }}>www.ramzabdae.com</span>
              </span>
              <span className="text-[10px] print:text-[7pt]" style={{ color: GOLD + '60' }}>
                البريد <span style={{ color: GOLD + '90' }}>info@ramzabdae.com</span>
              </span>
              <span className="text-[10px] font-bold print:text-[7pt]" style={{ color: GOLD + '80' }}>
                الهاتف <span style={{ color: GOLD }}>920013517</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* أنماط الطباعة */}
      <style>{`
        .official-report { background: #fff !important; color: #111 !important; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:rounded { border-radius: 4px !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-3 { padding: 0.75rem !important; }
          .print\\:p-2 { padding: 0.5rem !important; }
          .print\\:gap-2 { gap: 0.5rem !important; }
          .print\\:gap-3 { gap: 0.75rem !important; }
          .print\\:mb-3 { margin-bottom: 0.75rem !important; }
          .print\\:mb-2 { margin-bottom: 0.5rem !important; }
          .print\\:text-\\[7pt\\] { font-size: 7pt !important; }
          .print\\:text-\\[8pt\\] { font-size: 8pt !important; }
          .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .print\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .print\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </DashboardLayout>
  );
}
