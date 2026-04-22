/*
 * صفحة طلبات الصيانة - رمز الإبداع
 * مع نماذج CRUD
 */
import { useState } from 'react';
import { Wrench, Plus, CheckCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';
import { MaintenanceForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Maintenance() {
  const { data: requests, loading, reload } = useEntityData('Maintenance');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Maintenance.update(editItem.id, formData);
        toast.success('تم تحديث طلب الصيانة بنجاح');
      } else {
        await base44.entities.Maintenance.create(formData);
        toast.success('تم إنشاء طلب الصيانة بنجاح');
      }
      reload();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await base44.entities.Maintenance.delete(id);
      toast.success('تم حذف طلب الصيانة');
      reload();
    } catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

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
      'urgent': { color: 'bg-red-500/10 text-red-400', label: 'عاجل' },
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
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> طلب صيانة جديد</Button>
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
            <EmptyState title="لا توجد طلبات صيانة" actionLabel="طلب صيانة جديد" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'عنوان_الطلب', label: 'العنوان', render: (v, r) => v || r.title || r.description?.slice(0, 40) || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'اسم_الوحدة', label: 'الوحدة', render: (v, r) => v || r.unit_name || '—' },
                { key: 'status', label: 'الحالة', render: (v, r) => statusBadge(v || r['حالة_الطلب'] || '') },
                { key: 'priority', label: 'الأولوية', render: (v, r) => priorityBadge(v || r['الأولوية'] || '') },
                { key: 'created_date', label: 'التاريخ', render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '—' },
              ]}
              data={requests}
              searchKeys={['عنوان_الطلب', 'title', 'اسم_العقار', 'property_name']}
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(row)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              )}
            />
          )}
        </div>
      )}

      <MaintenanceForm maintenance={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
