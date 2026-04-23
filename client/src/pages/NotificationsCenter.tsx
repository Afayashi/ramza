/*
 * مركز الإشعارات - رمز الإبداع
 * Design: Dark + Gold, Arabic RTL
 */
import { useState, useMemo } from 'react';
import {
  Bell, BellRing, CheckCircle, AlertTriangle, Clock, Wrench,
  FileText, DollarSign, RefreshCw, Trash2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  payment_overdue: { label: 'دفعة متأخرة', color: '#DC2626', icon: AlertTriangle },
  payment_reminder: { label: 'تذكير دفع', color: '#3b82f6', icon: DollarSign },
  lease_ending: { label: 'عقد ينتهي', color: '#D97706', icon: FileText },
  maintenance_urgent: { label: 'صيانة عاجلة', color: '#8b5cf6', icon: Wrench },
  maintenance_completed: { label: 'صيانة مكتملة', color: '#059669', icon: CheckCircle },
  system: { label: 'نظام', color: '#6B7280', icon: BellRing },
};

function timeAgo(d: string) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000); const h = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${days} يوم`;
}

export default function NotificationsCenter() {
  const { data, loading, isDemo } = useMultiEntityData([
    { name: 'Payment' }, { name: 'Lease' }, { name: 'Maintenance' },
  ]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // توليد إشعارات تلقائية من البيانات
  const notifications = useMemo(() => {
    const notifs: any[] = [];
    const now = new Date();

    // دفعات متأخرة
    (data.Payment || []).forEach(p => {
      const status = p['حالة_الدفع'] || p.status || '';
      if (['متأخر', 'overdue', 'غير مدفوع'].includes(status)) {
        notifs.push({
          id: `pay-${p.id}`, type: 'payment_overdue',
          title: `دفعة متأخرة - ${p['اسم_المستأجر'] || 'مستأجر'}`,
          message: `مبلغ ${Number(p['مبلغ_الدفعة'] || p.amount || 0).toLocaleString('ar-SA')} ر.س بتاريخ ${p['تاريخ_الاستحقاق'] || p.due_date || ''}`,
          date: p['تاريخ_الاستحقاق'] || p.due_date || p.created_date || '',
          isRead: false, priority: 'high',
        });
      }
    });

    // عقود تنتهي قريباً
    (data.Lease || []).forEach(l => {
      const endDate = new Date(l['تاريخ_النهاية'] || l.end_date || '');
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
      if (daysLeft > 0 && daysLeft <= 30) {
        notifs.push({
          id: `lease-${l.id}`, type: 'lease_ending',
          title: `عقد ينتهي خلال ${daysLeft} يوم`,
          message: `عقد ${l['رقم_العقد'] || l.id} - ${l['اسم_المستأجر'] || ''}`,
          date: l['تاريخ_النهاية'] || l.end_date || '',
          isRead: false, priority: daysLeft <= 7 ? 'urgent' : 'medium',
        });
      }
    });

    // صيانة معلقة
    (data.Maintenance || []).forEach(m => {
      const status = m['الحالة'] || m.status || '';
      if (['معلق', 'pending', 'جديد'].includes(status)) {
        notifs.push({
          id: `maint-${m.id}`, type: 'maintenance_urgent',
          title: m['عنوان_الطلب'] || m.title || 'طلب صيانة جديد',
          message: m['الوصف'] || m.description || '',
          date: m['تاريخ_الإنشاء'] || m.created_date || '',
          isRead: false, priority: (m['الأولوية'] || m.priority) === 'عاجل' ? 'urgent' : 'medium',
        });
      }
    });

    notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return notifs;
  }, [data]);

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <DashboardLayout pageTitle="الإشعارات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="الإشعارات">
      <PageHeader title="مركز الإشعارات" description={`${unreadCount} إشعار غير مقروء`}>
        <div className="flex gap-1 bg-sidebar rounded-lg p-0.5">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {f === 'all' ? 'الكل' : 'غير مقروء'}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'إجمالي الإشعارات', value: notifications.length, color: '#C8A951' },
          { label: 'دفعات متأخرة', value: notifications.filter(n => n.type === 'payment_overdue').length, color: '#DC2626' },
          { label: 'عقود تنتهي', value: notifications.filter(n => n.type === 'lease_ending').length, color: '#D97706' },
          { label: 'صيانة معلقة', value: notifications.filter(n => n.type === 'maintenance_urgent').length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* القائمة */}
      {filtered.length === 0 ? <EmptyState title="لا توجد إشعارات" description="ستظهر الإشعارات هنا عند وجود تنبيهات" /> : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${notif.isRead ? 'bg-card border-border opacity-70' : 'border-border bg-card shadow-sm'}`}
                style={notif.isRead ? {} : { borderColor: `${cfg.color}30` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}18` }}>
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-xs text-foreground">{notif.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${notif.priority === 'urgent' ? 'bg-red-500/15 text-red-400' : notif.priority === 'high' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {notif.priority === 'urgent' ? 'حرج' : notif.priority === 'high' ? 'عالي' : 'متوسط'}
                    </span>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                    <Clock size={10} /> {timeAgo(notif.date)}
                    <span className="mx-1">|</span>
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
