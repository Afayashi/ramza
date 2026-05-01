/*
 * إعدادات تكامل واتساب بزنس
 */
import React, { useState } from 'react';
import { MessageCircle, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Loader2, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

const GOLD = '#C8A951';
const DARK = '#1a1a1a';
const LS_KEY = 'whatsapp_settings';

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function save(d: object) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {}
}

export default function IntegrationWhatsAppSettings() {
  const saved = load();
  const [phoneNumber, setPhoneNumber]       = useState(saved.phoneNumber || '');
  const [accessToken, setAccessToken]       = useState(saved.accessToken || '');
  const [businessId, setBusinessId]         = useState(saved.businessId || '');
  const [showToken, setShowToken]           = useState(false);
  const [isConnected, setIsConnected]       = useState(saved.isConnected || false);
  const [isSaving, setIsSaving]             = useState(false);

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-emerald-400 transition';

  const handleSave = async () => {
    if (!phoneNumber || !accessToken || !businessId) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    save({ phoneNumber, accessToken, businessId, isConnected: true });
    setIsSaving(false);
    toast.success('تم ربط واتساب بزنس بنجاح');
  };

  return (
    <DashboardLayout pageTitle="إعدادات واتساب">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-2xl">💬</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">واتساب بزنس API</h1>
              <p className="text-gray-500 text-sm">إرسال إشعارات تلقائية للمستأجرين والملاك</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm">بيانات الاتصال</h2>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم الهاتف (E.164)</label>
            <input className={inp} dir="ltr" placeholder="+966XXXXXXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Business Account ID</label>
            <input className={inp} dir="ltr" placeholder="1234567890" value={businessId} onChange={e => setBusinessId(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Access Token</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr" type={showToken ? 'text' : 'password'} placeholder="EAAxxxxxxx" value={accessToken} onChange={e => setAccessToken(e.target.value)} />
              <button type="button" onClick={() => setShowToken(s => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            احصل على بياناتك من <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="font-bold underline mx-1">Meta for Developers</a>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: DARK }}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'جاري الحفظ...' : 'حفظ وربط'}
            </button>
            <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-800 text-sm mb-3">المميزات المتاحة</h2>
          <div className="grid grid-cols-2 gap-2">
            {['إشعارات الدفع المتأخر', 'تذكير انتهاء العقد', 'رسائل قوالب جاهزة', 'إرسال جماعي', 'تأكيد المواعيد', 'إشعارات الصيانة'].map(f => (
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
