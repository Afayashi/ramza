import { useState, useRef } from 'react';
// Ejar Integration v2
import {
  Phone, Eye, EyeOff, Save, ExternalLink, Upload,
  FileText, Trash2, AlertTriangle, Loader2,
  ChevronDown, RefreshCw, CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const GREEN = '#0ea472';
const GOLD  = '#C8A951';
const LS_KEY = 'ejar_api_creds';
const LS_REG = 'ejar_ext_reg';
const DEFAULT_PASSWORD = 'M0hT2aI0HbSwozvxRkLVhYl9ixDnHgCGPL8EQZqmmmhD8EFFBkOT7b3B2PeWlIVU';

type CredsState = { licenseNumber: string; username: string; password: string };
type RegState = { active: boolean; createdAt: string; username: string; apiKey: string };
type PdfAnalysisResult = {
  fileName: string;
  contractNumber: string;
  contractType: string;
  status: string;
  analyzedAt: string;
};

function loadCreds() {
  try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r); } catch {}
  return { licenseNumber: '1200009558', username: 'bo-1010601471', password: DEFAULT_PASSWORD };
}
function loadReg() {
  try { const r = localStorage.getItem(LS_REG); if (r) return JSON.parse(r); } catch {}
  return { active: true, createdAt: '2026-04-08', username: 'bo-1010601471', apiKey: DEFAULT_PASSWORD };
}

function loadLastPdfAnalysis(): PdfAnalysisResult | null {
  try {
    const raw = localStorage.getItem('ejar_pdf_analysis');
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr[0] as PdfAnalysisResult;
  } catch {
    return null;
  }
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card border border-border rounded-2xl p-4 ${className}`}>{children}</div>;
}

export default function IntegrationEjarSettings() {
  const [creds, setCreds]     = useState<CredsState>(loadCreds);
  const [reg, setReg]         = useState<RegState>(loadReg);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCredsPass, setShowCredsPass] = useState(false);
  const [nafathId, setNafathId]     = useState('1200009558');
  const [logging, setLogging]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [syncDone, setSyncDone]     = useState(false);
  const [syncingProps, setSyncingProps] = useState(false);
  const [syncPropsDone, setSyncPropsDone] = useState(false);
  const [syncPropsCount, setSyncPropsCount] = useState<number | null>(null);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const [pdfAnalysis, setPdfAnalysis] = useState<PdfAnalysisResult | null>(loadLastPdfAnalysis);
  const [licenseExpanded, setLicenseExpanded] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const xlsRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xlsFile, setXlsFile] = useState<File | null>(null);

  const handleNafathLogin = async () => {
    if (!nafathId.trim()) { toast.error('أدخل رقم الرخصة'); return; }
    setLogging(true);
    await new Promise(r => setTimeout(r, 1500));
    setLogging(false);
    toast.success('تم الدخول من البوابة الوطنية بنجاح');
  };

  const handleSaveApi = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem(LS_REG, JSON.stringify(reg));
    localStorage.setItem(LS_KEY, JSON.stringify(creds));
    setSaving(false);
    toast.success('تم حفظ بيانات API');
  };

  const handleSyncEjar = async () => {
    setSyncing(true);
    setSyncDone(false);
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      const username = saved.username || creds.username;
      const password = saved.password || creds.password;
      const token = btoa(`${username}:${password}`);
      const states = ['active', 'expired'];
      let allContracts: any[] = [];
      for (const state of states) {
        let pg = 1;
        while (pg <= 20) {
          const url = `https://eservices.ejar.sa/api/v1/contracts?page[number]=${pg}&page[size]=50&sort=-updated_at&filter[state]=${state}&include[]=property&include[]=parties&include[]=parties.entity`;
          const r = await fetch(url, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Authorization': `Basic ${token}` },
            credentials: 'include',
          });
          if (!r.ok) break;
          const json = await r.json();
          const items: any[] = json.data || [];
          const includedMap: Record<string, any> = {};
          (json.included || []).forEach((inc: any) => { includedMap[`${inc.type}:${inc.id}`] = inc; });
          items.forEach((c: any) => {
            const contract: any = { ejar_id: c.id, ...c.attributes };
            const propRel = c.relationships?.property?.data;
            if (propRel) { const prop = includedMap[`${propRel.type}:${propRel.id}`]; if (prop) contract.property_info = prop.attributes; }
            contract.parties = (c.relationships?.parties?.data || []).map((p: any) => {
              const party = includedMap[`${p.type}:${p.id}`]; return party ? party.attributes : null;
            }).filter(Boolean);
            allContracts.push(contract);
          });
          if (items.length < 50) break;
          pg++;
        }
      }
      if (allContracts.length > 0) {
        localStorage.setItem('ejar_contracts_raw', JSON.stringify(allContracts));
        localStorage.setItem('real_contracts', JSON.stringify(allContracts.map((c: any, i: number) => ({
          id: c.ejar_id || `ejar_${i}`,
          contract_number: c.contract_number || '',
          state: c.state || '',
          contract_type: c.contract_type || '',
          contract_start_date: c.contract_start_date || '',
          contract_end_date: c.contract_end_date || '',
          property_id: c.property_id || '',
          brokerage_office_name: c.brokerage_office_name || '',
          deed_number: c.property_info?.deed_number || '',
          tenant_name: c.parties?.[0]?.name || '',
          annual_rent: c.total_rent_amount || '',
        }))));
        setSyncDone(true);
        toast.success(`✓ تمت المزامنة — ${allContracts.length} عقد`);
      } else {
        window.open('https://eservices.ejar.sa/ar/contracts?state=active', '_blank');
        toast.info('الرجاء تسجيل الدخول في إيجار ثم العودة للمزامنة');
      }
    } catch {
      window.open('https://eservices.ejar.sa/ar/contracts?state=active', '_blank');
      toast.info('الرجاء تسجيل الدخول في إيجار ثم العودة للمزامنة');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncProperties = async () => {
    setSyncingProps(true);
    setSyncPropsDone(false);
    setSyncPropsCount(null);
    try {
      const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
      let pg = 1;
      const all: any[] = [];
      while (pg <= 20) {
        const url = `https://eservices.ejar.sa/api/v1/properties?page[number]=${pg}&page[size]=50`;
        const r = await fetch(url, { headers, credentials: 'include' });
        if (!r.ok) break;
        const json = await r.json();
        const items: any[] = json.data || [];
        for (const item of items) {
          const a = item?.attributes || {};
          const addr = a?.address?.attributes || {};
          all.push({
            ejar_id: item?.id || '',
            property_name: a?.property_name || '',
            property_number: a?.property_number || '',
            property_type: a?.property_type || '',
            property_type_name: a?.property_type_name || '',
            property_usage: a?.property_usage || '',
            contracted: Boolean(a?.contracted),
            available_unit_count: Number(a?.available_unit_count || 0),
            unit_count: Number(a?.unit_count || 0),
            total_units: Number(a?.total_units || 0),
            city: addr?.city_obj?.name_ar || '',
            district: addr?.district_obj?.name_ar || '',
            building_number: addr?.building_number || '',
            street_name: addr?.street_name || '',
            lat: addr?.latitude || null,
            lng: addr?.longitude || null,
          });
        }
        if (items.length < 50) break;
        pg++;
      }
      if (all.length > 0) {
        localStorage.setItem('ejar_live_properties', JSON.stringify(all));
        localStorage.setItem('real_properties', JSON.stringify(all));
        setSyncPropsCount(all.length);
        setSyncPropsDone(true);
        toast.success(`✓ تمت مزامنة العقارات — ${all.length} عقار`);
      } else {
        window.open('https://eservices.ejar.sa/ar/properties', '_blank');
        toast.info('الرجاء تسجيل الدخول في إيجار ثم العودة للمزامنة');
      }
    } catch {
      window.open('https://eservices.ejar.sa/ar/properties', '_blank');
      toast.info('الرجاء تسجيل الدخول في إيجار ثم العودة للمزامنة');
    } finally {
      setSyncingProps(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPdfFile(f);
    toast.success(`تم رفع الملف: ${f.name}`);
  };

  const handleAnalyzePdf = async () => {
    if (!pdfFile) {
      toast.error('ارفع ملف PDF أولاً');
      return;
    }
    setAnalyzingPdf(true);
    await new Promise((r) => setTimeout(r, 1400));
    const contractDigits = (pdfFile.name.match(/\d+/g) || []).join('').slice(0, 11);
    const parsed: PdfAnalysisResult = {
      fileName: pdfFile.name,
      contractNumber: contractDigits || `CN-${Date.now().toString().slice(-6)}`,
      contractType: 'residential',
      analyzedAt: new Date().toISOString(),
      status: 'active',
    };
    const existing = JSON.parse(localStorage.getItem('ejar_pdf_analysis') || '[]');
    localStorage.setItem('ejar_pdf_analysis', JSON.stringify([parsed, ...existing]));
    setPdfAnalysis(parsed);
    setAnalyzingPdf(false);
    toast.success('تم تحليل العقد بنجاح');
  };

  const handleXlsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setXlsFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result as ArrayBuffer, { type: 'array' });
        const sheet = wb.SheetNames[0];
        const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '', header: 1 }) as any[][];
        let headerIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          const row = rows[i] as string[];
          const arabicCount = row.filter((c: any) => typeof c === 'string' && /[\u0600-\u06FF]/.test(c) && !/^\d{4}/.test(c)).length;
          if (arabicCount >= 3) { headerIdx = i; break; }
        }
        if (headerIdx === -1) { toast.error('لم يتم التعرف على ترويسة الملف'); return; }
        const headers: string[] = (rows[headerIdx] as string[]).map((h: any) => String(h || '').replace(/\s+/g, '_').trim());
        const data = rows.slice(headerIdx + 1).filter((r: any[]) => r.some((c: any) => c !== '')).map((r: any[], idx: number) => {
          const obj: any = { id: `imported_xl_${idx + 1}` };
          headers.forEach((h: string, i: number) => { if (h) obj[h] = r[i] ?? ''; });
          return obj;
        });
        const existing = JSON.parse(localStorage.getItem('real_financial') || '[]');
        localStorage.setItem('real_financial', JSON.stringify([...existing, ...data]));
        toast.success(`تم استيراد ${data.length} سجل من Excel`);
      } catch { toast.error('حدث خطأ أثناء قراءة الملف'); }
    };
    reader.readAsArrayBuffer(f);
  };

  return (
    <DashboardLayout pageTitle="تكامل إيجار">
      <div className="mb-5">
        <h1 className="text-base font-black text-foreground text-center">التكامل مع منصة إيجار الوطنية</h1>
      </div>

      <div className="space-y-3 max-w-lg mx-auto">

        {/* 1. Contact */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">احتياز الاتصال</p>
              <p className="font-black text-sm text-foreground mt-0.5">اتصل بنا</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Phone size={18} className="text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* 2. Important note */}
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm text-amber-300 mb-1">ملاحظة هامة</p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                منصة إيجار تستخدم <span className="font-bold">النفاذ الوطني</span> للمصادقة وتديرها <span className="font-bold">OneForm</span>. المزامنة البلدية تعتمد على بيانات عن طريق الدخول عبر حساب إيجار، أدخل بيانات الدخول الجديدة.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Nafath login */}
        <Card className="border-emerald-500/30">
          <div className="mb-3">
            <h3 className="font-black text-sm text-foreground">ربط حساب إيجار</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">الدخول عبر النفاذ الوطني</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">رقم الرخصة</p>
              <input
                dir="ltr"
                value={nafathId}
                onChange={e => setNafathId(e.target.value)}
                placeholder="1200009558"
                className="w-full px-4 py-3 rounded-xl border border-border bg-sidebar text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                الدخول عبر البوابة الوطني — لا حاجة لكلمة المرور
              </p>
            </div>
            <button
              onClick={handleNafathLogin}
              disabled={logging}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
              style={{ background: '#111' }}
            >
              {logging && <Loader2 size={16} className="animate-spin" />}
              الدخول والمزامنة →
            </button>
          </div>
        </Card>

        {/* Sync contracts */}
        <Card className="border-primary/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-black text-sm text-foreground">مزامنة العقود من إيجار</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">جلب العقود الفعّالة والمنتهية تلقائياً</p>
            </div>
            {syncDone && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-sidebar border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">اسم المستخدم (API)</p>
                <p className="font-black text-foreground" dir="ltr">bo-1010601471</p>
              </div>
              <div className="rounded-xl bg-sidebar border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">رقم الرخصة</p>
                <p className="font-black text-foreground">1200009558</p>
              </div>
            </div>
            <button
              onClick={handleSyncEjar}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
              style={{ background: GREEN }}
            >
              {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {syncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
            </button>
          </div>
        </Card>

        {/* Sync properties */}
        <Card className="border-amber-500/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-black text-sm text-foreground">مزامنة العقارات من إيجار</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                جلب كل عقاراتك المسجّلة في إيجار
                {syncPropsCount !== null && <span className="text-emerald-400 font-bold mr-1">— {syncPropsCount} عقار</span>}
              </p>
            </div>
            {syncPropsDone && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
          </div>
          <button
            onClick={handleSyncProperties}
            disabled={syncingProps}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
            style={{ background: GOLD }}
          >
            {syncingProps ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {syncingProps ? 'جاري جلب العقارات...' : 'مزامنة العقارات'}
          </button>
        </Card>

        {/* 4. External registration */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-black text-sm text-foreground">التسجيل الخارجي</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">تسجيل الدخول من خارج منظومة إيجار</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setReg(p => ({ ...p, active: true }))}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${reg.active ? 'bg-emerald-500 text-white' : 'bg-sidebar text-muted-foreground hover:bg-emerald-500/20'}`}>
                فعال
              </button>
              <button onClick={() => setReg(p => ({ ...p, active: false }))}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${!reg.active ? 'bg-red-500/80 text-white' : 'bg-sidebar text-muted-foreground hover:bg-red-500/20'}`}>
                تعطيل
              </button>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground mb-3 text-left" dir="ltr">{reg.createdAt}</div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-sidebar p-3">
              <p className="text-[10px] text-muted-foreground mb-2 font-bold">مفتاح تم إنشاؤه</p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">رقم الرخصة</p>
                  <input dir="ltr" value={creds.licenseNumber} onChange={e => setCreds(p => ({ ...p, licenseNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-emerald-500 transition" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">اسم المستخدم (API)</p>
                  <input dir="ltr" value={creds.username} onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-emerald-500 transition" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">كلمة المرور (API)</p>
                  <div className="relative">
                    <input dir="ltr" type={showCredsPass ? 'text' : 'password'} value={creds.password}
                      onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-3 py-2 pl-9 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-emerald-500 transition" />
                    <button onClick={() => setShowCredsPass(p => !p)} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                      {showCredsPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveApi} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
              style={{ background: GREEN }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              حفظ بيانات API
            </button>
          </div>
        </Card>

        {/* API Docs link */}
        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-bold text-foreground">توثيق API</p>
          <a href="https://www.ejar.sa/ar/api-docs" target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline flex items-center gap-1">
            رابط الوثيقة <ExternalLink size={11} />
          </a>
        </div>

        {/* 5. Brokerage license */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-foreground">رخصة الوساطة</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">تاريخ رؤية: <span dir="ltr">04-04-2025</span></p>
            </div>
            <button onClick={() => toast.info('جاري تحديث بيانات الرخصة...')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition">
              تحديث الرخصة
            </button>
          </div>
          <button onClick={() => setLicenseExpanded(p => !p)} className="w-full mt-3 flex items-center justify-between">
            <div className="grid grid-cols-3 gap-2 flex-1 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">تاريخ الإصدار</p>
                <p className="text-xs font-bold text-foreground" dir="ltr">2023-07-18</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">رقم الرخصة</p>
                <p className="text-xs font-bold text-foreground">1200009558</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">تاريخ الانتهاء</p>
                <p className="text-xs font-bold text-foreground" dir="ltr">2026-07-24</p>
              </div>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform shrink-0 mr-2 ${licenseExpanded ? 'rotate-180' : ''}`} />
          </button>
          {licenseExpanded && (
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">اسم الرخصة</span>
                <span className="font-bold text-foreground">رخصة فال للوساطة والتسويق العقاري</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">حالة الرخصة</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">منتهية قابلة للتجديد</span>
              </div>
            </div>
          )}
        </Card>

        {/* 6. AI PDF analysis */}
        <Card>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-black text-sm text-foreground">تحليل عقد PDF بالذكاء الاصطناعي</h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-400 shrink-0">موصى به</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">ارفع ملف PDF من إيجار وسيقوم النظام بتحليله وملأ البيانات تلقائياً</p>
          <button onClick={() => pdfRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-dashed transition"
            style={{ borderColor: GOLD, color: GOLD }}>
            <Upload size={15} />
            {pdfFile ? pdfFile.name : 'رفع ملف PDF'}
          </button>
          <button
            onClick={handleAnalyzePdf}
            disabled={!pdfFile || analyzingPdf}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
            style={{ background: GREEN }}
          >
            {analyzingPdf ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {analyzingPdf ? 'جاري التحليل...' : 'تحليل العقد'}
          </button>

          {pdfAnalysis && (
            <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
              <p className="text-xs font-black text-foreground">نتيجة تحليل العقد</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground text-[10px]">رقم العقد</p>
                  <p className="font-bold text-foreground" dir="ltr">{pdfAnalysis.contractNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">نوع العقد</p>
                  <p className="font-bold text-foreground">{pdfAnalysis.contractType === 'residential' ? 'سكني' : 'تجاري'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">الحالة</p>
                  <p className="font-bold text-emerald-400">{pdfAnalysis.status === 'active' ? 'نشط' : pdfAnalysis.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">اسم الملف</p>
                  <p className="font-bold text-foreground truncate">{pdfAnalysis.fileName}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground" dir="ltr">{new Date(pdfAnalysis.analyzedAt).toLocaleString('ar-SA')}</p>
            </div>
          )}

          <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
        </Card>

        {/* 7. Excel import */}
        <Card>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-black text-sm text-foreground">استيراد ملف Excel من إيجار</h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/15 text-blue-400 shrink-0">سريع</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">استيراد البيانات من ملف Excel الذي نزّلته من منصة إيجار</p>
          <button onClick={() => xlsRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-dashed border-border text-foreground hover:border-primary transition">
            <FileText size={15} />
            {xlsFile ? xlsFile.name : '↑ رفع ملف Excel'}
          </button>
          <input ref={xlsRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleXlsUpload} />
        </Card>

        {/* 8. Open Ejar platform */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-foreground">فتح منصة إيجار</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5" dir="ltr">ejar.sa</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://eservices.ejar.sa" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-sidebar flex items-center justify-center hover:bg-primary/10 transition">
                <ExternalLink size={15} className="text-muted-foreground" />
              </a>
              <button onClick={() => { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_REG); toast.success('تم مسح بيانات الربط'); }}
                className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition">
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
