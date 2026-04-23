/*
 * كشوف الحسابات - رمز الإبداع
 * عرض ملخص مالي شامل مع كشوف حسابات المستأجرين
 */
import { useState, useMemo } from 'react';
import { DollarSign, Search, Users, TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

export default function FinancialStatements() {
  const { data, loading } = useMultiEntityData([
    { name: 'Payment' }, { name: 'Expense' }, { name: 'Tenant' }, { name: 'Lease' },
  ]);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');

  const summary = useMemo(() => {
    const payments = data.Payment || [];
    const expenses = data.Expense || [];
    const now = new Date();
    const filterByPeriod = (dateStr: string) => {
      if (period === 'all') return true;
      const d = new Date(dateStr);
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === 'quarter') { const q = Math.floor(now.getMonth() / 3); return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear(); }
      if (period === 'year') return d.getFullYear() === now.getFullYear();
      return true;
    };
    const filteredPayments = payments.filter(p => filterByPeriod(p['تاريخ_الدفع'] || p.payment_date || p.created_date || ''));
    const filteredExpenses = expenses.filter(e => filterByPeriod(e['تاريخ_المصروف'] || e.expense_date || e.created_date || ''));
    const totalIncome = filteredPayments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    const totalOverdue = filteredPayments.filter(p => ['متأخر', 'overdue', 'غير مدفوع'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);

    // كشوف حسابات المستأجرين
    const tenants = data.Tenant || [];
    const tenantStatements = tenants.map(t => {
      const tPayments = filteredPayments.filter(p => p.tenant_id === t.id || p['معرف_المستأجر'] === t.id || (p['اسم_المستأجر'] || '') === (t['اسم_المستأجر'] || t.name || ''));
      const paid = tPayments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
      const due = tPayments.filter(p => !['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
      return { name: t['اسم_المستأجر'] || t.name || 'بدون اسم', paid, due, total: paid + due, count: tPayments.length };
    }).filter(t => t.count > 0 && (!search || t.name.includes(search)));

    return { totalIncome, totalExpenses, net: totalIncome - totalExpenses, totalOverdue, tenantStatements };
  }, [data, period, search]);

  if (loading) return <DashboardLayout pageTitle="كشوف الحسابات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="كشوف الحسابات">
      <PageHeader title="كشوف الحسابات" description="ملخص مالي شامل مع كشوف حسابات المستأجرين">
        <div className="flex gap-1 bg-sidebar rounded-lg p-0.5">
          {[{ id: 'all', label: 'الكل' }, { id: 'month', label: 'الشهر' }, { id: 'quarter', label: 'الربع' }, { id: 'year', label: 'السنة' }].map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* ملخص مالي */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي الإيرادات', value: summary.totalIncome, icon: TrendingUp, color: '#059669' },
          { label: 'إجمالي المصروفات', value: summary.totalExpenses, icon: TrendingDown, color: '#DC2626' },
          { label: 'صافي الدخل', value: summary.net, icon: DollarSign, color: summary.net >= 0 ? '#C8A951' : '#DC2626' },
          { label: 'مبالغ متأخرة', value: summary.totalOverdue, icon: Calendar, color: '#D97706' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span></p>
          </div>
        ))}
      </div>

      {/* كشوف حسابات المستأجرين */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Users size={14} /> كشوف حسابات المستأجرين</h3>
          <div className="relative w-48">
            <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-sidebar border border-border rounded-lg pr-8 pl-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        {summary.tenantStatements.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">لا توجد كشوف حسابات</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-right p-2.5 font-medium">المستأجر</th>
                  <th className="text-right p-2.5 font-medium">المدفوع</th>
                  <th className="text-right p-2.5 font-medium">المستحق</th>
                  <th className="text-right p-2.5 font-medium">الإجمالي</th>
                  <th className="text-right p-2.5 font-medium">عدد الدفعات</th>
                  <th className="text-right p-2.5 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {summary.tenantStatements.map((t, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-sidebar/50 transition-colors">
                    <td className="p-2.5 font-medium text-foreground">{t.name}</td>
                    <td className="p-2.5 text-emerald-400">{t.paid.toLocaleString('ar-SA')} ر.س</td>
                    <td className="p-2.5 text-red-400">{t.due.toLocaleString('ar-SA')} ر.س</td>
                    <td className="p-2.5 text-foreground font-bold">{t.total.toLocaleString('ar-SA')} ر.س</td>
                    <td className="p-2.5 text-muted-foreground">{t.count}</td>
                    <td className="p-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.due === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {t.due === 0 ? 'سدد بالكامل' : 'متأخر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="p-2.5 text-foreground">الإجمالي</td>
                  <td className="p-2.5 text-emerald-400">{summary.tenantStatements.reduce((s, t) => s + t.paid, 0).toLocaleString('ar-SA')} ر.س</td>
                  <td className="p-2.5 text-red-400">{summary.tenantStatements.reduce((s, t) => s + t.due, 0).toLocaleString('ar-SA')} ر.س</td>
                  <td className="p-2.5 text-foreground">{summary.tenantStatements.reduce((s, t) => s + t.total, 0).toLocaleString('ar-SA')} ر.س</td>
                  <td className="p-2.5 text-muted-foreground">{summary.tenantStatements.reduce((s, t) => s + t.count, 0)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
