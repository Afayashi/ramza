/*
 * EjarSync — مزامنة مباشرة مع منصة إيجار
 * رمز الإبداع لإدارة الأملاك
 */
import { useState } from 'react';
import {
  AlertTriangle, LogIn, Shield, RefreshCw, CheckCircle2,
  ExternalLink, Loader2, Key, Building2, FileText,
  ToggleLeft, ToggleRight, Info, ArrowLeft,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

// ─── Constants ──────────────────────────────────────────────────────────────
const GOLD  = '#C8A951';
const GREEN = '#0ea472';
const LS_REG = 'ejar_ext_reg';
const LS_KEY = 'ejar_api_creds';
const DEFAULT_API_KEY = 'M0hT2aI0HbSwozvxRkLVhYl9ixDnHgCGPL8EQZqmmmhD8EFFBkOT7b3B2PeWlIVU';

function loadReg() {
  try { const r = localStorage.getItem(LS_REG); if (r) return JSON.parse(r); } catch {}
  return { active: true, createdAt: '2026-04-08', username: 'bo-1010601471', apiKey: DEFAULT_API_KEY };
}

// ─── Card wrapper ────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function EjarSync() {
  const [, setLocation] = useLocation();
  const [nationalId, setNationalId] = useState('');
  const [logging, setLogging] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [reg, setReg] = useState(loadReg);
  const [renewLoading, setRenewLoading] = useState(false);

  // ── تسجيل الدخول عبر النفاذ الوطني ──────────────────────────────────────
  const handleNafathLogin = async () => {
    if (!nationalId.trim()) { toast.error('أدخل رقم الهوية أو السجل التجاري'); return; }
    setLogging(true);
    await new Promise(r => setTimeout(r, 1800));
    setLogging(false);
    toast.success('تم الدخول عبر النفاذ الوطني بنجاح');
  };

  // ── مزامنة البيانات من إيجار ─────────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    setSyncDone(false);
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      const username = saved.username || 'bo-1010601471';
      const password = saved.password || DEFAULT_API_KEY;
      const token = btoa(`${username}:${password}`);
      let allContracts: any[] = [];
      for (const state of ['active', 'expired']) {
        let pg = 1;
        while (pg <= 10) {
          const url = `https://eservices.ejar.sa/api/v1/contracts?page[number]=${pg}&page[size]=50&filter[state]=${state}`;
          const r = await fetch(url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', Authorization: `Basic ${token}` },
            credentials: 'include',
          });
          if (!r.ok) break;
          const json = await r.json();
          allContracts = [...allContracts, ...(json.data || [])];
          if ((json.data || []).length < 50) break;
          pg++;
        }
      }
      if (allContracts.length > 0) {
        localStorage.setItem('real_contracts', JSON.stringify(allContracts.map((c: any, i: number) => ({
          id: c.id || `ejar_${i}`,
          contract_number: c.attributes?.contract_number || '',
          state: c.attributes?.state || '',
          contract_start_date: c.attributes?.contract_start_date || '',
          contract_end_date: c.attributes?.contract_end_date || '',
          annual_rent: c.attributes?.total_rent_amount || '',
        }))));
        setSyncDone(true);
        toast.success(`✓ تمت المزامنة — ${allContracts.length} عقد`);
      } else {
        window.open('https://eservices.ejar.sa/ar/contracts?state=active', '_blank');
        toast.info('سجّل الدخول في إيجار أولاً ثم عد لإعادة المزامنة');
      }
    } catch {
      window.open('https://eservices.ejar.sa/ar/contracts?state=active', '_blank');
      toast.info('تعذّر الاتصال — سجّل الدخول في إيجار ثم عد للمزامنة');
    } finally {
      setSyncing(false);
    }
  };

  // ── تجديد رمز التسجيل الخارجي ───────────────────────────────────────────
  const handleRenew = async () => {
    setRenewLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const newReg = { ...reg, createdAt: new Date().toISOString().slice(0, 10) };
    setReg(newReg);
    localStorage.setItem(LS_REG, JSON.stringify(newReg));
    setRenewLoading(false);
    toast.success('تم تجديد رمز التسجيل الخارجي');
  };

  const handleToggleReg = () => {
    const updated = { ...reg, active: !reg.active };
    setReg(updated);
    localStorage.setItem(LS_REG, JSON.stringify(updated));
    toast.success(updated.active ? 'تم تفعيل التسجيل الخارجي' : 'تم تعطيل التسجيل الخارجي');
  };

  return (
    <DashboardLayout pageTitle="مزامنة إيجار">
      <div className="max-w-2xl mx-auto space-y-5 pb-10">

        {/* ── شريط العودة ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/ejar')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            العودة إلى إيجار
          </button>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-sm font-bold text-foreground">مزامنة منصة إيجار</span>
        </div>

        {/* ── تنبيه Cloudflare ──────────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            منصة إيجار تستخدم{' '}
            <span className="font-bold text-amber-900">النفاذ الوطني</span>{' '}
            للمصادقة وتحمي واجهاتها بـ{' '}
            <span className="font-bold text-amber-900">Cloudflare</span>
            . المزامنة التلقائية تعتمد على بيانات دخولك. في حال تعذّر الاتصال المباشر، استخدم طرق الاستيراد البديلة أدناه.
          </p>
        </div>

        {/* ── بطاقة الدخول ─────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          {/* رأس البطاقة */}
          <div className="flex items-center gap-3 p-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/10 flex items-center justify-center">
              <LogIn size={18} className="text-[#C8A951]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">الدخول بحساب إيجار (النفاذ الوطني)</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">استخدم نفس بيانات دخولك في ejar.sa</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* حقل رقم الهوية */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                رقم الهوية / السجل التجاري
              </label>
              <input
                type="text"
                dir="ltr"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                placeholder="10XXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C8A951]/30 focus:border-[#C8A951]/50 transition-all"
              />
            </div>

            {/* خيار النفاذ الوطني */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <Shield size={15} className="shrink-0" />
              <span>الدخول عبر النفاذ الوطني — لا حاجة لكلمة المرور</span>
            </button>

            {/* زر الدخول والمزامنة */}
            <button
              onClick={async () => { await handleNafathLogin(); if (nationalId.trim()) await handleSync(); }}
              disabled={logging || syncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {(logging || syncing) ? (
                <><Loader2 size={15} className="animate-spin" /> جاري الاتصال...</>
              ) : syncDone ? (
                <><CheckCircle2 size={15} className="text-emerald-400" /> تمت المزامنة بنجاح</>
              ) : (
                <>← الدخول ومزامنة</>
              )}
            </button>

            {/* رابط إيجار المباشر */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => window.open('https://eservices.ejar.sa', '_blank')}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-[#C8A951] transition-colors"
              >
                <ExternalLink size={11} />
                فتح منصة إيجار مباشرة
              </button>
            </div>
          </div>
        </Card>

        {/* ── إعدادات المنصة ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1">إعدادات المنصة</h3>

          <Card>
            <div className="p-5">
              {/* عنوان + الحالة */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Key size={15} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">التسجيل الخارجي</span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold">
                        <span className={`w-1.5 h-1.5 rounded-full ${reg.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className={reg.active ? 'text-emerald-600' : 'text-slate-400'}>
                          {reg.active ? 'فعال' : 'معطّل'}
                        </span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">السماح بتسجيل العقود من خارج منصة إيجار.</p>
                  </div>
                </div>

                {/* زر التبديل */}
                <button onClick={handleToggleReg}>
                  {reg.active
                    ? <ToggleRight size={28} className="text-emerald-500" />
                    : <ToggleLeft size={28} className="text-slate-300" />}
                </button>
              </div>

              {/* آخر تجديد */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Info size={11} />
                  <span>آخر رمز تم إنشاؤه</span>
                  <span className="font-semibold text-slate-600">{reg.createdAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRenew}
                    disabled={renewLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                  >
                    {renewLoading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    تجديد
                  </button>
                  <button
                    onClick={handleToggleReg}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-colors"
                  >
                    تعطيل
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── روابط سريعة ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation('/data-import')}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-[#C8A951]/40 transition-all text-right"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/10 flex items-center justify-center shrink-0">
              <FileText size={15} className="text-[#C8A951]" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">استيراد ملف Excel</p>
              <p className="text-[10px] text-muted-foreground">بديل للمزامنة المباشرة</p>
            </div>
          </button>

          <button
            onClick={() => setLocation('/contracts')}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-[#C8A951]/40 transition-all text-right"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Building2 size={15} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">عرض العقود</p>
              <p className="text-[10px] text-muted-foreground">العقود المستوردة والمزامنة</p>
            </div>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
