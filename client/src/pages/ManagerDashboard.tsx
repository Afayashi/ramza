/*
 * لوحة تحكم المدير - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 * نظرة شاملة على أداء العقارات مع رسوم بيانية
 */
import { useMemo } from 'react';
import { Link } from 'wouter';
import {
  Building2, Users, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Wrench, BarChart3, PieChart as PieIcon,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const GOLD = '#C8A951';
const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');
const fmtCurrency = (v: number) => `${fmt(v)} ر.س`;

export default function ManagerDashboard() {
  const { data, loading, isDemo, reload } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit', limit: 2000 },
    { name: 'Lease' }, { name: 'Payment' },
    { name: 'Maintenance' }, { name: 'Complaint' },
    { name: 'Expense' }, { name: 'Tenant' },
  ]);

  const stats = useMemo(() => {
    const properties = data.Property || [];
    const units = data.Unit || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];
    const maintenance = data.Maintenance || [];
    const complaints = data.Complaint || [];
    const expenses = data.Expense || [];
    const tenants = data.Tenant || [];

    const occupied = units.filter(u => (u['حالة_الوحدة'] || u.status) === 'مؤجرة' || (u['حالة_الوحدة'] || u.status) === 'occupied').length;
    const vacant = units.filter(u => (u['حالة_الوحدة'] || u.status) === 'شاغرة' || (u['حالة_الوحدة'] || u.status) === 'vacant').length;
    const underMaint = units.filter(u => (u['حالة_الوحدة'] || u.status) === 'صيانة' || (u['حالة_الوحدة'] || u.status) === 'maintenance').length;
    const occupancyRate = units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;

    const totalRevenue = payments.reduce((s, p) => s + (Number(p['مبلغ_الدفعة'] || p.amount || 0)), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e['المبلغ'] || e.amount || 0)), 0);
    const netIncome = totalRevenue - totalExpenses;

    const activeLeases = leases.filter(l => (l['حالة_العقد'] || l.status) === 'نشط' || (l['حالة_العقد'] || l.status) === 'active').length;
    const pendingMaint = maintenance.filter(m => m.status === 'pending' || m['الحالة'] === 'معلق').length;
    const openComplaints = complaints.filter(c => c.status === 'open' || c['الحالة'] === 'مفتوحة').length;

    // بيانات الرسم البياني الدائري - حالة الوحدات
    const pieData = [
      { name: 'مؤجرة', value: occupied, color: '#059669' },
      { name: 'شاغرة', value: vacant, color: '#DC2626' },
      { name: 'صيانة', value: underMaint, color: '#D97706' },
    ].filter(d => d.value > 0);

    // بيانات الإيرادات الشهرية (آخر 6 أشهر)
    const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const now = new Date();
    const barData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const rent = payments.filter(p => {
        const pd = new Date(p['تاريخ_الدفع'] || p.date || p.created_date || '');
        return pd.getFullYear() === y && pd.getMonth() === m;
      }).reduce((s, p) => s + (Number(p['مبلغ_الدفعة'] || p.amount || 0)), 0);
      const exp = expenses.filter(e => {
        const ed = new Date(e['التاريخ'] || e.date || e.created_date || '');
        return ed.getFullYear() === y && ed.getMonth() === m;
      }).reduce((s, e) => s + (Number(e['المبلغ'] || e.amount || 0)), 0);
      return { month: monthNames[m], إيرادات: rent, مصروفات: exp };
    });

    return {
      properties: properties.length, units: units.length, occupied, vacant, underMaint,
      occupancyRate, tenants: tenants.length, activeLeases, totalRevenue, totalExpenses,
      netIncome, pendingMaint, openComplaints, pieData, barData,
    };
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="لوحة المدير"><LoadingState /></DashboardLayout>;

  const kpis = [
    { label: 'العقارات', value: fmt(stats.properties), icon: Building2, color: GOLD },
    { label: 'إجمالي الوحدات', value: fmt(stats.units), icon: Building2, color: '#3b82f6' },
    { label: 'مؤجرة', value: fmt(stats.occupied), icon: CheckCircle, color: '#059669' },
    { label: 'شاغرة', value: fmt(stats.vacant), icon: AlertTriangle, color: '#DC2626' },
    { label: 'نسبة الإشغال', value: `${stats.occupancyRate}%`, icon: TrendingUp, color: GOLD },
    { label: 'المستأجرون', value: fmt(stats.tenants), icon: Users, color: '#8b5cf6' },
    { label: 'العقود النشطة', value: fmt(stats.activeLeases), icon: CheckCircle, color: '#059669' },
    { label: 'طلبات صيانة معلقة', value: fmt(stats.pendingMaint), icon: Wrench, color: '#D97706' },
  ];

  return (
    <DashboardLayout pageTitle="لوحة المدير">
      <PageHeader title="لوحة تحكم المدير" description="نظرة شاملة على أداء جميع العقارات والوحدات">
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw size={14} className="ml-1" /> تحديث
        </Button>
      </PageHeader>

      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle size={14} /> بيانات تجريبية - سجل الدخول لعرض البيانات الحقيقية
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${kpi.color}18` }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* المالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'إجمالي الإيرادات', value: fmtCurrency(stats.totalRevenue), color: '#059669', icon: DollarSign },
          { label: 'إجمالي المصروفات', value: fmtCurrency(stats.totalExpenses), color: '#DC2626', icon: DollarSign },
          { label: 'صافي الدخل', value: fmtCurrency(stats.netIncome), color: GOLD, icon: TrendingUp },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={16} style={{ color: item.color }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* رسم دائري - حالة الوحدات */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={16} className="text-primary" />
            <h3 className="font-bold text-sm text-foreground">توزيع حالة الوحدات</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stats.pieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} وحدة`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {stats.pieData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* رسم شريطي - الإيرادات والمصروفات */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="font-bold text-sm text-foreground">الإيرادات والمصروفات (6 أشهر)</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ar-SA')} ر.س`, '']} />
                <Bar dataKey="إيرادات" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="مصروفات" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> إيرادات
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> مصروفات
            </div>
          </div>
        </div>
      </div>

      {/* تنبيهات وروابط سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" /> تنبيهات عاجلة
          </h3>
          <div className="space-y-2">
            {stats.pendingMaint > 0 && (
              <Link href="/maintenance" className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-amber-500" />
                  <span className="text-xs text-foreground">{stats.pendingMaint} طلب صيانة معلق</span>
                </div>
                <ArrowUpRight size={12} className="text-muted-foreground" />
              </Link>
            )}
            {stats.openComplaints > 0 && (
              <Link href="/complaints" className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-xs text-foreground">{stats.openComplaints} شكوى مفتوحة</span>
                </div>
                <ArrowUpRight size={12} className="text-muted-foreground" />
              </Link>
            )}
            {stats.vacant > 0 && (
              <Link href="/unit-status" className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-blue-500" />
                  <span className="text-xs text-foreground">{stats.vacant} وحدة شاغرة</span>
                </div>
                <ArrowUpRight size={12} className="text-muted-foreground" />
              </Link>
            )}
            {stats.pendingMaint === 0 && stats.openComplaints === 0 && stats.vacant === 0 && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-400">
                <CheckCircle size={14} /> لا توجد تنبيهات حالياً
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" /> روابط سريعة
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'العقارات', path: '/properties', icon: Building2 },
              { label: 'المستأجرون', path: '/tenants', icon: Users },
              { label: 'الدفعات', path: '/payments', icon: DollarSign },
              { label: 'التقارير المالية', path: '/financial-reports', icon: TrendingUp },
              { label: 'الصيانة', path: '/maintenance', icon: Wrench },
              { label: 'العقود', path: '/contracts', icon: CheckCircle },
            ].map((link) => (
              <Link key={link.path} href={link.path} className="flex items-center gap-2 p-2.5 rounded-lg bg-sidebar/50 hover:bg-sidebar transition-colors text-xs text-foreground">
                <link.icon size={14} className="text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
