/*
 * صفحة العقود - رمز الإبداع
 * عرض وإدارة عقود الإيجار
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle, Clock, Eye, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Contracts() {
  const { data: leases, loading } = useEntityData('Lease');

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any; label: string }> = {
      'نشط': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'نشط' },
      'active': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'نشط' },
      'منتهي': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'منتهي' },
      'expired': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'منتهي' },
      'معلق': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'معلق' },
      'pending': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'معلق' },
    };
    const s = map[status] || { color: 'bg-muted text-muted-foreground', icon: FileText, label: status || 'غير محدد' };
    const Icon = s.icon;
    return (
      <span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}>
        <Icon size={10} /> {s.label}
      </span>
    );
  };

  const active = leases.filter(l => (l['حالة_العقد'] || l.status) === 'نشط' || (l['حالة_العقد'] || l.status) === 'active').length;
  const expired = leases.filter(l => (l['حالة_العقد'] || l.status) === 'منتهي' || (l['حالة_العقد'] || l.status) === 'expired').length;

  return (
    <DashboardLayout pageTitle="العقود">
      <PageHeader
        title="إدارة العقود"
        description={`${leases.length} عقد`}
      >
        <Link href="/lease-builder">
          <Button size="sm" className="gap-2">
            <Plus size={16} />
            إنشاء عقد جديد
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل العقود..." />
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="العقود النشطة" value={active} icon={CheckCircle} />
            <StatCard title="العقود المنتهية" value={expired} icon={AlertTriangle} />
            <StatCard title="إجمالي العقود" value={leases.length} icon={FileText} />
          </div>

          {leases.length === 0 ? (
            <EmptyState title="لا توجد عقود" description="ابدأ بإنشاء أول عقد إيجار" actionLabel="إنشاء عقد" />
          ) : (
            <DataTable
              columns={[
                { key: 'رقم_العقد', label: 'رقم العقد', render: (v, r) => v || r.contract_number || `#${r.id?.slice(-6)}` },
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                {
                  key: 'تاريخ_بداية_العقد', label: 'تاريخ البداية',
                  render: (v, r) => {
                    const d = v || r.start_date || '';
                    return d ? new Date(d).toLocaleDateString('ar-SA') : '—';
                  }
                },
                {
                  key: 'تاريخ_نهاية_العقد', label: 'تاريخ النهاية',
                  render: (v, r) => {
                    const d = v || r['تاريخ_انتهاء_الإيجار'] || r.end_date || '';
                    return d ? new Date(d).toLocaleDateString('ar-SA') : '—';
                  }
                },
                {
                  key: 'حالة_العقد', label: 'الحالة',
                  render: (v, r) => statusBadge(v || r.status || '')
                },
                {
                  key: 'قيمة_الإيجار', label: 'قيمة الإيجار',
                  render: (v, r) => {
                    const amount = v || r.rent_amount || 0;
                    return amount ? `${Number(amount).toLocaleString('ar-SA')} ر.س` : '—';
                  }
                },
              ]}
              data={leases}
              searchKeys={['رقم_العقد', 'اسم_المستأجر', 'اسم_العقار', 'tenant_name', 'property_name']}
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
                    <Eye size={14} />
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
