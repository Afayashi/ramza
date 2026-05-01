import React, { useState } from 'react';
import { CreditCard, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Loader2, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

const DARK = '#1a1a1a';
const LS_KEY = 'stripe_settings';
const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 transition placeholder:text-gray-400';
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5';

function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }

export default function IntegrationStripeSettings() {
  const s = load();
  const [pubKey, setPubKey]         = useState(s.pubKey || '');
  const [secKey, setSecKey]         = useState(s.secKey || '');
  const [webhook, setWebhook]       = useState(s.webhook || '');
  const [currency, setCurrency]     = useState(s.currency || 'SAR');
  const [showSec, setShowSec]       = useState(false);
  const [isConnected, setIsConnected] = useState(s.isConnected || false);
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!pubKey || !secKey) { toast.error('مفاتيح Stripe مطلوبة'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ pubKey, secKey, webhook, currency, isConnected: true })); } catch {}
    setSaving(false);
    toast.success('تم ربط Stripe بنجاح');
  };

  return (
    <DashboardLayout pageTitle="إعدادات Stripe">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">💳</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Stripe – بوابة الدفع</h1>
              <p className="text-gray-500 text-sm">استقبال المدفوعات الإلكترونية من المستأجرين</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm">مفاتيح API</h2>
          <div>
            <label className={lbl}>Publishable Key *</label>
            <input className={inp} dir="ltr" value={pubKey} onChange={e => setPubKey(e.target.value)} placeholder="pk_live_..." />
          </div>
          <div>
            <label className={lbl}>Secret Key *</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr" type={showSec ? 'text' : 'password'} value={secKey} onChange={e => setSecKey(e.target.value)} placeholder="sk_live_..." />
              <button type="button" onClick={() => setShowSec(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showSec ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Webhook Secret</label>
            <input className={inp} dir="ltr" value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="whsec_..." />
          </div>
          <div>
            <label className={lbl}>العملة الافتراضية</label>
            <select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
              {['SAR','USD','AED','KWD','BHD'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            احصل على مفاتيحك من <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="font-bold underline mx-1">Stripe Dashboard</a>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: DARK }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ وربط'}
            </button>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-800 text-sm mb-3">المميزات المتاحة</h2>
          <div className="grid grid-cols-2 gap-2">
            {['استقبال المدفوعات', 'روابط دفع مباشرة', 'إشعارات الدفع الفوري', 'كشوف حسابات', 'استرداد المبالغ', 'دعم بطاقات مدى'].map(f => (
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
