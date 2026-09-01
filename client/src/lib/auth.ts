export type UserRole = 'admin' | 'owner' | 'employee' | 'tenant' | 'technician';

export interface SessionUser {
  role: UserRole;
  name: string;
  ownerId?: string;
  employeeId?: string;
  tenantId?: string;
  technicianId?: string;
  loginTime?: number;
  sessionToken?: string;
}

const SESSION_KEY = 'ramz_auth_v2';
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 ساعات

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function saveSession(user: SessionUser) {
  const val = JSON.stringify({
    ...user,
    loginTime: Date.now(),
    sessionToken: generateToken(),
  });
  // sessionStorage أولاً (يُمسح عند إغلاق المتصفح)
  sessionStorage.setItem(SESSION_KEY, val);
  // localStorage للاستمرار بين التبويبات
  localStorage.setItem(SESSION_KEY, val);
  // امسح أي جلسات قديمة
  sessionStorage.removeItem('ramz_auth');
  localStorage.removeItem('ramz_auth');
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('ramz_auth');
  localStorage.removeItem('ramz_auth');
}

export function getSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || !parsed.role) return null;

    // تحقق من انتهاء الجلسة
    if (parsed.loginTime && Date.now() - parsed.loginTime > SESSION_TIMEOUT_MS) {
      clearSession();
      return null;
    }
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getSessionRole(): UserRole | null {
  return getSession()?.role ?? null;
}
