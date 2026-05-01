/*
 * تقرير عقار منفرد - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Building2, DollarSign, Users, Home, Wrench, FileText, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { useLocation } from 'wouter';

export default function PropertySingleReport() {
  const [, setLocation] = useLocation();
  const { data, loading } = useMultiEntityData([{ name: 'Property' }, { name: 'Unit' }, { name: 'Payment' }, { name: 'Expense' }, { name: 'Maintenance' }]);
  const [selectedId, setSelectedId] = useState<string>('');

  const properties = data.Property || [];
  const selected = selectedId ? properties.find(p => String(p.id) === selectedId) : null;

  const report = useMemo(() => {
    if (!selected) return null;
    const units = (data.Unit || []).filter(u => u.property_id === selected.id || u['معرف_العقار'] === selected.id);
    const payments = (data.Payment || []).filter(p => p.property_id === selected.id || p['معرف_العقار'] === selected.id);
    const expenses = (data.Expense || []).filter(e => e.property_id === selected.id || e['معرف_العقار'] === selected.id);
    const maint = (data.Maintenance || []).filter(m => m.property_id === selected.id || m['معرف_العقار'] === selected.id);
    const income = payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExp = expenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    const occupied = units.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
    return { units: units.length, occupied, income, totalExp, net: income - totalExp, maint: maint.length, occupancy: units.length > 0 ? Math.round((occupied / units.length) * 100) : 0 };
  }, [selected, data]);

  if (loading) return <DashboardLayout pageTitle="تقرير عقار منفرد"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="تقرير عقار منفرد">
      <PageHeader title="تقرير عقار منفرد" description="اختر عقاراً لعرض تقريره المفصل" />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setLocation(selectedId ? `/property-official-report?propertyId=${selectedId}` : '/property-official-report')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#C8A951] text-black font-medium hover:bg-[#b8973f] transition-all">
          <FileText size={11} /> نموذج التقرير الرسمي
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {properties.map(p => (
          <button key={p.id} onClick={() => setSelectedId(String(p.id))}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${String(p.id) === selectedId ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/30'}`}>
            <Building2 size={10} className="inline ml-1" /> {p['اسم_العقار'] || p.name || 'بدون اسم'}
          </button>
        ))}
      </div>

      {!report ? <EmptyState title="اختر عقاراً" description="اضغط على أحد العقارات أعلاه لعرض التقرير" /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'الوحدات', value: report.units, icon: Home, color: '#C8A951' },
              { label: 'نسبة الإشغال', value: `${report.occupancy}%`, icon: Users, color: '#059669' },
              { label: 'الإيرادات', value: `${(report.income / 1000).toFixed(0)}K`, icon: TrendingUp, color: '#3b82f6' },
              { label: 'صافي الدخل', value: `${(report.net / 1000).toFixed(0)}K`, icon: DollarSign, color: report.net >= 0 ? '#059669' : '#DC2626' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
                <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-bold text-sm text-foreground mb-3">ملخص التقرير</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'اسم العقار', value: selected?.['اسم_العقار'] || selected?.name || '' },
                { label: 'النوع', value: selected?.['نوع_العقار'] || selected?.type || '' },
                { label: 'العنوان', value: selected?.['العنوان'] || selected?.address || '' },
                { label: 'عدد الوحدات', value: report.units },
                { label: 'وحدات مشغولة', value: report.occupied },
                { label: 'إجمالي الإيرادات', value: `${report.income.toLocaleString('ar-SA')} ر.س` },
                { label: 'إجمالي المصروفات', value: `${report.totalExp.toLocaleString('ar-SA')} ر.س` },
                { label: 'صافي الدخل', value: `${report.net.toLocaleString('ar-SA')} ر.س` },
                { label: 'طلبات الصيانة', value: report.maint },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
