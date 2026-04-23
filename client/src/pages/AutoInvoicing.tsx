/*
 * الفواتير التلقائية - رمز الإبداع
 */
import { useMemo } from 'react';
import { Receipt, CheckCircle, Clock, AlertTriangle, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AutoInvoicing() {
  const { data, loading } = useEntityData('Invoice');

  const stats = useMemo(() => {
    const paid = data.filter(i => ['مدفوعة', 'paid'].includes(i['الحالة'] || i.status || '')).length;
    const pending = data.filter(i => ['معلقة', 'pending'].includes(i['الحالة'] || i.status || '')).length;
    const overdue = data.filter(i => ['متأخرة', 'overdue'].includes(i['الحالة'] || i.status || '')).length;
    const total = data.reduce((s, i) => s + Number(i['المبلغ'] || i.amount || 0), 0);
    return { paid, pending, overdue, total };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="الفواتير التلقائية"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="الفواتير التلقائية">
      <PageHeader title="الفواتير التلقائية" description="إصدار وإدارة الفواتير تلقائياً">
        <Button size="sm" onClick={() => toast.success('تم إنشاء الفواتير التلقائية (تجريبي)')}><RefreshCw size={14} className="ml-1" /> إنشاء فواتير الشهر</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي الفواتير', value: data.length, icon: Receipt, color: '#C8A951' },
          { label: 'مدفوعة', value: stats.paid, icon: CheckCircle, color: '#059669' },
          { label: 'معلقة', value: stats.pending, icon: Clock, color: '#D97706' },
          { label: 'متأخرة', value: stats.overdue, icon: AlertTriangle, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h3 className="font-bold text-sm text-foreground mb-3">إعدادات الفوترة التلقائية</h3>
        <div className="space-y-3">
          {[
            { label: 'إصدار فواتير تلقائية شهرياً', desc: 'إنشاء فواتير لجميع العقود السارية في بداية كل شهر', enabled: true },
            { label: 'إرسال تذكيرات الدفع', desc: 'إرسال تذكير قبل 5 أيام من تاريخ الاستحقاق', enabled: true },
            { label: 'إشعار الفواتير المتأخرة', desc: 'إرسال إشعار عند تأخر الدفع', enabled: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-sidebar">
              <div>
                <p className="text-xs font-medium text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full ${s.enabled ? 'bg-primary' : 'bg-border'} relative cursor-pointer`} onClick={() => toast.info('تبديل (ميزة قادمة)')}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${s.enabled ? 'left-0.5' : 'right-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.length === 0 ? <EmptyState title="لا توجد فواتير" description="" /> : (
        <div className="space-y-2">
          {data.slice(0, 20).map((inv: any) => (
            <div key={inv.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Receipt size={14} className="text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">{inv['رقم_الفاتورة'] || inv.invoice_number || `فاتورة #${inv.id}`}</p>
                  <p className="text-[10px] text-muted-foreground">{inv['اسم_المستأجر'] || inv.tenant_name || ''} - {inv['تاريخ_الاستحقاق'] || inv.due_date || ''}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-primary">{Number(inv['المبلغ'] || inv.amount || 0).toLocaleString('ar-SA')} ر.س</p>
                <span className={`text-[10px] ${['مدفوعة', 'paid'].includes(inv['الحالة'] || inv.status || '') ? 'text-emerald-400' : ['متأخرة', 'overdue'].includes(inv['الحالة'] || inv.status || '') ? 'text-red-400' : 'text-amber-400'}`}>
                  {inv['الحالة'] || inv.status || 'معلقة'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
