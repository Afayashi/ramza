/*
 * صفحة الأرشيف - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 * عرض العناصر المؤرشفة من جميع الكيانات
 */
import { useState, useMemo } from 'react';
import {
  Archive as ArchiveIcon, Search, FileText, Building2, Users, Wrench,
  Clock, CheckCircle, AlertCircle, Eye, SlidersHorizontal
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  active: { label: 'نشط', cls: 'bg-emerald-500/15 text-emerald-400' },
  expired: { label: 'منتهي', cls: 'bg-red-500/15 text-red-400' },
  terminated: { label: 'مُنهى', cls: 'bg-zinc-500/15 text-zinc-400' },
  pending: { label: 'معلق', cls: 'bg-amber-500/15 text-amber-400' },
  completed: { label: 'مكتمل', cls: 'bg-emerald-500/15 text-emerald-400' },
  cancelled: { label: 'ملغي', cls: 'bg-zinc-500/15 text-zinc-400' },
};

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: ArchiveIcon },
  { id: 'lease', label: 'العقود', icon: FileText },
  { id: 'maintenance', label: 'الصيانة', icon: Wrench },
  { id: 'property', label: 'العقارات', icon: Building2 },
  { id: 'tenant', label: 'المستأجرون', icon: Users },
];

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'منذ لحظات';
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 30) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-SA');
}

export default function Archive() {
  const { data, loading } = useMultiEntityData([
    { name: 'Lease' }, { name: 'Maintenance' },
    { name: 'Property' }, { name: 'Tenant' },
  ]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const items = useMemo(() => {
    const all: any[] = [];
    // عقود منتهية أو ملغية
    (data.Lease || []).filter(l => ['expired', 'terminated', 'منتهي', 'مُنهى'].includes(l['حالة_العقد'] || l.status || '')).forEach(l => {
      all.push({ type: 'lease', cat: 'lease', title: `عقد ${l['رقم_العقد'] || l.id}`, sub: l['اسم_المستأجر'] || '', status: l['حالة_العقد'] || l.status || 'expired', date: l['تاريخ_النهاية'] || l.end_date || l.created_date || '', icon: FileText });
    });
    // صيانة مكتملة أو ملغية
    (data.Maintenance || []).filter(m => ['completed', 'cancelled', 'مكتمل', 'ملغي'].includes(m['الحالة'] || m.status || '')).forEach(m => {
      all.push({ type: 'maintenance', cat: 'maintenance', title: m['عنوان_الطلب'] || m.title || 'طلب صيانة', sub: m['الوصف'] || '', status: m['الحالة'] || m.status || 'completed', date: m['تاريخ_الإنشاء'] || m.created_date || '', icon: Wrench });
    });
    // ترتيب بالتاريخ
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all;
  }, [data]);

  const filtered = items.filter(item => {
    if (category !== 'all' && item.cat !== category) return false;
    if (search && !item.title.includes(search) && !item.sub.includes(search)) return false;
    return true;
  });

  if (loading) return <DashboardLayout pageTitle="الأرشيف"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="الأرشيف">
      <PageHeader title="الأرشيف" description={`${items.length} عنصر مؤرشف`} />

      {/* فلاتر */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الأرشيف..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-1 bg-sidebar rounded-lg p-0.5 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${category === cat.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <cat.icon size={12} /> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'إجمالي المؤرشف', value: items.length, icon: ArchiveIcon, color: '#C8A951' },
          { label: 'عقود منتهية', value: items.filter(i => i.cat === 'lease').length, icon: FileText, color: '#DC2626' },
          { label: 'صيانة مكتملة', value: items.filter(i => i.cat === 'maintenance').length, icon: Wrench, color: '#059669' },
          { label: 'هذا الشهر', value: items.filter(i => { const d = new Date(i.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length, icon: Clock, color: '#3b82f6' },
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

      {/* القائمة */}
      {filtered.length === 0 ? <EmptyState title="لا توجد عناصر مؤرشفة" description="العناصر المنتهية والمكتملة ستظهر هنا" /> : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const st = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-sidebar flex items-center justify-center shrink-0">
                  <item.icon size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-foreground truncate">{item.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                  <Clock size={10} /> {timeAgo(item.date)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
