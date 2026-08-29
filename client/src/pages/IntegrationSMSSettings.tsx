/*
 * إعدادات خدمة SMS - رمز الإبداع
 * يدعم Taqnyat (تقنيات) مع إرسال حقيقي عبر API
 */
import React, { useState } from 'react';
import {
  Phone, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink,
  Loader2, Send, MessageSquare, Bell, RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { loadSMSSettings, saveSMSSettings, testSMSConnection } from '@/lib/smsService';

const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 transition placeholder:text-gray-400';
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5';

export default function IntegrationSMSSettings() {
  const s = loadSMSSettings();
  const [bearer, setBearer]         = useState(s.bearer || '');
  const [sender, setSender]         = useState(s.sender || 'RAMZ');
  const [provider, setProvider]     = useState(s.provider || 'taqnyat');
  const [showBearer, setShowBearer] = useState(false);
  const [isConnected, setIsConnected] = useState(s.isConnected || false);
  const [saving, setSaving]         = useState(false);
  const [testPhone, setTestPhone]   = useState('');
  const [testing, setTesting]       = useState(false);

  // إعدادات الإشعارات التلقائية
  const [autoRentReminder, setAutoRentReminder] = useState(
    () => { try { return JSON.parse(localStorage.getItem('sms_auto_rent') || 'true'); } catch { return true; } }
  );
  const [autoLeaseExpiry, setAutoLeaseExpiry] = useState(
    () => { try { return JSON.parse(localStorage.getItem('sms_auto_lease') || 'true'); } catch { return true; } }
  );
  const [autoMaintenance, setAutoMaintenance] = useState(
    () => { try { return JSON.parse(localStorage.getItem('sms_auto_maint') || 'false'); } catch { return false; } }
  );

  const handleSave = () => {
    if (!bearer.trim()) { toast.error('Bearer Token مطلوب'); return; }
    setSaving(true);
    saveSMSSettings({ bearer: bearer.trim(), sender: sender.trim(), provider, isConnected: true });
    localStorage.setItem('sms_auto_rent', JSON.stringify(autoRentReminder));
    localStorage.setItem('sms_auto_lease', JSON.stringify(autoLeaseExpiry));
    localStorage.setItem('sms_auto_maint', JSON.stringify(autoMaintenance));
    setIsConnected(true);
    setSaving(false);
    toast.success('تم حفظ إعدادات SMS بنجاح');
  };

  const handleTest = async () => {
    if (!bearer.trim()) { toast.error('احفظ Bearer Token أولاً'); return; }
    if (!testPhone.trim()) { toast.error('أدخل رقم الهاتف للاختبار'); return; }
    setTesting(true);
    const result = await testSMSConnection(bearer.trim(), sender.trim(), testPhone.trim());
    setTesting(false);
    if (result.success) {
      toast.success('✅ تم إرسال رسالة الاختبار بنجاح');
    } else {
      toast.error(`فشل الإرسال: ${result.error}`);
    }
  };

  const handleDisconnect = () => {
    saveSMSSettings({ isConnected: false, bearer: '' });
    setBearer('');
    setIsConnected(false);
    toast.info('تم قطع الاتصال بخدمة SMS');
  };

  return (
    <DashboardLayout pageTitle="إعدادات SMS">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">

        {/* رأس الصفحة */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">📱</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">خدمة الرسائل القصيرة (SMS)</h1>
              <p className="text-gray-500 text-sm">إرسال رسائل SMS للمستأجرين والملاك عبر Taqnyat</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل بتقنيات' : 'غير متصل'}
          </span>
        </div>

        {/* إعدادات الاتصال */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500" /> إعدادات الاتصال
          </h2>

          <div>
            <label className={lbl}>مزوّد الخدمة</label>
            <select className={inp} value={provider} onChange={e => setProvider(e.target.value)}>
              <option value="taqnyat">Taqnyat (تقنيات)</option>
              <option value="msegat">Msegat (مسجات)</option>
              <option value="unifonic">Unifonic</option>
            </select>
          </div>

          <div>
            <label className={lbl}>Bearer Token *</label>
            <div className="relative">
              <input
                className={`${inp} pl-10`}
                dir="ltr"
                type={showBearer ? 'text' : 'password'}
                value={bearer}
                onChange={e => setBearer(e.target.value)}
                placeholder="eyJhbGciOiJSUzI1NiIsIn..."
              />
              <button
                type="button"
                onClick={() => setShowBearer(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showBearer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              من لوحة تحكم تقنيات: API Keys → Bearer Token
            </p>
          </div>

          <div>
            <label className={lbl}>اسم المُرسِل (Sender ID)</label>
            <input
              className={inp}
              dir="ltr"
              value={sender}
              onChange={e => setSender(e.target.value.toUpperCase())}
              placeholder="RAMZ"
              maxLength={11}
            />
            <p className="text-xs text-gray-400 mt-1">يجب أن يكون مسجلاً مسبقاً لدى تقنيات (حتى 11 حرف)</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-[#1a1a1a] hover:bg-[#333] transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
            <a
              href="https://portal.taqnyat.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center gap-1 text-xs"
            >
              <ExternalLink className="w-4 h-4" /> تقنيات
            </a>
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="px-3 py-2.5 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" /> قطع
              </button>
            )}
          </div>
        </div>

        {/* الإشعارات التلقائية */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-black text-gray-800 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" /> الإشعارات التلقائية
          </h2>
          <p className="text-xs text-gray-400">سيتم تفعيل الإرسال التلقائي عند اكتمال الموقع</p>

          {[
            {
              key: 'rent', label: 'تذكير الإيجار', desc: 'إرسال تذكير قبل 3 أيام من استحقاق الإيجار',
              value: autoRentReminder, set: setAutoRentReminder,
            },
            {
              key: 'lease', label: 'انتهاء العقد', desc: 'إشعار المستأجر قبل 30 يوماً من انتهاء العقد',
              value: autoLeaseExpiry, set: setAutoLeaseExpiry,
            },
            {
              key: 'maint', label: 'تحديث الصيانة', desc: 'إشعار المستأجر عند تغيير حالة طلب الصيانة',
              value: autoMaintenance, set: setAutoMaintenance,
            },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <div className="text-sm font-bold text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </div>
              <button
                onClick={() => item.set((v: boolean) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-amber-400' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-0.5' : 'translate-x-5'}`} />
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              localStorage.setItem('sms_auto_rent', JSON.stringify(autoRentReminder));
              localStorage.setItem('sms_auto_lease', JSON.stringify(autoLeaseExpiry));
              localStorage.setItem('sms_auto_maint', JSON.stringify(autoMaintenance));
              toast.success('تم حفظ إعدادات الإشعارات');
            }}
            className="w-full py-2 rounded-xl border border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-50 transition"
          >
            حفظ إعدادات الإشعارات
          </button>
        </div>

        {/* اختبار الإرسال */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-black text-gray-800 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" /> اختبار الإرسال المباشر
          </h2>
          <div>
            <label className={lbl}>رقم الهاتف للاختبار</label>
            <input
              className={inp}
              dir="ltr"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="+966XXXXXXXXX أو 05XXXXXXXX"
            />
          </div>
          <button
            onClick={handleTest}
            disabled={testing || !bearer.trim()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 transition disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {testing ? 'جاري الإرسال...' : 'إرسال رسالة تجريبية'}
          </button>
          {!bearer.trim() && (
            <p className="text-xs text-red-400 text-center">احفظ Bearer Token أولاً لتتمكن من الاختبار</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
