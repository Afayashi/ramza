/*
 * صفحة نظام الشكاوى - رمز الإبداع
 */
import { useState } from 'react';
import { MessageSquare, Plus, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Complaints() {
  const { data: complaints, loading } = useEntityData('Complaint');

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'جديدة': 'bg-blue-500/10 text-blue-400',
      'new': 'bg-blue-500/10 text-blue-400',
      'قيد_المعالجة': 'bg-amber-500/10 text-amber-400',
      'in_progress': 'bg-amber-500/10 text-amber-400',
      'محلولة': 'bg-green-500/10 text-green-400',
      'resolved': 'bg-green-500/10 text-green-400',
      'مغلقة': 'bg-muted text-muted-foreground',
      'closed': 'bg-muted text-muted-foreground',
    };
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', map[status] || 'bg-muted text-muted-foreground')}>{status || 'غير محدد'}</span>;
  };

  const open = complaints.filter(c => ['جديدة', 'new', 'قيد_المعالجة', 'in_progress'].includes(c.status || c['حالة_الشكوى'] || '')).length;
  const resolved = complaints.filter(c => ['محلولة', 'resolved', 'مغلقة', 'closed'].includes(c.status || c['حالة_الشكوى'] || '')).length;

  return (
    <DashboardLayout pageTitle="الشكاوى">
      <PageHeader title="نظام الشكاوى" description={`${complaints.length} شكوى`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> تسجيل شكوى</Button>
      </PageHeader>

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="إجمالي الشكاوى" value={complaints.length} icon={MessageSquare} />
            <StatCard title="مفتوحة" value={open} icon={AlertCircle} />
            <StatCard title="محلولة" value={resolved} icon={CheckCircle} />
          </div>

          {complaints.length === 0 ? <EmptyState title="لا توجد شكاوى" /> : (
            <DataTable
              columns={[
                { key: 'عنوان_الشكوى', label: 'العنوان', render: (v, r) => v || r.title || r.subject || '—' },
                { key: 'اسم_المستأجر', label: 'المقدم', render: (v, r) => v || r.tenant_name || r.submitted_by || '—' },
                { key: 'status', label: 'الحالة', render: (v, r) => statusBadge(v || r['حالة_الشكوى'] || '') },
                { key: 'created_date', label: 'التاريخ', render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '—' },
              ]}
              data={complaints}
              searchKeys={['عنوان_الشكوى', 'title', 'اسم_المستأجر', 'tenant_name']}
              actions={(row) => (
                <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Eye size={14} /></button>
              )}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
