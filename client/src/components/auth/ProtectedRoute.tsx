/*
 * مكون حماية المسارات - رمز الإبداع
 * يمنع الوصول لأي صفحة بدون تسجيل دخول
 */
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const GOLD = '#C8A951';
const DARK = '#1a1209';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isAuthenticated, navigateToLogin]);

  // شاشة التحميل أثناء التحقق
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: DARK }}>
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
            style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}40` }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke={GOLD} strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-center" style={{ color: GOLD }}>رمز الإبداع</h1>
          <p className="text-xs text-center mt-1" style={{ color: `${GOLD}80` }}>إدارة الأملاك</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: GOLD, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: `${GOLD}60` }}>جاري التحقق من الهوية...</p>
      </div>
    );
  }

  // غير مسجل → سيتم التوجيه بواسطة useEffect
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: DARK }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}40` }}>
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke={GOLD} strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-sm font-bold" style={{ color: GOLD }}>جاري التوجيه لتسجيل الدخول...</p>
      </div>
    );
  }

  return <>{children}</>;
}
