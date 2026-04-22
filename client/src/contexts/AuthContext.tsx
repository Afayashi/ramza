/*
 * سياق المصادقة - رمز الإبداع
 * يدير حالة تسجيل الدخول والمستخدم عبر Base44 SDK
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44, appParams, removeAccessToken, getAccessToken } from '@/lib/base44Client';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface AuthError {
  type: 'auth_required' | 'user_not_registered' | 'unknown';
  message: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: AuthError | null;
  logout: () => void;
  navigateToLogin: () => void;
  checkAuth: () => Promise<void>;
  hasToken: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [hasToken] = useState(() => !!getAccessToken());

  const checkAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const token = getAccessToken();
      if (!token) {
        // لا يوجد توكن - المستخدم غير مسجل الدخول
        setIsAuthenticated(false);
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

      // محاولة جلب بيانات المستخدم
      try {
        const currentUser = await (base44 as any).auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.warn('فشل التحقق من المصادقة:', error);
        
        if (error?.status === 401 || error?.status === 403) {
          const reason = error?.data?.extra_data?.reason;
          if (reason === 'user_not_registered') {
            setAuthError({ type: 'user_not_registered', message: 'المستخدم غير مسجل في التطبيق' });
          } else {
            setAuthError({ type: 'auth_required', message: 'يرجى تسجيل الدخول' });
          }
        }
        
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع في المصادقة:', error);
      setAuthError({ type: 'unknown', message: error?.message || 'حدث خطأ غير متوقع' });
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    removeAccessToken();
    
    try {
      (base44 as any).auth.logout(window.location.href);
    } catch {
      // إذا فشل SDK logout، نعيد التحميل
      window.location.reload();
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    try {
      (base44 as any).auth.redirectToLogin(window.location.href);
    } catch {
      // fallback: بناء URL يدوياً
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://base44.app/login?from_url=${redirectUrl}&app_id=${appParams.appId}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      logout,
      navigateToLogin,
      checkAuth,
      hasToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth يجب استخدامه داخل AuthProvider');
  }
  return context;
}
