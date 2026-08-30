/*
 * صفحة تسجيل الدخول - رمز الإبداع
 */
import { useState } from 'react';
import { Eye, EyeOff, LogIn, Building2, UserCheck } from 'lucide-react';
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

// Legacy re-exports for any existing imports
export { saveSession, clearSession, isAuthenticated } from '@/lib/auth';

function normalizePhone(p: string) {
  return p.replace(/\D/g, '').slice(-9);
}

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [tab, setTab] = useState<'admin' | 'owner'>('admin');

  // Admin fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Owner fields
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const hash = await sha256(password);
      if (username.trim() === ADMIN_USER && hash === ADMIN_HASH) {
        saveSession({ role: 'admin', name: username.trim() });
        onSuccess();
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const owner = DEMO_OWNERS.find(o => {
      const idMatch = o['رقم_الهوية'] === idNumber.trim();
      const phoneMatch = normalizePhone(o['رقم_الجوال'] || '') === normalizePhone(phone);
      return idMatch && phoneMatch;
    });
    if (owner) {
      saveSession({ role: 'owner', name: owner['الاسم_الكامل'] || '', ownerId: owner.id });
      onSuccess();
    } else {
      setError('رقم الهوية أو رقم الجوال غير صحيح');
    }
    setLoading(false);
  };

  const inputStyle = {
    background: '#f5f3ee',
    border: `1.5px solid #d4b96a40`,
    color: TEXT_DARK,
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: LIGHT_BG }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: GOLD, filter: 'blur(100px)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: GOLD, filter: 'blur(100px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <img src="/ramza/brand/ramz-logo.svg" alt="رمز الإبداع"
            className="w-24 h-24 mx-auto mb-3"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-2xl font-black" style={{ color: TEXT_DARK }}>رمز الإبداع</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>منصة إدارة الأملاك</p>
        </div>

        {/* تبويبات */}
        <div className="flex rounded-xl overflow-hidden mb-6 shadow-sm" style={{ border: `1px solid #e5e0d5` }}>
          {[
            { key: 'admin', label: 'مدير النظام', icon: Building2 },
            { key: 'owner', label: 'بوابة الملاك', icon: UserCheck },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as any); setError(''); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all"
              style={{
                background: tab === t.key ? GOLD : '#f5f3ee',
                color: tab === t.key ? '#fff' : '#6b5c2e',
              }}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* بطاقة الدخول */}
        <div className="rounded-2xl p-8 shadow-lg" style={{ background: CARD_BG, border: `1px solid #e5e0d5` }}>
          <h2 className="text-lg font-black mb-6 text-center" style={{ color: TEXT_DARK }}>
            {tab === 'admin' ? 'دخول المدير' : 'دخول المالك'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-center font-bold"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {tab === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>اسم المستخدم</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم" required dir="ltr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>كلمة المرور</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور" required dir="ltr"
                    className="w-full px-4 py-3 pl-10 rounded-xl text-sm outline-none transition"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 transition" style={{ color: '#9ca3af' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all mt-6 text-white"
                style={{ background: loading ? `${GOLD}90` : GOLD }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'جاري التحقق...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>رقم الهوية</label>
                <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                  placeholder="أدخل رقم الهوية" required dir="ltr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>رقم الجوال</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx" required dir="ltr"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#d4b96a40'} />
              </div>
              <p className="text-[11px] text-center" style={{ color: '#9ca3af' }}>
                يُستخدم رقم الهوية ورقم الجوال المسجّلان في المنظومة
              </p>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all mt-6 text-white"
                style={{ background: loading ? `${GOLD}90` : GOLD }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserCheck className="w-4 h-4" />}
                {loading ? 'جاري التحقق...' : 'دخول'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} رمز الإبداع لإدارة الأملاك
        </p>
      </div>
    </div>
  );
}
