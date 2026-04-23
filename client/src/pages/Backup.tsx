/*
 * النسخ الاحتياطي - رمز الإبداع
 */
import { useState } from 'react';
import { Database, Download, Upload, Clock, CheckCircle, Shield, HardDrive } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKUPS = [
  { id: 1, date: '2025-04-20 14:30', size: '12.5 MB', type: 'تلقائي', status: 'مكتمل' },
  { id: 2, date: '2025-04-15 10:00', size: '11.8 MB', type: 'يدوي', status: 'مكتمل' },
  { id: 3, date: '2025-04-10 14:30', size: '11.2 MB', type: 'تلقائي', status: 'مكتمل' },
  { id: 4, date: '2025-04-05 14:30', size: '10.9 MB', type: 'تلقائي', status: 'مكتمل' },
  { id: 5, date: '2025-04-01 09:15', size: '10.5 MB', type: 'يدوي', status: 'مكتمل' },
];

export default function Backup() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => { setIsBackingUp(false); toast.success('تم إنشاء نسخة احتياطية بنجاح (تجريبي)'); }, 2000);
  };

  return (
    <DashboardLayout pageTitle="النسخ الاحتياطي">
      <PageHeader title="النسخ الاحتياطي" description="إدارة النسخ الاحتياطية واستعادة البيانات" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'آخر نسخة', value: '20 أبريل 2025', icon: Clock, color: '#059669' },
          { label: 'حجم البيانات', value: '12.5 MB', icon: HardDrive, color: '#3b82f6' },
          { label: 'الحالة', value: 'محمي', icon: Shield, color: '#C8A951' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={handleBackup} disabled={isBackingUp}>
          {isBackingUp ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" /> جاري النسخ...</> : <><Database size={14} className="ml-2" /> إنشاء نسخة احتياطية</>}
        </Button>
        <Button variant="outline" onClick={() => toast.info('استعادة البيانات (ميزة قادمة)')}>
          <Upload size={14} className="ml-2" /> استعادة نسخة
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm text-foreground">سجل النسخ الاحتياطية</h3>
        </div>
        <div className="divide-y divide-border">
          {BACKUPS.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 hover:bg-sidebar/50 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">{b.date}</p>
                  <p className="text-[10px] text-muted-foreground">{b.type} - {b.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.info('تحميل النسخة (ميزة قادمة)')}>
                  <Download size={10} className="ml-1" /> تحميل
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.info('استعادة (ميزة قادمة)')}>
                  <Upload size={10} className="ml-1" /> استعادة
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
