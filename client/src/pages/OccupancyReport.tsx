/*
 * تقارير الإشغال - رمز الإبداع
 */
import { useMemo } from 'react';
import { Building2, Home, Users, Percent, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function OccupancyReport() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit' },
  ]);

  const report = useMemo(() => {
    const properties = data.Property || [];
    const units = data.Unit || [];

    const byProperty = properties.map(p => {
      const pUnits = units.filter(u => u.property_id === p.id || u['معرف_العقار'] === p.id);
      const occupied = pUnits.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
      const vacant = pUnits.length - occupied;
      const rate = pUnits.length > 0 ? Math.round((occupied / pUnits.length) * 100) : 0;
      return { name: p['اسم_العقار'] || p.name || 'بدون اسم', type: p['نوع_العقار'] || p.type || '', total: pUnits.length, occupied, vacant, rate };
    }).sort((a, b) => b.rate - a.rate);

    const totalUnits = units.length;
    const totalOccupied = units.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
    const totalVacant = totalUnits - totalOccupied;
    const avgRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

    return { byProperty, totalUnits, totalOccupied, totalVacant, avgRate };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="تقارير الإشغال"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="تقارير الإشغال">
      <PageHeader title="تقارير الإشغال" description="نسب إشغال العقارات والوحدات" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي الوحدات', value: report.totalUnits, icon: Home, color: '#C8A951' },
          { label: 'مشغولة', value: report.totalOccupied, icon: CheckCircle, color: '#059669' },
          { label: 'شاغرة', value: report.totalVacant, icon: XCircle, color: '#DC2626' },
          { label: 'نسبة الإشغال', value: `${report.avgRate}%`, icon: Percent, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {report.byProperty.length === 0 ? <EmptyState title="لا توجد عقارات" description="" /> : (
        <div className="space-y-3">
          {report.byProperty.map((p, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-primary" />
                  <div>
                    <p className="font-bold text-sm text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.type} - {p.total} وحدة</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${p.rate >= 80 ? 'text-emerald-400' : p.rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{p.rate}%</span>
              </div>
              {/* شريط الإشغال */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-sidebar rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${p.rate >= 80 ? 'bg-emerald-500' : p.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${p.rate}%` }} />
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-emerald-400">{p.occupied} مشغولة</span>
                  <span className="text-red-400">{p.vacant} شاغرة</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
