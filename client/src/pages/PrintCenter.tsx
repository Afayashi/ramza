/*
 * مركز الطباعة - رمز الإبداع
 */
import { useState } from 'react';
import { Printer, FileText, DollarSign, Building2, Users, Download, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

const TEMPLATES = [
  { id: 'official_report', title: 'نموذج تقرير العقار الرسمي', description: 'تقرير رسمي كامل مهيأ للطباعة وتسليمه للمالك', icon: FileText, color: '#C8A951', path: '/property-official-report' },
  { id: 'lease', title: 'عقد إيجار', description: 'طباعة عقد إيجار رسمي', icon: FileText, color: '#3b82f6' },
  { id: 'receipt', title: 'إيصال دفع', description: 'طباعة إيصال دفعة مالية', icon: DollarSign, color: '#059669' },
  { id: 'invoice', title: 'فاتورة', description: 'طباعة فاتورة للمستأجر', icon: FileText, color: '#C8A951' },
  { id: 'property_report', title: 'تقرير عقار', description: 'تقرير شامل عن عقار', icon: Building2, color: '#8b5cf6', path: '/property-single-report' },
  { id: 'tenant_statement', title: 'كشف حساب مستأجر', description: 'كشف حساب تفصيلي', icon: Users, color: '#D97706' },
  { id: 'financial_report', title: 'تقرير مالي', description: 'تقرير مالي شامل', icon: DollarSign, color: '#DC2626' },
  { id: 'maintenance_order', title: 'أمر صيانة', description: 'طباعة أمر عمل صيانة', icon: FileText, color: '#0891b2' },
  { id: 'vacancy_report', title: 'تقرير الشواغر', description: 'تقرير الوحدات الشاغرة', icon: Building2, color: '#059669' },
];

export default function PrintCenter() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);

  const handlePrint = (t: typeof TEMPLATES[0]) => {
    if (t.path) { setLocation(t.path); return; }
    toast.info('جاري تجهيز المستند للطباعة... (ميزة قادمة)');
  };

  return (
    <DashboardLayout pageTitle="مركز الطباعة">
      <PageHeader title="مركز الطباعة" description="طباعة العقود والفواتير والتقارير" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {TEMPLATES.map(t => (
          <div key={t.id}
            className={`bg-card border rounded-xl p-4 transition-all cursor-pointer hover:border-primary/30 ${selected === t.id ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'}`}
            onClick={() => setSelected(t.id)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${t.color}18` }}>
              <t.icon size={18} style={{ color: t.color }} />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1">{t.title}</h3>
            <p className="text-[11px] text-muted-foreground mb-3">{t.description}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7" onClick={(e) => { e.stopPropagation(); toast.info('معاينة (ميزة قادمة)'); }}>
                <Eye size={10} className="ml-1" /> معاينة
              </Button>
              <Button size="sm" className="flex-1 text-[10px] h-7" onClick={(e) => { e.stopPropagation(); handlePrint(t); }}>
                <Printer size={10} className="ml-1" /> طباعة
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
