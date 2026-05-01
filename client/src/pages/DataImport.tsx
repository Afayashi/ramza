import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload, CheckCircle, XCircle, FileText, Trash2, Database,
  RefreshCw, Loader2, AlertTriangle, Download, Eye,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────────────────
const DARK = '#1a1a1a';
const GOLD = '#C8A951';

// كيف نخزن البيانات في localStorage
const LS_KEYS: Record<string, string> = {
  properties: 'real_properties',
  units:      'real_units',
  contracts:  'real_contracts',
  users:      'real_users',
  financial:  'real_financial',
};

// تعريف ملفات إيجار المتوقعة
const EJAR_FILES = [
  { key: 'properties', label: 'العقارات',    icon: '🏢', hint: 'properties.report',  color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'units',      label: 'الوحدات',     icon: '🛏️', hint: 'units.report',       color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { key: 'contracts',  label: 'العقود',      icon: '📄', hint: 'contracts.report',   color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { key: 'users',      label: 'المستخدمون',  icon: '👤', hint: 'bo_users',            color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'financial',  label: 'المالية',     icon: '💰', hint: 'financial.report',   color: 'bg-rose-50 border-rose-200 text-rose-700' },
];

// قراءة البيانات المستوردة
function loadReal(key: string) {
  try { const r = localStorage.getItem(LS_KEYS[key]); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveReal(key: string, rows: object[]) {
  try { localStorage.setItem(LS_KEYS[key], JSON.stringify(rows)); } catch {}
}
function clearReal(key: string) {
  try { localStorage.removeItem(LS_KEYS[key]); } catch {}
}

// ── مفاتيح التكرار لكل نوع بيانات ────────────────────────────────────────────
const DEDUP_KEYS: Record<string, string[]> = {
  contracts: [
    'رقم_عقد_الإيجار', 'رقم_العقد', 'contract_number', 'ejar_id', 'id',
    'رقم_العقد_الإيجاري', 'Contract_Number',
  ],
  properties: [
    'رقم_الوحدة_الإيجار', 'property_number', 'رقم_العقار', 'ejar_id', 'id',
  ],
  units: [
    'رقم_الوحدة', 'unit_number', 'ejar_unit_id', 'id',
  ],
  users: [
    'رقم_الهوية', 'national_id', 'رقم_هوية_المستأجر', 'id',
  ],
  financial: [
    'رقم_الفاتورة', 'invoice_number', 'id',
  ],
};

// دمج صفوف جديدة مع موجودة بمنع التكرار
// يُرجع { merged, added, duplicates }
function mergeWithDedup(
  existing: Record<string, any>[],
  incoming: Record<string, any>[],
  entityKey: string
): { merged: Record<string, any>[]; added: number; duplicates: number } {
  const keys = DEDUP_KEYS[entityKey] || ['id'];

  // بناء خريطة للسجلات الموجودة حسب أول مفتاح متاح
  const existingMap = new Map<string, Record<string, any>>();
  for (const row of existing) {
    for (const k of keys) {
      const v = String(row[k] ?? '').trim();
      if (v && v !== '' && v !== 'undefined') {
        existingMap.set(`${k}::${v}`, row);
        break;
      }
    }
  }

  let added = 0;
  let duplicates = 0;
  const merged = [...existing];

  for (const row of incoming) {
    let isDup = false;
    for (const k of keys) {
      const v = String((row as any)[k] ?? '').trim();
      if (v && v !== '' && v !== 'undefined') {
        if (existingMap.has(`${k}::${v}`)) {
          isDup = true;
          break;
        }
      }
    }
    if (isDup) {
      duplicates++;
    } else {
      merged.push(row);
      added++;
      // أضفه للخريطة لمنع تكرار داخل الملف الجديد نفسه
      for (const k of keys) {
        const v = String((row as any)[k] ?? '').trim();
        if (v && v !== '' && v !== 'undefined') {
          existingMap.set(`${k}::${v}`, row);
          break;
        }
      }
    }
  }

  return { merged, added, duplicates };
}
// إزالة البيانات التجريبية العامة
function clearAllDemo() {
  ['ejar_settings', 'ejar_api_creds'].forEach(k => {
    // لا تمسح بيانات الربط
  });
  // مسح أي كاش تجريبي قديم
  Object.keys(localStorage).filter(k => k.startsWith('demo_')).forEach(k => localStorage.removeItem(k));
}

// ── FileCard ───────────────────────────────────────────────────────────────────
type FileState = { rows: object[]; sheetName: string; fileName: string } | null;

interface FileCardProps {
  fileKey: string;
  label: string;
  icon: string;
  hint: string;
  color: string;
  state: FileState;
  onFile: (key: string, rows: object[], sheetName: string, fileName: string) => void;
  onClear: (key: string) => void;
  onPreview: (key: string) => void;
}

function FileCard({ fileKey, label, icon, hint, color, state, onFile, onClear, onPreview }: FileCardProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLoading(true);
    try {
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, { type: 'array', cellText: true, cellDates: true });
      const sheet = wb.SheetNames[0];

      // قراءة الصفوف كمصفوفات خام للتعامل مع ترويسة إيجار المتعددة الصفوف
      const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '', header: 1 }) as any[][];

      // ابحث عن صف الرؤوس الحقيقية: أول صف يحتوي على نص عربي في أكثر من عمود
      let headerIdx = -1;
      for (let i = 0; i < Math.min(raw.length, 10); i++) {
        const row = raw[i] as any[];
        const meaningfulCols = row.filter(c => typeof c === 'string' && c.trim().length > 1 && !/^\d{4}/.test(c) && c !== '');
        if (meaningfulCols.length >= 3) { headerIdx = i; break; }
      }
      if (headerIdx === -1) headerIdx = 0;

      const headerRow = (raw[headerIdx] as any[]).map((h: any) =>
        typeof h === 'string' ? h.trim().replace(/\s+/g, '_') : String(h)
      );
      const dataRows = raw.slice(headerIdx + 1).filter(row =>
        (row as any[]).some((c: any) => c !== '' && c !== null && c !== undefined)
      );

      const rows = dataRows.map((row: any[], rowIdx: number) => {
        const obj: Record<string, any> = { id: `imported_${rowIdx + 1}` };
        headerRow.forEach((key, i) => { if (key) obj[key] = row[i] ?? ''; });
        return obj;
      }).filter(r => Object.values(r).some(v => v !== '' && v !== null));

      if (!rows.length) throw new Error('الملف فارغ');
      onFile(fileKey, rows, sheet, file.name);
      toast.success(`✓ تم قراءة ${rows.length} سجل من "${file.name}"`);
    } catch (err: any) {
      toast.error(`خطأ في قراءة الملف: ${err.message}`);
    }
    setLoading(false);
    e.target.value = '';
  };

  return (
    <div className={`rounded-2xl border-2 p-4 transition-all ${state ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-gray-200 bg-white hover:border-gray-300'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-black text-gray-900 text-sm">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{hint}*.xlsx</p>
          </div>
        </div>
        {state && (
          <div className="flex items-center gap-1">
            <button onClick={() => onPreview(fileKey)} title="معاينة"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onClear(fileKey)} title="حذف"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {state ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-700 truncate">{state.fileName}</p>
            <p className="text-[10px] text-gray-500">{state.rows.length} سجل — ورقة: {state.sheetName}</p>
          </div>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border border-dashed transition disabled:opacity-60"
          style={{ borderColor: GOLD, color: DARK }}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {loading ? 'جاري القراءة...' : 'اختر الملف'}
        </button>
      )}
      <input ref={ref} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleChange} />
    </div>
  );
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({ fileKey, files, onClose }: { fileKey: string; files: Record<string, FileState>; onClose: () => void }) {
  const state = files[fileKey]; if (!state) return null;
  const headers = state.rows.length ? Object.keys(state.rows[0]) : [];
  const preview = state.rows.slice(0, 10);
  const label = EJAR_FILES.find(f => f.key === fileKey)?.label || fileKey;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col" dir="rtl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">معاينة: {label}</h2>
            <p className="text-xs text-gray-400">{state.rows.length} سجل — أول 10 صفوف</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition text-lg font-bold">×</button>
        </div>
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {headers.map(h => (
                  <th key={h} className="px-3 py-2 text-right font-bold text-gray-700 border border-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {headers.map(h => (
                    <td key={h} className="px-3 py-1.5 text-gray-700 border border-gray-100 whitespace-nowrap max-w-40 truncate">
                      {String((row as any)[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DataImport() {
  const [files, setFiles] = useState<Record<string, FileState>>(() => {
    const init: Record<string, FileState> = {};
    EJAR_FILES.forEach(f => {
      const stored = loadReal(f.key);
      if (stored?.length) init[f.key] = { rows: stored, sheetName: 'محفوظ', fileName: 'بيانات محفوظة مسبقاً' };
      else init[f.key] = null;
    });
    return init;
  });
  const [preview,  setPreview]  = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [mergeStats, setMergeStats] = useState<{ added: number; duplicates: number } | null>(null);

  const handleFile = useCallback((key: string, rows: object[], sheetName: string, fileName: string) => {
    setFiles(prev => ({ ...prev, [key]: { rows, sheetName, fileName } }));
    setSaved(false);
  }, []);

  const handleClear = useCallback((key: string) => {
    clearReal(key);
    setFiles(prev => ({ ...prev, [key]: null }));
    setSaved(false);
    toast.info('تم حذف البيانات المستوردة');
  }, []);

  const handleSaveAll = async () => {
    const loaded = EJAR_FILES.filter(f => files[f.key]);
    if (!loaded.length) { toast.error('لم يتم تحميل أي ملف بعد'); return; }
    setSaving(true);
    setMergeStats(null);
    await new Promise(r => setTimeout(r, 400));

    let totalAdded = 0;
    let totalDuplicates = 0;

    loaded.forEach(f => {
      const incoming = files[f.key]!.rows as Record<string, any>[];
      const existing: Record<string, any>[] = loadReal(f.key) || [];
      const { merged, added, duplicates } = mergeWithDedup(existing, incoming, f.key);
      saveReal(f.key, merged);
      totalAdded += added;
      totalDuplicates += duplicates;

      // تحديث الـ state ليعكس عدد السجلات الفعلي بعد الدمج
      setFiles(prev => ({
        ...prev,
        [f.key]: { rows: merged, sheetName: prev[f.key]?.sheetName || '', fileName: prev[f.key]?.fileName || '' },
      }));
    });

    setSaving(false);
    setSaved(true);
    setMergeStats({ added: totalAdded, duplicates: totalDuplicates });

    if (totalDuplicates > 0) {
      toast.success(`✓ تم إضافة ${totalAdded} سجل جديد — تم تجاهل ${totalDuplicates} مكرر`);
    } else {
      toast.success(`✓ تم حفظ ${totalAdded} سجل جديد بدون تكرار`);
    }
  };

  const totalRecords = EJAR_FILES.reduce((s, f) => s + (files[f.key]?.rows.length ?? 0), 0);
  const loadedCount  = EJAR_FILES.filter(f => files[f.key]).length;

  return (
    <DashboardLayout pageTitle="استيراد بيانات إيجار">
      <div className="p-5 space-y-5 max-w-4xl mx-auto" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">استيراد بيانات منصة إيجار</h1>
            <p className="text-gray-500 text-sm mt-0.5">ارفع ملفات Excel المُصدَّرة من إيجار لاستيراد بياناتك الحقيقية</p>
          </div>
          {loadedCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              <Database className="w-3.5 h-3.5" />
              {totalRecords.toLocaleString('ar')} سجل جاهز
            </span>
          )}
        </div>

        {/* إرشادات */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-black mb-1">كيفية تصدير الملفات من منصة إيجار:</p>
            <ol className="space-y-0.5 list-decimal list-inside text-xs">
              <li>سجّل دخولك على <strong>ejar.sa</strong></li>
              <li>اذهب لكل قسم (العقارات، الوحدات، العقود...) وانقر "تصدير Excel"</li>
              <li>ارفع الملفات هنا — النظام سيتعرف عليها تلقائياً</li>
            </ol>
          </div>
        </div>

        {/* بطاقات الملفات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EJAR_FILES.map(f => (
            <FileCard
              key={f.key}
              fileKey={f.key}
              label={f.label}
              icon={f.icon}
              hint={f.hint}
              color={f.color}
              state={files[f.key]}
              onFile={handleFile}
              onClear={handleClear}
              onPreview={setPreview}
            />
          ))}
        </div>

        {/* ملخص + حفظ */}
        {loadedCount > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-sm mb-4">ملخص البيانات المحمّلة</h2>
            <div className="grid grid-cols-5 gap-3 mb-5">
              {EJAR_FILES.map(f => {
                const count = files[f.key]?.rows.length ?? 0;
                return (
                  <div key={f.key} className={`rounded-xl p-3 text-center border ${count ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                    <p className="text-2xl mb-1">{f.icon}</p>
                    <p className={`text-xl font-black ${count ? 'text-emerald-700' : 'text-gray-400'}`}>{count.toLocaleString('ar')}</p>
                    <p className="text-[10px] text-gray-500">{f.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={handleSaveAll} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
                style={{ background: saved ? '#059669' : DARK }}>
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />جاري الدمج وإزالة التكرار...</>
                  : saved
                    ? <><CheckCircle className="w-4 h-4" />تم الحفظ بنجاح</>
                    : <><Database className="w-4 h-4" />دمج البيانات (بدون تكرار)</>}
              </button>
              <button onClick={() => {
                EJAR_FILES.forEach(f => { handleClear(f.key); });
                setSaved(false);
                setMergeStats(null);
              }}
                className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-bold transition flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> حذف الكل
              </button>
            </div>

            {/* نتائج الدمج */}
            {mergeStats && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-emerald-700">{mergeStats.added.toLocaleString('ar')}</p>
                    <p className="text-[11px] text-emerald-600">سجل جديد تم إضافته</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${mergeStats.duplicates > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                  <XCircle className={`w-5 h-5 shrink-0 ${mergeStats.duplicates > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                  <div>
                    <p className={`text-lg font-black ${mergeStats.duplicates > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{mergeStats.duplicates.toLocaleString('ar')}</p>
                    <p className={`text-[11px] ${mergeStats.duplicates > 0 ? 'text-amber-600' : 'text-gray-400'}`}>سجل مكرر تم تجاهله</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* حالة فارغة */}
        {loadedCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <Database size={48} className="text-gray-200 mb-4" />
            <p className="font-bold text-gray-400 text-sm">لم يتم تحميل أي ملفات بعد</p>
            <p className="text-xs text-gray-300 mt-1">ارفع ملفات Excel من إيجار أعلاه</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <PreviewModal fileKey={preview} files={files} onClose={() => setPreview(null)} />
      )}
    </DashboardLayout>
  );
}
