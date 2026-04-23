/*
 * المواعيد - رمز الإبداع
 */
import { useState } from 'react';
import { Calendar, Plus, Search, Pencil, Trash2, Clock, User, MapPin, Phone } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

const STATUS = { upcoming: { label: 'قادم', cls: 'bg-blue-500/15 text-blue-400' }, completed: { label: 'مكتمل', cls: 'bg-emerald-500/15 text-emerald-400' }, cancelled: { label: 'ملغي', cls: 'bg-red-500/15 text-red-400' }, missed: { label: 'فائت', cls: 'bg-zinc-500/15 text-zinc-400' } };
const TYPES = { inspection: 'معاينة', meeting: 'اجتماع', maintenance: 'صيانة', handover: 'تسليم', other: 'أخرى' };
const EMPTY = { title: '', type: 'inspection', date: '', time: '', location: '', contactName: '', contactPhone: '', status: 'upcoming', notes: '' };

export default function Appointments() {
  const { data, loading, reload } = useEntityData('Appointment');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (n: string, v: string) => setForm(p => ({ ...p, [n]: v }));
  const filtered = data.filter(i => !search || (i.title || '').includes(search) || (i.contactName || '').includes(search));

  const handleAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setForm({ title: item.title || '', type: item.type || 'inspection', date: item.date || '', time: item.time || '', location: item.location || '', contactName: item.contactName || '', contactPhone: item.contactPhone || '', status: item.status || 'upcoming', notes: item.notes || '' }); setShowForm(true); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await base44.entities.Appointment.update(editItem.id, form); toast.success('تم التحديث'); }
      else { await base44.entities.Appointment.create(form); toast.success('تم الإضافة'); }
      setShowForm(false); reload();
    } catch { toast.error('حدث خطأ'); } setSaving(false);
  };
  const handleDelete = async (id: string) => { if (!confirm('حذف؟')) return; try { await base44.entities.Appointment.delete(id); toast.success('تم'); reload(); } catch { toast.error('خطأ'); } };

  if (loading) return <DashboardLayout pageTitle="المواعيد"><LoadingState /></DashboardLayout>;

  // تجميع حسب التاريخ
  const grouped: Record<string, any[]> = {};
  filtered.forEach(a => { const d = a.date || 'بدون تاريخ'; if (!grouped[d]) grouped[d] = []; grouped[d].push(a); });
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <DashboardLayout pageTitle="المواعيد">
      <PageHeader title="إدارة المواعيد" description={`${data.length} موعد`}>
        <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> موعد جديد</Button>
      </PageHeader>
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'إجمالي المواعيد', value: data.length, color: '#C8A951' },
          { label: 'قادمة', value: data.filter(a => a.status === 'upcoming').length, color: '#3b82f6' },
          { label: 'مكتملة', value: data.filter(a => a.status === 'completed').length, color: '#059669' },
          { label: 'ملغية', value: data.filter(a => a.status === 'cancelled').length, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState title="لا توجد مواعيد" description="أنشئ موعداً جديداً" /> : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date}>
              <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2"><Calendar size={12} /> {date === 'بدون تاريخ' ? date : new Date(date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              <div className="space-y-2">
                {grouped[date].map(a => {
                  const st = STATUS[(a.status as keyof typeof STATUS)] || STATUS.upcoming;
                  return (
                    <div key={a.id} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-foreground">{a.title || 'بدون عنوان'}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                          {a.type && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sidebar text-muted-foreground">{TYPES[a.type as keyof typeof TYPES] || a.type}</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
                          {a.time && <span className="flex items-center gap-1"><Clock size={10} />{a.time}</span>}
                          {a.location && <span className="flex items-center gap-1"><MapPin size={10} />{a.location}</span>}
                          {a.contactName && <span className="flex items-center gap-1"><User size={10} />{a.contactName}</span>}
                          {a.contactPhone && <span className="flex items-center gap-1"><Phone size={10} />{a.contactPhone}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg hover:bg-sidebar"><Pencil size={12} className="text-muted-foreground" /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={12} className="text-red-400" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <FormModal title={editItem ? 'تعديل الموعد' : 'موعد جديد'} isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} loading={saving}>
        <FormSection title="بيانات الموعد" icon={<Calendar size={14} />}>
          <FormInput label="العنوان" name="title" value={form.title} onChange={set} required fullWidth />
          <FormRow><FormSelect label="النوع" name="type" value={form.type} onChange={set} options={Object.entries(TYPES).map(([v, l]) => ({ value: v, label: l }))} /><FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label }))} /></FormRow>
          <FormRow><FormInput label="التاريخ" name="date" value={form.date} onChange={set} type="date" required /><FormInput label="الوقت" name="time" value={form.time} onChange={set} type="time" /></FormRow>
          <FormInput label="الموقع" name="location" value={form.location} onChange={set} fullWidth />
          <FormRow><FormInput label="اسم جهة الاتصال" name="contactName" value={form.contactName} onChange={set} /><FormInput label="هاتف جهة الاتصال" name="contactPhone" value={form.contactPhone} onChange={set} /></FormRow>
          <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
