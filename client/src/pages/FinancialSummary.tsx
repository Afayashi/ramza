/*
 * الملخص المالي - رمز الإبداع
 */
import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart2, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function FinancialSummary() {
  const { data, loading } = useMultiEntityData([{ name: 'Payment' }, { name: 'Expense' }, { name: 'Invoice' }]);

  const stats = useMemo(() => {
    const payments = data.Payment || [];
    const expenses = data.Expense || [];
    const income = payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const pending = payments.filter(p => !['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExp = expenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    const net = income - totalExp;
    const collectionRate = income + pending > 0 ? Math.round((income / (income + pending)) * 100) : 0;
    return { income, pending, totalExp, net, collectionRate, paymentCount: payments.length, expenseCount: expenses.length };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="الملخص المالي"><LoadingState /></DashboardLayout>;

  const items = [
    { label: 'إجمالي الإيرادات', value: stats.income, icon: TrendingUp, color: '#059669', desc: `${stats.paymentCount} عملية دفع` },
    { label: 'إجمالي المصروفات', value: stats.totalExp, icon: TrendingDown, color: '#DC2626', desc: `${stats.expenseCount} مصروف` },
    { label: 'صافي الدخل', value: stats.net, icon: DollarSign, color: stats.net >= 0 ? '#C8A951' : '#DC2626', desc: stats.net >= 0 ? 'ربح' : 'خسارة' },
    { label: 'مستحقات معلقة', value: stats.pending, icon: Calendar, color: '#D97706', desc: 'بانتظار التحصيل' },
  ];

  return (
    <DashboardLayout pageTitle="الملخص المالي">
      <PageHeader title="الملخص المالي" description="نظرة شاملة على الوضع المالي" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        {items.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value.toLocaleString('ar-SA')} ر.س</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-bold text-sm text-foreground mb-3">نسبة التحصيل</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-sidebar" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#C8A951" strokeWidth="2" strokeDasharray={`${stats.collectionRate} ${100 - stats.collectionRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">{stats.collectionRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground font-medium">نسبة التحصيل الحالية</p>
            <p className="text-[10px] text-muted-foreground mt-1">محصّل: {stats.income.toLocaleString('ar-SA')} ر.س</p>
            <p className="text-[10px] text-muted-foreground">معلق: {stats.pending.toLocaleString('ar-SA')} ر.س</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
