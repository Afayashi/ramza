/*
 * المحاسبة - رمز الإبداع
 */
import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpDown, FileText, Calculator } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function Accounting() {
  const { data, loading } = useMultiEntityData([{ name: 'Payment' }, { name: 'Expense' }, { name: 'Invoice' }]);

  const stats = useMemo(() => {
    const payments = data.Payment || [];
    const expenses = data.Expense || [];
    const income = payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    const net = income - totalExpenses;
    const pending = payments.filter(p => !['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    return { income, totalExpenses, net, pending };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="المحاسبة"><LoadingState /></DashboardLayout>;

  const entries = [
    ...(data.Payment || []).map(p => ({ type: 'إيراد', desc: p['وصف_الدفعة'] || p.description || 'دفعة إيجار', amount: Number(p['مبلغ_الدفعة'] || p.amount || 0), date: p['تاريخ_الدفع'] || p.payment_date || p['تاريخ_الاستحقاق'] || '', status: p['حالة_الدفع'] || p.status || '' })),
    ...(data.Expense || []).map(e => ({ type: 'مصروف', desc: e['الوصف'] || e.description || 'مصروف', amount: -Number(e['المبلغ'] || e.amount || 0), date: e['التاريخ'] || e.date || '', status: 'مدفوع' })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 30);

  return (
    <DashboardLayout pageTitle="المحاسبة">
      <PageHeader title="المحاسبة" description="دفتر الحسابات والقيود المحاسبية" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'الإيرادات', value: stats.income, icon: TrendingUp, color: '#059669' },
          { label: 'المصروفات', value: stats.totalExpenses, icon: TrendingDown, color: '#DC2626' },
          { label: 'صافي الدخل', value: stats.net, icon: DollarSign, color: stats.net >= 0 ? '#C8A951' : '#DC2626' },
          { label: 'مستحقات معلقة', value: stats.pending, icon: Calculator, color: '#D97706' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} style={{ color: s.color }} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value.toLocaleString('ar-SA')} ر.س</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <FileText size={14} className="text-primary" />
          <h3 className="font-bold text-sm text-foreground">سجل القيود</h3>
        </div>
        <div className="divide-y divide-border">
          {entries.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-sidebar/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${e.amount >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                  {e.amount >= 0 ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{e.desc}</p>
                  <p className="text-[10px] text-muted-foreground">{e.date} - {e.type}</p>
                </div>
              </div>
              <p className={`text-xs font-bold ${e.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString('ar-SA')} ر.س
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
