/*
 * إدارة المستخدمين - رمز الإبداع
 */
import { useState } from 'react';
import { Users, Shield, Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { FormModal } from '@/components/forms';
import { FormInput, FormSelect, FormSection } from '@/components/forms/FormFields';
import { toast } from 'sonner';

const DEMO_USERS = [
  { id: 1, name: 'أحمد المدير', email: 'ahmed@ramzabdae.com', role: 'مدير', status: 'نشط', lastLogin: '2025-04-20' },
  { id: 2, name: 'محمد المحاسب', email: 'mohammed@ramzabdae.com', role: 'محاسب', status: 'نشط', lastLogin: '2025-04-19' },
  { id: 3, name: 'خالد الفني', email: 'khaled@ramzabdae.com', role: 'فني صيانة', status: 'نشط', lastLogin: '2025-04-18' },
  { id: 4, name: 'سارة الموظفة', email: 'sara@ramzabdae.com', role: 'موظف', status: 'غير نشط', lastLogin: '2025-03-15' },
];

const ROLES = [
  { value: 'مدير', label: 'مدير - صلاحيات كاملة' },
  { value: 'محاسب', label: 'محاسب - إدارة مالية' },
  { value: 'فني صيانة', label: 'فني صيانة - طلبات الصيانة' },
  { value: 'موظف', label: 'موظف - عرض فقط' },
];

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'موظف', phone: '' });

  const set = (name: string, value: string) => setForm(f => ({ ...f, [name]: value }));

  const filtered = DEMO_USERS.filter(u => !search || u.name.includes(search) || u.email.includes(search));

  return (
    <DashboardLayout pageTitle="إدارة المستخدمين">
      <PageHeader title="إدارة المستخدمين" description="إدارة مستخدمي النظام وصلاحياتهم">
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="ml-1" /> إضافة مستخدم</Button>
      </PageHeader>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن مستخدم..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-sidebar/50">
                <th className="text-right p-3 font-medium text-muted-foreground">المستخدم</th>
                <th className="text-right p-3 font-medium text-muted-foreground">البريد</th>
                <th className="text-right p-3 font-medium text-muted-foreground">الدور</th>
                <th className="text-right p-3 font-medium text-muted-foreground">الحالة</th>
                <th className="text-right p-3 font-medium text-muted-foreground">آخر دخول</th>
                <th className="text-right p-3 font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border hover:bg-sidebar/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{u.name.charAt(0)}</div>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{u.role}</span></td>
                  <td className="p-3">
                    <span className={`flex items-center gap-1 text-[10px] ${u.status === 'نشط' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {u.status === 'نشط' ? <CheckCircle size={10} /> : <XCircle size={10} />} {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.lastLogin}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-sidebar" onClick={() => toast.info('تعديل المستخدم (ميزة قادمة)')}><Edit size={12} className="text-muted-foreground" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10" onClick={() => toast.info('حذف المستخدم (ميزة قادمة)')}><Trash2 size={12} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal title="إضافة مستخدم جديد" icon={<Users size={16} />} isOpen={showForm} onClose={() => setShowForm(false)}
        onSubmit={e => { e.preventDefault(); toast.success('تم إضافة المستخدم (تجريبي)'); setShowForm(false); }}>
        <FormSection title="بيانات المستخدم" icon={<Users size={14} />}>
          <FormInput label="الاسم الكامل" name="name" value={form.name} onChange={set} required />
          <FormInput label="البريد الإلكتروني" name="email" value={form.email} onChange={set} type="email" required />
          <FormInput label="رقم الهاتف" name="phone" value={form.phone} onChange={set} />
          <FormSelect label="الدور" name="role" value={form.role} onChange={set} options={ROLES} />
        </FormSection>
      </FormModal>
    </DashboardLayout>
  );
}
