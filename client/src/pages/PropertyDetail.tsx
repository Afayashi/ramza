/*
 * تفاصيل العقار - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Building2, Home, Users, DollarSign, Wrench, FileText, MapPin, Calendar, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { useSearch } from 'wouter';

export default function PropertyDetail() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const propertyId = params.get('id');
  const { data, loading } = useMultiEntityData([
    { name: 'Property' }, { name: 'Unit' }, { name: 'Lease' }, { name: 'Payment' }, { name: 'Maintenance' },
  ]);
  const [tab, setTab] = useState<'units' | 'leases' | 'payments' | 'maintenance'>('units');

  const property = useMemo(() => {
    const props = data.Property || [];
    return propertyId ? props.find(p => String(p.id) === propertyId) : props[0];
  }, [data, propertyId]);

  const units = useMemo(() => (data.Unit || []).filter(u => property && (u.property_id === property.id || u['معرف_العقار'] === property?.id)), [data, property]);
  const leases = useMemo(() => (data.Lease || []).filter(l => property && (l.property_id === property.id || l['معرف_العقار'] === property?.id)), [data, property]);
  const payments = useMemo(() => (data.Payment || []).filter(p => property && (p.property_id === property?.id || p['معرف_العقار'] === property?.id)), [data, property]);
  const maint = useMemo(() => (data.Maintenance || []).filter(m => property && (m.property_id === property?.id || m['معرف_العقار'] === property?.id)), [data, property]);

  if (loading) return <DashboardLayout pageTitle="تفاصيل العقار"><LoadingState /></DashboardLayout>;
  if (!property) return <DashboardLayout pageTitle="تفاصيل العقار"><EmptyState title="لم يتم العثور على العقار" description="اختر عقاراً من صفحة العقارات" /></DashboardLayout>;

  const name = property['اسم_العقار'] || property.name || 'بدون اسم';
  const type = property['نوع_العقار'] || property.type || '';
  const address = property['العنوان'] || property.address || '';
  const occupied = units.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
  const totalIncome = payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);

  const tabs = [
    { id: 'units' as const, label: `الوحدات (${units.length})`, icon: Home },
    { id: 'leases' as const, label: `العقود (${leases.length})`, icon: FileText },
    { id: 'payments' as const, label: `الدفعات (${payments.length})`, icon: DollarSign },
    { id: 'maintenance' as const, label: `الصيانة (${maint.length})`, icon: Wrench },
  ];

  return (
    <DashboardLayout pageTitle="تفاصيل العقار">
      <PageHeader title={name} description={`${type} - ${address}`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'الوحدات', value: units.length, icon: Home, color: '#C8A951' },
          { label: 'مشغولة', value: `${occupied}/${units.length}`, icon: Users, color: '#059669' },
          { label: 'الإيرادات', value: `${(totalIncome / 1000).toFixed(0)}K`, icon: DollarSign, color: '#3b82f6' },
          { label: 'طلبات صيانة', value: maint.length, icon: Wrench, color: '#D97706' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} style={{ color: s.color }} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 bg-sidebar rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-colors ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tab === 'units' && units.map((u: any, i: number) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '') ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                <Home size={14} className={['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '') ? 'text-emerald-400' : 'text-amber-400'} />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">وحدة {u['رقم_الوحدة'] || u.unit_number || i + 1}</p>
                <p className="text-[10px] text-muted-foreground">{u['نوع_الوحدة'] || u.type || ''} - {u['المساحة'] || u.area || ''} م²</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {u['الحالة'] || u.status || 'غير محدد'}
            </span>
          </div>
        ))}
        {tab === 'leases' && leases.map((l: any, i: number) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">{l['اسم_المستأجر'] || l.tenant_name || 'بدون اسم'}</p>
              <p className="text-[10px] text-muted-foreground">{l['تاريخ_البداية'] || l.start_date || ''} - {l['تاريخ_النهاية'] || l.end_date || ''}</p>
            </div>
            <p className="text-xs font-bold text-primary">{Number(l['قيمة_الإيجار'] || l.rent_amount || 0).toLocaleString('ar-SA')} ر.س</p>
          </div>
        ))}
        {tab === 'payments' && payments.map((p: any, i: number) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">{p['وصف_الدفعة'] || p.description || 'دفعة'}</p>
              <p className="text-[10px] text-muted-foreground">{p['تاريخ_الاستحقاق'] || p.due_date || ''}</p>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-primary">{Number(p['مبلغ_الدفعة'] || p.amount || 0).toLocaleString('ar-SA')} ر.س</p>
              <span className={`text-[10px] ${['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '') ? 'text-emerald-400' : 'text-red-400'}`}>
                {p['حالة_الدفع'] || p.status || ''}
              </span>
            </div>
          </div>
        ))}
        {tab === 'maintenance' && maint.map((m: any, i: number) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">{m['وصف_الطلب'] || m.description || 'طلب صيانة'}</p>
              <p className="text-[10px] text-muted-foreground">{m['تاريخ_الطلب'] || m.request_date || ''}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${['مكتمل', 'completed'].includes(m['الحالة'] || m.status || '') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {m['الحالة'] || m.status || ''}
            </span>
          </div>
        ))}
        {((tab === 'units' && units.length === 0) || (tab === 'leases' && leases.length === 0) || (tab === 'payments' && payments.length === 0) || (tab === 'maintenance' && maint.length === 0)) && (
          <EmptyState title="لا توجد بيانات" description="" />
        )}
      </div>
    </DashboardLayout>
  );
}
