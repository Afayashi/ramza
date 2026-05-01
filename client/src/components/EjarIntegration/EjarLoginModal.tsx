/*
 * EjarLoginModal — نافذة ربط حساب إيجار
 */
import React, { useState } from 'react';
import { X, Loader2, LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import { base44 } from '@/lib/base44Client';

const GREEN = '#0ea472';
const DARK  = '#1a1a1a';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EjarLoginModal({ onClose, onSuccess }: Props) {
  const [nationalId,   setNationalId]   = useState('');
  const [username,     setUsername]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('ejar_api_creds') || '{}').username || 'bo-1010601471'; } catch { return 'bo-1010601471'; }
  });
  const [password,     setPassword]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('ejar_api_creds') || '{}').password || 'M0hT2aI0HbSwozvxRkLVhYl9ixDnHgCGPL8EQZqmmmhD8EFFBkOT7b3B2PeWlIVU'; } catch { return 'M0hT2aI0HbSwozvxRkLVhYl9ixDnHgCGPL8EQZqmmmhD8EFFBkOT7b3B2PeWlIVU'; }
  });
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 bg-gray-50';

  const handleSubmit = async () => {
    if (!nationalId) { setError('أدخل رقم الهوية أو السجل التجاري'); return; }
    setLoading(true); setError(null);
    try {
      // حفظ بيانات API محلياً
      localStorage.setItem('ejar_api_creds', JSON.stringify({ username, password }));

      const res = await (base44 as any).functions.invoke('ejarApiSync', {
        action:      'login',
        nationalId,
        apiUsername: username || nationalId,
        password,
      });

      if (res.data?.success) {
        // تحديث بيانات المستخدم إن أمكن
        try {
          await (base44 as any).auth.updateMe({
            ejarUsername:      username || nationalId,
            ejarLicenseNumber: nationalId,
            ejarToken:         res.data.token || 'connected',
            ejarConnectedAt:   new Date().toISOString(),
          });
        } catch { /* base44 auth قد لا يكون مهيأً */ }

        setSuccess(true);
        setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
      } else {
        setError(res.data?.error || 'فشل الاتصال بإيجار');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-teal-50">🏛️</div>
            <div>
              <h2 className="font-black text-gray-900">ربط حساب إيجار</h2>
              <p className="text-xs text-gray-400">الدخول عبر النفاذ الوطني</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم الهوية / السجل التجاري</label>
            <input className={inp} dir="ltr" value={nationalId}
              onChange={e => setNationalId(e.target.value)}
              placeholder="10XXXXXXXX"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">اسم المستخدم (API)</label>
            <input className={inp} dir="ltr" value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="bo-1010601471" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">كلمة المرور (API)</label>
            <div className="relative">
              <input className={`${inp} pl-10`} dir="ltr"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••••••" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nafath notice */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: '#f0fdf8', border: '1px solid #a7f3d0' }}>
            <Shield className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
            <p className="text-xs font-bold" style={{ color: '#065f46' }}>
              الدخول الآمن عبر النفاذ الوطني
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm font-medium border bg-red-50 border-red-200 text-red-800">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm font-medium border bg-emerald-50 border-emerald-200 text-emerald-800">
              ✓ تم الاتصال بنجاح، جاري الإغلاق...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            إلغاء
          </button>
          <button onClick={handleSubmit} disabled={loading || success}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
            style={{ background: DARK }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'جاري الاتصال...' : 'ربط الحساب'}
          </button>
        </div>
      </div>
    </div>
  );
}
