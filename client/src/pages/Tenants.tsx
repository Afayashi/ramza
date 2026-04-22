/*
 * صفحة المستأجرين - رمز الإبداع
 * عرض وإدارة جميع المستأجرين مع نماذج CRUD
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
import { TenantForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Tenants() {
  const { data: tenants, loading, reload } = useEntityData('Tenant');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Tenant.update(editItem.id, formData);
        toast.success('تم تحديث بيانات المستأجر بنجاح');
      } else {
        await base44.entities.Tenant.create(formData);
        toast.success('تم إضافة المستأجر بنجاح');
      }
      reload();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستأجر؟')) return;
    try {
      await base44.entities.Tenant.delete(id);
      toast.success('تم حذف المستأجر');
      reload();
    } catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const statusBadge = (status: string) => {
    const isActive = status === 'نشط' || status === 'active';
    return (
      <span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium', isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
        {isActive ? <UserCheck size={10} /> : <UserX size={10} />}
        {isActive ? 'نشط' : 'غير نشط'}
      </span>
    );
  };

  return (
    <DashboardLayout pageTitle="المستأجرون">
      <PageHeader title="إدارة المستأجرين" description={`${tenants.length} مستأجر مسجل`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> إضافة مستأجر</Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل المستأجرين..." />
      ) : tenants.length === 0 ? (
        <EmptyState title="لا يوجد مستأجرون" description="ابدأ بإضافة أول مستأجر" actionLabel="إضافة مستأجر" onAction={handleAdd} />
      ) : (
        <DataTable
          columns={[
            { key: 'الاسم_الكامل', label: 'الاسم', render: (v, r) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{(v || r.name || '?')[0]}</div>
                <span className="font-medium">{v || r.name || '—'}</span>
              </div>
            )},
            { key: 'رقم_الهوية', label: 'رقم الهوية', render: (v, r) => v || r.id_number || '—' },
            { key: 'رقم_الجوال', label: 'الجوال', render: (v, r) => {
              const phone = v || r.phone || '';
              return phone ? <a href={`tel:${phone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone size={12} /> {phone}</a> : '—';
            }},
            { key: 'حالة_المستأجر', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
            { key: 'العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
          ]}
          data={tenants}
          searchKeys={['الاسم_الكامل', 'name', 'رقم_الهوية', 'id_number', 'رقم_الجوال', 'phone']}
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(row)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          )}
        />
      )}

      <TenantForm tenant={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
