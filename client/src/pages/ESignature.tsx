/*
 * التوقيع الإلكتروني - رمز الإبداع
 */
import { useState } from 'react';
import { ClipboardList, FileText, CheckCircle, Clock, AlertTriangle, Search, Send } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ESignature() {
  const { data, loading } = useEntityData('Lease');
  const [search, setSearch] = useState('');

  const leases = data.filter(l => !search || (l['اسم_المستأجر'] || l.tenant_name || '').includes(search));

  if (loading) return <DashboardLayout pageTitle="التوقيع الإلكتروني"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="التوقيع الإلكتروني">
      <PageHeader title="التوقيع الإلكتروني" description="إدارة التوقيعات الإلكترونية على العقود" />

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'بانتظار التوقيع', value: leases.filter(l => !(l['موقع'] || l.signed)).length, icon: Clock, color: '#D97706' },
          { label: 'تم التوقيع', value: leases.filter(l => l['موقع'] || l.signed).length, icon: CheckCircle, color: '#059669' },
          { label: 'إجمالي العقود', value: leases.length, icon: FileText, color: '#C8A951' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {leases.length === 0 ? <EmptyState title="لا توجد عقود" description="" /> : (
        <div className="space-y-2">
          {leases.map((l: any) => {
            const signed = l['موقع'] || l.signed;
            return (
              <div key={l.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  {signed ? <CheckCircle size={16} className="text-emerald-400" /> : <Clock size={16} className="text-amber-400" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{l['اسم_المستأجر'] || l.tenant_name || 'بدون اسم'}</p>
                    <p className="text-[10px] text-muted-foreground">{l['رقم_العقد'] || l.contract_number || ''}</p>
                  </div>
                </div>
                <Button size="sm" variant={signed ? 'outline' : 'default'} className="h-7 text-[10px]"
                  onClick={() => toast.info(signed ? 'العقد موقع بالفعل' : 'إرسال طلب توقيع (ميزة قادمة)')}>
                  {signed ? 'موقع' : <><Send size={10} className="ml-1" /> إرسال للتوقيع</>}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
