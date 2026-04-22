/*
 * صفحة العقود - رمز الإبداع
 * عرض وإدارة عقود الإيجار مع نماذج CRUD
 */
import { useState } from 'react';
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle, Clock, Eye, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';
import { LeaseForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Contracts() {
  const { data: leases, loading, reload } = useEntityData('Lease');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Lease.update(editItem.id, formData);
        toast.success('تم تحديث العقد بنجاح');
      } else {
        await base44.entities.Lease.create(formData);
        toast.success('تم إنشاء العقد بنجاح');
      }
      reload();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) return;
    try {
      await base44.entities.Lease.delete(id);
      toast.success('تم حذف العقد');
      reload();
    } catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

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
    return (<span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}><Icon size={10} /> {s.label}</span>);
  };

  const active = leases.filter(l => ['نشط', 'active'].includes(l['حالة_العقد'] || l.status || '')).length;
  const expired = leases.filter(l => ['منتهي', 'expired'].includes(l['حالة_العقد'] || l.status || '')).length;

  return (
    <DashboardLayout pageTitle="العقود">
      <PageHeader title="إدارة العقود" description={`${leases.length} عقد`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> إنشاء عقد جديد</Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل العقود..." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="العقود النشطة" value={active} icon={CheckCircle} />
            <StatCard title="العقود المنتهية" value={expired} icon={AlertTriangle} />
            <StatCard title="إجمالي العقود" value={leases.length} icon={FileText} />
          </div>

          {leases.length === 0 ? (
            <EmptyState title="لا توجد عقود" description="ابدأ بإنشاء أول عقد إيجار" actionLabel="إنشاء عقد" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'رقم_العقد', label: 'رقم العقد', render: (v, r) => v || r.contract_number || `#${r.id?.slice(-6)}` },
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'تاريخ_بداية_العقد', label: 'البداية', render: (v, r) => { const d = v || r.start_date || ''; return d ? new Date(d).toLocaleDateString('ar-SA') : '—'; }},
                { key: 'تاريخ_نهاية_العقد', label: 'النهاية', render: (v, r) => { const d = v || r['تاريخ_انتهاء_الإيجار'] || r.end_date || ''; return d ? new Date(d).toLocaleDateString('ar-SA') : '—'; }},
                { key: 'حالة_العقد', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
                { key: 'قيمة_الإيجار', label: 'قيمة الإيجار', render: (v, r) => { const a = v || r.rent_amount || 0; return a ? `${Number(a).toLocaleString('ar-SA')} ر.س` : '—'; }},
              ]}
              data={leases}
              searchKeys={['رقم_العقد', 'اسم_المستأجر', 'اسم_العقار', 'tenant_name', 'property_name']}
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

      <LeaseForm lease={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
