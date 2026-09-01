/*
 * لوحة تحكم الموظف - رمز الإبداع
 */
import { LogOut, FileText, Users, DollarSign, Wrench, Building2, Bell, ChevronLeft, CheckCircle, Clock } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth';
import { DEMO_PROPERTIES, DEMO_CONTRACTS, DEMO_UNITS } from '@/lib/demoData';

const BLUE = '#2563eb';
const TEXT_DARK = '#1a1a2e';

const QUICK_LINKS = [
  { label: 'العقارات', icon: Building2, color: '#B8932A', path: 'properties' },
  { label: 'العقود', icon: FileText, color: '#059669', path: 'contracts' },
  { label: 'المستأجرون', icon: Users, color: '#7c3aed', path: 'tenants' },
  { label: 'المدفوعات', icon: DollarSign, color: '#dc2626', path: 'payments' },
  { label: 'الصيانة', icon: Wrench, color: '#d97706', path: 'maintenance' },
];

export default function EmployeeDashboard({ onLogout }: { onLogout: () => void }) {
  const session = getSession();
  const handleLogout = () => { clearSession(); onLogout(); };

  const stats = [
    { label: 'إجمالي العقارات', value: DEMO_PROPERTIES.length, icon: Building2, color: '#B8932A' },
    { label: 'الوحدات', value: DEMO_UNITS.length, icon: Building2, color: '#7c3aed' },
    { label: 'عقود نشطة', value: DEMO_CONTRACTS.filter(c => c['حالة_العقد'] === 'نشط').length, icon: CheckCircle, color: '#059669' },
    { label: 'عقود معلقة', value: DEMO_CONTRACTS.filter(c => c['حالة_العقد'] !== 'نشط').length, icon: Clock, color: '#d97706' },
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: '#f8f6f1' }}>
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: '#fff', borderBottom: '1px solid #e5e0d5', boxShadow: '0 1px 4px #0000000a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${BLUE}18` }}>
            <span className="text-lg font-black" style={{ color: BLUE }}>م</span>
          </div>
          <div>
            <div className="font-black text-sm" style={{ color: TEXT_DARK }}>{session?.name || 'الموظف'}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>موظف النظام</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg" style={{ background: '#f5f3ee' }}>
            <Bell className="w-4 h-4" style={{ color: '#6b7280' }} />
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold"
            style={{ background: '#fef2f2', color: '#dc2626' }}>
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}>
          <h1 className="text-xl font-black" style={{ color: '#1e40af' }}>مرحباً، {session?.name || 'الموظف'} 👋</h1>
          <p className="text-sm mt-1" style={{ color: '#3b82f6' }}>لوحة تحكم الموظف — إدارة العقارات والعقود والمدفوعات</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div className="text-2xl font-black" style={{ color: TEXT_DARK }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <h2 className="font-black text-base mb-4" style={{ color: TEXT_DARK }}>الوصول السريع</h2>
          <div className="space-y-2">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <button key={link.label}
                  onClick={() => { window.location.href = `/ramza/${link.path}`; }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl text-right transition hover:scale-[1.01]"
                  style={{ background: '#f8f6f1', border: '1px solid #e5e0d5' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: link.color }} />
                  </div>
                  <span className="flex-1 font-bold text-sm" style={{ color: TEXT_DARK }}>{link.label}</span>
                  <ChevronLeft className="w-4 h-4" style={{ color: '#9ca3af' }} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <h2 className="font-black text-base mb-4" style={{ color: TEXT_DARK }}>آخر العقود</h2>
          <div className="space-y-2">
            {DEMO_CONTRACTS.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8f6f1' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c['حالة_العقد'] === 'نشط' ? '#059669' : '#d97706' }} />
                <div className="flex-1 text-sm font-bold" style={{ color: TEXT_DARK }}>{c['اسم_المستأجر'] || 'مستأجر'}</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>{Number(c['القيمة_السنوية'] || 0).toLocaleString()} ر.س</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: c['حالة_العقد'] === 'نشط' ? '#05966918' : '#d9770618', color: c['حالة_العقد'] === 'نشط' ? '#059669' : '#d97706' }}>
                  {c['حالة_العقد'] || 'غير محدد'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
