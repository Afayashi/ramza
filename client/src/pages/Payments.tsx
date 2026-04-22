/*
 * صفحة الدفعات - رمز الإبداع
 * عرض وإدارة جميع الدفعات المالية
 */
import { useState } from 'react';
import { DollarSign, Plus, CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Payments() {
  const { data: payments, loading } = useEntityData('Payment');

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any; label: string }> = {
      'مدفوع': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'مدفوع' },
      'مكتمل': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'مكتمل' },
      'مستحق': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'مستحق' },
      'معلق': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'معلق' },
      'لم_يتم_الدفع': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'لم يتم الدفع' },
      'متأخر': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'متأخر' },
    };
    const s = map[status] || { color: 'bg-muted text-muted-foreground', icon: DollarSign, label: status || 'غير محدد' };
    const Icon = s.icon;
    return (
      <span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}>
        <Icon size={10} /> {s.label}
      </span>
    );
  };

  const paid = payments.filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
  const pending = payments.filter(p => ['مستحق', 'معلق'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
  const overdue = payments.filter(p => ['لم_يتم_الدفع', 'متأخر'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
  const totalPaid = payments
    .filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || ''))
    .reduce((s, p) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

  return (
    <DashboardLayout pageTitle="الدفعات">
      <PageHeader title="إدارة الدفعات" description={`${payments.length} دفعة`}>
        <Button size="sm" className="gap-2">
          <Plus size={16} />
          تسجيل دفعة
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل الدفعات..." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي المحصل" value={`${totalPaid.toLocaleString('ar-SA')} ر.س`} icon={DollarSign} />
            <StatCard title="مدفوعة" value={paid} icon={CheckCircle} />
            <StatCard title="مستحقة" value={pending} icon={Clock} />
            <StatCard title="متأخرة" value={overdue} icon={AlertTriangle} />
          </div>

          {payments.length === 0 ? (
            <EmptyState title="لا توجد دفعات" description="لم يتم تسجيل أي دفعات بعد" />
          ) : (
            <DataTable
              columns={[
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                {
                  key: 'مبلغ_الدفعة', label: 'المبلغ',
                  render: (v, r) => {
                    const amount = v || r['قيمة_القسط'] || 0;
                    return `${Number(amount).toLocaleString('ar-SA')} ر.س`;
                  }
                },
                {
                  key: 'تاريخ_الدفع', label: 'تاريخ الدفع',
                  render: (v, r) => {
                    const d = v || r['تاريخ_استحقاق_القسط'] || '';
                    return d ? new Date(d).toLocaleDateString('ar-SA') : '—';
                  }
                },
                {
                  key: 'حالة_القسط', label: 'الحالة',
                  render: (v, r) => statusBadge(v || r['حالة_الدفع'] || '')
                },
                { key: 'طريقة_الدفع', label: 'طريقة الدفع', render: (v) => v || '—' },
              ]}
              data={payments}
              searchKeys={['اسم_المستأجر', 'tenant_name', 'اسم_العقار', 'property_name']}
              actions={(row) => (
                <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
                  <Eye size={14} />
                </button>
              )}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
