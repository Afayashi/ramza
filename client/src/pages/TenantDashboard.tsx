/*
 * لوحة تحكم المستأجر - رمز الإبداع
 */
import { LogOut, FileText, DollarSign, Wrench, Phone, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth';
import { DEMO_CONTRACTS, DEMO_UNITS } from '@/lib/demoData';

const PURPLE = '#7c3aed';
const TEXT_DARK = '#1a1a2e';

export default function TenantDashboard({ onLogout }: { onLogout: () => void }) {
  const session = getSession();
  const handleLogout = () => { clearSession(); onLogout(); };

  const contract = DEMO_CONTRACTS[0];
  const unit = DEMO_UNITS[0];

  const payments = [
    { month: 'يناير 2026', amount: 5000, status: 'مدفوع' },
    { month: 'فبراير 2026', amount: 5000, status: 'مدفوع' },
    { month: 'مارس 2026', amount: 5000, status: 'معلق' },
  ];

  const maintenanceRequests = [
    { title: 'إصلاح تسريب مياه', date: '2026-02-15', status: 'مكتمل' },
    { title: 'صيانة مكيف', date: '2026-03-01', status: 'قيد التنفيذ' },
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: '#f8f6f1' }}>
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: '#fff', borderBottom: '1px solid #e5e0d5', boxShadow: '0 1px 4px #0000000a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${PURPLE}18` }}>
            <span className="text-lg font-black" style={{ color: PURPLE }}>م</span>
          </div>
          <div>
            <div className="font-black text-sm" style={{ color: TEXT_DARK }}>{session?.name || 'المستأجر'}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>بوابة المستأجر</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold"
          style={{ background: '#fef2f2', color: '#dc2626' }}>
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #ddd6fe' }}>
          <h1 className="text-xl font-black" style={{ color: '#5b21b6' }}>مرحباً، {session?.name || 'المستأجر'} 👋</h1>
          <p className="text-sm mt-1" style={{ color: PURPLE }}>بوابتك لمتابعة عقدك ومدفوعاتك وطلبات الصيانة</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <h2 className="font-black text-sm mb-3" style={{ color: '#9ca3af' }}>الوحدة المستأجرة</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'اسم العقار', value: unit?.['اسم_العقار'] || 'برج الياسمين' },
              { label: 'رقم الوحدة', value: unit?.['رقم_الوحدة'] || 'A-101' },
              { label: 'النوع', value: unit?.['النوع'] || 'شقة' },
              { label: 'الطابق', value: unit?.['الطابق'] || '1' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: '#f8f6f1' }}>
                <div className="text-xs mb-1" style={{ color: '#9ca3af' }}>{item.label}</div>
                <div className="font-black text-sm" style={{ color: TEXT_DARK }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: PURPLE }} />
            <h2 className="font-black text-sm" style={{ color: TEXT_DARK }}>العقد</h2>
            <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#05966918', color: '#059669' }}>نشط</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'بداية العقد', value: contract?.['تاريخ_البداية'] || '2026-01-01' },
              { label: 'نهاية العقد', value: contract?.['تاريخ_الانتهاء'] || '2026-12-31' },
              { label: 'الإيجار الشهري', value: `${Number(contract?.['القيمة_الشهرية'] || 5000).toLocaleString()} ر.س` },
              { label: 'التأمين', value: `${Number(contract?.['مبلغ_التأمين'] || 5000).toLocaleString()} ر.س` },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: '#f8f6f1' }}>
                <div className="text-xs mb-1" style={{ color: '#9ca3af' }}>{item.label}</div>
                <div className="font-black text-sm" style={{ color: TEXT_DARK }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4" style={{ color: '#059669' }} />
            <h2 className="font-black text-sm" style={{ color: TEXT_DARK }}>المدفوعات</h2>
          </div>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8f6f1' }}>
                {p.status === 'مدفوع' ? <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} /> : <Clock className="w-4 h-4" style={{ color: '#d97706' }} />}
                <div className="flex-1 text-sm font-bold" style={{ color: TEXT_DARK }}>{p.month}</div>
                <div className="text-sm font-black" style={{ color: TEXT_DARK }}>{p.amount.toLocaleString()} ر.س</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: p.status === 'مدفوع' ? '#05966918' : '#d9770618', color: p.status === 'مدفوع' ? '#059669' : '#d97706' }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4" style={{ color: '#d97706' }} />
            <h2 className="font-black text-sm" style={{ color: TEXT_DARK }}>طلبات الصيانة</h2>
          </div>
          <div className="space-y-2">
            {maintenanceRequests.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8f6f1' }}>
                {r.status === 'مكتمل' ? <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} /> : <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />}
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: TEXT_DARK }}>{r.title}</div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>{r.date}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: r.status === 'مكتمل' ? '#05966918' : '#d9770618', color: r.status === 'مكتمل' ? '#059669' : '#d97706' }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: `${PURPLE}18`, color: PURPLE, border: `1px dashed ${PURPLE}40` }}>
            + تقديم طلب صيانة جديد
          </button>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4" style={{ color: '#2563eb' }} />
            <h2 className="font-black text-sm" style={{ color: TEXT_DARK }}>تواصل معنا</h2>
          </div>
          <a href="tel:920013517" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
            style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Phone className="w-4 h-4" /> 920013517
          </a>
        </div>
      </main>
    </div>
  );
}
