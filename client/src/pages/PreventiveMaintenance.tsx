/*
 * الصيانة الوقائية - رمز الإبداع
 */
import { useState } from 'react';
import { Wrench, Plus, Search, Pencil, Trash2, Calendar, Building2, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

const STATUS = { scheduled: { label: 'مجدول', cls: 'bg-blue-500/15 text-blue-400' }, in_progress: { label: 'جاري', cls: 'bg-amber-500/15 text-amber-400' }, completed: { label: 'مكتمل', cls: 'bg-emerald-500/15 text-emerald-400' }, overdue: { label: 'متأخر', cls: 'bg-red-500/15 text-red-400' } };
const FREQ = { weekly: 'أسبوعي', monthly: 'شهري', quarterly: 'ربع سنوي', semi_annual: 'نصف سنوي', annual: 'سنوي' };
const EMPTY = { title: '', description: '', propertyName: '', frequency: 'monthly', nextDate: '', assignedTo: '', status: 'scheduled', cost: '', category: '' };

export default function PreventiveMaintenance() {
  const { data, loading, reload } = useEntityData('PreventiveMaintenance');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (n: string, v: string) => setForm(p => ({ ...p, [n]: v }));
  const filtered = data.filter(i => !search || (i.title || i['العنوان'] || '').includes(search));

  const handleAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ title: item.title || '', description: item.description || '', propertyName: item.propertyName || '', frequency: item.frequency || 'monthly', nextDate: item.nextDate || '', assignedTo: item.assignedTo || '', status: item.status || 'scheduled', cost: item.cost || '', category: item.category || '' });
    setShowForm(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await base44.entities.PreventiveMaintenance.update(editItem.id, form); toast.success('تم التحديث'); }
      else { await base44.entities.PreventiveMaintenance.create(form); toast.success('تم الإضافة'); }
      setShowForm(false); reload();
    } catch { toast.error('حدث خطأ'); } setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('حذف؟')) return;
    try { await base44.entities.PreventiveMaintenance.delete(id); toast.success('تم الحذف'); reload(); } catch { toast.error('خطأ'); }
  };

  if (loading) return <DashboardLayout pageTitle="الصيانة الوقائية"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="الصيانة الوقائية">
      <PageHeader title="الصيانة الوقائية" description={`${data.length} جدول صيانة`}>
        <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> جدول جديد</Button>
      </PageHeader>
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'إجمالي الجداول', value: data.length, color: '#C8A951' },
          { label: 'مجدولة', value: data.filter(i => (i.status) === 'scheduled').length, color: '#3b82f6' },
          { label: 'مكتملة', value: data.filter(i => (i.status) === 'completed').length, color: '#059669' },
          { label: 'متأخرة', value: data.filter(i => (i.status) === 'overdue').length, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState title="لا توجد جداول صيانة وقائية" description="أنشئ جدول صيانة وقائية جديد" /> : (
        <div className="space-y-2">
          {filtered.map(item => {
            const st = STATUS[(item.status as keyof typeof STATUS)] || STATUS.scheduled;
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-foreground">{item.title || 'بدون عنوان'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                      {item.frequency && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sidebar text-muted-foreground">{FREQ[item.frequency as keyof typeof FREQ] || item.frequency}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{item.description || ''}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      {item.propertyName && <span className="flex items-center gap-1"><Building2 size={10} />{item.propertyName}</span>}
                      {item.nextDate && <span className="flex items-center gap-1"><Calendar size={10} />التالي: {item.nextDate}</span>}
                      {item.cost && <span>التكلفة: {Number(item.cost).toLocaleString('ar-SA')} ر.س</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-sidebar"><Pencil size={14} className="text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <FormModal title={editItem ? 'تعديل الجدول' : 'جدول صيانة جديد'} isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} loading={saving}>
        <FormSection title="بيانات الصيانة الوقائية" icon={<Wrench size={14} />}>
          <FormInput label="العنوان" name="title" value={form.title} onChange={set} required fullWidth />
          <FormTextarea label="الوصف" name="description" value={form.description} onChange={set} />
          <FormRow>
            <FormInput label="العقار" name="propertyName" value={form.propertyName} onChange={set} />
            <FormSelect label="التكرار" name="frequency" value={form.frequency} onChange={set} options={Object.entries(FREQ).map(([v, l]) => ({ value: v, label: l }))} />
          </FormRow>
          <FormRow>
            <FormInput label="التاريخ التالي" name="nextDate" value={form.nextDate} onChange={set} type="date" />
            <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label }))} />
          </FormRow>
          <FormRow>
            <FormInput label="المسؤول" name="assignedTo" value={form.assignedTo} onChange={set} />
            <FormInput label="التكلفة (ر.س)" name="cost" value={form.cost} onChange={set} type="number" />
          </FormRow>
          <FormSelect label="الفئة" name="category" value={form.category} onChange={set} options={[{ value: 'hvac', label: 'تكييف' }, { value: 'electrical', label: 'كهرباء' }, { value: 'plumbing', label: 'سباكة' }, { value: 'elevator', label: 'مصاعد' }, { value: 'fire_safety', label: 'سلامة حريق' }, { value: 'cleaning', label: 'تنظيف' }, { value: 'pest_control', label: 'مكافحة حشرات' }, { value: 'other', label: 'أخرى' }]} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
