/*
 * لوحة التحكم الرئيسية - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 * تعرض إحصائيات شاملة عن العقارات والمستأجرين والمالية
 */
import { useMemo } from 'react';
import { Link } from 'wouter';
import {
  Building2, Users, DollarSign, Wrench, TrendingUp,
  AlertTriangle, Clock, CheckCircle, ArrowUpRight,
  RefreshCw, Calendar, Home as HomeIcon, FileText, Info
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');
const fmtCurrency = (v: number) => `${fmt(v)} ر.س`;

export default function Dashboard() {
  const { data, loading, isDemo, reload } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 1000 },
    { name: 'Maintenance', sort: '-created_date', limit: 200 },
    { name: 'Lease', sort: '-created_date', limit: 500 },
    { name: 'Tenant', sort: '-created_date', limit: 500 },
    { name: 'Property', sort: '-created_date', limit: 200 },
    { name: 'Unit', sort: '-created_date', limit: 2000 },
    { name: 'Expense', sort: '-created_date', limit: 500 },
  ]);

  const stats = useMemo(() => {
    const payments = data.Payment || [];
    const maintenance = data.Maintenance || [];
    const leases = data.Lease || [];
    const tenants = data.Tenant || [];
    const properties = data.Property || [];
    const units = data.Unit || [];
    const expenses = data.Expense || [];

    if (properties.length === 0 && units.length === 0 && tenants.length === 0) return null;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().slice(0, 7);
    const in60 = new Date(now.getTime() + 60 * 86400000).toISOString().split('T')[0];

    // Revenue
    const monthlyRevenue = payments
      .filter((p: any) => {
        const d = p['تاريخ_الدفع'] || p.created_date || '';
        const paid = p['حالة_القسط'] === 'مدفوع' || p['حالة_الدفع'] === 'مكتمل';
        return paid && d.startsWith(thisMonth);
      })
      .reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

    // Expenses
    const monthlyExpenses = expenses
      .filter((e: any) => (e.date || '').startsWith(thisMonth))
      .reduce((s: number, e: any) => s + (parseFloat(e.amount) || 0), 0);

    // Overdue
    const overdue = payments.filter((p: any) => {
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const unpaid = ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(status);
      return unpaid && due && due < today;
    });
    const overdueAmount = overdue.reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

    // Expiring leases
    const expiringLeases = leases.filter((l: any) => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || '';
      const status = l['حالة_العقد'] || l.status || '';
      const active = status === 'نشط' || status === 'active';
      return active && end && end >= today && end <= in60;
    });

    // Pending maintenance
    const pendingMaint = maintenance.filter((m: any) => m.status === 'pending' || m.status === 'in_progress');

    // Occupancy
    const totalUnits = units.length;
    const rentedUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'مؤجرة' || u.status === 'occupied').length;
    const occupancy = totalUnits ? Math.round((rentedUnits / totalUnits) * 100) : 0;

    return {
      totalProperties: properties.length,
      totalUnits,
      rentedUnits,
      vacantUnits: totalUnits - rentedUnits,
      occupancy,
      totalTenants: tenants.length,
      activeLeases: leases.filter((l: any) => (l['حالة_العقد'] || l.status) === 'نشط' || (l['حالة_العقد'] || l.status) === 'active').length,
      monthlyRevenue,
      monthlyExpenses,
      netIncome: monthlyRevenue - monthlyExpenses,
      overdueCount: overdue.length,
      overdueAmount,
      expiringLeases: expiringLeases.length,
      pendingMaint: pendingMaint.length,
    };
  }, [data]);

  return (
    <DashboardLayout pageTitle="لوحة التحكم">
      {loading ? (
        <LoadingState message="جاري تحميل بيانات لوحة التحكم..." />
      ) : !stats ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>لم يتم تحميل البيانات</p>
          <Button onClick={reload} variant="outline" size="sm" className="mt-4">إعادة المحاولة</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Demo Banner */}
          {isDemo && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
              <Info size={16} />
              <span>يتم عرض بيانات تجريبية. قم بتسجيل الدخول لعرض البيانات الحقيقية.</span>
            </div>
          )}

          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden h-40 lg:h-48">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663078821712/Zm2JEbmeVFTJRp6HMZVTym/hero-dashboard-eLb4EMrUFnrPmJbLzSLQYy.webp"
              alt="لوحة التحكم"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />
            <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-8">
              <h1 className="font-heading text-xl lg:text-2xl font-bold text-white mb-1">
                مرحباً بك في رمز الإبداع
              </h1>
              <p className="text-sm text-white/70">
                إدارة شاملة لأملاكك العقارية
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Calendar size={12} />
                  <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <button onClick={reload} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                  <RefreshCw size={12} />
                  <span>تحديث</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCard title="إجمالي العقارات" value={stats.totalProperties} icon={Building2} />
            <StatCard title="الوحدات المؤجرة" value={`${stats.rentedUnits} / ${stats.totalUnits}`} icon={HomeIcon} change={stats.occupancy} changeLabel={`نسبة الإشغال ${stats.occupancy}%`} />
            <StatCard title="المستأجرون النشطون" value={stats.totalTenants} icon={Users} />
            <StatCard title="العقود النشطة" value={stats.activeLeases} icon={FileText} />
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp size={18} className="text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">الإيرادات الشهرية</span>
              </div>
              <p className="text-2xl font-heading font-bold text-green-400">{fmtCurrency(stats.monthlyRevenue)}</p>
              <div className="gold-line mt-3" />
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <DollarSign size={18} className="text-red-400" />
                </div>
                <span className="text-sm text-muted-foreground">المصروفات الشهرية</span>
              </div>
              <p className="text-2xl font-heading font-bold text-red-400">{fmtCurrency(stats.monthlyExpenses)}</p>
              <div className="gold-line mt-3" />
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign size={18} className="text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">صافي الدخل</span>
              </div>
              <p className={`text-2xl font-heading font-bold ${stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmtCurrency(stats.netIncome)}
              </p>
              <div className="gold-line mt-3" />
            </div>
          </div>

          {/* Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {/* Overdue */}
            <Link href="/overdue-tracker" className="block">
              <div className="bg-card border border-border rounded-lg p-4 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <AlertTriangle size={16} className="text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">دفعات متأخرة</span>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground" />
                </div>
                <p className="text-xl font-heading font-bold text-red-400">{stats.overdueCount}</p>
                <p className="text-xs text-muted-foreground mt-1">بقيمة {fmtCurrency(stats.overdueAmount)}</p>
              </div>
            </Link>

            {/* Expiring Leases */}
            <Link href="/lease-alerts" className="block">
              <div className="bg-card border border-border rounded-lg p-4 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Clock size={16} className="text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">عقود تنتهي قريباً</span>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground" />
                </div>
                <p className="text-xl font-heading font-bold text-amber-400">{stats.expiringLeases}</p>
                <p className="text-xs text-muted-foreground mt-1">خلال 60 يوم</p>
              </div>
            </Link>

            {/* Maintenance */}
            <Link href="/maintenance" className="block">
              <div className="bg-card border border-border rounded-lg p-4 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Wrench size={16} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">طلبات صيانة معلقة</span>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground" />
                </div>
                <p className="text-xl font-heading font-bold text-blue-400">{stats.pendingMaint}</p>
                <p className="text-xs text-muted-foreground mt-1">بحاجة لمتابعة</p>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: 'إضافة عقار', path: '/property-form', icon: Building2 },
              { label: 'إنشاء عقد', path: '/lease-builder', icon: FileText },
              { label: 'تسجيل دفعة', path: '/payments', icon: DollarSign },
              { label: 'طلب صيانة', path: '/maintenance', icon: Wrench },
              { label: 'التقارير', path: '/financial-reports', icon: TrendingUp },
              { label: 'الإعدادات', path: '/settings', icon: CheckCircle },
            ].map(link => (
              <Link key={link.path} href={link.path}>
                <div className="bg-card border border-border rounded-lg p-3 text-center card-hover">
                  <link.icon size={20} className="mx-auto mb-1.5 text-primary" />
                  <span className="text-xs text-foreground">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
