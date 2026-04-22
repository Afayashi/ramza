/*
 * صفحة طلبات الصيانة - رمز الإبداع
 */
import { useState } from 'react';
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Maintenance() {
  const { data: requests, loading } = useEntityData('Maintenance');

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      'pending': { color: 'bg-amber-500/10 text-amber-400', label: 'معلق' },
      'in_progress': { color: 'bg-blue-500/10 text-blue-400', label: 'قيد التنفيذ' },
      'completed': { color: 'bg-green-500/10 text-green-400', label: 'مكتمل' },
      'cancelled': { color: 'bg-red-500/10 text-red-400', label: 'ملغي' },
      'معلق': { color: 'bg-amber-500/10 text-amber-400', label: 'معلق' },
      'قيد_التنفيذ': { color: 'bg-blue-500/10 text-blue-400', label: 'قيد التنفيذ' },
      'مكتمل': { color: 'bg-green-500/10 text-green-400', label: 'مكتمل' },
    };
    const s = map[status] || { color: 'bg-muted text-muted-foreground', label: status || 'غير محدد' };
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}>{s.label}</span>;
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, { color: string; label: string }> = {
      'high': { color: 'bg-red-500/10 text-red-400', label: 'عالية' },
      'medium': { color: 'bg-amber-500/10 text-amber-400', label: 'متوسطة' },
      'low': { color: 'bg-green-500/10 text-green-400', label: 'منخفضة' },
      'عاجل': { color: 'bg-red-500/10 text-red-400', label: 'عاجل' },
      'عالية': { color: 'bg-red-500/10 text-red-400', label: 'عالية' },
      'متوسطة': { color: 'bg-amber-500/10 text-amber-400', label: 'متوسطة' },
      'منخفضة': { color: 'bg-green-500/10 text-green-400', label: 'منخفضة' },
    };
    const s = map[priority] || { color: 'bg-muted text-muted-foreground', label: priority || '—' };
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}>{s.label}</span>;
  };

  const pending = requests.filter(r => r.status === 'pending' || r['حالة_الطلب'] === 'معلق').length;
  const inProgress = requests.filter(r => r.status === 'in_progress' || r['حالة_الطلب'] === 'قيد_التنفيذ').length;
  const completed = requests.filter(r => r.status === 'completed' || r['حالة_الطلب'] === 'مكتمل').length;

  return (
    <DashboardLayout pageTitle="الصيانة">
      <PageHeader title="طلبات الصيانة" description={`${requests.length} طلب`}>
        <Button size="sm" className="gap-2">
          <Plus size={16} />
          طلب صيانة جديد
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل طلبات الصيانة..." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="معلقة" value={pending} icon={Clock} />
            <StatCard title="قيد التنفيذ" value={inProgress} icon={Wrench} />
            <StatCard title="مكتملة" value={completed} icon={CheckCircle} />
          </div>

          {requests.length === 0 ? (
            <EmptyState title="لا توجد طلبات صيانة" />
          ) : (
            <DataTable
              columns={[
                { key: 'عنوان_الطلب', label: 'العنوان', render: (v, r) => v || r.title || r.description?.slice(0, 40) || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'اسم_الوحدة', label: 'الوحدة', render: (v, r) => v || r.unit_name || '—' },
                { key: 'status', label: 'الحالة', render: (v, r) => statusBadge(v || r['حالة_الطلب'] || '') },
                { key: 'priority', label: 'الأولوية', render: (v, r) => priorityBadge(v || r['الأولوية'] || '') },
                {
                  key: 'created_date', label: 'التاريخ',
                  render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '—'
                },
              ]}
              data={requests}
              searchKeys={['عنوان_الطلب', 'title', 'اسم_العقار', 'property_name']}
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
