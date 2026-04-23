/*
 * تقييم المستأجرين - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Star, Users, CheckCircle, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'} />
      ))}
    </div>
  );
}

export default function TenantRating() {
  const { data, loading } = useMultiEntityData([
    { name: 'Tenant' }, { name: 'Payment' }, { name: 'Complaint' }, { name: 'Lease' },
  ]);
  const [search, setSearch] = useState('');

  const ratings = useMemo(() => {
    const tenants = data.Tenant || [];
    const payments = data.Payment || [];
    const complaints = data.Complaint || [];
    const leases = data.Lease || [];

    return tenants.map(t => {
      const tPayments = payments.filter(p => p.tenant_id === t.id || p['معرف_المستأجر'] === t.id);
      const paid = tPayments.filter(p => ['مدفوع', 'paid'].includes(p['حالة_الدفع'] || p.status || '')).length;
      const overdue = tPayments.filter(p => ['متأخر', 'overdue'].includes(p['حالة_الدفع'] || p.status || '')).length;
      const tComplaints = complaints.filter(c => c.tenant_id === t.id || c['معرف_المستأجر'] === t.id).length;
      const tLeases = leases.filter(l => l.tenant_id === t.id || l['معرف_المستأجر'] === t.id);
      const activeLeases = tLeases.filter(l => ['ساري', 'active'].includes(l['حالة_العقد'] || l.status || '')).length;

      // حساب التقييم
      let score = 3;
      if (tPayments.length > 0) { const payRate = paid / tPayments.length; score = payRate >= 0.9 ? 5 : payRate >= 0.7 ? 4 : payRate >= 0.5 ? 3 : payRate >= 0.3 ? 2 : 1; }
      if (overdue > 2) score = Math.max(1, score - 1);
      if (tComplaints > 3) score = Math.max(1, score - 1);

      return {
        name: t['اسم_المستأجر'] || t.name || 'بدون اسم',
        phone: t['رقم_الهاتف'] || t.phone || '',
        score, paid, overdue, complaints: tComplaints, activeLeases,
        totalPayments: tPayments.length,
      };
    }).filter(t => !search || t.name.includes(search)).sort((a, b) => b.score - a.score);
  }, [data, search]);

  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1) : '0';

  if (loading) return <DashboardLayout pageTitle="تقييم المستأجرين"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="تقييم المستأجرين">
      <PageHeader title="تقييم المستأجرين" description="تقييم تلقائي بناءً على الالتزام بالدفع والسلوك" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'متوسط التقييم', value: `${avgRating} / 5`, color: '#C8A951' },
          { label: 'ممتاز (5 نجوم)', value: ratings.filter(r => r.score === 5).length, color: '#059669' },
          { label: 'جيد (3-4 نجوم)', value: ratings.filter(r => r.score >= 3 && r.score <= 4).length, color: '#3b82f6' },
          { label: 'ضعيف (1-2 نجوم)', value: ratings.filter(r => r.score <= 2).length, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن مستأجر..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {ratings.length === 0 ? <EmptyState title="لا يوجد مستأجرون" description="" /> : (
        <div className="space-y-2">
          {ratings.map((r, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${r.score >= 4 ? 'bg-emerald-500/15 text-emerald-400' : r.score >= 3 ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">{r.name}</p>
                    <RatingStars rating={r.score} />
                  </div>
                </div>
                <div className="flex gap-4 text-[11px]">
                  <div className="text-center"><p className="text-emerald-400 font-bold">{r.paid}</p><p className="text-muted-foreground">مدفوع</p></div>
                  <div className="text-center"><p className="text-red-400 font-bold">{r.overdue}</p><p className="text-muted-foreground">متأخر</p></div>
                  <div className="text-center"><p className="text-amber-400 font-bold">{r.complaints}</p><p className="text-muted-foreground">شكاوى</p></div>
                  <div className="text-center"><p className="text-blue-400 font-bold">{r.activeLeases}</p><p className="text-muted-foreground">عقود</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
