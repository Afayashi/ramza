/*
 * المقترحات الذكية - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 * تحليل ذكي للبيانات وتقديم مقترحات لتحسين الأداء
 */
import { useMemo } from 'react';
import {
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle, DollarSign,
  Building2, Users, Wrench, ArrowUpRight, RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const GOLD = '#C8A951';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'info' | 'success';
  priority: 'high' | 'medium' | 'low';
  icon: any;
  action?: { label: string; path: string };
}

export default function SmartSuggestions() {
  const { data, loading, isDemo, reload } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit', limit: 2000 },
    { name: 'Lease' }, { name: 'Payment' },
    { name: 'Maintenance' }, { name: 'Expense' },
  ]);

  const suggestions = useMemo(() => {
    const items: Suggestion[] = [];
    const units = data.Unit || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];
    const maintenance = data.Maintenance || [];
    const expenses = data.Expense || [];
    const now = new Date();

    // وحدات شاغرة
    const vacant = units.filter(u => ['شاغرة', 'vacant'].includes(u['حالة_الوحدة'] || u.status || ''));
    if (vacant.length > 0) {
      items.push({
        id: 'vacant-units', title: `${vacant.length} وحدة شاغرة تحتاج تسويق`,
        description: `لديك ${vacant.length} وحدة شاغرة. يُنصح بتحسين التسويق عبر المنصات العقارية أو تعديل أسعار الإيجار لزيادة الإشغال.`,
        type: 'warning', priority: 'high', icon: Building2,
        action: { label: 'عرض الوحدات الشاغرة', path: '/unit-status' },
      });
    }

    // عقود تنتهي قريباً
    const expiringLeases = leases.filter(l => {
      const endDate = new Date(l['تاريخ_النهاية'] || l.end_date || '');
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
      return daysLeft > 0 && daysLeft <= 60;
    });
    if (expiringLeases.length > 0) {
      items.push({
        id: 'expiring-leases', title: `${expiringLeases.length} عقد ينتهي خلال 60 يوم`,
        description: `تواصل مع المستأجرين مبكراً لتجديد العقود وتجنب فترات الشغور.`,
        type: 'warning', priority: 'high', icon: AlertTriangle,
        action: { label: 'عرض تنبيهات العقود', path: '/lease-alerts' },
      });
    }

    // دفعات متأخرة
    const overdue = payments.filter(p => ['متأخر', 'overdue', 'غير مدفوع'].includes(p['حالة_الدفع'] || p.status || ''));
    if (overdue.length > 0) {
      const totalOverdue = overdue.reduce((s, p) => s + (Number(p['مبلغ_الدفعة'] || p.amount || 0)), 0);
      items.push({
        id: 'overdue-payments', title: `${overdue.length} دفعة متأخرة بقيمة ${totalOverdue.toLocaleString('ar-SA')} ر.س`,
        description: `يُنصح بإرسال تذكيرات للمستأجرين المتأخرين واتخاذ إجراءات التحصيل المناسبة.`,
        type: 'warning', priority: 'high', icon: DollarSign,
        action: { label: 'عرض المتأخرات', path: '/overdue-tracker' },
      });
    }

    // صيانة معلقة
    const pendingMaint = maintenance.filter(m => ['معلق', 'pending', 'جديد'].includes(m['الحالة'] || m.status || ''));
    if (pendingMaint.length > 0) {
      items.push({
        id: 'pending-maintenance', title: `${pendingMaint.length} طلب صيانة معلق`,
        description: `سرعة معالجة طلبات الصيانة تحسن رضا المستأجرين وتقلل من الشكاوى.`,
        type: 'info', priority: 'medium', icon: Wrench,
        action: { label: 'عرض طلبات الصيانة', path: '/maintenance' },
      });
    }

    // نسبة الإشغال
    const occupied = units.filter(u => ['مؤجرة', 'occupied'].includes(u['حالة_الوحدة'] || u.status || '')).length;
    const occupancyRate = units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;
    if (occupancyRate >= 90) {
      items.push({
        id: 'high-occupancy', title: `نسبة إشغال ممتازة ${occupancyRate}%`,
        description: `أداء ممتاز! يمكنك التفكير في رفع أسعار الإيجار عند تجديد العقود.`,
        type: 'success', priority: 'low', icon: TrendingUp,
      });
    } else if (occupancyRate < 70 && units.length > 0) {
      items.push({
        id: 'low-occupancy', title: `نسبة إشغال منخفضة ${occupancyRate}%`,
        description: `يُنصح بمراجعة أسعار الإيجار وتحسين حالة الوحدات الشاغرة وزيادة التسويق.`,
        type: 'warning', priority: 'high', icon: TrendingUp,
      });
    }

    // تحليل المصروفات
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e['المبلغ'] || e.amount || 0)), 0);
    const totalRevenue = payments.reduce((s, p) => s + (Number(p['مبلغ_الدفعة'] || p.amount || 0)), 0);
    if (totalRevenue > 0 && totalExpenses > totalRevenue * 0.5) {
      items.push({
        id: 'high-expenses', title: 'المصروفات تتجاوز 50% من الإيرادات',
        description: `نسبة المصروفات إلى الإيرادات ${Math.round((totalExpenses / totalRevenue) * 100)}%. يُنصح بمراجعة بنود المصروفات وتقليل التكاليف غير الضرورية.`,
        type: 'opportunity', priority: 'medium', icon: DollarSign,
        action: { label: 'عرض التقارير المالية', path: '/financial-reports' },
      });
    }

    // ترتيب حسب الأولوية
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return items;
  }, [data]);

  const typeStyles = {
    warning: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', badge: 'bg-amber-500/15 text-amber-400' },
    opportunity: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', badge: 'bg-blue-500/15 text-blue-400' },
    info: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', badge: 'bg-purple-500/15 text-purple-400' },
    success: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', badge: 'bg-emerald-500/15 text-emerald-400' },
  };

  if (loading) return <DashboardLayout pageTitle="المقترحات الذكية"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="المقترحات الذكية">
      <PageHeader title="المقترحات الذكية" description="تحليل ذكي للبيانات مع توصيات لتحسين الأداء">
        <Button variant="outline" size="sm" onClick={reload}><RefreshCw size={14} className="ml-1" /> تحديث</Button>
      </PageHeader>

      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle size={14} /> بيانات تجريبية - سجل الدخول لعرض مقترحات حقيقية
        </div>
      )}

      {/* ملخص */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي المقترحات', value: suggestions.length, color: GOLD },
          { label: 'عاجلة', value: suggestions.filter(s => s.priority === 'high').length, color: '#DC2626' },
          { label: 'فرص تحسين', value: suggestions.filter(s => s.type === 'opportunity').length, color: '#3b82f6' },
          { label: 'إيجابية', value: suggestions.filter(s => s.type === 'success').length, color: '#059669' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* المقترحات */}
      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">لا توجد مقترحات حالياً</h3>
          <p className="text-xs text-muted-foreground">كل شيء يسير بشكل ممتاز!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map(s => {
            const style = typeStyles[s.type];
            const Icon = s.icon;
            return (
              <div key={s.id} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.type === 'warning' ? '#D9770618' : s.type === 'success' ? '#05966918' : s.type === 'opportunity' ? '#3b82f618' : '#8b5cf618' }}>
                    <Icon size={18} style={{ color: s.type === 'warning' ? '#D97706' : s.type === 'success' ? '#059669' : s.type === 'opportunity' ? '#3b82f6' : '#8b5cf6' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-foreground">{s.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.priority === 'high' ? 'bg-red-500/15 text-red-400' : s.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {s.priority === 'high' ? 'عاجل' : s.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{s.description}</p>
                    {s.action && (
                      <Link href={s.action.path} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        {s.action.label} <ArrowUpRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
