/*
 * صفحة التقارير المالية - رمز الإبداع
 */
import { useState, useMemo } from 'react';
import { BarChart2, DollarSign, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useMultiEntityData } from '@/hooks/useEntityData';

const fmt = (v: number) => `${(v || 0).toLocaleString('ar-SA')} ر.س`;

export default function FinancialReports() {
  const { data, loading } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 2000 },
    { name: 'Expense', sort: '-created_date', limit: 1000 },
  ]);
  const payments = data.Payment || [];
  const expenses = data.Expense || [];
  const [period, setPeriod] = useState('all');

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const thisYear = now.getFullYear().toString();

    const filterByPeriod = (date: string) => {
      if (period === 'month') return date?.startsWith(thisMonth);
      if (period === 'year') return date?.startsWith(thisYear);
      return true;
    };

    const paidPayments = payments.filter(p => {
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const date = p['تاريخ_الدفع'] || p.created_date || '';
      return (status === 'مدفوع' || status === 'مكتمل') && filterByPeriod(date);
    });

    const filteredExpenses = expenses.filter(e => {
      const date = e.date || e.created_date || '';
      return (e.status === 'paid' || !e.status) && filterByPeriod(date);
    });

    const totalRevenue = paidPayments.reduce((s, p) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    // Monthly breakdown
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
    paidPayments.forEach(p => {
      const month = (p['تاريخ_الدفع'] || p.created_date || '').slice(0, 7);
      if (!month) return;
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
      monthlyData[month].revenue += parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0);
    });
    filteredExpenses.forEach(e => {
      const month = (e.date || e.created_date || '').slice(0, 7);
      if (!month) return;
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
      monthlyData[month].expenses += parseFloat(e.amount || 0);
    });

    const months = Object.keys(monthlyData).sort().slice(-12);

    return {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      paymentCount: paidPayments.length,
      months: months.map(m => ({
        month: m,
        revenue: monthlyData[m].revenue,
        expenses: monthlyData[m].expenses,
        net: monthlyData[m].revenue - monthlyData[m].expenses,
      })),
    };
  }, [payments, expenses, period]);

  return (
    <DashboardLayout pageTitle="التقارير المالية">
      <PageHeader title="التقارير المالية" description="ملخص شامل للأداء المالي">
        <div className="flex gap-1">
          {[
            { key: 'month', label: 'هذا الشهر' },
            { key: 'year', label: 'هذا العام' },
            { key: 'all', label: 'الكل' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${period === p.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل التقارير..." />
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي الإيرادات" value={fmt(stats.totalRevenue)} icon={TrendingUp} />
            <StatCard title="إجمالي المصروفات" value={fmt(stats.totalExpenses)} icon={TrendingDown} />
            <StatCard title="صافي الدخل" value={fmt(stats.netIncome)} icon={DollarSign} />
            <StatCard title="عدد الدفعات" value={stats.paymentCount} icon={BarChart2} />
          </div>

          {/* Monthly Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-foreground">التفصيل الشهري</h3>
              <Calendar size={16} className="text-muted-foreground" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">الشهر</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">الإيرادات</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">المصروفات</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.months.map(m => (
                    <tr key={m.month} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{m.month}</td>
                      <td className="px-4 py-3 text-green-400">{fmt(m.revenue)}</td>
                      <td className="px-4 py-3 text-red-400">{fmt(m.expenses)}</td>
                      <td className={`px-4 py-3 font-semibold ${m.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {fmt(m.net)}
                      </td>
                    </tr>
                  ))}
                  {stats.months.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">لا توجد بيانات للفترة المحددة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
