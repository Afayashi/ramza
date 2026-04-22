/*
 * صفحة إدارة الملاك - رمز الإبداع مع نماذج CRUD
 */
import { useState } from 'react';
import { Plus, Phone, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import { OwnerForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Owners() {
  const { data: owners, loading, reload } = useEntityData('Owner');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };
  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Owner.update(editItem.id, formData);
        toast.success('تم تحديث بيانات المالك');
      } else {
        await base44.entities.Owner.create(formData);
        toast.success('تم إضافة المالك');
      }
      reload();
    } catch {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المالك؟')) return;
    try {
      await base44.entities.Owner.delete(id);
      toast.success('تم حذف المالك');
      reload();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  return (
    <DashboardLayout pageTitle="الملاك">
      <PageHeader title="إدارة الملاك" description={`${owners.length} مالك`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> إضافة مالك</Button>
      </PageHeader>

      {loading ? (
        <LoadingState />
      ) : owners.length === 0 ? (
        <EmptyState title="لا يوجد ملاك" description="ابدأ بإضافة أول مالك" actionLabel="إضافة مالك" onAction={handleAdd} />
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
                  <span className="font-medium">{v || r.name || '\u2014'}</span>
                </div>
              )
            },
            { key: 'رقم_الهوية', label: 'رقم الهوية', render: (v, r) => v || r.id_number || '\u2014' },
            {
              key: 'رقم_الجوال', label: 'الجوال',
              render: (v, r) => {
                const phone = v || r.phone || '';
                return phone ? <a href={`tel:${phone}`} className="text-primary hover:underline flex items-center gap-1"><Phone size={12} />{phone}</a> : '\u2014';
              }
            },
            { key: 'عدد_العقارات', label: 'العقارات', render: (v) => v || '0' },
          ]}
          data={owners}
          searchKeys={['الاسم', 'name', 'رقم_الهوية', 'رقم_الجوال']}
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(row)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          )}
        />
      )}

      <OwnerForm owner={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
