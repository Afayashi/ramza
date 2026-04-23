/*
 * إدارة الفنيين - رمز الإبداع
 */
import { useState } from 'react';
import { Users, Phone, Star, Wrench, Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DEMO_TECHNICIANS = [
  { id: 1, name: 'أحمد محمد', phone: '0551234567', specialty: 'سباكة', rating: 4.5, tasks: 23, status: 'متاح' },
  { id: 2, name: 'خالد عبدالله', phone: '0559876543', specialty: 'كهرباء', rating: 4.2, tasks: 18, status: 'مشغول' },
  { id: 3, name: 'فهد سعد', phone: '0553456789', specialty: 'تكييف', rating: 4.8, tasks: 31, status: 'متاح' },
  { id: 4, name: 'عمر حسن', phone: '0557654321', specialty: 'نجارة', rating: 3.9, tasks: 12, status: 'إجازة' },
];

export default function TechnicianManager() {
  const [search, setSearch] = useState('');
  const techs = DEMO_TECHNICIANS.filter(t => !search || t.name.includes(search) || t.specialty.includes(search));

  const statusColors: Record<string, string> = { 'متاح': 'bg-emerald-500/15 text-emerald-400', 'مشغول': 'bg-amber-500/15 text-amber-400', 'إجازة': 'bg-red-500/15 text-red-400' };

  return (
    <DashboardLayout pageTitle="إدارة الفنيين">
      <PageHeader title="إدارة الفنيين" description={`${techs.length} فني`}>
        <Button size="sm" onClick={() => toast.info('إضافة فني (ميزة قادمة)')}><Plus size={14} className="ml-1" /> إضافة فني</Button>
      </PageHeader>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن فني..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {techs.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users size={16} className="text-primary" /></div>
                <div>
                  <p className="text-xs font-bold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.specialty}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[t.status] || ''}`}>{t.status}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Phone size={10} /> {t.phone}</span>
              <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" /> {t.rating}</span>
              <span className="flex items-center gap-1"><Wrench size={10} /> {t.tasks} مهمة</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
