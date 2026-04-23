/*
 * مقارنة العقارات - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Building2, Check, X, ArrowUpDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function PropertyComparison() {
  const { data, loading } = useMultiEntityData([{ name: 'Property' }, { name: 'Unit' }, { name: 'Payment' }]);
  const [selected, setSelected] = useState<string[]>([]);

  const properties = useMemo(() => {
    return (data.Property || []).map(p => {
      const units = (data.Unit || []).filter(u => u.property_id === p.id || u['معرف_العقار'] === p.id);
      const occupied = units.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
      const payments = (data.Payment || []).filter(pay => pay.property_id === p.id || pay['معرف_العقار'] === p.id);
      const income = payments.filter(pay => ['مدفوع', 'paid'].includes(pay['حالة_الدفع'] || pay.status || '')).reduce((s, pay) => s + Number(pay['مبلغ_الدفعة'] || pay.amount || 0), 0);
      return {
        id: String(p.id), name: p['اسم_العقار'] || p.name || 'بدون اسم',
        type: p['نوع_العقار'] || p.type || '', address: p['العنوان'] || p.address || '',
        totalUnits: units.length, occupied, occupancy: units.length > 0 ? Math.round((occupied / units.length) * 100) : 0,
        income,
      };
    });
  }, [data]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const compared = properties.filter(p => selected.includes(p.id));

  if (loading) return <DashboardLayout pageTitle="مقارنة العقارات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="مقارنة العقارات">
      <PageHeader title="مقارنة العقارات" description="اختر حتى 3 عقارات للمقارنة" />

      {/* اختيار العقارات */}
      <div className="flex flex-wrap gap-2 mb-6">
        {properties.map(p => (
          <button key={p.id} onClick={() => toggleSelect(p.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${selected.includes(p.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/30'}`}>
            {selected.includes(p.id) && <Check size={10} className="inline ml-1" />}
            {p.name}
          </button>
        ))}
      </div>

      {compared.length < 2 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <ArrowUpDown size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">اختر عقارين على الأقل للمقارنة</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-sidebar/50">
                <th className="text-right p-3 font-medium text-muted-foreground">المعيار</th>
                {compared.map(p => <th key={p.id} className="text-center p-3 font-bold text-foreground">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'النوع', key: 'type' },
                { label: 'العنوان', key: 'address' },
                { label: 'عدد الوحدات', key: 'totalUnits', isNum: true },
                { label: 'مشغولة', key: 'occupied', isNum: true },
                { label: 'نسبة الإشغال', key: 'occupancy', suffix: '%', isNum: true },
                { label: 'الإيرادات', key: 'income', isCurrency: true },
              ].map(row => (
                <tr key={row.key} className="border-b border-border hover:bg-sidebar/30">
                  <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                  {compared.map(p => {
                    const val = (p as any)[row.key];
                    const best = row.isNum ? Math.max(...compared.map(c => Number((c as any)[row.key]) || 0)) : null;
                    const isBest = row.isNum && Number(val) === best && best > 0;
                    return (
                      <td key={p.id} className={`p-3 text-center ${isBest ? 'text-emerald-400 font-bold' : 'text-foreground'}`}>
                        {row.isCurrency ? `${Number(val).toLocaleString('ar-SA')} ر.س` : `${val}${row.suffix || ''}`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
