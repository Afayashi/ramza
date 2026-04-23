/*
 * صفحة عقود الوساطة - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 */
import { useState } from 'react';
import { Briefcase, Plus, Search, Pencil, Trash2, Calendar, User, Building2, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

const STATUS = { active: { label: 'نشط', cls: 'bg-emerald-500/15 text-emerald-400' }, expired: { label: 'منتهي', cls: 'bg-red-500/15 text-red-400' }, pending: { label: 'قيد المعالجة', cls: 'bg-amber-500/15 text-amber-400' } };
const EMPTY = { contractNumber: '', ownerName: '', ownerPhone: '', propertyName: '', propertyType: '', startDate: '', endDate: '', commissionRate: '', status: 'active', notes: '' };

export default function BrokerageContracts() {
  const { data, loading, reload } = useEntityData('BrokerageContract');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => setForm(p => ({ ...p, [name]: value }));
  const filtered = data.filter(c => (c.contractNumber || c.ownerName || c.propertyName || '').includes(search));

  const handleAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ contractNumber: item.contractNumber || '', ownerName: item.ownerName || '', ownerPhone: item.ownerPhone || '', propertyName: item.propertyName || '', propertyType: item.propertyType || '', startDate: item.startDate || '', endDate: item.endDate || '', commissionRate: item.commissionRate || '', status: item.status || 'active', notes: item.notes || '' });
    setShowForm(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await base44.entities.BrokerageContract.update(editItem.id, form); toast.success('تم تحديث العقد'); }
      else { await base44.entities.BrokerageContract.create(form); toast.success('تم إضافة العقد'); }
      setShowForm(false); reload();
    } catch { toast.error('حدث خطأ'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا العقد؟')) return;
    try { await base44.entities.BrokerageContract.delete(id); toast.success('تم الحذف'); reload(); } catch { toast.error('حدث خطأ'); }
  };

  if (loading) return <DashboardLayout pageTitle="عقود الوساطة"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="عقود الوساطة">
      <PageHeader title="عقود الوساطة" description={`${data.length} عقد وساطة`}>
        <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> عقد جديد</Button>
      </PageHeader>
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في العقود..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      {filtered.length === 0 ? <EmptyState title="لا توجد عقود وساطة" description="أضف عقد وساطة جديد" /> : (
        <div className="space-y-3">
          {filtered.map(c => {
            const st = STATUS[(c.status as keyof typeof STATUS)] || STATUS.pending;
            const daysLeft = c.endDate ? Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000) : null;
            return (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-foreground">{c.contractNumber || 'بدون رقم'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                      {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium flex items-center gap-1">
                          <AlertTriangle size={10} /> ينتهي خلال {daysLeft} يوم
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><User size={12} /> {c.ownerName || '-'}</span>
                      <span className="flex items-center gap-1"><Building2 size={12} /> {c.propertyName || '-'}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {c.startDate || '-'} → {c.endDate || '-'}</span>
                      {c.commissionRate && <span>العمولة: {c.commissionRate}%</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-sidebar transition-colors"><Pencil size={14} className="text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <FormModal title={editItem ? 'تعديل عقد الوساطة' : 'عقد وساطة جديد'} isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} loading={saving}>
        <FormSection title="بيانات العقد" icon={<Briefcase size={14} />}>
          <FormRow><FormInput label="رقم العقد" name="contractNumber" value={form.contractNumber} onChange={set} required /><FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={[{ value: 'active', label: 'نشط' }, { value: 'expired', label: 'منتهي' }, { value: 'pending', label: 'قيد المعالجة' }]} /></FormRow>
          <FormRow><FormInput label="اسم المالك" name="ownerName" value={form.ownerName} onChange={set} required /><FormInput label="هاتف المالك" name="ownerPhone" value={form.ownerPhone} onChange={set} /></FormRow>
          <FormRow><FormInput label="اسم العقار" name="propertyName" value={form.propertyName} onChange={set} /><FormInput label="نوع العقار" name="propertyType" value={form.propertyType} onChange={set} /></FormRow>
          <FormRow><FormInput label="تاريخ البداية" name="startDate" value={form.startDate} onChange={set} type="date" /><FormInput label="تاريخ النهاية" name="endDate" value={form.endDate} onChange={set} type="date" /></FormRow>
          <FormInput label="نسبة العمولة (%)" name="commissionRate" value={form.commissionRate} onChange={set} type="number" />
          <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
