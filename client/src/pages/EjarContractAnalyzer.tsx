/*
 * EjarContractAnalyzer — استرداد وتحليل عقود إيجار
 * رمز الإبداع لإدارة الأملاك
 */
import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, AlertTriangle, CheckCircle, Loader2,
  Search, Download, Copy, ChevronDown, ChevronUp,
  User, Building2, Calendar, DollarSign, Phone,
  MapPin, Hash, Clock, RefreshCw, Eye, X,
  FileSearch, Sparkles, ClipboardList,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const GOLD = '#C8A951';
const DARK = '#1a1a1a';
const GREEN = '#0ea472';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ContractData {
  // معلومات العقد
  contractNumber?: string;
  contractDate?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  status?: string;

  // معلومات العقار
  propertyName?: string;
  propertyType?: string;
  unitNumber?: string;
  city?: string;
  district?: string;
  address?: string;

  // المستأجر
  tenantName?: string;
  tenantId?: string;
  tenantPhone?: string;
  tenantEmail?: string;

  // المالك
  ownerName?: string;
  ownerId?: string;
  ownerPhone?: string;

  // المالية
  annualRent?: string;
  monthlyRent?: string;
  deposit?: string;
  vatAmount?: string;
  totalRent?: string;
  paymentMethod?: string;
  paymentFrequency?: string;

  // ميزات إضافية
  waterIncluded?: boolean;
  electricityIncluded?: boolean;
  maintenanceIncluded?: boolean;

  // خام
  rawFields?: Record<string, string>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function extractFromRows(rows: Record<string, string>[]): ContractData[] {
  return rows.map(row => {
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
        if (val && String(val).trim()) return String(val).trim();
      }
      return undefined;
    };

    return {
      contractNumber: get('رقم_عقد_الإيجار', 'رقم_العقد', 'contract_number', 'Contract_Number', 'رقم العقد', 'ContractNo'),
      contractDate: get('تاريخ_العقد', 'contract_date', 'ContractDate', 'تاريخ العقد'),
      startDate: get('تاريخ_بداية_العقد', 'start_date', 'StartDate', 'تاريخ البداية', 'بداية العقد'),
      endDate: get('تاريخ_نهاية_العقد', 'end_date', 'EndDate', 'تاريخ النهاية', 'نهاية العقد'),
      duration: get('مدة_العقد', 'duration', 'Duration', 'مدة العقد'),
      status: get('حالة_العقد', 'status', 'Status', 'الحالة'),

      propertyName: get('اسم_العقار', 'property_name', 'PropertyName', 'اسم العقار'),
      propertyType: get('نوع_العقار', 'property_type', 'PropertyType', 'نوع العقار'),
      unitNumber: get('رقم_الوحدة', 'unit_number', 'UnitNumber', 'رقم الوحدة', 'رقم_الوحدة_الإيجار'),
      city: get('المدينة', 'city', 'City'),
      district: get('الحي', 'district', 'District', 'الحي/المنطقة'),
      address: get('العنوان', 'address', 'Address'),

      tenantName: get('اسم_المستأجر', 'tenant_name', 'TenantName', 'اسم المستأجر', 'المستأجر'),
      tenantId: get('رقم_هوية_المستأجر', 'tenant_id', 'TenantID', 'رقم الهوية', 'رقم_الهوية'),
      tenantPhone: get('جوال_المستأجر', 'tenant_phone', 'TenantPhone', 'هاتف المستأجر'),
      tenantEmail: get('بريد_المستأجر', 'tenant_email', 'TenantEmail'),

      ownerName: get('اسم_المالك', 'owner_name', 'OwnerName', 'اسم المالك', 'المالك'),
      ownerId: get('رقم_هوية_المالك', 'owner_id', 'OwnerID'),
      ownerPhone: get('جوال_المالك', 'owner_phone', 'OwnerPhone'),

      annualRent: get('الإيجار_السنوي', 'annual_rent', 'AnnualRent', 'الإيجار السنوي', 'قيمة_الإيجار'),
      monthlyRent: get('الإيجار_الشهري', 'monthly_rent', 'MonthlyRent', 'الإيجار الشهري'),
      deposit: get('مبلغ_التأمين', 'deposit', 'Deposit', 'التأمين'),
      vatAmount: get('قيمة_الضريبة', 'vat', 'VAT', 'ضريبة القيمة المضافة'),
      totalRent: get('الإيجار_الكلي', 'total_rent', 'TotalRent', 'الإجمالي'),
      paymentMethod: get('طريقة_الدفع', 'payment_method', 'PaymentMethod', 'طريقة الدفع'),
      paymentFrequency: get('دورية_الدفع', 'payment_frequency', 'PaymentFrequency', 'دورية الدفع'),

      rawFields: row,
    };
  });
}

function parseFile(file: File): Promise<ContractData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        resolve(extractFromRows(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Field Badge ───────────────────────────────────────────────────────────────
function Field({ label, value, icon: Icon, color = 'text-gray-800' }: {
  label: string; value?: string; icon?: any; color?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className={`text-sm font-bold ${color} break-words`}>{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: {
  title: string; icon: any; color: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Contract Card ─────────────────────────────────────────────────────────────
function ContractCard({ c, index }: { c: ContractData; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const statusColor = (s?: string) => {
    if (!s) return 'bg-gray-100 text-gray-500';
    const lower = s.toLowerCase();
    if (lower.includes('ساري') || lower.includes('نشط') || lower.includes('active')) return 'bg-emerald-50 text-emerald-700';
    if (lower.includes('منته') || lower.includes('expired')) return 'bg-red-50 text-red-600';
    if (lower.includes('قريب') || lower.includes('warn')) return 'bg-amber-50 text-amber-700';
    return 'bg-blue-50 text-blue-700';
  };

  const copy = () => {
    const text = Object.entries(c.rawFields || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ بيانات العقد');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
            <FileText className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">
              {c.contractNumber ? `عقد #${c.contractNumber}` : `عقد رقم ${index + 1}`}
            </p>
            <p className="text-xs text-gray-400">{c.tenantName || 'مستأجر غير محدد'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {c.status && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(c.status)}`}>
              {c.status}
            </span>
          )}
          <button onClick={copy} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 border-b border-gray-100">
        {[
          { label: 'الإيجار السنوي', val: c.annualRent ? `${Number(c.annualRent).toLocaleString('ar')} ر.س` : '—' },
          { label: 'المدة', val: c.duration || (c.startDate && c.endDate ? `${c.startDate} ← ${c.endDate}` : '—') },
          { label: 'الوحدة', val: c.unitNumber || c.propertyName || '—' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-sm font-black text-gray-800 mt-0.5 truncate">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="p-4 space-y-3">
          <Section title="معلومات العقد" icon={ClipboardList} color="bg-blue-500">
            <Field label="رقم العقد" value={c.contractNumber} icon={Hash} />
            <Field label="تاريخ العقد" value={c.contractDate} icon={Calendar} />
            <Field label="تاريخ البداية" value={c.startDate} icon={Calendar} />
            <Field label="تاريخ النهاية" value={c.endDate} icon={Calendar} />
            <Field label="المدة" value={c.duration} icon={Clock} />
            <Field label="الحالة" value={c.status} />
          </Section>

          <Section title="معلومات العقار" icon={Building2} color="bg-emerald-500">
            <Field label="اسم العقار" value={c.propertyName} icon={Building2} />
            <Field label="نوع العقار" value={c.propertyType} />
            <Field label="رقم الوحدة" value={c.unitNumber} icon={Hash} />
            <Field label="المدينة" value={c.city} icon={MapPin} />
            <Field label="الحي" value={c.district} icon={MapPin} />
            <Field label="العنوان" value={c.address} icon={MapPin} color="text-blue-700" />
          </Section>

          <Section title="المستأجر" icon={User} color="bg-purple-500">
            <Field label="الاسم" value={c.tenantName} icon={User} />
            <Field label="رقم الهوية" value={c.tenantId} icon={Hash} />
            <Field label="الجوال" value={c.tenantPhone} icon={Phone} />
            <Field label="البريد الإلكتروني" value={c.tenantEmail} />
          </Section>

          <Section title="المالك" icon={User} color="bg-amber-500">
            <Field label="الاسم" value={c.ownerName} icon={User} />
            <Field label="رقم الهوية" value={c.ownerId} icon={Hash} />
            <Field label="الجوال" value={c.ownerPhone} icon={Phone} />
          </Section>

          <Section title="التفاصيل المالية" icon={DollarSign} color="bg-green-600">
            <Field label="الإيجار السنوي" value={c.annualRent ? `${Number(c.annualRent).toLocaleString('ar')} ر.س` : undefined} icon={DollarSign} color="text-emerald-700" />
            <Field label="الإيجار الشهري" value={c.monthlyRent ? `${Number(c.monthlyRent).toLocaleString('ar')} ر.س` : undefined} icon={DollarSign} />
            <Field label="مبلغ التأمين" value={c.deposit ? `${Number(c.deposit).toLocaleString('ar')} ر.س` : undefined} />
            <Field label="ضريبة القيمة المضافة" value={c.vatAmount ? `${Number(c.vatAmount).toLocaleString('ar')} ر.س` : undefined} />
            <Field label="الإجمالي" value={c.totalRent ? `${Number(c.totalRent).toLocaleString('ar')} ر.س` : undefined} color="text-emerald-700" />
            <Field label="طريقة الدفع" value={c.paymentMethod} />
            <Field label="دورية الدفع" value={c.paymentFrequency} />
          </Section>
        </div>
      )}
    </div>
  );
}

// ─── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
          <Upload className="w-8 h-8" style={{ color: GOLD }} />
        </div>
        <div>
          <p className="font-black text-gray-800">ارفع ملف العقود من إيجار</p>
          <p className="text-sm text-gray-500 mt-1">اسحب وأفلت أو انقر للاختيار</p>
          <p className="text-xs text-gray-400 mt-2">Excel (.xlsx, .xls) أو CSV</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {['عقود_إيجار.xlsx', 'تصدير_إيجار.csv', 'Ejar_Contracts.xlsx'].map(name => (
            <span key={name} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-500">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analysis Summary ──────────────────────────────────────────────────────────
function AnalysisSummary({ contracts }: { contracts: ContractData[] }) {
  const total = contracts.length;
  const active = contracts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s.includes('ساري') || s.includes('نشط') || s.includes('active') || s === '';
  }).length;
  const expired = contracts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s.includes('منته') || s.includes('expired');
  }).length;

  const totalRent = contracts.reduce((sum, c) => {
    const v = parseFloat(c.annualRent?.replace(/,/g, '') || '0');
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const uniqueTenants = new Set(contracts.map(c => c.tenantId || c.tenantName).filter(Boolean)).size;
  const uniqueProperties = new Set(contracts.map(c => c.unitNumber || c.propertyName).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {[
        { label: 'إجمالي العقود', val: total, color: GOLD, bg: `${GOLD}15` },
        { label: 'عقود سارية', val: active, color: '#059669', bg: '#ECFDF5' },
        { label: 'عقود منتهية', val: expired, color: '#DC2626', bg: '#FEF2F2' },
        { label: 'مستأجرون', val: uniqueTenants, color: '#7C3AED', bg: '#EDE9FE' },
        { label: 'الإيجار السنوي', val: totalRent > 0 ? `${(totalRent / 1000).toFixed(0)}k ر.س` : '—', color: '#0891B2', bg: '#E0F7FA' },
      ].map(s => (
        <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
          <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Save to localStorage ──────────────────────────────────────────────────────
function saveContracts(contracts: ContractData[]) {
  try {
    const existing: Record<string, any>[] = JSON.parse(localStorage.getItem('real_contracts') || '[]');
    const existingNums = new Set(existing.map((c: any) => c.contractNumber || c['رقم_عقد_الإيجار'] || c['رقم_العقد']));
    const newContracts = contracts
      .filter(c => c.contractNumber && !existingNums.has(c.contractNumber))
      .map(c => ({ ...c.rawFields, ...c }));
    const merged = [...existing, ...newContracts];
    localStorage.setItem('real_contracts', JSON.stringify(merged));
    return { added: newContracts.length, duplicates: contracts.length - newContracts.length };
  } catch {
    return { added: 0, duplicates: 0 };
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function EjarContractAnalyzer() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saveResult, setSaveResult] = useState<{ added: number; duplicates: number } | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    setSaveResult(null);
    try {
      const data = await parseFile(file);
      setContracts(data);
      toast.success(`تم تحليل ${data.length} عقد من الملف`);
    } catch (err) {
      toast.error('فشل قراءة الملف — تأكد أنه Excel أو CSV صحيح');
      setContracts([]);
    }
    setLoading(false);
  };

  const handleSave = () => {
    if (!contracts.length) return;
    const result = saveContracts(contracts);
    setSaveResult(result);
    if (result.added > 0) {
      toast.success(`تم حفظ ${result.added} عقد جديد`);
    } else {
      toast.info('جميع العقود موجودة مسبقاً — لا توجد إضافات');
    }
  };

  const handleClear = () => {
    setContracts([]);
    setFileName('');
    setSaveResult(null);
    setSearch('');
    setFilterStatus('all');
  };

  // Filtering
  const filtered = contracts.filter(c => {
    const matchSearch = !search || [
      c.contractNumber, c.tenantName, c.propertyName, c.unitNumber, c.city, c.tenantId
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && (c.status?.toLowerCase().includes('ساري') || c.status?.toLowerCase().includes('نشط') || !c.status)) ||
      (filterStatus === 'expired' && c.status?.toLowerCase().includes('منته'));

    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'active', 'expired'];
  const statusLabels: Record<string, string> = { all: 'الكل', active: 'سارية', expired: 'منتهية' };

  return (
    <DashboardLayout pageTitle="تحليل عقود إيجار">
      <div className="p-5 space-y-5 max-w-5xl mx-auto" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileSearch className="w-6 h-6" style={{ color: GOLD }} />
              استرداد وتحليل عقود إيجار
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              رفع ملف Excel من منصة إيجار وتحليل بياناته تلقائياً
            </p>
          </div>
          {contracts.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition"
                style={{ background: GREEN }}>
                <Download className="w-4 h-4" />
                حفظ في النظام
              </button>
              <button onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 transition">
                <X className="w-4 h-4" />
                مسح
              </button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-black mb-1">كيف تستخرج ملف العقود من إيجار؟</p>
            <ol className="list-decimal list-inside space-y-0.5 text-xs text-amber-700">
              <li>سجّل دخولك على <strong>ejar.sa</strong></li>
              <li>اذهب إلى قسم <strong>العقود</strong></li>
              <li>انقر على زر <strong>تصدير Excel</strong> أو <strong>Export</strong></li>
              <li>ارفع الملف هنا — سيتم التحليل تلقائياً</li>
            </ol>
          </div>
        </div>

        {/* Upload Zone */}
        {!contracts.length && !loading && (
          <DropZone onFile={handleFile} />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: GOLD }} />
            </div>
            <p className="font-bold text-gray-600">جاري تحليل الملف...</p>
            <p className="text-sm text-gray-400">{fileName}</p>
          </div>
        )}

        {/* Results */}
        {contracts.length > 0 && (
          <>
            {/* File info bar */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-400">{contracts.length} عقد تم استخراجه</p>
                </div>
              </div>
              <button onClick={() => document.querySelector('input[type=file]')?.click()}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition">
                <RefreshCw className="w-3.5 h-3.5" /> تغيير الملف
              </button>
            </div>

            {/* Save result banner */}
            {saveResult && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-emerald-700">{saveResult.added.toLocaleString('ar')}</p>
                    <p className="text-[11px] text-emerald-600">عقد جديد تم حفظه</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-amber-700">{saveResult.duplicates.toLocaleString('ar')}</p>
                    <p className="text-[11px] text-amber-600">عقد مكرر تم تجاهله</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <AnalysisSummary contracts={contracts} />

            {/* Search & Filter */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-48 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث باسم المستأجر أو رقم العقد أو العقار..."
                  className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
                />
              </div>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                {statuses.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2.5 text-xs font-bold transition ${
                      filterStatus === s ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={filterStatus === s ? { background: DARK } : {}}>
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Contract list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">لا توجد نتائج</p>
                </div>
              ) : (
                filtered.map((c, i) => <ContractCard key={i} c={c} index={i} />)
              )}
              {filtered.length < contracts.length && (
                <p className="text-center text-xs text-gray-400">
                  عرض {filtered.length} من {contracts.length} عقد
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
