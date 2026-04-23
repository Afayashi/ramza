/*
 * الجدول الزمني للدفعات - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Calendar, DollarSign, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';

export default function PaymentTimeline() {
  const { data, loading } = useEntityData('Payment');
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const filtered = data.filter(p => !search || (p['اسم_المستأجر'] || p.tenant_name || '').includes(search));
    const groups: Record<string, any[]> = {};
    filtered.forEach(p => {
      const date = p['تاريخ_الدفع'] || p.payment_date || p.created_date || '';
      const month = date ? new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : 'بدون تاريخ';
      if (!groups[month]) groups[month] = [];
      groups[month].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'بدون تاريخ') return 1;
      if (b === 'بدون تاريخ') return -1;
      return 0;
    });
  }, [data, search]);

  const totalPaid = data.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
  const totalDue = data.filter(p => !['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);

  if (loading) return <DashboardLayout pageTitle="الجدول الزمني للدفعات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="الجدول الزمني للدفعات">
      <PageHeader title="الجدول الزمني للدفعات" description={`${data.length} دفعة`} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {[
          { label: 'إجمالي الدفعات', value: data.length, color: '#C8A951', fmt: false },
          { label: 'المدفوع', value: totalPaid, color: '#059669', fmt: true },
          { label: 'المستحق', value: totalDue, color: '#DC2626', fmt: true },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.fmt ? `${Number(s.value).toLocaleString('ar-SA')} ر.س` : s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالمستأجر..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {grouped.length === 0 ? <EmptyState title="لا توجد دفعات" description="" /> : (
        <div className="relative">
          <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {grouped.map(([month, payments]) => (
              <div key={month}>
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10 shrink-0">
                    <Calendar size={14} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{month}</h3>
                  <span className="text-[10px] text-muted-foreground">({payments.length} دفعة)</span>
                </div>
                <div className="mr-10 space-y-2">
                  {payments.map((p: any) => {
                    const isPaid = ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '');
                    return (
                      <div key={p.id} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isPaid ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                            <div>
                              <p className="text-xs font-medium text-foreground">{p['اسم_المستأجر'] || p.tenant_name || 'بدون اسم'}</p>
                              <p className="text-[10px] text-muted-foreground">{p['تاريخ_الدفع'] || p.payment_date || ''}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className={`text-xs font-bold ${isPaid ? 'text-emerald-400' : 'text-red-400'}`}>
                              {Number(p['مبلغ_الدفعة'] || p.amount || 0).toLocaleString('ar-SA')} ر.س
                            </p>
                            <p className={`text-[10px] ${isPaid ? 'text-emerald-400' : 'text-red-400'}`}>{isPaid ? 'مدفوع' : 'مستحق'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
