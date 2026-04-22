/*
 * صفحة المستأجرين - رمز الإبداع
 * عرض وإدارة جميع المستأجرين
 */
import { useState } from 'react';
import { Users, Plus, Phone, Mail, Eye, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Tenants() {
  const { data: tenants, loading } = useEntityData('Tenant');

  const statusBadge = (status: string) => {
    const isActive = status === 'نشط' || status === 'active';
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
        isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
      )}>
        {isActive ? <UserCheck size={10} /> : <UserX size={10} />}
        {isActive ? 'نشط' : 'غير نشط'}
      </span>
    );
  };

  return (
    <DashboardLayout pageTitle="المستأجرون">
      <PageHeader
        title="إدارة المستأجرين"
        description={`${tenants.length} مستأجر مسجل`}
      >
        <Button size="sm" className="gap-2" onClick={() => {/* TODO: open form */}}>
          <Plus size={16} />
          إضافة مستأجر
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل المستأجرين..." />
      ) : tenants.length === 0 ? (
        <EmptyState title="لا يوجد مستأجرون" description="ابدأ بإضافة أول مستأجر" actionLabel="إضافة مستأجر" />
      ) : (
        <DataTable
          columns={[
            {
              key: 'الاسم_الكامل', label: 'الاسم',
              render: (v, r) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {(v || r.name || '?')[0]}
                  </div>
                  <span className="font-medium">{v || r.name || '—'}</span>
                </div>
              )
            },
            { key: 'رقم_الهوية', label: 'رقم الهوية', render: (v, r) => v || r.id_number || '—' },
            {
              key: 'رقم_الجوال', label: 'الجوال',
              render: (v, r) => {
                const phone = v || r.phone || '';
                return phone ? (
                  <a href={`tel:${phone}`} className="flex items-center gap-1 text-primary hover:underline">
                    <Phone size={12} /> {phone}
                  </a>
                ) : '—';
              }
            },
            {
              key: 'حالة_المستأجر', label: 'الحالة',
              render: (v, r) => statusBadge(v || r.status || '')
            },
            {
              key: 'العقار', label: 'العقار',
              render: (v, r) => v || r.property_name || '—'
            },
          ]}
          data={tenants}
          searchKeys={['الاسم_الكامل', 'name', 'رقم_الهوية', 'id_number', 'رقم_الجوال', 'phone']}
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
                <Eye size={14} />
              </button>
              <button
                onClick={() => console.log('حذف:', row.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      )}
    </DashboardLayout>
  );
}
