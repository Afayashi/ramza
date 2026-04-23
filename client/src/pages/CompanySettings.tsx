/*
 * إعدادات الشركة - رمز الإبداع
 */
import { useState } from 'react';
import { Building2, Save, Phone, Mail, MapPin, Globe, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CompanySettings() {
  const [form, setForm] = useState({
    name: 'شركة رمز الإبداع العقارية',
    nameEn: 'Ramz Al-Ibdaa Real Estate',
    phone: '+966 XX XXX XXXX',
    email: 'info@ramzabdae.com',
    website: 'https://ramzabdae.com',
    address: 'المملكة العربية السعودية',
    city: 'الرياض',
    crNumber: '',
    vatNumber: '',
    logo: '',
  });

  const handleSave = () => { toast.success('تم حفظ الإعدادات بنجاح (تجريبي)'); };

  return (
    <DashboardLayout pageTitle="إعدادات الشركة">
      <PageHeader title="إعدادات الشركة" description="إعدادات الشركة والمعلومات الأساسية" />

      <div className="max-w-3xl space-y-6">
        {/* معلومات الشركة */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2"><Building2 size={16} className="text-primary" /> معلومات الشركة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'اسم الشركة (عربي)', name: 'name', icon: Building2 },
              { label: 'اسم الشركة (إنجليزي)', name: 'nameEn', icon: Building2 },
              { label: 'رقم الهاتف', name: 'phone', icon: Phone },
              { label: 'البريد الإلكتروني', name: 'email', icon: Mail },
              { label: 'الموقع الإلكتروني', name: 'website', icon: Globe },
              { label: 'العنوان', name: 'address', icon: MapPin },
              { label: 'المدينة', name: 'city', icon: MapPin },
              { label: 'السجل التجاري', name: 'crNumber', icon: FileText },
              { label: 'الرقم الضريبي', name: 'vatNumber', icon: FileText },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">{f.label}</label>
                <div className="relative">
                  <f.icon size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={(form as any)[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* إعدادات النظام */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-foreground mb-4">إعدادات النظام</h3>
          <div className="space-y-3">
            {[
              { label: 'إرسال إشعارات البريد', description: 'إرسال إشعارات تلقائية عبر البريد الإلكتروني', enabled: true },
              { label: 'تنبيهات انتهاء العقود', description: 'تنبيه قبل 30 يوم من انتهاء العقد', enabled: true },
              { label: 'تنبيهات الدفعات المتأخرة', description: 'تنبيه عند تأخر دفعة عن موعدها', enabled: true },
              { label: 'النسخ الاحتياطي التلقائي', description: 'نسخ احتياطي أسبوعي تلقائي', enabled: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-sidebar">
                <div>
                  <p className="text-xs font-medium text-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                </div>
                <button className={`w-10 h-5 rounded-full transition-colors relative ${s.enabled ? 'bg-primary' : 'bg-border'}`}
                  onClick={() => toast.info('تبديل الإعداد (ميزة قادمة)')}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${s.enabled ? 'left-0.5' : 'right-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}><Save size={14} className="ml-2" /> حفظ الإعدادات</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
