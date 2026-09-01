/*
 * صفحة تسجيل الدخول - رمز الإبداع
 * دخول متعدد الأدوار: مدير | موظف | مالك | مستأجر | فني
 */
import { useState } from 'react';
import { Eye, EyeOff, LogIn, Building2, UserCheck, Users, Wrench, Briefcase, ArrowRight } from 'lucide-react';
import { saveSession } from '@/lib/auth';
import { DEMO_OWNERS } from '@/lib/demoData';

const GOLD = '#B8932A';
const LIGHT_BG = '#f8f6f1';
const CARD_BG = '#ffffff';
const TEXT_DARK = '#1a1a2e';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || '';
const ADMIN_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export { saveSession, clearSession, isAuthenticated } from '@/lib/auth';

function normalizePhone(p: string) {
  return p.replace(/\D/g, '').slice(-9);
}

type RoleKey = 'admin' | 'employee' | 'owner' | 'tenant' | 'technician';

const ROLES: { key: RoleKey; label: string; sublabel: string; icon: any; color: string }[] = [
  { key: 'admin',      label: 'المدير',    sublabel: 'صلاحيات كاملة',     icon: Building2,  color: '#B8932A' },
  { key: 'employee',   label: 'الموظف',    sublabel: 'إدارة العمليات',    icon: Briefcase,  color: '#2563eb' },
  { key: 'owner',      label: 'المالك',    sublabel: 'بوابة الملاك',      icon: UserCheck,  color: '#059669' },
  { key: 'tenant',     label: 'المستأجر',  sublabel: 'بوابة المستأجرين', icon: Users,      color: '#7c3aed' },
  { key: 'technician', label: 'الفني',     sublabel: 'لوحة الصيانة',     icon: Wrench,     color: '#dc2626' },
];

const DEMO_EMPLOYEES = [
  { id: 'emp1', username: 'ahmed', password: 'ahmed123', name: 'أحمد العمري' },
  { id: 'emp2', username: 'sara',  password: 'sara123',  name: 'سارة الحربي' },
];
const DEMO_TECHNICIANS = [
  { id: 'tech1', username: 'faisal', password: 'faisal123', name: 'فيصل السالم' },
  { id: 'tech2', username: 'nasser', password: 'nasser123', name: 'ناصر الشمري' },
];
const DEMO_TENANTS = [
  { id: 'ten1', idNumber: '1234567890', phone: '0512345678', name: 'محمد الزهراني' },
  { id: 'ten2', idNumber: '9876543210', phone: '0598765432', name: 'خالد المطيري' },
];

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');

  const activeRole = ROLES.find(r => r.key === selectedRole);
  const roleColor = activeRole?.color || GOLD;

  const inputStyle: React.CSSProperties = {
    background: '#f5f3ee',
    border: `1.5px solid #d4b96a40`,
    color: TEXT_DARK,
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (selectedRole === 'admin') {
        const hash = await sha256(adminPass);
        if (adminUser.trim() === ADMIN_USER && hash === ADMIN_HASH) {
          saveSession({ role: 'admin', name: adminUser.trim() });
          onSuccess();
        } else {
          setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      } else if (selectedRole === 'employee') {
        const emp = DEMO_EMPLOYEES.find(e => e.username === username.trim() && e.password === password);
        if (emp) { saveSession({ role: 'employee', name: emp.name, employeeId: emp.id }); onSuccess(); }
        else setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      } else if (selectedRole === 'technician') {
        const tech = DEMO_TECHNICIANS.find(t => t.username === username.trim() && t.password === password);
        if (tech) { saveSession({ role: 'technician', name: tech.name, technicianId: tech.id }); onSuccess(); }
        else setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      } else if (selectedRole === 'owner') {
        const owner = DEMO_OWNERS.find(o =>
          o['رقم_الهوية'] === idNumber.trim() &&
          normalizePhone(o['رقم_الجوال'] || '') === normalizePhone(phone)
        );
        if (owner) { saveSession({ role: 'owner', name: owner['الاسم_الكامل'] || '', ownerId: owner.id }); onSuccess(); }
        else setError('رقم الهوية أو رقم الجوال غير صحيح');
      } else if (selectedRole === 'tenant') {
        const tenant = DEMO_TENANTS.find(t =>
          t.idNumber === idNumber.trim() && normalizePhone(t.phone) === normalizePhone(phone)
        );
        if (tenant) { saveSession({ role: 'tenant', name: tenant.name, tenantId: tenant.id }); onSuccess(); }
        else setError('رقم الهوية أو رقم الجوال غير صحيح');
      }
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: LIGHT_BG }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: GOLD, filter: 'blur(100px)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: GOLD, filter: 'blur(100px)' }} />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <img src="/ramza/brand/ramz-logo.svg" alt="رمز الإبداع" className="w-20 h-20 mx-auto mb-3"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-3xl font-black" style={{ color: TEXT_DARK }}>رمز الإبداع</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>منصة إدارة الأملاك العقارية</p>
        </div>

        {!selectedRole ? (
          <div className="rounded-2xl p-8 shadow-lg" style={{ background: CARD_BG, border: '1px solid #e5e0d5' }}>
            <h2 className="text-lg font-black text-center mb-6" style={{ color: TEXT_DARK }}>اختر نوع الحساب</h2>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map(role => {
                const Icon = role.icon;
                return (
                  <button key={role.key}
                    onClick={() => { setSelectedRole(role.key); setError(''); }}
                    className="flex items-center gap-4 p-4 rounded-xl text-right transition-all hover:scale-[1.01]"
                    style={{ background: '#f8f6f1', border: '1.5px solid #e5e0d5' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = role.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e0d5')}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${role.color}18` }}>
                      <Icon className="w-6 h-6" style={{ color: role.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-base" style={{ color: TEXT_DARK }}>{role.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{role.sublabel}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 rotate-180" style={{ color: '#9ca3af' }} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-8 shadow-lg" style={{ background: CARD_BG, border: '1px solid #e5e0d5' }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setSelectedRole(null); setError(''); }}
                className="p-2 rounded-lg" style={{ background: '#f5f3ee' }}>
                <ArrowRight className="w-4 h-4" style={{ color: '#6b7280' }} />
              </button>
              {(() => { const Icon = activeRole!.icon; return (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${roleColor}18` }}>
                    <Icon className="w-5 h-5" style={{ color: roleColor }} />
                  </div>
                  <div>
                    <div className="font-black text-base" style={{ color: TEXT_DARK }}>دخول {activeRole!.label}</div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>{activeRole!.sublabel}</div>
                  </div>
                </div>
              ); })()}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm text-center font-bold"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {(selectedRole === 'admin') && (<>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>اسم المستخدم</label>
                  <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)}
                    placeholder="أدخل اسم المستخدم" required dir="ltr" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = roleColor}
                    onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>كلمة المرور</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={adminPass}
                      onChange={e => setAdminPass(e.target.value)} placeholder="أدخل كلمة المرور" required dir="ltr"
                      style={{ ...inputStyle, paddingLeft: '44px' }}
                      onFocus={e => e.target.style.borderColor = roleColor}
                      onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>)}

              {(selectedRole === 'employee' || selectedRole === 'technician') && (<>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>اسم المستخدم</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم" required dir="ltr" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = roleColor}
                    onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>كلمة المرور</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" required dir="ltr"
                      style={{ ...inputStyle, paddingLeft: '44px' }}
                      onFocus={e => e.target.style.borderColor = roleColor}
                      onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-xl text-xs" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                  {selectedRole === 'employee'
                    ? 'تجريبي: ahmed / ahmed123 أو sara / sara123'
                    : 'تجريبي: faisal / faisal123 أو nasser / nasser123'}
                </div>
              </>)}

              {(selectedRole === 'owner' || selectedRole === 'tenant') && (<>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>رقم الهوية</label>
                  <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                    placeholder="أدخل رقم الهوية الوطنية" required dir="ltr" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = roleColor}
                    onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>رقم الجوال</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx" required dir="ltr" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = roleColor}
                    onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                </div>
                {selectedRole === 'tenant' && (
                  <div className="p-3 rounded-xl text-xs" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                    تجريبي: هوية 1234567890 / جوال 0512345678
                  </div>
                )}
              </>)}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all mt-2"
                style={{ background: loading ? `${roleColor}90` : roleColor }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'جاري التحقق...' : 'دخول'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} رمز الإبداع لإدارة الأملاك
        </p>
      </div>
    </div>
  );
}
