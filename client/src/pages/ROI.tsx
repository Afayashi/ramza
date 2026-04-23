/*
 * العائد على الاستثمار - رمز الإبداع
 */
import { useMemo } from 'react';
import { TrendingUp, Building2, DollarSign, Percent, BarChart2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function ROI() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property' }, { name: 'Payment' }, { name: 'Expense' },
  ]);

  const analysis = useMemo(() => {
    const properties = data.Property || [];
    const payments = data.Payment || [];
    const expenses = data.Expense || [];

    return properties.map(p => {
      const pPayments = payments.filter(pay => pay.property_id === p.id || pay['معرف_العقار'] === p.id);
      const pExpenses = expenses.filter(e => e.property_id === p.id || e['معرف_العقار'] === p.id);
      const income = pPayments.filter(pay => ['مدفوع', 'paid'].includes(pay['حالة_الدفع'] || pay.status || '')).reduce((s, pay) => s + Number(pay['مبلغ_الدفعة'] || pay.amount || 0), 0);
      const expense = pExpenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
      const net = income - expense;
      const value = Number(p['قيمة_العقار'] || p.value || 0);
      const roi = value > 0 ? ((net / value) * 100) : 0;

      return {
        name: p['اسم_العقار'] || p.name || 'بدون اسم',
        type: p['نوع_العقار'] || p.type || '',
        income, expense, net, value, roi: Math.round(roi * 10) / 10,
      };
    }).sort((a, b) => b.roi - a.roi);
  }, [data]);

  const totalIncome = analysis.reduce((s, a) => s + a.income, 0);
  const totalExpense = analysis.reduce((s, a) => s + a.expense, 0);
  const totalValue = analysis.reduce((s, a) => s + a.value, 0);
  const avgROI = totalValue > 0 ? Math.round(((totalIncome - totalExpense) / totalValue) * 1000) / 10 : 0;

  if (loading) return <DashboardLayout pageTitle="العائد على الاستثمار"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="العائد على الاستثمار">
      <PageHeader title="العائد على الاستثمار" description="تحليل العائد المالي لكل عقار" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي الإيرادات', value: totalIncome, color: '#059669', fmt: true },
          { label: 'إجمالي المصروفات', value: totalExpense, color: '#DC2626', fmt: true },
          { label: 'صافي الدخل', value: totalIncome - totalExpense, color: '#C8A951', fmt: true },
          { label: 'متوسط العائد', value: `${avgROI}%`, color: '#3b82f6', fmt: false },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.fmt ? `${Number(s.value).toLocaleString('ar-SA')} ر.س` : s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {analysis.length === 0 ? <EmptyState title="لا توجد عقارات" description="أضف عقارات لعرض تحليل العائد" /> : (
        <div className="space-y-3">
          {analysis.map((a, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.type}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${a.roi >= 5 ? 'bg-emerald-500/15 text-emerald-400' : a.roi >= 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                  {a.roi}% ROI
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'قيمة العقار', value: a.value, color: '#C8A951' },
                  { label: 'الإيرادات', value: a.income, color: '#059669' },
                  { label: 'المصروفات', value: a.expense, color: '#DC2626' },
                  { label: 'صافي الدخل', value: a.net, color: a.net >= 0 ? '#059669' : '#DC2626' },
                ].map(f => (
                  <div key={f.label} className="text-center">
                    <p className="text-[10px] text-muted-foreground">{f.label}</p>
                    <p className="text-xs font-bold" style={{ color: f.color }}>{f.value.toLocaleString('ar-SA')} ر.س</p>
                  </div>
                ))}
              </div>
              {/* شريط التقدم */}
              <div className="mt-3 h-2 bg-sidebar rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${a.roi >= 5 ? 'bg-emerald-500' : a.roi >= 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.max(a.roi, 0), 20) * 5}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
