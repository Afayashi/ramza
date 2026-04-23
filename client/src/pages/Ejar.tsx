/*
 * ربط إيجار - رمز الإبداع
 * صفحة ربط العقود بمنصة إيجار الحكومية
 */
import { useState } from 'react';
import { Link2, FileText, CheckCircle, Clock, AlertTriangle, ExternalLink, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Ejar() {
  const { data, loading } = useEntityData('Lease');
  const [search, setSearch] = useState('');

  const leases = data.filter(l => !search || (l['اسم_المستأجر'] || l.tenant_name || '').includes(search));

  if (loading) return <DashboardLayout pageTitle="ربط إيجار"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="ربط إيجار">
      <PageHeader title="ربط إيجار" description="ربط العقود بمنصة إيجار الحكومية" />

      <div className="bg-card border border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Link2 size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">منصة إيجار</p>
            <p className="text-[11px] text-muted-foreground">ربط العقود وتسجيلها في منصة إيجار التابعة لوزارة الإسكان</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { window.open('https://www.ejar.sa', '_blank'); }}>
            <ExternalLink size={12} className="ml-1" /> فتح إيجار
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالمستأجر..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'إجمالي العقود', value: leases.length, color: '#C8A951' },
          { label: 'مسجلة في إيجار', value: leases.filter(l => l['مسجل_في_إيجار'] || l.ejar_registered).length, color: '#059669' },
          { label: 'غير مسجلة', value: leases.filter(l => !(l['مسجل_في_إيجار'] || l.ejar_registered)).length, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {leases.length === 0 ? <EmptyState title="لا توجد عقود" description="" /> : (
        <div className="space-y-2">
          {leases.map((l: any) => {
            const registered = l['مسجل_في_إيجار'] || l.ejar_registered;
            return (
              <div key={l.id} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {registered ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{l['اسم_المستأجر'] || l.tenant_name || 'بدون اسم'}</p>
                    <p className="text-[10px] text-muted-foreground">{l['رقم_العقد'] || l.contract_number || ''} - {l['تاريخ_النهاية'] || l.end_date || ''}</p>
                  </div>
                </div>
                <Button size="sm" variant={registered ? 'outline' : 'default'} className="h-7 text-[10px]"
                  onClick={() => toast.info(registered ? 'العقد مسجل بالفعل في إيجار' : 'تسجيل في إيجار (ميزة قادمة)')}>
                  {registered ? 'مسجل' : 'تسجيل في إيجار'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
