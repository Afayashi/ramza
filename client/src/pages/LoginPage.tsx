/*
 * صفحة تسجيل الدخول - رمز الإبداع
 * نظام ذكي يعرّف المستخدم تلقائياً من بيانات الدخول
 */
import { useState } from 'react';
import { Eye, EyeOff, LogIn, Building2, BarChart3, Wrench, FileText, Users } from 'lucide-react';
import { saveSession } from '@/lib/auth';
import { DEMO_OWNERS } from '@/lib/demoData';

const ADMIN_USER  = import.meta.env.VITE_ADMIN_USERNAME       || '';
const ADMIN_HASH  = import.meta.env.VITE_ADMIN_PASSWORD_HASH  || '';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export { saveSession, clearSession, isAuthenticated } from '@/lib/auth';

function normalizePhone(p: string) {
  return p.replace(/\D/g, '').slice(-9);
}

// ─── بيانات المستخدمين ───────────────────────────────────────────
const EMPLOYEES = [
  { id: 'emp1', username: 'ahmed',  password: 'ahmed123',  name: 'أحمد العمري' },
  { id: 'emp2', username: 'sara',   password: 'sara123',   name: 'سارة الحربي' },
];
const TECHNICIANS = [
  { id: 'tech1', username: 'faisal', password: 'faisal123', name: 'فيصل السالم' },
  { id: 'tech2', username: 'nasser', password: 'nasser123', name: 'ناصر الشمري' },
];
// المستأجرون: اسم المستخدم = رقم الهوية، كلمة المرور = رقم الجوال
const DEMO_TENANTS = [
  { id: 'ten1', username: '1234567890', password: '0512345678', name: 'محمد الزهراني' },
  { id: 'ten2', username: '9876543210', password: '0598765432', name: 'خالد المطيري' },
];

// ─── الميزات للعرض في الجانب الأيمن ─────────────────────────────
const FEATURES = [
  {
    icon: BarChart3,
    title: 'التقارير المالية',
    desc: 'تحليلات مالية دقيقة: عقود، دفعات، صيانة، وتنبيهات تشغيلية في مكان واحد.',
  },
  {
    icon: Building2,
    title: 'إدارة العقارات',
    desc: 'تتبع جميع وحداتك وعقاراتك بسهولة مع لوحة تحكم شاملة.',
  },
  {
    icon: Wrench,
    title: 'الصيانة الذكية',
    desc: 'إدارة طلبات الصيانة وتتبع الفنيين وجدولة الأعمال الوقائية.',
  },
  {
    icon: FileText,
    title: 'العقود والإيجارات',
    desc: 'إنشاء وإدارة عقود الإيجار الإلكترونية مع تنبيهات الانتهاء.',
  },
];

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(true);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [featureIdx, setFeatureIdx] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const u = username.trim();

    try {
      // 1. مدير
      if (u === ADMIN_USER) {
        const hash = await sha256(password);
        if (hash === ADMIN_HASH) {
          saveSession({ role: 'admin', name: u });
          onSuccess(); return;
        }
        setError('كلمة المرور غير صحيحة');
        setLoading(false); return;
      }

      // 2. موظف
      const emp = EMPLOYEES.find(x => x.username === u && x.password === password);
      if (emp) {
        saveSession({ role: 'employee', name: emp.name, employeeId: emp.id });
        onSuccess(); return;
      }

      // 3. فني
      const tech = TECHNICIANS.find(x => x.username === u && x.password === password);
      if (tech) {
        saveSession({ role: 'technician', name: tech.name, technicianId: tech.id });
        onSuccess(); return;
      }

      // 4. مستأجر (هوية + جوال)
      const tenant = DEMO_TENANTS.find(x =>
        x.username === u && normalizePhone(x.password) === normalizePhone(password)
      );
      if (tenant) {
        saveSession({ role: 'tenant', name: tenant.name, tenantId: tenant.id });
        onSuccess(); return;
      }

      // 5. مالك (هوية + جوال)
      const owner = DEMO_OWNERS.find(o =>
        o['رقم_الهوية'] === u &&
        normalizePhone(o['رقم_الجوال'] || '') === normalizePhone(password)
      );
      if (owner) {
        saveSession({ role: 'owner', name: owner['الاسم_الكامل'] || '', ownerId: owner.id });
        onSuccess(); return;
      }

      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  const feat = FEATURES[featureIdx];
  const FeatIcon = feat.icon;

  return (
    <div dir="rtl" className="min-h-screen flex" style={{ fontFamily: 'IBM Plex Sans Arabic, Noto Sans Arabic, sans-serif' }}>

      {/* ── الجانب الأيسر: النموذج ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12"
        style={{ background: '#f9f8f5', minHeight: '100vh' }}>

        <div className="w-full max-w-sm">
          {/* شعار صغير */}
          <div className="flex items-center gap-2 mb-10">
            <img src="/ramza/brand/ramz-logo.svg" alt="رمز الإبداع" className="w-8 h-8"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>رمز الإبداع</span>
          </div>

          <h1 className="text-3xl font-black mb-2" style={{ color: '#1a1a2e' }}>مرحباً بعودتك</h1>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
            سجّل دخولك للوصول إلى لوحة التحكم. يتعرّف النظام على صلاحياتك<br />تلقائياً من اسم المستخدم.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm text-center font-bold"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* اسم المستخدم */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#374151' }}>اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="اسم المستخدم أو رقم الجوال"
                  required
                  dir="auto"
                  className="w-full px-4 py-3 pr-4 pl-10 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: '#fff',
                    border: '1.5px solid #e5e0d5',
                    color: '#1a1a2e',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a5c3a'}
                  onBlur={e => e.target.style.borderColor = '#e5e0d5'}
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold" style={{ color: '#374151' }}>كلمة المرور</label>
                <button type="button" className="text-xs font-bold" style={{ color: '#1a5c3a' }}>
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="w-full px-4 py-3 pl-10 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: '#fff',
                    border: '1.5px solid #e5e0d5',
                    color: '#1a1a2e',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a5c3a'}
                  onBlur={e => e.target.style.borderColor = '#e5e0d5'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* تذكّرني */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-green-700" />
              <span className="text-sm" style={{ color: '#374151' }}>حفظ الجلسة على هذا الجهاز</span>
            </label>

            {/* زر الدخول */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all"
              style={{ background: loading ? '#2d7a52' : '#1a5c3a' }}>
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {loading ? 'جاري التحقق...' : 'دخول ›'}
            </button>

            {/* فاصل */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#e5e0d5' }} />
              <span className="text-xs" style={{ color: '#9ca3af' }}>أو</span>
              <div className="flex-1 h-px" style={{ background: '#e5e0d5' }} />
            </div>

            {/* استعادة */}
            <button type="button"
              className="w-full py-3 rounded-xl font-bold text-sm border transition-all"
              style={{ background: '#fff', border: '1.5px solid #e5e0d5', color: '#374151' }}>
              طلب رابط استعادة عبر البريد
            </button>
          </form>

          <p className="text-xs text-center mt-8" style={{ color: '#9ca3af' }}>
            الدخول مخصّص للمستخدمين المصرّح لهم. تُدار الجلسات بأمان على خوادم المنصة
            وتنتهي تلقائياً بعد مدة محدّدة.
          </p>
        </div>
      </div>

      {/* ── الجانب الأيمن: العرض التسويقي ── */}
      <div className="hidden lg:flex flex-col items-center justify-between px-12 py-10 w-[480px] flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #0d3b2e 0%, #1a5c3a 60%, #0f4a31 100%)' }}>

        {/* الشعار العلوي */}
        <div className="self-start flex items-center gap-3">
          <img src="/ramza/brand/ramz-logo.svg" alt="رمز الإبداع" className="w-10 h-10"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <div className="font-black text-sm text-white">رمز الإبداع</div>
            <div className="text-xs" style={{ color: '#86efac' }}>إدارة الأملاك والعقارات</div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="text-center w-full">
          {/* أيقونة كبيرة */}
          <div className="w-28 h-28 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Building2 className="w-14 h-14" style={{ color: '#C8A951' }} />
          </div>

          <h2 className="text-3xl font-black text-white mb-3">رمز الإبداع</h2>
          <p className="text-sm mb-10" style={{ color: '#86efac' }}>
            منصة إدارة الأملاك والعقارات المتكاملة
          </p>

          {/* بطاقة الميزة */}
          <div className="rounded-2xl p-5 text-right"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#C8A951' }}>
                <FeatIcon className="w-5 h-5 text-white" />
              </div>
              <div className="font-black text-white text-sm">{feat.title}</div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#d1fae5' }}>{feat.desc}</p>
          </div>

          {/* نقاط التنقل */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {FEATURES.map((_, i) => (
              <button key={i} onClick={() => setFeatureIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === featureIdx ? '24px' : '8px',
                  height: '8px',
                  background: i === featureIdx ? '#C8A951' : 'rgba(255,255,255,0.3)',
                }} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-xs" style={{ color: '#86efac' }}>
          <div className="w-2 h-2 rounded-full bg-green-400" />
          بنية سحابية أمنة — Cloudflare + D1 جاهزان
        </div>
      </div>
    </div>
  );
}
