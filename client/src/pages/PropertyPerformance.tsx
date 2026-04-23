/*
 * أداء العقارات - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Building2, TrendingUp, Users, DollarSign, Percent, ArrowUp, ArrowDown, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function PropertyPerformance() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit' }, { name: 'Lease' }, { name: 'Payment' }, { name: 'Maintenance' },
  ]);
  const [search, setSearch] = useState('');

  const performance = useMemo(() => {
    const properties = data.Property || [];
    const units = data.Unit || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];
    const maintenance = data.Maintenance || [];

    return properties.filter(p => !search || (p['اسم_العقار'] || p.name || '').includes(search)).map(p => {
      const pUnits = units.filter(u => u.property_id === p.id || u['معرف_العقار'] === p.id);
      const occupied = pUnits.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
      const pLeases = leases.filter(l => l.property_id === p.id || l['معرف_العقار'] === p.id);
      const activeLeases = pLeases.filter(l => ['ساري', 'active', 'نشط'].includes(l['حالة_العقد'] || l.status || '')).length;
      const pPayments = payments.filter(pay => pay.property_id === p.id || pay['معرف_العقار'] === p.id);
      const income = pPayments.filter(pay => ['مدفوع', 'paid'].includes(pay['حالة_الدفع'] || pay.status || '')).reduce((s, pay) => s + Number(pay['مبلغ_الدفعة'] || pay.amount || 0), 0);
      const overdue = pPayments.filter(pay => ['متأخر', 'overdue'].includes(pay['حالة_الدفع'] || pay.status || '')).length;
      const pMaint = maintenance.filter(m => m.property_id === p.id || m['معرف_العقار'] === p.id);
      const openMaint = pMaint.filter(m => !['مكتمل', 'completed', 'مغلق'].includes(m['الحالة'] || m.status || '')).length;
      const occupancy = pUnits.length > 0 ? Math.round((occupied / pUnits.length) * 100) : 0;

      // حساب النقاط (من 100)
      let score = 50;
      score += occupancy > 80 ? 20 : occupancy > 50 ? 10 : 0;
      score += overdue === 0 ? 15 : overdue <= 2 ? 5 : -10;
      score += openMaint <= 1 ? 10 : openMaint <= 3 ? 0 : -10;
      score += income > 0 ? 5 : 0;
      score = Math.max(0, Math.min(100, score));

      return {
        name: p['اسم_العقار'] || p.name || 'بدون اسم',
        type: p['نوع_العقار'] || p.type || '',
        totalUnits: pUnits.length, occupied, occupancy,
        activeLeases, income, overdue, openMaint, score,
      };
    }).sort((a, b) => b.score - a.score);
  }, [data, search]);

  if (loading) return <DashboardLayout pageTitle="أداء العقارات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="أداء العقارات">
      <PageHeader title="أداء العقارات" description="تقييم شامل لأداء كل عقار" />

      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن عقار..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {performance.length === 0 ? <EmptyState title="لا توجد عقارات" description="" /> : (
        <div className="space-y-3">
          {performance.map((p, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${p.score >= 70 ? 'bg-emerald-500/15 text-emerald-400' : p.score >= 40 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                    {p.score}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.type} - {p.totalUnits} وحدة</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${p.score >= 70 ? 'text-emerald-400' : p.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  {p.score >= 70 ? <ArrowUp size={12} /> : p.score < 40 ? <ArrowDown size={12} /> : null}
                  {p.score >= 70 ? 'ممتاز' : p.score >= 40 ? 'متوسط' : 'ضعيف'}
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                {[
                  { label: 'الإشغال', value: `${p.occupancy}%`, color: p.occupancy >= 80 ? '#059669' : p.occupancy >= 50 ? '#D97706' : '#DC2626' },
                  { label: 'مشغولة', value: `${p.occupied}/${p.totalUnits}`, color: '#3b82f6' },
                  { label: 'عقود سارية', value: p.activeLeases, color: '#C8A951' },
                  { label: 'الإيرادات', value: `${(p.income / 1000).toFixed(0)}K`, color: '#059669' },
                  { label: 'متأخرات', value: p.overdue, color: p.overdue > 0 ? '#DC2626' : '#059669' },
                  { label: 'صيانة مفتوحة', value: p.openMaint, color: p.openMaint > 2 ? '#DC2626' : '#059669' },
                ].map(f => (
                  <div key={f.label} className="bg-sidebar rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">{f.label}</p>
                    <p className="text-xs font-bold" style={{ color: f.color }}>{f.value}</p>
                  </div>
                ))}
              </div>

              {/* شريط الأداء */}
              <div className="mt-3 h-1.5 bg-sidebar rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${p.score >= 70 ? 'bg-emerald-500' : p.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${p.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
