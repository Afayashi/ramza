/*
 * صفحة الدفعات - رمز الإبداع
 * عرض وإدارة جميع الدفعات المالية مع نماذج CRUD
 */
import { useState } from 'react';
import { DollarSign, Plus, CheckCircle, Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';
import { PaymentForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Payments() {
  const { data: payments, loading, reload } = useEntityData('Payment');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Payment.update(editItem.id, formData);
        toast.success('تم تحديث الدفعة بنجاح');
      } else {
        await base44.entities.Payment.create(formData);
        toast.success('تم تسجيل الدفعة بنجاح');
      }
      reload();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدفعة؟')) return;
    try {
      await base44.entities.Payment.delete(id);
      toast.success('تم حذف الدفعة');
      reload();
    } catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any; label: string }> = {
      'مدفوع': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'مدفوع' },
      'مكتمل': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'مكتمل' },
      'مستحق': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'مستحق' },
      'معلق': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'معلق' },
      'لم_يتم_الدفع': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'لم يتم الدفع' },
      'متأخر': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'متأخر' },
    };
    const s = map[status] || { color: 'bg-muted text-muted-foreground', icon: DollarSign, label: status || 'غير محدد' };
    const Icon = s.icon;
    return (<span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}><Icon size={10} /> {s.label}</span>);
  };

  const paid = payments.filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
  const pending = payments.filter(p => ['مستحق', 'معلق'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
  const overdue = payments.filter(p => ['لم_يتم_الدفع', 'متأخر'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
  const totalPaid = payments.filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).reduce((s, p) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

  return (
    <DashboardLayout pageTitle="الدفعات">
      <PageHeader title="إدارة الدفعات" description={`${payments.length} دفعة`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> تسجيل دفعة</Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل الدفعات..." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي المحصل" value={`${totalPaid.toLocaleString('ar-SA')} ر.س`} icon={DollarSign} />
            <StatCard title="مدفوعة" value={paid} icon={CheckCircle} />
            <StatCard title="مستحقة" value={pending} icon={Clock} />
            <StatCard title="متأخرة" value={overdue} icon={AlertTriangle} />
          </div>

          {payments.length === 0 ? (
            <EmptyState title="لا توجد دفعات" description="لم يتم تسجيل أي دفعات بعد" actionLabel="تسجيل دفعة" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'مبلغ_الدفعة', label: 'المبلغ', render: (v, r) => `${Number(v || r['قيمة_القسط'] || 0).toLocaleString('ar-SA')} ر.س` },
                { key: 'تاريخ_الدفع', label: 'تاريخ الدفع', render: (v, r) => { const d = v || r['تاريخ_استحقاق_القسط'] || ''; return d ? new Date(d).toLocaleDateString('ar-SA') : '—'; }},
                { key: 'حالة_القسط', label: 'الحالة', render: (v, r) => statusBadge(v || r['حالة_الدفع'] || '') },
                { key: 'طريقة_الدفع', label: 'طريقة الدفع', render: (v) => v || '—' },
              ]}
              data={payments}
              searchKeys={['اسم_المستأجر', 'tenant_name', 'اسم_العقار', 'property_name']}
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

      <PaymentForm payment={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
