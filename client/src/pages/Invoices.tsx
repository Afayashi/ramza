/*
 * صفحة الفواتير - رمز الإبداع مع نماذج CRUD
 */
import { useState } from 'react';
import { FileText, Plus, Pencil, Trash2, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';
import { InvoiceForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Invoices() {
  const { data: invoices, loading, reload } = useEntityData('Invoice');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };
  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Invoice.update(editItem.id, formData);
        toast.success('تم تحديث الفاتورة');
      } else {
        await base44.entities.Invoice.create(formData);
        toast.success('تم إنشاء الفاتورة');
      }
      reload();
    } catch {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    try {
      await base44.entities.Invoice.delete(id);
      toast.success('تم حذف الفاتورة');
      reload();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'مدفوعة': 'bg-green-500/10 text-green-400',
      'paid': 'bg-green-500/10 text-green-400',
      'مستحقة': 'bg-amber-500/10 text-amber-400',
      'pending': 'bg-amber-500/10 text-amber-400',
      'متأخرة': 'bg-red-500/10 text-red-400',
      'overdue': 'bg-red-500/10 text-red-400',
    };
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', map[status] || 'bg-muted text-muted-foreground')}>{status || 'غير محدد'}</span>;
  };

  const totalAmount = invoices.reduce((s: number, i: any) => s + (parseFloat(i['المبلغ'] || i.amount || 0)), 0);

  return (
    <DashboardLayout pageTitle="الفواتير">
      <PageHeader title="إدارة الفواتير" description={`${invoices.length} فاتورة`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> إنشاء فاتورة</Button>
      </PageHeader>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="إجمالي الفواتير" value={invoices.length} icon={FileText} />
            <StatCard title="إجمالي المبالغ" value={`${totalAmount.toLocaleString('ar-SA')} ر.س`} icon={CheckCircle} />
            <StatCard title="معلقة" value={invoices.filter((i: any) => ['pending', 'مستحقة', 'معلقة'].includes(i['الحالة'] || i.status || '')).length} icon={Clock} />
          </div>

          {invoices.length === 0 ? (
            <EmptyState title="لا توجد فواتير" description="لم يتم إنشاء أي فواتير بعد" actionLabel="إنشاء فاتورة" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'رقم_الفاتورة', label: 'رقم الفاتورة', render: (v, r) => v || r.invoice_number || `#${r.id?.slice(-6)}` },
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '\u2014' },
                { key: 'المبلغ', label: 'المبلغ', render: (v, r) => `${Number(v || r.amount || 0).toLocaleString('ar-SA')} ر.س` },
                { key: 'تاريخ_الاستحقاق', label: 'تاريخ الاستحقاق', render: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '\u2014' },
                { key: 'الحالة', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
              ]}
              data={invoices}
              searchKeys={['رقم_الفاتورة', 'اسم_المستأجر', 'tenant_name']}
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

      <InvoiceForm invoice={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
