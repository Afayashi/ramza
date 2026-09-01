/*
 * بوابة الفني - رمز الإبداع
 */
import { useMemo } from 'react';
import { LogOut, Wrench, Clock, CheckCircle, AlertTriangle, MapPin, Phone, Star } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth';
import { useEntityData } from '@/hooks/useEntityData';

const RED = '#dc2626';
const TEXT_DARK = '#1a1a2e';

export default function TechnicianPortal({ onLogout }: { onLogout: () => void }) {
  const session = getSession();
  const { data, loading } = useEntityData('Maintenance');
  const handleLogout = () => { clearSession(); onLogout(); };

  const myTasks = useMemo(() =>
    data.filter(m => !['مكتمل', 'completed'].includes(m['الحالة'] || m.status || '')),
    [data]
  );
  const completedCount = useMemo(() =>
    data.filter(m => ['مكتمل', 'completed'].includes(m['الحالة'] || m.status || '')).length,
    [data]
  );

  const stats = [
    { label: 'مهام اليوم', value: myTasks.length, icon: Clock, color: '#d97706' },
    { label: 'مكتملة', value: completedCount, icon: CheckCircle, color: '#059669' },
    { label: 'عاجلة', value: myTasks.filter(m => m['الأولوية'] === 'عالية').length, icon: AlertTriangle, color: RED },
    { label: 'التقييم', value: '4.8', icon: Star, color: '#B8932A' },
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: '#f8f6f1' }}>
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: '#fff', borderBottom: '1px solid #e5e0d5', boxShadow: '0 1px 4px #0000000a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${RED}18` }}>
            <Wrench className="w-5 h-5" style={{ color: RED }} />
          </div>
          <div>
            <div className="font-black text-sm" style={{ color: TEXT_DARK }}>{session?.name || 'الفني'}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>فني الصيانة</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold"
          style={{ background: '#fef2f2', color: RED }}>
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: '1px solid #fecaca' }}>
          <h1 className="text-xl font-black" style={{ color: '#991b1b' }}>مرحباً، {session?.name || 'الفني'} 👋</h1>
          <p className="text-sm mt-1" style={{ color: RED }}>لوحة مهامك اليومية — تابع طلبات الصيانة المسندة إليك</p>
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

        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e5e0d5' }}>
          <h2 className="font-black text-sm mb-4" style={{ color: TEXT_DARK }}>مهام قيد التنفيذ ({myTasks.length})</h2>
          {loading ? (
            <div className="text-center py-6" style={{ color: '#9ca3af' }}>جاري التحميل...</div>
          ) : myTasks.length === 0 ? (
            <div className="text-center py-6" style={{ color: '#9ca3af' }}>
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد مهام معلقة 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 8).map((task, i) => {
                const isUrgent = task['الأولوية'] === 'عالية';
                return (
                  <div key={i} className="p-4 rounded-xl" style={{ background: '#f8f6f1', border: isUrgent ? `1px solid ${RED}30` : '1px solid #e5e0d5' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: isUrgent ? `${RED}18` : '#d9770618' }}>
                        <Wrench className="w-4 h-4" style={{ color: isUrgent ? RED : '#d97706' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-sm" style={{ color: TEXT_DARK }}>
                          {task['نوع_الصيانة'] || task.type || 'طلب صيانة'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" style={{ color: '#9ca3af' }} />
                          <span className="text-xs" style={{ color: '#9ca3af' }}>{task['اسم_العقار'] || 'غير محدد'}</span>
                        </div>
                      </div>
                      {isUrgent && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                          style={{ background: `${RED}18`, color: RED }}>عاجل</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 rounded-lg text-xs font-bold"
                        style={{ background: '#05966918', color: '#059669', border: '1px solid #05966930' }}>
                        <CheckCircle className="w-3 h-3 inline ml-1" /> إتمام المهمة
                      </button>
                      <button className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: '#f5f3ee', color: '#6b7280' }}>
                        <Phone className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
