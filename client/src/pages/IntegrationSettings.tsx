import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/base44Client';
import { Link } from 'wouter';
import {
  Settings, Plug, Unlink, Loader2, CheckCircle, XCircle,
  ExternalLink, MessageSquare, DollarSign, FileText, RefreshCw
} from 'lucide-react';
import EjarLoginModal from '@/components/EjarIntegration/EjarLoginModal';

const GOLD = '#C8A951';
const DARK = '#1a1a1a';

// ─── Integration Card ──────────────────────────────────────────────────────────
function IntegCard({ icon, name, desc, status, features, actionLabel, onAction, actionLoading, docsUrl, note, disabled }) {
  const isConnected = status === 'connected';

  return (
    <div className={`bg-white rounded-2xl border flex flex-col transition hover:shadow-md ${
      isConnected ? 'border-emerald-300' : 'border-gray-200'
    }`}>
      {/* Top */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
              isConnected ? 'bg-emerald-50' : 'bg-gray-50'
            }`}>{icon}</div>
            <div>
              <h3 className="font-black text-gray-900 text-sm">{name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Features */}
        <div className="flex flex-col gap-1 mb-3">
          {features.map(f => (
            <div key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isConnected ? 'text-emerald-500' : 'text-gray-300'}`} />
              {f}
            </div>
          ))}
        </div>

        {note && (
          <div className="text-xs px-3 py-2 rounded-xl bg-gray-50 text-gray-600 mb-3">{note}</div>
        )}
      </div>

      {/* Action */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={onAction}
          disabled={actionLoading || disabled}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 ${
            isConnected
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'text-white'
          }`}
          style={!isConnected ? { background: DARK } : {}}
        >
          {actionLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : isConnected
              ? <Settings className="w-4 h-4" />
              : <Plug className="w-4 h-4" />
          }
          {actionLoading ? 'جاري...' : actionLabel || (isConnected ? 'إدارة الربط' : 'ربط الآن')}
        </button>
        {docsUrl && (
          <a href={docsUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  if (status === 'connected') return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
      <CheckCircle className="w-3 h-3" /> متصل
    </span>
  );
  if (status === 'pending') return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">
      <Settings className="w-3 h-3" /> يحتاج إعداد
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold shrink-0">
      <XCircle className="w-3 h-3" /> غير متصل
    </span>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
        {icon}
      </div>
      <h2 className="font-black text-gray-800">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function IntegrationSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEjarModal, setShowEjarModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try { setUser(await base44.auth.me()); }
    catch {}
    finally { setLoading(false); }
  };

  const handleEjarAction = async () => {
    if (user?.ejarToken) {
      if (!confirm('هل تريد قطع الاتصال بمنصة إيجار؟')) return;
      setDisconnecting(true);
      try {
        await base44.auth.updateMe({ ejarUsername: null, ejarLicenseNumber: null, ejarToken: null, ejarConnectedAt: null });
        setUser(p => ({ ...p, ejarToken: null }));
      } catch {}
      setDisconnecting(false);
    } else {
      setShowEjarModal(true);
    }
  };

  const handleEjarSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('syncEjarContracts', {});
    } catch {}
    setSyncing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
    </div>
  );

  const ejarConnected = !!user?.ejarToken;
  const totalConnected = [ejarConnected, true, true, true, true, true].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">التكاملات</h1>
          <p className="text-gray-500 text-sm mt-0.5">ربط الخدمات الخارجية لتوسيع قدرات النظام</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${GOLD}15` }}>
          <CheckCircle className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-sm font-bold" style={{ color: GOLD }}>{totalConnected} تكاملات نشطة</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'إجمالي التكاملات', val: 8, bg: `${GOLD}15`, color: GOLD },
          { label: 'متصل', val: totalConnected, bg: '#ECFDF5', color: '#059669' },
          { label: 'يحتاج إعداد', val: 8 - totalConnected, bg: '#FEF2F2', color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Section 1: التواصل والإشعارات ── */}
      <SectionTitle icon={<MessageSquare className="w-4 h-4" style={{ color: GOLD }} />} title="التواصل والإشعارات" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-2">

        <IntegCard
          icon="📧" name="البريد الإلكتروني" desc="إرسال التقارير والعقود والإشعارات بالبريد"
          status="connected"
          features={['إرسال العقود', 'التقارير الشهرية', 'إشعارات تلقائية', 'قوالب HTML']}
          actionLabel="إدارة الربط"
          onAction={() => window.open('mailto:', '_blank')}
        />

        <IntegCard
          icon="📱" name="مسجات (Msegat)" desc="إرسال رسائل نصية قصيرة للمستأجرين والملاك"
          status="connected"
          features={['رسائل SMS جماعية', 'رسائل مخصصة', 'جدولة الإرسال', 'تقارير الإرسال']}
          note="تم إعداد رمز الربط لخدمة الرسائل"
          actionLabel="إدارة الربط"
          onAction={() => window.open('https://taqnyat.sa', '_blank')}
          docsUrl="https://taqnyat.sa"
        />

        <IntegCard
          icon="💬" name="WhatsApp Business API" desc="إرسال إشعارات تلقائية للمستأجرين والملاك"
          status={user?.ejarToken ? 'connected' : 'pending'}
          features={['قوالب رسائل جاهزة', 'رسائل جماعية', 'تأكيد المواعيد', 'تذكير السداد', '١٠ ميزة أخرى']}
          actionLabel="ربط الآن"
          onAction={() => window.open('https://developers.facebook.com/docs/whatsapp', '_blank')}
          docsUrl="https://developers.facebook.com/docs/whatsapp"
          note="تم إعداد رمز الوصول لخدمة واتساب"
        />
      </div>

      {/* ── Section 2: المحاسبة والفوترة ── */}
      <SectionTitle icon={<DollarSign className="w-4 h-4" style={{ color: GOLD }} />} title="المحاسبة والفوترة" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 -mt-2">

        <IntegCard
          icon="🧾" name="هيئة الزكاة والضريبة (فاتورة)" desc="ربط مع منظومة الفوترة الإلكترونية ZATCA"
          status="pending"
          features={['مزامنة الفواتير', 'إصدار فواتير ضريبية', 'فاتورة إلكترونية معتمدة', 'تقارير QR الضريبي', 'أرشفة الفواتير']}
          actionLabel="ربط الآن"
          onAction={() => window.open('https://zatca.gov.sa', '_blank')}
          docsUrl="https://zatca.gov.sa"
        />

        <IntegCard
          icon="💼" name="كويك بوكس (QuickBooks)" desc="ربط مع كويك بوكس لمزامنة الحسابات والفواتير"
          status="pending"
          features={['مزامنة الفواتير', 'متابعة المصروفات', 'تتبع الدخل', 'التقارير المالية', 'إدارة الضرائب']}
          actionLabel="ربط الآن"
          onAction={() => window.open('https://quickbooks.intuit.com', '_blank')}
          docsUrl="https://quickbooks.intuit.com"
        />
      </div>

      {/* ── Section 3: إدارة العقارات ── */}
      <SectionTitle icon={<FileText className="w-4 h-4" style={{ color: GOLD }} />} title="إدارة العقارات" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 -mt-2">

        {/* إيجار */}
        <div className={`bg-white rounded-2xl border flex flex-col transition hover:shadow-md ${
          ejarConnected ? 'border-emerald-300' : 'border-gray-200'
        }`}>
          <div className="p-5 flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl">🏛️</div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">منصة إيجار</h3>
                  <p className="text-xs text-gray-400 mt-0.5">تكامل العقود والعقارات السعودية</p>
                </div>
              </div>
              <StatusPill status={ejarConnected ? 'connected' : 'pending'} />
            </div>
            <div className="flex flex-col gap-1 mb-3">
              {['استيراد العقود', 'بيانات العقارات', 'تحليل العقود بالذكاء الاصطناعي', 'مزامنة تلقائية'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${ejarConnected ? 'text-emerald-500' : 'text-gray-300'}`} />
                  {f}
                </div>
              ))}
            </div>
            {ejarConnected && user?.ejarUsername && (
              <div className="text-xs px-3 py-2 rounded-xl bg-teal-50 text-teal-700 mb-3">
                حساب متصل: <strong>{user.ejarUsername}</strong>
              </div>
            )}
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={handleEjarAction} disabled={disconnecting}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 ${
                ejarConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'text-white'
              }`}
              style={!ejarConnected ? { background: DARK } : {}}>
              {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : ejarConnected ? <Unlink className="w-4 h-4" /> : <Plug className="w-4 h-4" />}
              {disconnecting ? 'جاري...' : ejarConnected ? 'قطع الاتصال' : 'ربط الآن'}
            </button>
            {ejarConnected && (
              <button onClick={handleEjarSync} disabled={syncing}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition flex items-center">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            )}
            <Link to="/ejar-sync"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Google Calendar */}
        <IntegCard
          icon="📅" name="Google Calendar" desc="مزامنة المواعيد والتنبيهات التلقائية"
          status="connected"
          features={['تنبيهات انتهاء العقود', 'مواعيد الصيانة', 'جداول الدفع', 'متابعة المواعيد']}
          note="مُفعّل عبر OAuth"
          actionLabel="إدارة الربط"
          onAction={() => window.open('https://calendar.google.com', '_blank')}
          docsUrl="https://calendar.google.com"
        />
      </div>

      {/* ── Section 4: الذكاء الاصطناعي والتحليل ── */}
      <SectionTitle icon={<span className="text-sm">🤖</span>} title="الذكاء الاصطناعي والتحليل" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-2">

        <IntegCard
          icon="✨" name="Google Gemini AI" desc="تحليل العقود وتوليد التقارير بالذكاء الاصطناعي"
          status="connected"
          features={['تحليل عقود إيجار', 'توليد التقارير', 'المساعد الذكي']}
          note="GEMINI_API_KEY مُعدّ"
          actionLabel="إدارة الربط"
          onAction={() => window.open('https://ai.google.dev', '_blank')}
          docsUrl="https://ai.google.dev"
        />

        <IntegCard
          icon="📒" name="Notion" desc="تصدير البيانات والتقارير إلى Notion"
          status="connected"
          features={['تصدير التقارير', 'مزامنة البيانات', 'قواعد بيانات Notion']}
          note="مُفعّل عبر OAuth"
          actionLabel="إدارة الربط"
          onAction={() => window.open('https://notion.so', '_blank')}
          docsUrl="https://notion.so"
        />

        <IntegCard
          icon="🐙" name="GitHub" desc="ربط المستودعات وتتبع التطوير"
          status="connected"
          features={['متابعة Pull Requests', 'إدارة الكود', 'المستودعات']}
          note="مُفعّل عبر OAuth"
          actionLabel="إدارة الربط"
          onAction={() => window.open('https://github.com', '_blank')}
          docsUrl="https://github.com"
        />
      </div>

      {showEjarModal && (
        <EjarLoginModal onClose={() => setShowEjarModal(false)} onSuccess={fetchUser} />
      )}
    </div>
  );
}
