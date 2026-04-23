/*
 * إنشاء عقد جديد - رمز الإبداع
 */
import { useState } from 'react';
import { FileText, Building2, Users, DollarSign, Calendar, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STEPS = ['بيانات العقار والوحدة', 'بيانات المستأجر', 'شروط العقد', 'المراجعة والتأكيد'];

export default function LeaseBuilder() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    property: '', unit: '', tenantName: '', tenantId: '', tenantPhone: '',
    startDate: '', endDate: '', rentAmount: '', paymentCycle: 'شهري',
    deposit: '', notes: '',
  });

  const set = (name: string, value: string) => setForm(f => ({ ...f, [name]: value }));

  const renderStep = () => {
    const inputClass = "w-full bg-sidebar border border-border rounded-lg px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
    const labelClass = "block text-[11px] font-medium text-muted-foreground mb-1.5";

    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4"><Building2 size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">بيانات العقار والوحدة</h3></div>
          <div><label className={labelClass}>العقار</label><input className={inputClass} value={form.property} onChange={e => set('property', e.target.value)} placeholder="اختر العقار..." /></div>
          <div><label className={labelClass}>الوحدة</label><input className={inputClass} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="اختر الوحدة..." /></div>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4"><Users size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">بيانات المستأجر</h3></div>
          <div><label className={labelClass}>اسم المستأجر</label><input className={inputClass} value={form.tenantName} onChange={e => set('tenantName', e.target.value)} placeholder="الاسم الكامل" /></div>
          <div><label className={labelClass}>رقم الهوية</label><input className={inputClass} value={form.tenantId} onChange={e => set('tenantId', e.target.value)} placeholder="رقم الهوية الوطنية" /></div>
          <div><label className={labelClass}>رقم الهاتف</label><input className={inputClass} value={form.tenantPhone} onChange={e => set('tenantPhone', e.target.value)} placeholder="05XXXXXXXX" /></div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4"><DollarSign size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">شروط العقد</h3></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>تاريخ البداية</label><input type="date" className={inputClass} value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
            <div><label className={labelClass}>تاريخ النهاية</label><input type="date" className={inputClass} value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
          </div>
          <div><label className={labelClass}>قيمة الإيجار</label><input className={inputClass} value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)} placeholder="0.00 ر.س" /></div>
          <div><label className={labelClass}>دورة الدفع</label>
            <select className={inputClass} value={form.paymentCycle} onChange={e => set('paymentCycle', e.target.value)}>
              <option value="شهري">شهري</option><option value="ربع سنوي">ربع سنوي</option><option value="نصف سنوي">نصف سنوي</option><option value="سنوي">سنوي</option>
            </select>
          </div>
          <div><label className={labelClass}>مبلغ التأمين</label><input className={inputClass} value={form.deposit} onChange={e => set('deposit', e.target.value)} placeholder="0.00 ر.س" /></div>
          <div><label className={labelClass}>ملاحظات</label><textarea className={inputClass + " h-20 resize-none"} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="ملاحظات إضافية..." /></div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4"><FileText size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">المراجعة والتأكيد</h3></div>
          <div className="bg-sidebar rounded-xl p-4 space-y-2 text-xs">
            {[
              { label: 'العقار', value: form.property || '-' },
              { label: 'الوحدة', value: form.unit || '-' },
              { label: 'المستأجر', value: form.tenantName || '-' },
              { label: 'رقم الهوية', value: form.tenantId || '-' },
              { label: 'الفترة', value: `${form.startDate || '-'} إلى ${form.endDate || '-'}` },
              { label: 'الإيجار', value: form.rentAmount ? `${form.rentAmount} ر.س / ${form.paymentCycle}` : '-' },
              { label: 'التأمين', value: form.deposit ? `${form.deposit} ر.س` : '-' },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-1 border-b border-border last:border-0">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <DashboardLayout pageTitle="إنشاء عقد جديد">
      <PageHeader title="إنشاء عقد جديد" description="معالج إنشاء عقد إيجار خطوة بخطوة" />

      {/* شريط التقدم */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-sidebar text-muted-foreground'}`}>{i + 1}</div>
            <span className={`text-[10px] hidden md:block ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        {renderStep()}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowRight size={14} className="ml-1" /> السابق
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}> التالي <ArrowLeft size={14} className="mr-1" /></Button>
        ) : (
          <Button onClick={() => { toast.success('تم إنشاء العقد بنجاح (تجريبي)'); }}><Save size={14} className="ml-1" /> إنشاء العقد</Button>
        )}
      </div>
    </DashboardLayout>
  );
}
