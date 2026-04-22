/*
 * صفحة نظام الشكاوى - رمز الإبداع مع نماذج CRUD
 */
import { useState } from 'react';
import { MessageSquare, Plus, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';
import { ComplaintForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Complaints() {
  const { data: complaints, loading, reload } = useEntityData('Complaint');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };
  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Complaint.update(editItem.id, formData);
        toast.success('تم تحديث الشكوى');
      } else {
        await base44.entities.Complaint.create(formData);
        toast.success('تم تسجيل الشكوى');
      }
      reload();
    } catch {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشكوى؟')) return;
    try {
      await base44.entities.Complaint.delete(id);
      toast.success('تم حذف الشكوى');
      reload();
    } catch {
      toast.error('حدث خطأ');
    }
  };

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

  const open = complaints.filter((c: any) => ['جديدة', 'new', 'قيد_المعالجة', 'in_progress'].includes(c.status || c['حالة_الشكوى'] || '')).length;
  const resolved = complaints.filter((c: any) => ['محلولة', 'resolved', 'مغلقة', 'closed'].includes(c.status || c['حالة_الشكوى'] || '')).length;

  return (
    <DashboardLayout pageTitle="الشكاوى">
      <PageHeader title="نظام الشكاوى" description={`${complaints.length} شكوى`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> تسجيل شكوى</Button>
      </PageHeader>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="إجمالي الشكاوى" value={complaints.length} icon={MessageSquare} />
            <StatCard title="مفتوحة" value={open} icon={AlertCircle} />
            <StatCard title="محلولة" value={resolved} icon={CheckCircle} />
          </div>

          {complaints.length === 0 ? (
            <EmptyState title="لا توجد شكاوى" actionLabel="تسجيل شكوى" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'عنوان_الشكوى', label: 'العنوان', render: (v, r) => v || r.title || r.subject || '\u2014' },
                { key: 'اسم_المستأجر', label: 'المقدم', render: (v, r) => v || r.tenant_name || r.submitted_by || '\u2014' },
                { key: 'status', label: 'الحالة', render: (v, r) => statusBadge(v || r['حالة_الشكوى'] || '') },
                { key: 'created_date', label: 'التاريخ', render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '\u2014' },
              ]}
              data={complaints}
              searchKeys={['عنوان_الشكوى', 'title', 'اسم_المستأجر', 'tenant_name']}
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

      <ComplaintForm complaint={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
