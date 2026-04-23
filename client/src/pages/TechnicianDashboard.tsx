/*
 * لوحة الفنيين - رمز الإبداع
 */
import { useMemo } from 'react';
import { Wrench, Clock, CheckCircle, AlertTriangle, User, Star } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';

export default function TechnicianDashboard() {
  const { data, loading } = useEntityData('Maintenance');

  const techStats = useMemo(() => {
    const techs: Record<string, { name: string; total: number; completed: number; pending: number }> = {};
    data.forEach(m => {
      const tech = m['الفني'] || m.technician || 'غير محدد';
      if (!techs[tech]) techs[tech] = { name: tech, total: 0, completed: 0, pending: 0 };
      techs[tech].total++;
      if (['مكتمل', 'completed'].includes(m['الحالة'] || m.status || '')) techs[tech].completed++;
      else techs[tech].pending++;
    });
    return Object.values(techs).sort((a, b) => b.total - a.total);
  }, [data]);

  const todayTasks = data.filter(m => !['مكتمل', 'completed'].includes(m['الحالة'] || m.status || '')).slice(0, 10);

  if (loading) return <DashboardLayout pageTitle="لوحة الفنيين"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="لوحة الفنيين">
      <PageHeader title="لوحة الفنيين" description="متابعة أداء فريق الصيانة" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">أداء الفنيين</h3>
          {techStats.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p> : (
            <div className="space-y-3">
              {techStats.slice(0, 5).map(t => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User size={14} className="text-primary" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground">{t.completed}/{t.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-sidebar rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${t.total > 0 ? (t.completed / t.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">المهام النشطة</h3>
          {todayTasks.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد مهام نشطة</p> : (
            <div className="space-y-2">
              {todayTasks.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-sidebar">
                  <Wrench size={12} className="text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{m['وصف_الطلب'] || m.description || 'طلب'}</p>
                    <p className="text-[10px] text-muted-foreground">{m['الفني'] || m.technician || 'غير محدد'}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${['قيد التنفيذ', 'in_progress'].includes(m['الحالة'] || m.status || '') ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {m['الحالة'] || m.status || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
