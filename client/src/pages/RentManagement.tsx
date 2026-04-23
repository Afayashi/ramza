/*
 * إدارة الإيجارات - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { DollarSign, Search, TrendingUp, TrendingDown, Building2, Users, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function RentManagement() {
  const { data, loading } = useMultiEntityData([
    { name: 'Lease' }, { name: 'Unit' }, { name: 'Property' },
  ]);
  const [search, setSearch] = useState('');

  const leases = useMemo(() => {
    return (data.Lease || []).filter(l => {
      if (!search) return true;
      return (l['اسم_المستأجر'] || l.tenant_name || '').includes(search) ||
        (l['رقم_الوحدة'] || l.unit_number || '').includes(search);
    }).map(l => {
      const unit = (data.Unit || []).find(u => u.id === l.unit_id || u.id === l['معرف_الوحدة']);
      const property = unit ? (data.Property || []).find(p => p.id === unit.property_id || p.id === unit['معرف_العقار']) : null;
      return {
        ...l,
        unitName: unit ? (unit['رقم_الوحدة'] || unit.unit_number || '') : '',
        propertyName: property ? (property['اسم_العقار'] || property.name || '') : '',
        rent: Number(l['قيمة_الإيجار'] || l.rent_amount || l['الإيجار_الشهري'] || 0),
        status: l['حالة_العقد'] || l.status || '',
        startDate: l['تاريخ_البداية'] || l.start_date || '',
        endDate: l['تاريخ_النهاية'] || l.end_date || '',
        tenantName: l['اسم_المستأجر'] || l.tenant_name || 'بدون اسم',
      };
    });
  }, [data, search]);

  const totalRent = leases.filter(l => ['ساري', 'active', 'نشط'].includes(l.status)).reduce((s, l) => s + l.rent, 0);

  if (loading) return <DashboardLayout pageTitle="إدارة الإيجارات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="إدارة الإيجارات">
      <PageHeader title="إدارة الإيجارات" description={`${leases.length} عقد إيجار`} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {[
          { label: 'إجمالي العقود', value: leases.length, color: '#C8A951' },
          { label: 'عقود سارية', value: leases.filter(l => ['ساري', 'active', 'نشط'].includes(l.status)).length, color: '#059669' },
          { label: 'إجمالي الإيجارات الشهرية', value: `${totalRent.toLocaleString('ar-SA')} ر.س`, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالمستأجر أو الوحدة..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {leases.length === 0 ? <EmptyState title="لا توجد عقود إيجار" description="" /> : (
        <div className="space-y-2">
          {leases.map((l: any) => (
            <div key={l.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${['ساري', 'active', 'نشط'].includes(l.status) ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                    <DollarSign size={16} className={['ساري', 'active', 'نشط'].includes(l.status) ? 'text-emerald-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">{l.tenantName}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                      {l.propertyName && <span className="flex items-center gap-1"><Building2 size={9} />{l.propertyName}</span>}
                      {l.unitName && <span>- وحدة {l.unitName}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">{l.rent.toLocaleString('ar-SA')} ر.س</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${['ساري', 'active', 'نشط'].includes(l.status) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {l.status || 'غير محدد'}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={9} /> من: {l.startDate}</span>
                <span className="flex items-center gap-1"><Calendar size={9} /> إلى: {l.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
