/*
 * إضافة عقار جديد - رمز الإبداع
 */
import { useState } from 'react';
import { Building2, Save, MapPin, Home, DollarSign, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function PropertyFormPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    name: '', type: 'سكني', address: '', city: '', neighborhood: '',
    units_count: '', year_built: '', area: '', description: '',
    owner: '', manager: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputClass = "w-full bg-sidebar border border-border rounded-lg px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "block text-[11px] font-medium text-muted-foreground mb-1.5";

  return (
    <DashboardLayout pageTitle="إضافة عقار جديد">
      <PageHeader title="إضافة عقار جديد" description="أدخل بيانات العقار الجديد" />

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* البيانات الأساسية */}
        <div>
          <div className="flex items-center gap-2 mb-4"><Building2 size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">البيانات الأساسية</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>اسم العقار *</label><input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="مثال: برج الأمل" /></div>
            <div><label className={labelClass}>نوع العقار *</label>
              <select className={inputClass} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="سكني">سكني</option><option value="تجاري">تجاري</option><option value="مكتبي">مكتبي</option><option value="أرض">أرض</option><option value="مجمع">مجمع</option>
              </select>
            </div>
          </div>
        </div>

        {/* الموقع */}
        <div>
          <div className="flex items-center gap-2 mb-4"><MapPin size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">الموقع</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>المدينة</label><input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} placeholder="الرياض" /></div>
            <div><label className={labelClass}>الحي</label><input className={inputClass} value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="حي النرجس" /></div>
            <div><label className={labelClass}>العنوان التفصيلي</label><input className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} placeholder="الشارع، الرقم" /></div>
          </div>
        </div>

        {/* التفاصيل */}
        <div>
          <div className="flex items-center gap-2 mb-4"><Home size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">التفاصيل</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>عدد الوحدات</label><input className={inputClass} value={form.units_count} onChange={e => set('units_count', e.target.value)} placeholder="0" /></div>
            <div><label className={labelClass}>سنة البناء</label><input className={inputClass} value={form.year_built} onChange={e => set('year_built', e.target.value)} placeholder="2020" /></div>
            <div><label className={labelClass}>المساحة (م²)</label><input className={inputClass} value={form.area} onChange={e => set('area', e.target.value)} placeholder="0" /></div>
          </div>
        </div>

        {/* الإدارة */}
        <div>
          <div className="flex items-center gap-2 mb-4"><FileText size={16} className="text-primary" /><h3 className="font-bold text-sm text-foreground">الإدارة</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>المالك</label><input className={inputClass} value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="اسم المالك" /></div>
            <div><label className={labelClass}>المدير المسؤول</label><input className={inputClass} value={form.manager} onChange={e => set('manager', e.target.value)} placeholder="اسم المدير" /></div>
          </div>
          <div className="mt-4"><label className={labelClass}>وصف العقار</label><textarea className={inputClass + " h-24 resize-none"} value={form.description} onChange={e => set('description', e.target.value)} placeholder="وصف تفصيلي للعقار..." /></div>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setLocation('/properties')}>إلغاء</Button>
        <Button onClick={() => { toast.success('تم حفظ العقار بنجاح (تجريبي)'); setLocation('/properties'); }}><Save size={14} className="ml-1" /> حفظ العقار</Button>
      </div>
    </DashboardLayout>
  );
}
