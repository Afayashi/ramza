/*
 * بوابة المالك - رمز الإبداع
 * عرض بيانات المالك وعقاراته وإيراداته
 */
import { useState, useMemo } from 'react';
import { UserCheck, Building2, DollarSign, Search, Phone, Mail, FileText, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function OwnerPortal() {
  const { data, loading } = useMultiEntityData([
    { name: 'Owner' }, { name: 'Property' }, { name: 'Payment' }, { name: 'Expense' },
  ]);
  const [search, setSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  const owners = (data.Owner || []).filter(o => !search || (o['اسم_المالك'] || o.name || '').includes(search));

  const ownerData = useMemo(() => {
    if (!selectedOwner) return null;
    const oid = selectedOwner.id;
    const properties = (data.Property || []).filter(p => p.owner_id === oid || p['معرف_المالك'] === oid);
    const payments = (data.Payment || []).filter(p => p.owner_id === oid || p['معرف_المالك'] === oid);
    const expenses = (data.Expense || []).filter(e => e.owner_id === oid || e['معرف_المالك'] === oid);
    const totalIncome = payments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).reduce((s, p) => s + Number(p['مبلغ_الدفعة'] || p.amount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e['المبلغ'] || e.amount || 0), 0);
    return { properties, payments, expenses, totalIncome, totalExpenses, net: totalIncome - totalExpenses };
  }, [selectedOwner, data]);

  if (loading) return <DashboardLayout pageTitle="بوابة المالك"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="بوابة المالك">
      <PageHeader title="بوابة المالك" description="عرض بيانات الملاك وعقاراتهم وإيراداتهم" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="relative mb-3">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن مالك..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto">
            {owners.map(o => (
              <button key={o.id} onClick={() => setSelectedOwner(o)}
                className={`w-full text-right p-3 rounded-xl border transition-all ${selectedOwner?.id === o.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-primary/20'}`}>
                <p className="font-bold text-xs text-foreground">{o['اسم_المالك'] || o.name || 'بدون اسم'}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  {(o['رقم_الهاتف'] || o.phone) && <span className="flex items-center gap-1"><Phone size={9} />{o['رقم_الهاتف'] || o.phone}</span>}
                </div>
              </button>
            ))}
            {owners.length === 0 && <EmptyState title="لا يوجد ملاك" description="" />}
          </div>
        </div>
        <div className="lg:col-span-2">
          {!selectedOwner ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
              <UserCheck size={40} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">اختر مالكاً لعرض تفاصيله</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-bold text-sm text-foreground mb-3">{selectedOwner['اسم_المالك'] || selectedOwner.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'الهاتف', value: selectedOwner['رقم_الهاتف'] || selectedOwner.phone, icon: Phone },
                    { label: 'البريد', value: selectedOwner['البريد_الإلكتروني'] || selectedOwner.email, icon: Mail },
                    { label: 'رقم الهوية', value: selectedOwner['رقم_الهوية'] || selectedOwner.id_number, icon: UserCheck },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <f.icon size={12} className="text-muted-foreground shrink-0" />
                      <div><p className="text-[10px] text-muted-foreground">{f.label}</p><p className="text-foreground">{f.value}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'العقارات', value: ownerData?.properties.length || 0, color: '#C8A951' },
                  { label: 'الإيرادات', value: ownerData?.totalIncome || 0, color: '#059669', fmt: true },
                  { label: 'المصروفات', value: ownerData?.totalExpenses || 0, color: '#DC2626', fmt: true },
                  { label: 'صافي الدخل', value: ownerData?.net || 0, color: (ownerData?.net || 0) >= 0 ? '#C8A951' : '#DC2626', fmt: true },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="text-sm font-bold" style={{ color: s.color }}>{s.fmt ? `${Number(s.value).toLocaleString('ar-SA')} ر.س` : s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-bold text-xs text-foreground mb-3 flex items-center gap-2"><Building2 size={14} /> العقارات</h4>
                {(ownerData?.properties || []).length === 0 ? <p className="text-xs text-muted-foreground">لا توجد عقارات مرتبطة</p> : (
                  <div className="space-y-2">
                    {ownerData!.properties.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-sidebar text-xs">
                        <span className="text-foreground font-medium">{p['اسم_العقار'] || p.name || 'بدون اسم'}</span>
                        <span className="text-muted-foreground">{p['نوع_العقار'] || p.type || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
