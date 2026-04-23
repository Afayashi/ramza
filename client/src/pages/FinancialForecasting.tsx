/*
 * التنبؤ المالي - رمز الإبداع
 */
import { useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign, BarChart2, ArrowUp, ArrowDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function FinancialForecasting() {
  const { data, loading } = useMultiEntityData([{ name: 'Payment' }, { name: 'Expense' }, { name: 'Lease' }]);

  const forecast = useMemo(() => {
    const leases = data.Lease || [];
    const monthlyRent = leases.reduce((s, l) => s + Number(l['قيمة_الإيجار'] || l.rent_amount || 0), 0);
    const avgExpense = (data.Expense || []).reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0) / Math.max((data.Expense || []).length, 1) * 5;
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const growth = 1 + (i * 0.02);
      months.push({
        month: MONTHS[m.getMonth()], year: m.getFullYear(),
        income: Math.round(monthlyRent * growth),
        expense: Math.round(avgExpense * (1 + i * 0.01)),
        net: Math.round(monthlyRent * growth - avgExpense * (1 + i * 0.01)),
      });
    }
    return months;
  }, [data]);

  const maxVal = Math.max(...forecast.map(f => Math.max(f.income, f.expense)), 1);

  if (loading) return <DashboardLayout pageTitle="التنبؤ المالي"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="التنبؤ المالي">
      <PageHeader title="التنبؤ المالي" description="توقعات الإيرادات والمصروفات للأشهر القادمة" />

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h3 className="font-bold text-sm text-foreground mb-4">التوقعات الشهرية</h3>
        <div className="space-y-4">
          {forecast.map(f => (
            <div key={f.month + f.year}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{f.month} {f.year}</span>
                <span className={`text-xs font-bold ${f.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {f.net >= 0 ? <ArrowUp size={10} className="inline" /> : <ArrowDown size={10} className="inline" />}
                  {' '}{f.net.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              <div className="flex gap-1 h-4">
                <div className="bg-emerald-500/30 rounded-sm" style={{ width: `${(f.income / maxVal) * 100}%` }} title={`إيراد: ${f.income.toLocaleString()}`} />
                <div className="bg-red-500/30 rounded-sm" style={{ width: `${(f.expense / maxVal) * 100}%` }} title={`مصروف: ${f.expense.toLocaleString()}`} />
              </div>
              <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                <span>إيراد: {f.income.toLocaleString('ar-SA')} ر.س</span>
                <span>مصروف: {f.expense.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-border text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/30" /> إيرادات متوقعة</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/30" /> مصروفات متوقعة</span>
        </div>
      </div>

      <div className="bg-sidebar/50 border border-border rounded-xl p-4 text-center">
        <BarChart2 size={24} className="mx-auto text-primary mb-2" />
        <p className="text-xs text-muted-foreground">التوقعات مبنية على البيانات الحالية وقد تختلف عن الواقع</p>
      </div>
    </DashboardLayout>
  );
}
