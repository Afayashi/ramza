/*
 * تحليلات المستأجرين - رمز الإبداع
 */
import { useMemo } from 'react';
import { BarChart2, Users, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function TenantAnalytics() {
  const { data, loading } = useMultiEntityData([
    { name: 'Tenant' }, { name: 'Lease' }, { name: 'Payment' }, { name: 'Complaint' },
  ]);

  const analytics = useMemo(() => {
    const tenants = data.Tenant || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];
    const complaints = data.Complaint || [];
    const active = leases.filter(l => ['ساري', 'active', 'نشط'].includes(l['حالة_العقد'] || l.status || ''));
    const totalPaid = payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalDue = payments.filter(p => !['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const avgPayment = payments.length > 0 ? totalPaid / payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).length : 0;

    // أعلى 10 مستأجرين بالدفعات
    const tenantPayments = tenants.map(t => {
      const tPayments = payments.filter(p => p.tenant_id === t.id || p['معرف_المستأجر'] === t.id);
      const paid = tPayments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
      const overdue = tPayments.filter(p => ['متأخر', 'overdue'].includes(p['حالة_الدفع'] || p.status || '')).length;
      const tComplaints = complaints.filter(c => c.tenant_id === t.id || c['معرف_المستأجر'] === t.id).length;
      return { name: t['اسم_المستأجر'] || t.name || 'بدون اسم', paid, overdue, complaints: tComplaints };
    }).sort((a, b) => b.paid - a.paid).slice(0, 10);

    return { total: tenants.length, activeLeases: active.length, totalPaid, totalDue, avgPayment, openComplaints: complaints.filter(c => !['مغلقة', 'closed'].includes(c['الحالة'] || c.status || '')).length, tenantPayments };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="تحليلات المستأجرين"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="تحليلات المستأجرين">
      <PageHeader title="تحليلات المستأجرين" description="تحليل شامل لبيانات المستأجرين والأداء المالي" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي المستأجرين', value: analytics.total, icon: Users, color: '#C8A951', fmt: false },
          { label: 'عقود سارية', value: analytics.activeLeases, icon: CheckCircle, color: '#059669', fmt: false },
          { label: 'إجمالي المدفوع', value: analytics.totalPaid, icon: DollarSign, color: '#059669', fmt: true },
          { label: 'مبالغ مستحقة', value: analytics.totalDue, icon: AlertTriangle, color: '#DC2626', fmt: true },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.fmt ? `${s.value.toLocaleString('ar-SA')} ر.س` : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* أعلى المستأجرين */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Star size={14} className="text-amber-400" /> أعلى المستأجرين (بالمدفوعات)</h3>
          <div className="space-y-2">
            {analytics.tenantPayments.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-sidebar">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                  <span className="text-xs text-foreground font-medium">{t.name}</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold">{t.paid.toLocaleString('ar-SA')} ر.س</span>
              </div>
            ))}
            {analytics.tenantPayments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد بيانات</p>}
          </div>
        </div>

        {/* ملخص الأداء */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><BarChart2 size={14} className="text-primary" /> ملخص الأداء</h3>
          <div className="space-y-3">
            {[
              { label: 'متوسط الدفعة', value: `${Math.round(analytics.avgPayment).toLocaleString('ar-SA')} ر.س`, color: '#C8A951' },
              { label: 'نسبة التحصيل', value: analytics.totalPaid + analytics.totalDue > 0 ? `${Math.round((analytics.totalPaid / (analytics.totalPaid + analytics.totalDue)) * 100)}%` : '0%', color: '#059669' },
              { label: 'شكاوى مفتوحة', value: analytics.openComplaints, color: '#D97706' },
              { label: 'معدل الإشغال', value: analytics.total > 0 ? `${Math.round((analytics.activeLeases / analytics.total) * 100)}%` : '0%', color: '#3b82f6' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-sidebar">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
