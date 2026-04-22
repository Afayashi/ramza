/*
 * صفحة المصروفات - رمز الإبداع
 */
import { useState } from 'react';
import { Receipt, Plus, Eye, DollarSign, TrendingDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';

export default function Expenses() {
  const { data: expenses, loading } = useEntityData('Expense');

  const total = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const thisMonth = expenses.filter(e => (e.date || '').startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  return (
    <DashboardLayout pageTitle="المصروفات">
      <PageHeader title="إدارة المصروفات" description={`${expenses.length} مصروف`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إضافة مصروف</Button>
      </PageHeader>

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="إجمالي المصروفات" value={`${total.toLocaleString('ar-SA')} ر.س`} icon={TrendingDown} />
            <StatCard title="مصروفات الشهر" value={`${thisMonth.toLocaleString('ar-SA')} ر.س`} icon={DollarSign} />
          </div>
          {expenses.length === 0 ? <EmptyState title="لا توجد مصروفات" /> : (
            <DataTable
              columns={[
                { key: 'description', label: 'الوصف', render: (v, r) => v || r['وصف_المصروف'] || '—' },
                { key: 'category', label: 'التصنيف', render: (v, r) => v || r['تصنيف_المصروف'] || '—' },
                { key: 'amount', label: 'المبلغ', render: (v) => `${Number(v || 0).toLocaleString('ar-SA')} ر.س` },
                { key: 'date', label: 'التاريخ', render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '—' },
                { key: 'property_name', label: 'العقار', render: (v, r) => v || r['اسم_العقار'] || '—' },
              ]}
              data={expenses}
              searchKeys={['description', 'وصف_المصروف', 'category', 'property_name']}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
