/*
 * صفحة التذاكر - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 * نظام تذاكر الدعم الفني
 */
import { useState } from 'react';
import { Ticket, Plus, Search, Pencil, Trash2, Clock, User, MessageSquare, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

const PRIORITY = { urgent: { label: 'حرج', cls: 'bg-red-500/15 text-red-400' }, high: { label: 'عالي', cls: 'bg-amber-500/15 text-amber-400' }, medium: { label: 'متوسط', cls: 'bg-blue-500/15 text-blue-400' }, low: { label: 'منخفض', cls: 'bg-zinc-500/15 text-zinc-400' } };
const STATUS = { open: { label: 'مفتوحة', cls: 'bg-blue-500/15 text-blue-400' }, in_progress: { label: 'قيد المعالجة', cls: 'bg-amber-500/15 text-amber-400' }, resolved: { label: 'تم الحل', cls: 'bg-emerald-500/15 text-emerald-400' }, closed: { label: 'مغلقة', cls: 'bg-zinc-500/15 text-zinc-400' } };
const EMPTY = { title: '', description: '', category: 'general', priority: 'medium', status: 'open', assignedTo: '', requesterName: '', requesterPhone: '' };

export default function Tickets() {
  const { data, loading, reload } = useEntityData('Ticket');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => setForm(p => ({ ...p, [name]: value }));
  const filtered = data.filter(t => {
    if (filterStatus !== 'all' && (t.status || t['الحالة']) !== filterStatus) return false;
    if (search && !(t.title || t['العنوان'] || '').includes(search)) return false;
    return true;
  });

  const handleAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ title: item.title || item['العنوان'] || '', description: item.description || item['الوصف'] || '', category: item.category || 'general', priority: item.priority || item['الأولوية'] || 'medium', status: item.status || item['الحالة'] || 'open', assignedTo: item.assignedTo || '', requesterName: item.requesterName || '', requesterPhone: item.requesterPhone || '' });
    setShowForm(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await base44.entities.Ticket.update(editItem.id, form); toast.success('تم تحديث التذكرة'); }
      else { await base44.entities.Ticket.create(form); toast.success('تم إنشاء التذكرة'); }
      setShowForm(false); reload();
    } catch { toast.error('حدث خطأ'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه التذكرة؟')) return;
    try { await base44.entities.Ticket.delete(id); toast.success('تم الحذف'); reload(); } catch { toast.error('حدث خطأ'); }
  };

  if (loading) return <DashboardLayout pageTitle="التذاكر"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="التذاكر">
      <PageHeader title="تذاكر الدعم" description={`${data.length} تذكرة`}>
        <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> تذكرة جديدة</Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-1 bg-sidebar rounded-lg p-0.5 overflow-x-auto">
          {[{ id: 'all', label: 'الكل' }, ...Object.entries(STATUS).map(([id, v]) => ({ id, label: v.label }))].map(s => (
            <button key={s.id} onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState title="لا توجد تذاكر" description="أنشئ تذكرة دعم جديدة" /> : (
        <div className="space-y-2">
          {filtered.map(t => {
            const st = STATUS[(t.status || t['الحالة'] || 'open') as keyof typeof STATUS] || STATUS.open;
            const pri = PRIORITY[(t.priority || t['الأولوية'] || 'medium') as keyof typeof PRIORITY] || PRIORITY.medium;
            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{t.title || t['العنوان'] || 'بدون عنوان'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pri.cls}`}>{pri.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{t.description || t['الوصف'] || ''}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      {(t.requesterName || t['اسم_المقدم']) && <span className="flex items-center gap-1"><User size={10} /> {t.requesterName || t['اسم_المقدم']}</span>}
                      <span className="flex items-center gap-1"><Clock size={10} /> {t.created_date ? new Date(t.created_date).toLocaleDateString('ar-SA') : '-'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-sidebar transition-colors"><Pencil size={14} className="text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FormModal title={editItem ? 'تعديل التذكرة' : 'تذكرة جديدة'} isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} loading={saving}>
        <FormSection title="بيانات التذكرة" icon={<Ticket size={14} />}>
          <FormInput label="العنوان" name="title" value={form.title} onChange={set} required fullWidth />
          <FormTextarea label="الوصف" name="description" value={form.description} onChange={set} required />
          <FormRow>
            <FormSelect label="الأولوية" name="priority" value={form.priority} onChange={set} options={[{ value: 'urgent', label: 'حرج' }, { value: 'high', label: 'عالي' }, { value: 'medium', label: 'متوسط' }, { value: 'low', label: 'منخفض' }]} />
            <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={[{ value: 'open', label: 'مفتوحة' }, { value: 'in_progress', label: 'قيد المعالجة' }, { value: 'resolved', label: 'تم الحل' }, { value: 'closed', label: 'مغلقة' }]} />
          </FormRow>
          <FormRow>
            <FormInput label="اسم مقدم الطلب" name="requesterName" value={form.requesterName} onChange={set} />
            <FormInput label="هاتف مقدم الطلب" name="requesterPhone" value={form.requesterPhone} onChange={set} />
          </FormRow>
          <FormInput label="المسؤول" name="assignedTo" value={form.assignedTo} onChange={set} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
