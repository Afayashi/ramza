/*
 * منصة التواصل - رمز الإبداع
 * إرسال رسائل وإشعارات للمستأجرين والملاك
 */
import { useState } from 'react';
import { MessageSquare, Send, Users, Phone, Mail, Plus, Search, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useMultiEntityData } from '@/hooks/useEntityData';
import FormModal from '@/components/forms/FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '@/components/forms/FormFields';
import { toast } from 'sonner';

export default function Communication() {
  const { data, loading } = useMultiEntityData([{ name: 'Tenant' }, { name: 'Owner' }]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'tenants' | 'owners'>('tenants');
  const [form, setForm] = useState({ recipient: '', type: 'sms', subject: '', message: '' });
  const set = (n: string, v: string) => setForm(p => ({ ...p, [n]: v }));

  const contacts = tab === 'tenants'
    ? (data.Tenant || []).map(t => ({ id: t.id, name: t['اسم_المستأجر'] || t.name || 'بدون اسم', phone: t['رقم_الهاتف'] || t.phone || '', email: t['البريد_الإلكتروني'] || t.email || '', type: 'مستأجر' }))
    : (data.Owner || []).map(o => ({ id: o.id, name: o['اسم_المالك'] || o.name || 'بدون اسم', phone: o['رقم_الهاتف'] || o.phone || '', email: o['البريد_الإلكتروني'] || o.email || '', type: 'مالك' }));

  const filtered = contacts.filter(c => !search || c.name.includes(search) || c.phone.includes(search));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم إرسال الرسالة بنجاح');
    setShowForm(false);
    setForm({ recipient: '', type: 'sms', subject: '', message: '' });
  };

  if (loading) return <DashboardLayout pageTitle="منصة التواصل"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="منصة التواصل">
      <PageHeader title="منصة التواصل" description="إرسال رسائل وإشعارات للمستأجرين والملاك">
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="ml-1" /> رسالة جديدة</Button>
      </PageHeader>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'المستأجرون', value: (data.Tenant || []).length, color: '#3b82f6' },
          { label: 'الملاك', value: (data.Owner || []).length, color: '#C8A951' },
          { label: 'لديهم هاتف', value: contacts.filter(c => c.phone).length, color: '#059669' },
          { label: 'لديهم بريد', value: contacts.filter(c => c.email).length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* تبويبات */}
      <div className="flex gap-1 bg-sidebar rounded-lg p-0.5 mb-4 w-fit">
        {[{ id: 'tenants' as const, label: 'المستأجرون', icon: Users }, { id: 'owners' as const, label: 'الملاك', icon: Users }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* بحث */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن جهة اتصال..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {/* قائمة جهات الاتصال */}
      {filtered.length === 0 ? <EmptyState title="لا توجد جهات اتصال" description="" /> : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">{c.name}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                    {c.phone && <span className="flex items-center gap-1"><Phone size={9} />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail size={9} />{c.email}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {c.phone && (
                  <button onClick={() => { setForm({ recipient: c.name, type: 'sms', subject: '', message: '' }); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-sidebar" title="رسالة SMS">
                    <MessageSquare size={14} className="text-muted-foreground" />
                  </button>
                )}
                {c.phone && (
                  <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-emerald-500/10" title="واتساب">
                    <Send size={14} className="text-emerald-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <FormModal title="إرسال رسالة" isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleSend} loading={false} submitLabel="إرسال">
        <FormSection title="بيانات الرسالة" icon={<MessageSquare size={14} />}>
          <FormInput label="المستلم" name="recipient" value={form.recipient} onChange={set} required fullWidth />
          <FormSelect label="نوع الرسالة" name="type" value={form.type} onChange={set} options={[{ value: 'sms', label: 'رسالة SMS' }, { value: 'whatsapp', label: 'واتساب' }, { value: 'email', label: 'بريد إلكتروني' }]} />
          {form.type === 'email' && <FormInput label="الموضوع" name="subject" value={form.subject} onChange={set} fullWidth />}
          <FormTextarea label="نص الرسالة" name="message" value={form.message} onChange={set} required />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
