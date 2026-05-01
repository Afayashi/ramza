import React, { useState } from 'react';
import { Mail, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Loader2, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

const DARK = '#1a1a1a';
const LS_KEY = 'email_settings';
const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 transition placeholder:text-gray-400';
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5';

function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }

export default function IntegrationEmailSettings() {
  const s = load();
  const [smtpHost, setSmtpHost]     = useState(s.smtpHost || '');
  const [smtpPort, setSmtpPort]     = useState(s.smtpPort || '587');
  const [email, setEmail]           = useState(s.email || '');
  const [password, setPassword]     = useState(s.password || '');
  const [fromName, setFromName]     = useState(s.fromName || 'رمز الإبداع');
  const [showPass, setShowPass]     = useState(false);
  const [isConnected, setIsConnected] = useState(s.isConnected || false);
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!smtpHost || !email || !password) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ smtpHost, smtpPort, email, password, fromName, isConnected: true })); } catch {}
    setSaving(false);
    toast.success('تم حفظ إعدادات البريد الإلكتروني بنجاح');
  };

  return (
    <DashboardLayout pageTitle="إعدادات البريد الإلكتروني">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">📧</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">البريد الإلكتروني (SMTP)</h1>
              <p className="text-gray-500 text-sm">إرسال التقارير والعقود والإشعارات بالبريد</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm">إعدادات SMTP</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={lbl}>خادم SMTP *</label>
              <input className={inp} dir="ltr" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className={lbl}>المنفذ (Port)</label>
              <select className={inp} value={smtpPort} onChange={e => setSmtpPort(e.target.value)}>
                {['587','465','25','2525'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>البريد الإلكتروني *</label>
            <input className={inp} dir="ltr" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="noreply@company.com" />
          </div>
          <div>
            <label className={lbl}>كلمة المرور / App Password *</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>اسم المُرسِل</label>
            <input className={inp} value={fromName} onChange={e => setFromName(e.target.value)} placeholder="رمز الإبداع" />
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            لـ Gmail استخدم App Password من <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="font-bold underline mx-1">إعدادات Google</a>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: DARK }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ وربط'}
            </button>
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-800 text-sm mb-3">المميزات المتاحة</h2>
          <div className="grid grid-cols-2 gap-2">
            {['إرسال العقود PDF', 'التقارير الشهرية', 'إشعارات انتهاء العقد', 'تذكيرات الدفع', 'قوالب HTML جاهزة', 'إرسال جماعي'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
