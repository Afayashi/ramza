/*
 * صفحة تسجيل الدخول - رمز الإبداع
 */
import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const GOLD = '#C8A951';
const DARK = '#1a1209';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || '';
const ADMIN_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function saveSession() {
  sessionStorage.setItem('ramz_auth', 'true');
  localStorage.setItem('ramz_auth', 'true');
}

export function clearSession() {
  sessionStorage.removeItem('ramz_auth');
  localStorage.removeItem('ramz_auth');
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem('ramz_auth') === 'true' || localStorage.getItem('ramz_auth') === 'true';
}

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const hash = await sha256(password);
      if (username.trim() === ADMIN_USER && hash === ADMIN_HASH) {
        saveSession();
        onSuccess();
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: DARK }}>
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5"
          style={{ background: GOLD, filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
          style={{ background: GOLD, filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <img src="/ramza/brand/ramz-logo.svg" alt="رمز الإبداع" className="w-28 h-28 mx-auto mb-3" />
          <h1 className="text-2xl font-black" style={{ color: GOLD }}>رمز الإبداع</h1>
          <p className="text-sm mt-1" style={{ color: `${GOLD}70` }}>منصة إدارة الأملاك</p>
        </div>

        {/* بطاقة الدخول */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: '#2d1f06', border: `1px solid ${GOLD}20` }}>
          <h2 className="text-lg font-black text-white mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-center font-bold"
              style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: `${GOLD}90` }}>
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                style={{ background: '#1a1209', border: `1.5px solid ${GOLD}30` }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = `${GOLD}30`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: `${GOLD}90` }}>
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  dir="ltr"
                  className="w-full px-4 py-3 pl-10 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  style={{ background: '#1a1209', border: `1.5px solid ${GOLD}30` }}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = `${GOLD}30`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all mt-6"
              style={{ background: loading ? `${GOLD}60` : GOLD, color: DARK }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: `${GOLD}40` }}>
          © {new Date().getFullYear()} رمز الإبداع لإدارة الأملاك
        </p>
      </div>
    </div>
  );
}
