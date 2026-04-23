/*
 * سجل النشاطات - رمز الإبداع
 */
import { useState } from 'react';
import { Activity, User, Building2, FileText, DollarSign, Wrench, Search, Filter, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/PageStates';

const DEMO_ACTIVITIES = [
  { id: 1, action: 'إضافة عقار جديد', entity: 'عقار', user: 'أحمد المدير', time: 'منذ 5 دقائق', icon: Building2, color: '#3b82f6' },
  { id: 2, action: 'تسجيل دفعة إيجار', entity: 'دفعة', user: 'محمد المحاسب', time: 'منذ 15 دقيقة', icon: DollarSign, color: '#059669' },
  { id: 3, action: 'إنشاء عقد إيجار', entity: 'عقد', user: 'أحمد المدير', time: 'منذ ساعة', icon: FileText, color: '#C8A951' },
  { id: 4, action: 'فتح طلب صيانة', entity: 'صيانة', user: 'خالد الفني', time: 'منذ ساعتين', icon: Wrench, color: '#D97706' },
  { id: 5, action: 'تعديل بيانات مستأجر', entity: 'مستأجر', user: 'أحمد المدير', time: 'منذ 3 ساعات', icon: User, color: '#8b5cf6' },
  { id: 6, action: 'إغلاق طلب صيانة', entity: 'صيانة', user: 'خالد الفني', time: 'منذ 4 ساعات', icon: Wrench, color: '#059669' },
  { id: 7, action: 'إصدار فاتورة', entity: 'فاتورة', user: 'محمد المحاسب', time: 'منذ 5 ساعات', icon: FileText, color: '#3b82f6' },
  { id: 8, action: 'تجديد عقد إيجار', entity: 'عقد', user: 'أحمد المدير', time: 'أمس 14:30', icon: FileText, color: '#C8A951' },
  { id: 9, action: 'تسجيل مصروف', entity: 'مصروف', user: 'محمد المحاسب', time: 'أمس 11:00', icon: DollarSign, color: '#DC2626' },
  { id: 10, action: 'إضافة مستأجر جديد', entity: 'مستأجر', user: 'أحمد المدير', time: 'أمس 09:15', icon: User, color: '#3b82f6' },
];

export default function ActivityLog() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = DEMO_ACTIVITIES.filter(a => {
    if (search && !a.action.includes(search) && !a.user.includes(search)) return false;
    if (filter !== 'all' && a.entity !== filter) return false;
    return true;
  });

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'عقار', label: 'العقارات' },
    { id: 'مستأجر', label: 'المستأجرون' },
    { id: 'عقد', label: 'العقود' },
    { id: 'دفعة', label: 'الدفعات' },
    { id: 'صيانة', label: 'الصيانة' },
  ];

  return (
    <DashboardLayout pageTitle="سجل النشاطات">
      <PageHeader title="سجل النشاطات" description="تتبع جميع العمليات والتغييرات في النظام" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في السجل..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-sidebar text-muted-foreground hover:text-foreground'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState title="لا توجد نشاطات" description="" /> : (
        <div className="relative">
          <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-1">
            {filtered.map(a => (
              <div key={a.id} className="relative flex items-start gap-3 p-3 mr-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center z-10 shrink-0" style={{ background: `${a.color}18` }}>
                  <a.icon size={12} style={{ color: a.color }} />
                </div>
                <div className="flex-1 bg-card border border-border rounded-xl p-3 hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{a.action}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={9} />{a.time}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">بواسطة: {a.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
