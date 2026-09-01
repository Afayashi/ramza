export type UserRole = 'admin' | 'owner' | 'employee' | 'tenant' | 'technician';

export interface SessionUser {
  role: UserRole;
  name: string;
  ownerId?: string;
  employeeId?: string;
  tenantId?: string;
  technicianId?: string;
}

export function saveSession(user: SessionUser) {
  const val = JSON.stringify(user);
  sessionStorage.setItem('ramz_auth', val);
  localStorage.setItem('ramz_auth', val);
}

export function clearSession() {
  sessionStorage.removeItem('ramz_auth');
  localStorage.removeItem('ramz_auth');
}

export function getSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem('ramz_auth') || localStorage.getItem('ramz_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed === 'true' || parsed === true) return { role: 'admin', name: 'Admin' };
    if (typeof parsed === 'object' && parsed.role) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
