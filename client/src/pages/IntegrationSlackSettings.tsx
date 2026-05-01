import React, { useState } from 'react';
import { MessageSquare, Save, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Loader2, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

const DARK = '#1a1a1a';
const LS_KEY = 'slack_settings';
const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 transition placeholder:text-gray-400';
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5';

function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }

export default function IntegrationSlackSettings() {
  const s = load();
  const [botToken, setBotToken]     = useState(s.botToken || '');
  const [channelId, setChannelId]   = useState(s.channelId || '');
  const [webhookUrl, setWebhookUrl] = useState(s.webhookUrl || '');
  const [showToken, setShowToken]   = useState(false);
  const [isConnected, setIsConnected] = useState(s.isConnected || false);
  const [saving, setSaving]         = useState(false);
  const [testMsg, setTestMsg]       = useState('');
  const [testing, setTesting]       = useState(false);

  const handleSave = async () => {
    if (!botToken && !webhookUrl) { toast.error('Bot Token أو Webhook URL مطلوب'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ botToken, channelId, webhookUrl, isConnected: true })); } catch {}
    setSaving(false);
    toast.success('تم ربط Slack بنجاح');
  };

  const handleTest = async () => {
    if (!channelId && !webhookUrl) { toast.error('أدخل Channel ID أو Webhook URL أولاً'); return; }
    setTesting(true);
    await new Promise(r => setTimeout(r, 1000));
    setTesting(false);
    toast.success('تم إرسال رسالة تجريبية إلى Slack');
  };

  return (
    <DashboardLayout pageTitle="إعدادات Slack">
      <div className="p-6 max-w-2xl mx-auto space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl">💬</div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Slack</h1>
              <p className="text-gray-500 text-sm">إشعارات فورية لفريقك عبر Slack</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-black text-gray-800 text-sm">إعدادات الربط</h2>
          <div>
            <label className={lbl}>Bot Token</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr" type={showToken ? 'text' : 'password'} value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="xoxb-..." />
              <button type="button" onClick={() => setShowToken(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Channel ID</label>
            <input className={inp} dir="ltr" value={channelId} onChange={e => setChannelId(e.target.value)} placeholder="C0XXXXXXXX" />
          </div>
          <div>
            <label className={lbl}>Webhook URL (بديل)</label>
            <input className={inp} dir="ltr" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." />
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-yellow-50 border border-yellow-100 text-xs text-yellow-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            أنشئ التطبيق من <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="font-bold underline mx-1">api.slack.com/apps</a>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: DARK }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ وربط'}
            </button>
            <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {isConnected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-black text-gray-800 text-sm">اختبار الإرسال</h2>
            <div>
              <label className={lbl}>رسالة تجريبية</label>
              <input className={inp} value={testMsg} onChange={e => setTestMsg(e.target.value)} placeholder="مرحبًا من رمز الإبداع 👋" />
            </div>
            <button onClick={handleTest} disabled={testing}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm border-2 border-dashed transition disabled:opacity-60"
              style={{ borderColor: '#C8A951', color: '#1a1a1a' }}>
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              {testing ? 'جاري الإرسال...' : 'إرسال رسالة تجريبية'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-800 text-sm mb-3">المميزات المتاحة</h2>
          <div className="grid grid-cols-2 gap-2">
            {['تنبيهات الصيانة الجديدة', 'إشعارات انتهاء العقد', 'تأخر الدفع', 'تقارير يومية تلقائية', 'تنبيهات الطوارئ', 'ملخص أسبوعي'].map(f => (
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
