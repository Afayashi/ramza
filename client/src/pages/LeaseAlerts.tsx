/*
 * صفحة تنبيهات العقود - رمز الإبداع
 * عرض العقود التي ستنتهي قريباً
 */
import { useMemo } from 'react';
import { AlertTriangle, Clock, Calendar, FileText, Bell } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function LeaseAlerts() {
  const { data: leases, loading } = useEntityData('Lease');

  const alerts = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const in30 = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];
    const in60 = new Date(now.getTime() + 60 * 86400000).toISOString().split('T')[0];
    const in90 = new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0];

    const active = leases.filter(l => {
      const status = l['حالة_العقد'] || l.status || '';
      return status === 'نشط' || status === 'active';
    });

    const expired = active.filter(l => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || l.end_date || '';
      return end && end < today;
    });

    const within30 = active.filter(l => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || l.end_date || '';
      return end && end >= today && end <= in30;
    });

    const within60 = active.filter(l => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || l.end_date || '';
      return end && end > in30 && end <= in60;
    });

    const within90 = active.filter(l => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || l.end_date || '';
      return end && end > in60 && end <= in90;
    });

    return { expired, within30, within60, within90 };
  }, [leases]);

  const renderLeaseCard = (lease: any, urgency: 'critical' | 'warning' | 'info') => {
    const name = lease['اسم_المستأجر'] || lease.tenant_name || 'غير محدد';
    const property = lease['اسم_العقار'] || lease.property_name || '';
    const end = lease['تاريخ_انتهاء_الإيجار'] || lease['تاريخ_نهاية_العقد'] || lease.end_date || '';
    const rent = lease['قيمة_الإيجار'] || lease.rent_amount || 0;

    const colors = {
      critical: 'border-red-500/30 bg-red-500/5',
      warning: 'border-amber-500/30 bg-amber-500/5',
      info: 'border-blue-500/30 bg-blue-500/5',
    };

    return (
      <div key={lease.id} className={cn('border rounded-lg p-4 space-y-2', colors[urgency])}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-foreground">{name}</span>
          {end && <span className="text-xs text-muted-foreground">{new Date(end).toLocaleDateString('ar-SA')}</span>}
        </div>
        {property && <p className="text-xs text-muted-foreground">{property}</p>}
        {rent > 0 && <p className="text-xs text-primary">{Number(rent).toLocaleString('ar-SA')} ر.س</p>}
      </div>
    );
  };

  return (
    <DashboardLayout pageTitle="تنبيهات العقود">
      <PageHeader title="تنبيهات العقود" description="متابعة العقود المنتهية والتي ستنتهي قريباً" />

      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="منتهية" value={alerts.expired.length} icon={AlertTriangle} />
            <StatCard title="خلال 30 يوم" value={alerts.within30.length} icon={Clock} />
            <StatCard title="خلال 60 يوم" value={alerts.within60.length} icon={Calendar} />
            <StatCard title="خلال 90 يوم" value={alerts.within90.length} icon={Bell} />
          </div>

          {alerts.expired.length > 0 && (
            <div>
              <h3 className="font-heading text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} /> عقود منتهية ({alerts.expired.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.expired.map(l => renderLeaseCard(l, 'critical'))}
              </div>
            </div>
          )}

          {alerts.within30.length > 0 && (
            <div>
              <h3 className="font-heading text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <Clock size={16} /> تنتهي خلال 30 يوم ({alerts.within30.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.within30.map(l => renderLeaseCard(l, 'warning'))}
              </div>
            </div>
          )}

          {alerts.within60.length > 0 && (
            <div>
              <h3 className="font-heading text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Calendar size={16} /> تنتهي خلال 60 يوم ({alerts.within60.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.within60.map(l => renderLeaseCard(l, 'info'))}
              </div>
            </div>
          )}

          {alerts.expired.length === 0 && alerts.within30.length === 0 && alerts.within60.length === 0 && alerts.within90.length === 0 && (
            <EmptyState title="لا توجد تنبيهات" description="جميع العقود في حالة جيدة" />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
