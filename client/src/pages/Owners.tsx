/*
 * صفحة إدارة الملاك - رمز الإبداع
 */
import { useState } from 'react';
import { Users, Plus, Eye, Phone, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';

export default function Owners() {
  const { data: owners, loading } = useEntityData('Owner');

  return (
    <DashboardLayout pageTitle="الملاك">
      <PageHeader title="إدارة الملاك" description={`${owners.length} مالك`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إضافة مالك</Button>
      </PageHeader>

      {loading ? <LoadingState /> : owners.length === 0 ? (
        <EmptyState title="لا يوجد ملاك" description="ابدأ بإضافة أول مالك" actionLabel="إضافة مالك" />
      ) : (
        <DataTable
          columns={[
            {
              key: 'الاسم', label: 'الاسم',
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
                return phone ? <a href={`tel:${phone}`} className="text-primary hover:underline flex items-center gap-1"><Phone size={12} />{phone}</a> : '—';
              }
            },
            { key: 'عدد_العقارات', label: 'العقارات', render: (v) => v || '0' },
          ]}
          data={owners}
          searchKeys={['الاسم', 'name', 'رقم_الهوية', 'رقم_الجوال']}
          actions={(row) => (
            <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Eye size={14} /></button>
          )}
        />
      )}
    </DashboardLayout>
  );
}
