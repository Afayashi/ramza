/*
 * الدراسة السوقية - رمز الإبداع
 */
import { Globe, TrendingUp, Building2, MapPin, BarChart2, ArrowUp, ArrowDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const MARKET_DATA = [
  { area: 'الرياض - حي النرجس', avgRent: 35000, trend: 5.2, demand: 'مرتفع' },
  { area: 'الرياض - حي الملقا', avgRent: 42000, trend: 3.8, demand: 'مرتفع' },
  { area: 'الرياض - حي العليا', avgRent: 55000, trend: -1.2, demand: 'متوسط' },
  { area: 'جدة - حي الشاطئ', avgRent: 38000, trend: 4.5, demand: 'مرتفع' },
  { area: 'جدة - حي الحمراء', avgRent: 28000, trend: 2.1, demand: 'متوسط' },
  { area: 'الدمام - حي الشاطئ', avgRent: 25000, trend: 6.3, demand: 'مرتفع' },
];

export default function MarketResearch() {
  return (
    <DashboardLayout pageTitle="الدراسة السوقية">
      <PageHeader title="الدراسة السوقية" description="تحليل سوق العقارات والإيجارات" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'متوسط الإيجار السنوي', value: '37,167 ر.س', icon: Building2, color: '#C8A951' },
          { label: 'نمو السوق', value: '+3.5%', icon: TrendingUp, color: '#059669' },
          { label: 'المناطق المراقبة', value: '6', icon: MapPin, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <BarChart2 size={14} className="text-primary" />
          <h3 className="font-bold text-sm text-foreground">مؤشرات السوق حسب المنطقة</h3>
        </div>
        <div className="divide-y divide-border">
          {MARKET_DATA.map(m => (
            <div key={m.area} className="flex items-center justify-between p-3 hover:bg-sidebar/30 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">{m.area}</p>
                  <p className="text-[10px] text-muted-foreground">الطلب: {m.demand}</p>
                </div>
              </div>
              <div className="text-left flex items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-primary">{m.avgRent.toLocaleString('ar-SA')} ر.س</p>
                  <p className="text-[10px] text-muted-foreground">سنوي</p>
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold ${m.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {Math.abs(m.trend)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-sidebar/50 border border-border rounded-xl p-4 text-center">
        <Globe size={24} className="mx-auto text-primary mb-2" />
        <p className="text-xs text-muted-foreground">البيانات تقريبية ومبنية على مؤشرات السوق العامة</p>
      </div>
    </DashboardLayout>
  );
}
