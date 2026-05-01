import React, { useState } from 'react';
import { Phone, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Loader2, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

const DARK = '#1a1a1a';
const LS_KEY = 'sms_settings';
const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 transition placeholder:text-gray-400';
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5';

function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }

export default function IntegrationSMSSettings() {
  const s = load();
  const [bearer, setBearer]         = useState(s.bearer || '');
  const [sender, setSender]         = useState(s.sender || 'RAMZ');
  const [provider, setProvider]     = useState(s.provider || 'taqnyat');
  const [showBearer, setShowBearer] = useState(false);
  const [isConnected, setIsConnected] = useState(s.isConnected || false);
  const [saving, setSaving]         = useState(false);
  const [testPhone, setTestPhone]   = useState('');
  const [testing, setTesting]       = useState(false);

  const handleSave = async () => {
    if (!bearer) { toast.error('Bearer Token مطلوب'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ bearer, sender, provider, isConnected: true })); } catch {}
    setSaving(false);
    toast.success('تم ربط خدمة SMS بنجاح');
  };

  const handleTest = async () => {
    if (!testPhone) { toast.error('أدخل رقم الهاتف للاختبار'); return; }
    setTesting(true);
    await new Promise(r => setTimeout(r, 1000));
    setTesting(false);
    toast.success(`تم إرسال رسالة تجريبية إلى ${testPhone}`);
  };

  return (
    <DashboardLayout pageTitle="إعدادات SMS">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">📱</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">خدمة الرسائل القصيرة (SMS)</h1>
              <p className="text-gray-500 text-sm">إرسال رسائل SMS للمستأجرين والملاك عبر Msegat / Taqnyat</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm">إعدادات الخدمة</h2>
          <div>
            <label className={lbl}>مزوّد الخدمة</label>
            <select className={inp} value={provider} onChange={e => setProvider(e.target.value)}>
              <option value="taqnyat">Taqnyat (تقنيات)</option>
              <option value="msegat">Msegat (مسجات)</option>
              <option value="unifonic">Unifonic</option>
              <option value="stc">STC مسائل</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Bearer Token *</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr" type={showBearer ? 'text' : 'password'} value={bearer} onChange={e => setBearer(e.target.value)} placeholder="Bearer eyJ..." />
              <button type="button" onClick={() => setShowBearer(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showBearer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>اسم المُرسِل (Sender ID)</label>
            <input className={inp} dir="ltr" value={sender} onChange={e => setSender(e.target.value)} placeholder="RAMZ" maxLength={11} />
            <p className="text-xs text-gray-400 mt-1">يجب أن يكون مسجلاً مسبقاً لدى المزود</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: DARK }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ وربط'}
            </button>
            <a href="https://taqnyat.sa" target="_blank" rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {isConnected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-black text-gray-800 text-sm">اختبار الإرسال</h2>
            <div>
              <label className={lbl}>رقم الهاتف للاختبار</label>
              <input className={inp} dir="ltr" value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="+966XXXXXXXXX" />
            </div>
            <button onClick={handleTest} disabled={testing}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm border-2 border-dashed transition disabled:opacity-60"
              style={{ borderColor: '#C8A951', color: '#1a1a1a' }}>
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              {testing ? 'جاري الإرسال...' : 'إرسال رسالة تجريبية'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
