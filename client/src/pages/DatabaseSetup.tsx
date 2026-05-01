/*
 * صفحة إعداد قاعدة البيانات - Supabase
 * رمز الإبداع لإدارة الأملاك
 */
import { useState, useEffect } from 'react';
import {
  Database, CheckCircle2, XCircle, Loader2, Copy,
  ExternalLink, Key, Globe, RefreshCw, Trash2, Eye, EyeOff
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  saveSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
  resetSupabaseClient,
} from '@/lib/supabaseClient';

const SQL_SCHEMA_URL = 'https://github.com/ramzabdae/platform/blob/main/supabase_schema.sql';

export default function DatabaseSetup() {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    // تحميل القيم المحفوظة
    const savedUrl = localStorage.getItem('ramz_supabase_url') || '';
    const savedKey = localStorage.getItem('ramz_supabase_anon_key') || '';
    if (savedUrl) setUrl(savedUrl);
    if (savedKey) setAnonKey(savedKey);
  }, []);

  const handleTest = async () => {
    if (!url || !anonKey) {
      toast.error('أدخل Project URL و Anon Key أولاً');
      return;
    }
    setTesting(true);
    setStatus(null);
    // حفظ مؤقت للاختبار
    saveSupabaseConfig(url, anonKey);
    resetSupabaseClient();
    const result = await testSupabaseConnection();
    setStatus(result);
    setTesting(false);
  };

  const handleSave = async () => {
    if (!url || !anonKey) {
      toast.error('أدخل Project URL و Anon Key أولاً');
      return;
    }
    if (!url.startsWith('https://')) {
      toast.error('الـ URL يجب أن يبدأ بـ https://');
      return;
    }
    setSaving(true);
    saveSupabaseConfig(url, anonKey);
    resetSupabaseClient();
    const result = await testSupabaseConnection();
    setStatus(result);
    setSaving(false);
    if (result.success) {
      setIsConfigured(true);
      toast.success('تم حفظ الإعدادات والاتصال بـ Supabase بنجاح!');
    } else {
      toast.error(`فشل الاتصال: ${result.message}`);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    resetSupabaseClient();
    setUrl('');
    setAnonKey('');
    setStatus(null);
    setIsConfigured(false);
    toast.info('تم قطع الاتصال بـ Supabase. سيُستخدم Base44 / البيانات التجريبية.');
  };

  const inputClass = "w-full bg-sidebar border border-border rounded-lg px-3 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#C8A951] placeholder:text-muted-foreground/40";

  return (
    <DashboardLayout pageTitle="إعداد قاعدة البيانات">
      <PageHeader
        title="إعداد قاعدة البيانات السحابية"
        description="ربط المنصة بـ Supabase لتخزين البيانات بشكل دائم في السحاب"
      />

      {/* ── حالة الاتصال الحالية ── */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${
        isConfigured ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'
      }`}>
        {isConfigured ? (
          <>
            <CheckCircle2 size={18} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">متصل بـ Supabase</p>
              <p className="text-xs text-muted-foreground">{url || localStorage.getItem('ramz_supabase_url')}</p>
            </div>
            <button onClick={handleDisconnect} className="mr-auto flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 border border-red-500/30 rounded-lg px-2 py-1">
              <Trash2 size={11} /> قطع الاتصال
            </button>
          </>
        ) : (
          <>
            <Database size={18} className="text-muted-foreground/50 shrink-0" />
            <p className="text-sm text-muted-foreground">غير متصل - يُستخدم حالياً Base44 / بيانات تجريبية</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── نموذج الاتصال ── */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database size={15} className="text-[#C8A951]" />
            <h3 className="font-bold text-sm text-foreground">بيانات اتصال Supabase</h3>
          </div>

          {/* Project URL */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
              <Globe size={11} className="text-[#C8A951]" /> Project URL
            </label>
            <input
              className={inputClass}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
              dir="ltr"
            />
          </div>

          {/* Anon Key */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
              <Key size={11} className="text-[#C8A951]" /> Anon / Public Key
            </label>
            <div className="relative">
              <input
                className={inputClass}
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                dir="ltr"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* حالة الاختبار */}
          {status && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${
              status.success ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                             : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}>
              {status.success ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {status.message}
            </div>
          )}

          {/* أزرار */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleTest}
              disabled={testing || saving}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5">
              {testing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              اختبار الاتصال
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || testing}
              size="sm"
              className="bg-[#C8A951] text-black hover:bg-[#b8973f] text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
              حفظ وتفعيل
            </Button>
          </div>
        </div>

        {/* ── خطوات الإعداد ── */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
              <ExternalLink size={13} className="text-[#C8A951]" /> خطوات الإعداد
            </h3>
            <ol className="space-y-3 text-xs text-muted-foreground">
              {[
                { n: 1, text: 'اذهب إلى', link: 'https://supabase.com/dashboard', linkText: 'supabase.com' },
                { n: 2, text: 'أنشئ مشروعاً جديداً أو افتح مشروعاً موجوداً' },
                { n: 3, text: 'افتح: Project Settings → API' },
                { n: 4, text: 'انسخ Project URL و anon/public key' },
                { n: 5, text: 'الصقهما في الحقول على اليسار' },
                { n: 6, text: 'اضغط "اختبار الاتصال" ثم "حفظ وتفعيل"' },
              ].map(s => (
                <li key={s.n} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C8A951]/20 text-[#C8A951] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{s.n}</span>
                  <span>
                    {s.text}
                    {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-[#C8A951] hover:underline mr-1">{s.linkText}</a>}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* إنشاء الجداول */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-bold text-sm text-foreground mb-3">إنشاء الجداول</h3>
            <p className="text-xs text-muted-foreground mb-3">
              بعد الاتصال، افتح <strong>SQL Editor</strong> في Supabase وشغّل ملف الـ Schema:
            </p>
            <div className="space-y-2">
              <div className="bg-sidebar rounded-lg px-3 py-2 font-mono text-[10px] text-muted-foreground flex items-center justify-between">
                <span>supabase_schema.sql</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('supabase_schema.sql');
                    toast.success('تم النسخ');
                  }}
                  className="text-[#C8A951] hover:opacity-70">
                  <Copy size={11} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                الملف موجود في جذر المشروع: <code className="bg-sidebar px-1 rounded">supabase_schema.sql</code>
              </p>
              <div className="bg-sidebar rounded-lg px-3 py-2 font-mono text-[10px] text-muted-foreground flex items-center justify-between">
                <span>supabase_seed.sql</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('supabase_seed.sql');
                    toast.success('تم النسخ');
                  }}
                  className="text-[#C8A951] hover:opacity-70">
                  <Copy size={11} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                للتجربة السريعة: شغّل أولاً schema ثم seed لإدخال بيانات أولية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── جدول الكيانات والجداول ── */}
      <div className="bg-card border border-border rounded-xl p-5 mt-4">
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
          <Database size={13} className="text-[#C8A951]" /> خريطة الجداول
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            ['Property', 'properties'],
            ['Unit', 'units'],
            ['Tenant', 'tenants'],
            ['Lease', 'leases'],
            ['Payment', 'payments'],
            ['Maintenance', 'maintenance_requests'],
            ['Expense', 'expenses'],
            ['Owner', 'owners'],
            ['Complaint', 'complaints'],
            ['Invoice', 'invoices'],
            ['Document', 'documents'],
            ['Notification', 'notifications'],
            ['BrokerageContract', 'brokerage_contracts'],
            ['AdLicense', 'ad_licenses'],
          ].map(([entity, table]) => (
            <div key={entity} className="bg-sidebar rounded-lg p-2 text-center">
              <div className="text-[10px] font-bold text-[#C8A951]">{entity}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">{table}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
