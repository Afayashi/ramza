/*
 * صفحة CRM - إدارة العملاء - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 */
import { useState, useMemo } from 'react';
import {
  Users, Plus, Search, Pencil, Trash2, Phone, Mail, Star,
  UserPlus, TrendingUp, Clock
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

const LEAD_STATUS = {
  new: { label: 'جديد', cls: 'bg-blue-500/15 text-blue-400' },
  contacted: { label: 'تم التواصل', cls: 'bg-amber-500/15 text-amber-400' },
  interested: { label: 'مهتم', cls: 'bg-emerald-500/15 text-emerald-400' },
  negotiating: { label: 'تفاوض', cls: 'bg-purple-500/15 text-purple-400' },
  converted: { label: 'تم التحويل', cls: 'bg-emerald-500/15 text-emerald-400' },
  lost: { label: 'خسارة', cls: 'bg-red-500/15 text-red-400' },
};
const EMPTY = { name: '', phone: '', email: '', source: '', status: 'new', interest: '', budget: '', notes: '', assignedTo: '' };

export default function CRM() {
  const { data, loading, reload } = useEntityData('Lead');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => setForm(p => ({ ...p, [name]: value }));

  const filtered = data.filter(l => {
    if (filterStatus !== 'all' && (l.status || l['الحالة']) !== filterStatus) return false;
    const term = search.toLowerCase();
    return !search || (l.name || l['الاسم'] || '').includes(term) || (l.phone || l['الهاتف'] || '').includes(term);
  });

  const stats = useMemo(() => ({
    total: data.length,
    new: data.filter(l => (l.status || l['الحالة']) === 'new').length,
    interested: data.filter(l => ['interested', 'negotiating'].includes(l.status || l['الحالة'] || '')).length,
    converted: data.filter(l => (l.status || l['الحالة']) === 'converted').length,
  }), [data]);

  const handleAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name || item['الاسم'] || '', phone: item.phone || item['الهاتف'] || '', email: item.email || item['البريد'] || '', source: item.source || item['المصدر'] || '', status: item.status || item['الحالة'] || 'new', interest: item.interest || item['الاهتمام'] || '', budget: item.budget || item['الميزانية'] || '', notes: item.notes || item['ملاحظات'] || '', assignedTo: item.assignedTo || '' });
    setShowForm(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await base44.entities.Lead.update(editItem.id, form); toast.success('تم التحديث'); }
      else { await base44.entities.Lead.create(form); toast.success('تم الإضافة'); }
      setShowForm(false); reload();
    } catch { toast.error('حدث خطأ'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا العميل المحتمل؟')) return;
    try { await base44.entities.Lead.delete(id); toast.success('تم الحذف'); reload(); } catch { toast.error('حدث خطأ'); }
  };

  if (loading) return <DashboardLayout pageTitle="إدارة العملاء"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="إدارة العملاء">
      <PageHeader title="إدارة العملاء (CRM)" description={`${data.length} عميل محتمل`}>
        <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> عميل جديد</Button>
      </PageHeader>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'إجمالي العملاء', value: stats.total, icon: Users, color: '#C8A951' },
          { label: 'عملاء جدد', value: stats.new, icon: UserPlus, color: '#3b82f6' },
          { label: 'مهتمون / تفاوض', value: stats.interested, icon: Star, color: '#D97706' },
          { label: 'تم التحويل', value: stats.converted, icon: TrendingUp, color: '#059669' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* فلاتر */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-1 bg-sidebar rounded-lg p-0.5 overflow-x-auto">
          {[{ id: 'all', label: 'الكل' }, ...Object.entries(LEAD_STATUS).map(([id, v]) => ({ id, label: v.label }))].map(s => (
            <button key={s.id} onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* القائمة */}
      {filtered.length === 0 ? <EmptyState title="لا يوجد عملاء" description="أضف عميل محتمل جديد" /> : (
        <div className="space-y-2">
          {filtered.map(l => {
            const st = LEAD_STATUS[(l.status || l['الحالة'] || 'new') as keyof typeof LEAD_STATUS] || LEAD_STATUS.new;
            return (
              <div key={l.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-foreground">{l.name || l['الاسم'] || 'بدون اسم'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      {(l.phone || l['الهاتف']) && <span className="flex items-center gap-1"><Phone size={12} /> {l.phone || l['الهاتف']}</span>}
                      {(l.email || l['البريد']) && <span className="flex items-center gap-1"><Mail size={12} /> {l.email || l['البريد']}</span>}
                      {(l.interest || l['الاهتمام']) && <span>الاهتمام: {l.interest || l['الاهتمام']}</span>}
                      {(l.budget || l['الميزانية']) && <span>الميزانية: {Number(l.budget || l['الميزانية']).toLocaleString('ar-SA')} ر.س</span>}
                      {(l.source || l['المصدر']) && <span>المصدر: {l.source || l['المصدر']}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(l)} className="p-1.5 rounded-lg hover:bg-sidebar"><Pencil size={14} className="text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FormModal title={editItem ? 'تعديل العميل' : 'عميل جديد'} isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} loading={saving}>
        <FormSection title="بيانات العميل" icon={<Users size={14} />}>
          <FormInput label="الاسم" name="name" value={form.name} onChange={set} required fullWidth />
          <FormRow><FormInput label="الهاتف" name="phone" value={form.phone} onChange={set} required /><FormInput label="البريد الإلكتروني" name="email" value={form.email} onChange={set} type="email" /></FormRow>
          <FormRow>
            <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={Object.entries(LEAD_STATUS).map(([v, l]) => ({ value: v, label: l.label }))} />
            <FormSelect label="المصدر" name="source" value={form.source} onChange={set} options={[{ value: 'website', label: 'الموقع' }, { value: 'referral', label: 'إحالة' }, { value: 'social', label: 'وسائل التواصل' }, { value: 'walk_in', label: 'زيارة مباشرة' }, { value: 'phone', label: 'اتصال هاتفي' }, { value: 'other', label: 'أخرى' }]} />
          </FormRow>
          <FormRow><FormInput label="الاهتمام" name="interest" value={form.interest} onChange={set} placeholder="شقة، فيلا، مكتب..." /><FormInput label="الميزانية (ر.س)" name="budget" value={form.budget} onChange={set} type="number" /></FormRow>
          <FormInput label="المسؤول" name="assignedTo" value={form.assignedTo} onChange={set} />
          <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
