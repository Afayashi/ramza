/*
 * صفحة المتأخرات - رمز الإبداع
 */
import { useMemo } from 'react';
import { AlertTriangle, DollarSign, Phone, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';

export default function OverdueTracker() {
  const { data: payments, loading } = useEntityData('Payment');

  const overdue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return payments.filter(p => {
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const unpaid = ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(status);
      return unpaid && due && due < today;
    });
  }, [payments]);

  const totalOverdue = overdue.reduce((s, p) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

  return (
    <DashboardLayout pageTitle="المتأخرات">
      <PageHeader title="متابعة المتأخرات" description={`${overdue.length} دفعة متأخرة`} />

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="عدد المتأخرات" value={overdue.length} icon={AlertTriangle} />
            <StatCard title="إجمالي المبلغ المتأخر" value={`${totalOverdue.toLocaleString('ar-SA')} ر.س`} icon={DollarSign} />
          </div>

          {overdue.length === 0 ? (
            <EmptyState title="لا توجد متأخرات" description="جميع الدفعات محصلة في وقتها" />
          ) : (
            <DataTable
              columns={[
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'مبلغ_الدفعة', label: 'المبلغ', render: (v, r) => `${Number(v || r['قيمة_القسط'] || 0).toLocaleString('ar-SA')} ر.س` },
                {
                  key: 'تاريخ_استحقاق_القسط', label: 'تاريخ الاستحقاق',
                  render: (v, r) => {
                    const d = v || r['تاريخ_استحقاق_الفاتورة'] || '';
                    if (!d) return '—';
                    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
                    return (
                      <div>
                        <span>{new Date(d).toLocaleDateString('ar-SA')}</span>
                        <span className="text-red-400 text-[10px] block">متأخر {days} يوم</span>
                      </div>
                    );
                  }
                },
              ]}
              data={overdue}
              searchKeys={['اسم_المستأجر', 'tenant_name', 'اسم_العقار']}
              actions={(row) => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" title="اتصال">
                    <Phone size={14} />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" title="رسالة">
                    <MessageSquare size={14} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
