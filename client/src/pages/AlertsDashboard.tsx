/*
 * لوحة التنبيهات - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Bell, AlertTriangle, Calendar, DollarSign, Wrench, FileText, CheckCircle, Clock, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

type AlertType = 'overdue' | 'lease_expiry' | 'maintenance' | 'complaint';
interface Alert { id: string; type: AlertType; title: string; description: string; date: string; severity: 'high' | 'medium' | 'low'; }

export default function AlertsDashboard() {
  const { data, loading } = useMultiEntityData([
    { name: 'Payment' }, { name: 'Lease' }, { name: 'Maintenance' }, { name: 'Complaint' },
  ]);
  const [filter, setFilter] = useState<'all' | AlertType>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const now = new Date();

    (data.Payment || []).filter(p => ['متأخر', 'overdue', 'غير مدفوع'].includes(p['حالة_الدفع'] || p.status || '')).forEach(p => {
      result.push({ id: `pay-${p.id}`, type: 'overdue', title: `دفعة متأخرة - ${p['اسم_المستأجر'] || p.tenant_name || 'مستأجر'}`, description: `مبلغ ${Number(p['مبلغ_الدفعة'] || p.amount || 0).toLocaleString('ar-SA')} ر.س`, date: p['تاريخ_الاستحقاق'] || p.due_date || '', severity: 'high' });
    });

    (data.Lease || []).forEach(l => {
      const end = new Date(l['تاريخ_النهاية'] || l.end_date || '');
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 30 && diff > 0) {
        result.push({ id: `lease-${l.id}`, type: 'lease_expiry', title: `عقد ينتهي قريباً - ${l['اسم_المستأجر'] || l.tenant_name || ''}`, description: `ينتهي خلال ${diff} يوم`, date: l['تاريخ_النهاية'] || l.end_date || '', severity: diff <= 7 ? 'high' : 'medium' });
      } else if (diff <= 0) {
        result.push({ id: `lease-${l.id}`, type: 'lease_expiry', title: `عقد منتهي - ${l['اسم_المستأجر'] || l.tenant_name || ''}`, description: `انتهى منذ ${Math.abs(diff)} يوم`, date: l['تاريخ_النهاية'] || l.end_date || '', severity: 'high' });
      }
    });

    (data.Maintenance || []).filter(m => ['جديد', 'new', 'قيد_المعالجة', 'in_progress'].includes(m['الحالة'] || m.status || '')).forEach(m => {
      result.push({ id: `maint-${m.id}`, type: 'maintenance', title: `طلب صيانة - ${m['العنوان'] || m.title || ''}`, description: m['الوصف'] || m.description || '', date: m.created_date || '', severity: (m['الأولوية'] || m.priority) === 'عاجل' ? 'high' : 'medium' });
    });

    (data.Complaint || []).filter(c => !['مغلقة', 'closed'].includes(c['الحالة'] || c.status || '')).forEach(c => {
      result.push({ id: `comp-${c.id}`, type: 'complaint', title: `شكوى - ${c['العنوان'] || c.title || ''}`, description: c['الوصف'] || c.description || '', date: c.created_date || '', severity: 'medium' });
    });

    return result.filter(a => !dismissed.has(a.id) && (filter === 'all' || a.type === filter)).sort((a, b) => {
      const sev = { high: 3, medium: 2, low: 1 };
      return sev[b.severity] - sev[a.severity];
    });
  }, [data, filter, dismissed]);

  const typeConfig = { overdue: { label: 'دفعات متأخرة', icon: DollarSign, color: '#DC2626' }, lease_expiry: { label: 'انتهاء عقود', icon: Calendar, color: '#D97706' }, maintenance: { label: 'صيانة', icon: Wrench, color: '#3b82f6' }, complaint: { label: 'شكاوى', icon: FileText, color: '#8b5cf6' } };
  const sevConfig = { high: { label: 'عالي', cls: 'bg-red-500/15 text-red-400' }, medium: { label: 'متوسط', cls: 'bg-amber-500/15 text-amber-400' }, low: { label: 'منخفض', cls: 'bg-blue-500/15 text-blue-400' } };

  if (loading) return <DashboardLayout pageTitle="لوحة التنبيهات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="لوحة التنبيهات">
      <PageHeader title="لوحة التنبيهات" description={`${alerts.length} تنبيه نشط`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {(Object.entries(typeConfig) as [AlertType, any][]).map(([type, cfg]) => {
          const count = alerts.filter(a => a.type === type).length;
          return (
            <button key={type} onClick={() => setFilter(f => f === type ? 'all' : type)}
              className={`bg-card border rounded-xl p-3 text-center transition-colors ${filter === type ? 'border-primary/50' : 'border-border hover:border-primary/20'}`}>
              <cfg.icon size={16} className="mx-auto mb-1" style={{ color: cfg.color }} />
              <p className="text-base font-bold" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {alerts.length === 0 ? <EmptyState title="لا توجد تنبيهات نشطة" description="جميع الأمور تحت السيطرة" /> : (
        <div className="space-y-2">
          {alerts.map(a => {
            const tc = typeConfig[a.type];
            const sc = sevConfig[a.severity];
            return (
              <div key={a.id} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${tc.color}18` }}>
                    <tc.icon size={14} style={{ color: tc.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-foreground">{a.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{a.description}</p>
                    {a.date && <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Clock size={9} />{a.date}</p>}
                  </div>
                </div>
                <button onClick={() => setDismissed(s => { const n = new Set(Array.from(s)); n.add(a.id); return n; })} className="p-1 rounded-lg hover:bg-sidebar shrink-0" title="تجاهل">
                  <X size={12} className="text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
