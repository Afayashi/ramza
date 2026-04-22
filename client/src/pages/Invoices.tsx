/*
 * صفحة الفواتير - رمز الإبداع
 */
import { useState } from 'react';
import { FileText, Plus, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Invoices() {
  const { data: invoices, loading } = useEntityData('Invoice');

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'مدفوعة': 'bg-green-500/10 text-green-400',
      'paid': 'bg-green-500/10 text-green-400',
      'مستحقة': 'bg-amber-500/10 text-amber-400',
      'pending': 'bg-amber-500/10 text-amber-400',
      'متأخرة': 'bg-red-500/10 text-red-400',
      'overdue': 'bg-red-500/10 text-red-400',
    };
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', map[status] || 'bg-muted text-muted-foreground')}>{status || 'غير محدد'}</span>;
  };

  return (
    <DashboardLayout pageTitle="الفواتير">
      <PageHeader title="إدارة الفواتير" description={`${invoices.length} فاتورة`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إنشاء فاتورة</Button>
      </PageHeader>

      {loading ? <LoadingState /> : invoices.length === 0 ? (
        <EmptyState title="لا توجد فواتير" description="لم يتم إنشاء أي فواتير بعد" />
      ) : (
        <DataTable
          columns={[
            { key: 'رقم_الفاتورة', label: 'رقم الفاتورة', render: (v, r) => v || r.invoice_number || `#${r.id?.slice(-6)}` },
            { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
            { key: 'المبلغ', label: 'المبلغ', render: (v, r) => `${Number(v || r.amount || 0).toLocaleString('ar-SA')} ر.س` },
            { key: 'تاريخ_الاستحقاق', label: 'تاريخ الاستحقاق', render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '—' },
            { key: 'الحالة', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
          ]}
          data={invoices}
          searchKeys={['رقم_الفاتورة', 'اسم_المستأجر', 'tenant_name']}
        />
      )}
    </DashboardLayout>
  );
}
