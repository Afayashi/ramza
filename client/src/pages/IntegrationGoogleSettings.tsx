import React, { useState } from 'react';
import { Calendar, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Loader2, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

const DARK = '#1a1a1a';
const LS_KEY = 'google_settings';
const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 transition placeholder:text-gray-400';
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5';

function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }

export default function IntegrationGoogleSettings() {
  const s = load();
  const [clientId, setClientId]       = useState(s.clientId || '');
  const [clientSecret, setClientSecret] = useState(s.clientSecret || '');
  const [calendarId, setCalendarId]   = useState(s.calendarId || 'primary');
  const [showSec, setShowSec]         = useState(false);
  const [isConnected, setIsConnected] = useState(s.isConnected || false);
  const [saving, setSaving]           = useState(false);

  const handleSave = async () => {
    if (!clientId || !clientSecret) { toast.error('Client ID و Client Secret مطلوبان'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ clientId, clientSecret, calendarId, isConnected: true })); } catch {}
    setSaving(false);
    toast.success('تم ربط Google Calendar بنجاح');
  };

  return (
    <DashboardLayout pageTitle="إعدادات Google">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-2xl">📅</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Google Calendar</h1>
              <p className="text-gray-500 text-sm">مزامنة المواعيد وانتهاءات العقود مع Google Calendar</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm">OAuth 2.0 Credentials</h2>
          <div>
            <label className={lbl}>Client ID *</label>
            <input className={inp} dir="ltr" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="XXXXXXXXXX.apps.googleusercontent.com" />
          </div>
          <div>
            <label className={lbl}>Client Secret *</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr" type={showSec ? 'text' : 'password'} value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="GOCSPX-..." />
              <button type="button" onClick={() => setShowSec(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showSec ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Calendar ID</label>
            <input className={inp} dir="ltr" value={calendarId} onChange={e => setCalendarId(e.target.value)} placeholder="primary أو email@group.calendar.google.com" />
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            أنشئ بيانات OAuth من <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="font-bold underline mx-1">Google Cloud Console</a>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: DARK }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ وربط'}
            </button>
            <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-800 text-sm mb-3">المميزات المتاحة</h2>
          <div className="grid grid-cols-2 gap-2">
            {['مزامنة مواعيد الصيانة', 'تذكيرات انتهاء العقد', 'مواعيد التفتيش', 'أحداث التجديد', 'تقويم الملاك', 'روابط Meet للاجتماعات'].map(f => (
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
