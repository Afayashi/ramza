/*
 * صفحة التحليلات - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 * تحليلات متقدمة للإشغال والإيرادات والأداء
 */
import { useMemo, useState } from 'react';
import {
  BarChart3, TrendingUp, Building2, Users, DollarSign,
  RefreshCw, AlertTriangle, CheckCircle, PieChart as PieIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const GOLD = '#C8A951';
const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<'6m' | '12m'>('6m');
  const { data, loading, isDemo, reload } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit', limit: 2000 },
    { name: 'Lease' }, { name: 'Payment' },
    { name: 'Expense' }, { name: 'Tenant' },
  ]);

  const analytics = useMemo(() => {
    const properties = data.Property || [];
    const units = data.Unit || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];
    const expenses = data.Expense || [];
    const tenants = data.Tenant || [];

    const occupied = units.filter(u => ['مؤجرة', 'occupied'].includes(u['حالة_الوحدة'] || u.status || '')).length;
    const vacant = units.filter(u => ['شاغرة', 'vacant'].includes(u['حالة_الوحدة'] || u.status || '')).length;
    const occupancyRate = units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;

    const totalRevenue = payments.reduce((s, p) => s + (Number(p['مبلغ_الدفعة'] || p.amount || 0)), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e['المبلغ'] || e.amount || 0)), 0);
    const avgRentPerUnit = occupied > 0 ? Math.round(totalRevenue / occupied) : 0;

    // توزيع العقارات حسب النوع
    const typeMap: Record<string, number> = {};
    properties.forEach(p => {
      const type = p['نوع_العقار'] || p.type || 'أخرى';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const typeColors = ['#C8A951', '#3b82f6', '#059669', '#DC2626', '#8b5cf6', '#D97706'];
    const propertyTypeData = Object.entries(typeMap).map(([name, value], i) => ({
      name, value, color: typeColors[i % typeColors.length],
    }));

    // توزيع الوحدات حسب الحالة
    const unitStatusData = [
      { name: 'مؤجرة', value: occupied, color: '#059669' },
      { name: 'شاغرة', value: vacant, color: '#DC2626' },
      { name: 'صيانة', value: units.length - occupied - vacant, color: '#D97706' },
    ].filter(d => d.value > 0);

    // بيانات الإيرادات الشهرية
    const months = period === '6m' ? 6 : 12;
    const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const now = new Date();
    const trendData = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
      const y = d.getFullYear(); const m = d.getMonth();
      const rev = payments.filter(p => {
        const pd = new Date(p['تاريخ_الدفع'] || p.date || p.created_date || '');
        return pd.getFullYear() === y && pd.getMonth() === m;
      }).reduce((s, p) => s + (Number(p['مبلغ_الدفعة'] || p.amount || 0)), 0);
      const exp = expenses.filter(e => {
        const ed = new Date(e['التاريخ'] || e.date || e.created_date || '');
        return ed.getFullYear() === y && ed.getMonth() === m;
      }).reduce((s, e) => s + (Number(e['المبلغ'] || e.amount || 0)), 0);
      return { month: monthNames[m], إيرادات: rev, مصروفات: exp, صافي: rev - exp };
    });

    return {
      properties: properties.length, units: units.length, occupied, vacant,
      occupancyRate, tenants: tenants.length, totalRevenue, totalExpenses,
      avgRentPerUnit, propertyTypeData, unitStatusData, trendData,
      activeLeases: leases.filter(l => ['نشط', 'active'].includes(l['حالة_العقد'] || l.status || '')).length,
    };
  }, [data, period]);

  if (loading) return <DashboardLayout pageTitle="التحليلات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="التحليلات">
      <PageHeader title="لوحة التحليلات" description="تحليلات متقدمة لأداء العقارات والإيرادات">
        <div className="flex gap-1 bg-sidebar rounded-lg p-0.5">
          {(['6m', '12m'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {p === '6m' ? '6 أشهر' : '12 شهر'}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={reload}><RefreshCw size={14} className="ml-1" /> تحديث</Button>
      </PageHeader>

      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle size={14} /> بيانات تجريبية
        </div>
      )}

      {/* مؤشرات الأداء */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'نسبة الإشغال', value: `${analytics.occupancyRate}%`, sub: `${analytics.occupied} من ${analytics.units}`, color: analytics.occupancyRate >= 80 ? '#059669' : '#DC2626' },
          { label: 'إجمالي الإيرادات', value: `${fmt(analytics.totalRevenue)} ر.س`, sub: `${analytics.activeLeases} عقد نشط`, color: GOLD },
          { label: 'متوسط الإيجار/وحدة', value: `${fmt(analytics.avgRentPerUnit)} ر.س`, sub: `${analytics.occupied} وحدة مؤجرة`, color: '#3b82f6' },
          { label: 'صافي الدخل', value: `${fmt(analytics.totalRevenue - analytics.totalExpenses)} ر.س`, sub: `هامش ${analytics.totalRevenue > 0 ? Math.round(((analytics.totalRevenue - analytics.totalExpenses) / analytics.totalRevenue) * 100) : 0}%`, color: '#059669' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-[11px] text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* رسم الإيرادات */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" /> اتجاه الإيرادات والمصروفات
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('ar-SA')} ر.س`, '']} />
              <Area type="monotone" dataKey="إيرادات" stroke="#059669" fill="#059669" fillOpacity={0.15} />
              <Area type="monotone" dataKey="مصروفات" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} />
              <Area type="monotone" dataKey="صافي" stroke={GOLD} fill={GOLD} fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-3">
          {[{ label: 'إيرادات', color: '#059669' }, { label: 'مصروفات', color: '#DC2626' }, { label: 'صافي', color: GOLD }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* رسوم دائرية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <PieIcon size={16} className="text-primary" /> توزيع حالة الوحدات
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.unitStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {analytics.unitStatusData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} وحدة`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 mt-2">
            {analytics.unitStatusData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-primary" /> توزيع العقارات حسب النوع
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.propertyTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {analytics.propertyTypeData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} عقار`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 mt-2 flex-wrap">
            {analytics.propertyTypeData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
