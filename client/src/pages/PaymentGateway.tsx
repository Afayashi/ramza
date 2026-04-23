/*
 * بوابة الدفع - رمز الإبداع
 */
import { useMemo } from 'react';
import { CreditCard, DollarSign, CheckCircle, Clock, Shield, Smartphone, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';
import { toast } from 'sonner';

export default function PaymentGateway() {
  const { data, loading } = useEntityData('Payment');

  const stats = useMemo(() => {
    const paid = data.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || ''));
    const pending = data.filter(p => !['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || ''));
    return {
      totalPaid: paid.reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0),
      totalPending: pending.reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0),
      paidCount: paid.length, pendingCount: pending.length,
    };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="بوابة الدفع"><LoadingState /></DashboardLayout>;

  const methods = [
    { name: 'تحويل بنكي', icon: Building2, desc: 'تحويل مباشر للحساب البنكي', active: true },
    { name: 'مدى / فيزا', icon: CreditCard, desc: 'الدفع بالبطاقة البنكية', active: true },
    { name: 'Apple Pay', icon: Smartphone, desc: 'الدفع عبر Apple Pay', active: false },
    { name: 'سداد', icon: Shield, desc: 'نظام سداد للمدفوعات', active: false },
  ];

  return (
    <DashboardLayout pageTitle="بوابة الدفع">
      <PageHeader title="بوابة الدفع" description="إدارة طرق الدفع والمعاملات المالية" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي المحصل', value: `${(stats.totalPaid / 1000).toFixed(0)}K`, icon: CheckCircle, color: '#059669' },
          { label: 'مستحقات معلقة', value: `${(stats.totalPending / 1000).toFixed(0)}K`, icon: Clock, color: '#D97706' },
          { label: 'عمليات ناجحة', value: stats.paidCount, icon: DollarSign, color: '#C8A951' },
          { label: 'بانتظار الدفع', value: stats.pendingCount, icon: CreditCard, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h3 className="font-bold text-sm text-foreground mb-3">طرق الدفع المتاحة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {methods.map(m => (
            <div key={m.name} onClick={() => toast.info(m.active ? `${m.name} مفعل` : 'تفعيل (ميزة قادمة)')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${m.active ? 'border-primary/30 bg-primary/5' : 'border-border bg-sidebar'}`}>
              <m.icon size={20} className={m.active ? 'text-primary mb-2' : 'text-muted-foreground mb-2'} />
              <p className="text-xs font-medium text-foreground">{m.name}</p>
              <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              <span className={`text-[10px] mt-1 inline-block ${m.active ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {m.active ? 'مفعل' : 'غير مفعل'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {data.length === 0 ? <EmptyState title="لا توجد معاملات" description="" /> : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border"><h3 className="font-bold text-sm text-foreground">آخر المعاملات</h3></div>
          <div className="divide-y divide-border">
            {data.slice(0, 15).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-sidebar/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '') ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                    {['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '') ? <CheckCircle size={12} className="text-emerald-400" /> : <Clock size={12} className="text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{p['اسم_المستأجر'] || p.tenant_name || 'دفعة'}</p>
                    <p className="text-[10px] text-muted-foreground">{p['تاريخ_الدفع'] || p.payment_date || p['تاريخ_الاستحقاق'] || ''}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-primary">{Number(p['مبلغ_الدفعة'] || p.amount || 0).toLocaleString('ar-SA')} ر.س</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
