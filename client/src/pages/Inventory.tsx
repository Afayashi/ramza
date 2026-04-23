/*
 * صفحة المخزون - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 */
import { useState } from 'react';
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

const EMPTY = { name: '', category: '', quantity: '', minQuantity: '', unit: '', location: '', supplier: '', cost: '', notes: '' };

export default function Inventory() {
  const { data, loading, reload } = useEntityData('InventoryItem');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => setForm(p => ({ ...p, [name]: value }));
  const filtered = data.filter(item => (item.name || item['الاسم'] || '').includes(search));
  const lowStock = data.filter(item => {
    const qty = Number(item.quantity || item['الكمية'] || 0);
    const min = Number(item.minQuantity || item['الحد_الأدنى'] || 0);
    return min > 0 && qty <= min;
  });

  const handleAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name || item['الاسم'] || '', category: item.category || item['الفئة'] || '', quantity: item.quantity || item['الكمية'] || '', minQuantity: item.minQuantity || item['الحد_الأدنى'] || '', unit: item.unit || item['الوحدة'] || '', location: item.location || item['الموقع'] || '', supplier: item.supplier || item['المورد'] || '', cost: item.cost || item['التكلفة'] || '', notes: item.notes || item['ملاحظات'] || '' });
    setShowForm(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await base44.entities.InventoryItem.update(editItem.id, form); toast.success('تم التحديث'); }
      else { await base44.entities.InventoryItem.create(form); toast.success('تم الإضافة'); }
      setShowForm(false); reload();
    } catch { toast.error('حدث خطأ'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا العنصر؟')) return;
    try { await base44.entities.InventoryItem.delete(id); toast.success('تم الحذف'); reload(); } catch { toast.error('حدث خطأ'); }
  };

  if (loading) return <DashboardLayout pageTitle="المخزون"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="المخزون">
      <PageHeader title="إدارة المخزون" description={`${data.length} عنصر`}>
        <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> إضافة عنصر</Button>
      </PageHeader>

      {lowStock.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle size={14} /> {lowStock.length} عنصر وصل للحد الأدنى من المخزون
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المخزون..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'إجمالي العناصر', value: data.length, color: '#C8A951' },
          { label: 'إجمالي الكمية', value: data.reduce((s, i) => s + Number(i.quantity || i['الكمية'] || 0), 0), color: '#3b82f6' },
          { label: 'مخزون منخفض', value: lowStock.length, color: '#DC2626' },
          { label: 'إجمالي التكلفة', value: `${data.reduce((s, i) => s + (Number(i.cost || i['التكلفة'] || 0) * Number(i.quantity || i['الكمية'] || 0)), 0).toLocaleString('ar-SA')} ر.س`, color: '#059669' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState title="لا توجد عناصر" description="أضف عنصر جديد للمخزون" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-right p-2.5 font-medium">الاسم</th>
                <th className="text-right p-2.5 font-medium">الفئة</th>
                <th className="text-right p-2.5 font-medium">الكمية</th>
                <th className="text-right p-2.5 font-medium">الحد الأدنى</th>
                <th className="text-right p-2.5 font-medium">الموقع</th>
                <th className="text-right p-2.5 font-medium">التكلفة</th>
                <th className="text-right p-2.5 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const qty = Number(item.quantity || item['الكمية'] || 0);
                const min = Number(item.minQuantity || item['الحد_الأدنى'] || 0);
                const isLow = min > 0 && qty <= min;
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-sidebar/50 transition-colors">
                    <td className="p-2.5 font-medium text-foreground">{item.name || item['الاسم'] || '-'}</td>
                    <td className="p-2.5 text-muted-foreground">{item.category || item['الفئة'] || '-'}</td>
                    <td className={`p-2.5 font-bold ${isLow ? 'text-red-400' : 'text-foreground'}`}>
                      {qty} {item.unit || item['الوحدة'] || ''}
                      {isLow && <AlertTriangle size={10} className="inline mr-1 text-red-400" />}
                    </td>
                    <td className="p-2.5 text-muted-foreground">{min || '-'}</td>
                    <td className="p-2.5 text-muted-foreground">{item.location || item['الموقع'] || '-'}</td>
                    <td className="p-2.5 text-muted-foreground">{Number(item.cost || item['التكلفة'] || 0).toLocaleString('ar-SA')} ر.س</td>
                    <td className="p-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1 rounded hover:bg-sidebar"><Pencil size={12} className="text-muted-foreground" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:bg-red-500/10"><Trash2 size={12} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FormModal title={editItem ? 'تعديل العنصر' : 'عنصر جديد'} isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} loading={saving}>
        <FormSection title="بيانات العنصر" icon={<Package size={14} />}>
          <FormInput label="اسم العنصر" name="name" value={form.name} onChange={set} required fullWidth />
          <FormRow>
            <FormSelect label="الفئة" name="category" value={form.category} onChange={set} options={[{ value: 'electrical', label: 'كهربائيات' }, { value: 'plumbing', label: 'سباكة' }, { value: 'painting', label: 'دهانات' }, { value: 'cleaning', label: 'تنظيف' }, { value: 'tools', label: 'أدوات' }, { value: 'other', label: 'أخرى' }]} />
            <FormInput label="الوحدة" name="unit" value={form.unit} onChange={set} placeholder="قطعة، كرتون، لتر..." />
          </FormRow>
          <FormRow>
            <FormInput label="الكمية" name="quantity" value={form.quantity} onChange={set} type="number" required />
            <FormInput label="الحد الأدنى" name="minQuantity" value={form.minQuantity} onChange={set} type="number" />
          </FormRow>
          <FormRow>
            <FormInput label="الموقع / المستودع" name="location" value={form.location} onChange={set} />
            <FormInput label="المورد" name="supplier" value={form.supplier} onChange={set} />
          </FormRow>
          <FormInput label="تكلفة الوحدة (ر.س)" name="cost" value={form.cost} onChange={set} type="number" />
          <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
