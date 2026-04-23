/*
 * بوابة المستأجر - رمز الإبداع
 * عرض بيانات المستأجر وعقوده ودفعاته وطلبات الصيانة
 */
import { useState, useMemo } from 'react';
import { Users, FileText, DollarSign, Wrench, Search, Building2, Calendar, Phone, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function TenantPortal() {
  const { data, loading, isDemo } = useMultiEntityData([
    { name: 'Tenant' }, { name: 'Lease' }, { name: 'Payment' }, { name: 'Maintenance' },
  ]);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const tenants = (data.Tenant || []).filter(t => !search || (t['اسم_المستأجر'] || t.name || '').includes(search));

  const tenantData = useMemo(() => {
    if (!selectedTenant) return null;
    const tid = selectedTenant.id;
    const leases = (data.Lease || []).filter(l => l.tenant_id === tid || l['معرف_المستأجر'] === tid);
    const payments = (data.Payment || []).filter(p => p.tenant_id === tid || p['معرف_المستأجر'] === tid);
    const maint = (data.Maintenance || []).filter(m => m.tenant_id === tid || m['معرف_المستأجر'] === tid);
    return { leases, payments, maintenance: maint };
  }, [selectedTenant, data]);

  if (loading) return <DashboardLayout pageTitle="بوابة المستأجر"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="بوابة المستأجر">
      <PageHeader title="بوابة المستأجر" description="عرض بيانات المستأجرين وعقودهم ودفعاتهم" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* قائمة المستأجرين */}
        <div className="lg:col-span-1">
          <div className="relative mb-3">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن مستأجر..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto">
            {tenants.map(t => (
              <button key={t.id} onClick={() => setSelectedTenant(t)}
                className={`w-full text-right p-3 rounded-xl border transition-all ${selectedTenant?.id === t.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-primary/20'}`}>
                <p className="font-bold text-xs text-foreground">{t['اسم_المستأجر'] || t.name || 'بدون اسم'}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  {(t['رقم_الهاتف'] || t.phone) && <span className="flex items-center gap-1"><Phone size={9} />{t['رقم_الهاتف'] || t.phone}</span>}
                  {(t['رقم_الهوية'] || t.id_number) && <span>هوية: {t['رقم_الهوية'] || t.id_number}</span>}
                </div>
              </button>
            ))}
            {tenants.length === 0 && <EmptyState title="لا يوجد مستأجرون" description="" />}
          </div>
        </div>

        {/* تفاصيل المستأجر */}
        <div className="lg:col-span-2">
          {!selectedTenant ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
              <Users size={40} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">اختر مستأجراً لعرض تفاصيله</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* بطاقة المستأجر */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-bold text-sm text-foreground mb-3">{selectedTenant['اسم_المستأجر'] || selectedTenant.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'الهاتف', value: selectedTenant['رقم_الهاتف'] || selectedTenant.phone, icon: Phone },
                    { label: 'البريد', value: selectedTenant['البريد_الإلكتروني'] || selectedTenant.email, icon: Mail },
                    { label: 'رقم الهوية', value: selectedTenant['رقم_الهوية'] || selectedTenant.id_number, icon: Users },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <f.icon size={12} className="text-muted-foreground shrink-0" />
                      <div><p className="text-[10px] text-muted-foreground">{f.label}</p><p className="text-foreground">{f.value}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* إحصائيات */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'العقود', value: tenantData?.leases.length || 0, color: '#3b82f6' },
                  { label: 'الدفعات', value: tenantData?.payments.length || 0, color: '#059669' },
                  { label: 'طلبات الصيانة', value: tenantData?.maintenance.length || 0, color: '#D97706' },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* العقود */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-bold text-xs text-foreground mb-3 flex items-center gap-2"><FileText size={14} /> العقود</h4>
                {(tenantData?.leases || []).length === 0 ? <p className="text-xs text-muted-foreground">لا توجد عقود</p> : (
                  <div className="space-y-2">
                    {tenantData!.leases.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-sidebar text-xs">
                        <span className="text-foreground">عقد {l['رقم_العقد'] || l.id}</span>
                        <span className="text-muted-foreground">{l['تاريخ_البداية'] || l.start_date} → {l['تاريخ_النهاية'] || l.end_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* الدفعات */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-bold text-xs text-foreground mb-3 flex items-center gap-2"><DollarSign size={14} /> الدفعات</h4>
                {(tenantData?.payments || []).length === 0 ? <p className="text-xs text-muted-foreground">لا توجد دفعات</p> : (
                  <div className="space-y-2">
                    {tenantData!.payments.map((p: any) => {
                      const isPaid = ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '');
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-sidebar text-xs">
                          <span className="text-foreground">{Number(p['مبلغ_الدفعة'] || p.amount || 0).toLocaleString('ar-SA')} ر.س</span>
                          <span className={isPaid ? 'text-emerald-400' : 'text-red-400'}>{isPaid ? 'مدفوع' : 'غير مدفوع'}</span>
                        </div>
                      );
                    })}
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
