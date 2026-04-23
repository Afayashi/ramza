/*
 * إدارة الصيانة - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Wrench, Clock, CheckCircle, AlertTriangle, Users, DollarSign, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { MaintenanceForm } from '@/components/forms';
import { toast } from 'sonner';

export default function MaintenanceManager() {
  const { data, loading, reload } = useEntityData('Maintenance');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const stats = useMemo(() => {
    const pending = data.filter(m => ['جديد', 'new', 'قيد الانتظار', 'pending'].includes(m['الحالة'] || m.status || '')).length;
    const inProgress = data.filter(m => ['قيد التنفيذ', 'in_progress'].includes(m['الحالة'] || m.status || '')).length;
    const completed = data.filter(m => ['مكتمل', 'completed'].includes(m['الحالة'] || m.status || '')).length;
    const totalCost = data.reduce((s, m) => s + Number(m['التكلفة'] || m.cost || 0), 0);
    return { pending, inProgress, completed, totalCost };
  }, [data]);

  const filtered = filter === 'all' ? data : data.filter(m => {
    const status = m['الحالة'] || m.status || '';
    if (filter === 'pending') return ['جديد', 'new', 'قيد الانتظار', 'pending'].includes(status);
    if (filter === 'progress') return ['قيد التنفيذ', 'in_progress'].includes(status);
    if (filter === 'done') return ['مكتمل', 'completed'].includes(status);
    return true;
  });

  const priorities = { 'عاجل': 'bg-red-500/15 text-red-400', 'urgent': 'bg-red-500/15 text-red-400', 'عالي': 'bg-amber-500/15 text-amber-400', 'high': 'bg-amber-500/15 text-amber-400', 'متوسط': 'bg-blue-500/15 text-blue-400', 'medium': 'bg-blue-500/15 text-blue-400', 'منخفض': 'bg-emerald-500/15 text-emerald-400', 'low': 'bg-emerald-500/15 text-emerald-400' };

  if (loading) return <DashboardLayout pageTitle="إدارة الصيانة"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="إدارة الصيانة">
      <PageHeader title="إدارة الصيانة" description={`${data.length} طلب صيانة`}>
        <Button size="sm" onClick={() => setShowForm(true)}>طلب صيانة جديد</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: '#D97706' },
          { label: 'قيد التنفيذ', value: stats.inProgress, icon: Wrench, color: '#3b82f6' },
          { label: 'مكتملة', value: stats.completed, icon: CheckCircle, color: '#059669' },
          { label: 'إجمالي التكاليف', value: `${(stats.totalCost / 1000).toFixed(0)}K`, icon: DollarSign, color: '#C8A951' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 bg-sidebar rounded-xl p-1">
        {[{ id: 'all', label: 'الكل' }, { id: 'pending', label: 'قيد الانتظار' }, { id: 'progress', label: 'قيد التنفيذ' }, { id: 'done', label: 'مكتملة' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-colors ${filter === f.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState title="لا توجد طلبات" description="" /> : (
        <div className="space-y-2">
          {filtered.map((m: any) => {
            const priority = m['الأولوية'] || m.priority || '';
            const pClass = (priorities as any)[priority] || 'bg-muted text-muted-foreground';
            return (
              <div key={m.id} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-foreground">{m['وصف_الطلب'] || m.description || 'طلب صيانة'}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${pClass}`}>{priority || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{m['اسم_العقار'] || m.property_name || ''}</span>
                  <span>{m['تاريخ_الطلب'] || m.request_date || ''}</span>
                  <span>{m['الفني'] || m.technician || ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MaintenanceForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={async () => { reload(); setShowForm(false); toast.success('تم إنشاء طلب الصيانة'); }} />
    </DashboardLayout>
  );
}
