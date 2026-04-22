/*
 * صفحة المصروفات - رمز الإبداع مع نماذج CRUD
 */
import { useState } from 'react';
import { Plus, Pencil, Trash2, DollarSign, TrendingDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import { ExpenseForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Expenses() {
  const { data: expenses, loading, reload } = useEntityData('Expense');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };
  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Expense.update(editItem.id, formData);
        toast.success('تم تحديث المصروف');
      } else {
        await base44.entities.Expense.create(formData);
        toast.success('تم إضافة المصروف');
      }
      reload();
    } catch {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await base44.entities.Expense.delete(id);
      toast.success('تم الحذف');
      reload();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const total = expenses.reduce((s: number, e: any) => s + (parseFloat(e.amount) || 0), 0);
  const thisMonth = expenses
    .filter((e: any) => (e.date || '').startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s: number, e: any) => s + (parseFloat(e.amount) || 0), 0);

  return (
    <DashboardLayout pageTitle="المصروفات">
      <PageHeader title="إدارة المصروفات" description={`${expenses.length} مصروف`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}>
          <Plus size={16} /> إضافة مصروف
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="إجمالي المصروفات" value={`${total.toLocaleString('ar-SA')} ر.س`} icon={TrendingDown} />
            <StatCard title="مصروفات الشهر" value={`${thisMonth.toLocaleString('ar-SA')} ر.س`} icon={DollarSign} />
          </div>

          {expenses.length === 0 ? (
            <EmptyState title="لا توجد مصروفات" actionLabel="إضافة مصروف" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'description', label: 'الوصف', render: (v: any, r: any) => v || r.title || r['\u0648\u0635\u0641_\u0627\u0644\u0645\u0635\u0631\u0648\u0641'] || '\u2014' },
                { key: 'category', label: 'التصنيف', render: (v: any, r: any) => v || r['\u062a\u0635\u0646\u064a\u0641_\u0627\u0644\u0645\u0635\u0631\u0648\u0641'] || '\u2014' },
                { key: 'amount', label: 'المبلغ', render: (v: any) => `${Number(v || 0).toLocaleString('ar-SA')} ر.س` },
                { key: 'date', label: 'التاريخ', render: (v: any) => v ? new Date(v).toLocaleDateString('ar-SA') : '\u2014' },
                { key: 'property_name', label: 'العقار', render: (v: any, r: any) => v || r['\u0627\u0633\u0645_\u0627\u0644\u0639\u0642\u0627\u0631'] || '\u2014' },
              ]}
              data={expenses}
              searchKeys={['description', 'title', '\u0648\u0635\u0641_\u0627\u0644\u0645\u0635\u0631\u0648\u0641', 'category', 'property_name']}
              actions={(row: any) => (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(row)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      )}

      <ExpenseForm expense={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
