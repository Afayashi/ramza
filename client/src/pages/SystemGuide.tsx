/*
 * دليل النظام - رمز الإبداع
 */
import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronLeft, Building2, Users, FileText, DollarSign, Wrench, BarChart2, Settings, Shield } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const SECTIONS = [
  { id: 'overview', title: 'نظرة عامة', icon: Shield, content: 'منصة رمز الإبداع هي نظام متكامل لإدارة الأملاك العقارية. تتيح لك إدارة العقارات والوحدات والمستأجرين والعقود والدفعات والصيانة والتقارير المالية من مكان واحد. النظام يدعم العمل مع قاعدة بيانات Base44 لتخزين واسترجاع البيانات بشكل آمن.' },
  { id: 'properties', title: 'إدارة العقارات', icon: Building2, content: 'من قسم العقارات يمكنك إضافة عقارات جديدة وتعديلها وحذفها. كل عقار يحتوي على معلومات مثل الاسم والنوع والعنوان وعدد الوحدات. يمكنك أيضاً إدارة الوحدات داخل كل عقار وتتبع حالتها (شاغرة/مشغولة). قسم حالة الوحدات يعطيك نظرة شاملة على جميع الوحدات في جميع العقارات.' },
  { id: 'tenants', title: 'إدارة المستأجرين', icon: Users, content: 'قسم المستأجرين يتيح لك إدارة بيانات المستأجرين بما في ذلك الاسم ورقم الهوية والهاتف والبريد الإلكتروني. يمكنك أيضاً عرض تقييم المستأجرين التلقائي بناءً على التزامهم بالدفع. بوابة المستأجر تعرض جميع بيانات المستأجر وعقوده ودفعاته في مكان واحد.' },
  { id: 'contracts', title: 'إدارة العقود', icon: FileText, content: 'من قسم العقود يمكنك إنشاء عقود إيجار جديدة وربطها بالمستأجرين والوحدات. النظام يتتبع تواريخ بداية ونهاية العقود ويرسل تنبيهات عند اقتراب انتهاء العقد. يمكنك أيضاً إدارة عقود الوساطة وتراخيص الإعلان.' },
  { id: 'finance', title: 'الإدارة المالية', icon: DollarSign, content: 'القسم المالي يشمل إدارة الدفعات والمصروفات والفواتير. يمكنك تسجيل الدفعات وتتبع المتأخرات وإصدار الفواتير. كشوف الحسابات تعطيك ملخصاً مالياً شاملاً لكل مستأجر. الجدول الزمني للدفعات يعرض جميع الدفعات مرتبة حسب التاريخ.' },
  { id: 'maintenance', title: 'إدارة الصيانة', icon: Wrench, content: 'قسم الصيانة يتيح لك تسجيل طلبات الصيانة وتتبعها من الإنشاء حتى الإغلاق. يمكنك تعيين الأولوية والفني المسؤول. قسم الصيانة الوقائية يساعدك في جدولة أعمال الصيانة الدورية. يمكنك أيضاً إدارة المخزون والتذاكر والمواعيد.' },
  { id: 'reports', title: 'التقارير', icon: BarChart2, content: 'قسم التقارير يوفر تقارير مالية شاملة تشمل الإيرادات والمصروفات وصافي الدخل. لوحة التحليلات تعرض رسوماً بيانية تفاعلية لأداء العقارات. يمكنك أيضاً عرض تقارير العائد على الاستثمار وأداء العقارات الفردية.' },
  { id: 'settings', title: 'الإعدادات', icon: Settings, content: 'من الإعدادات يمكنك تخصيص النظام حسب احتياجاتك. يشمل ذلك إعدادات الشركة والإشعارات والنسخ الاحتياطي. يمكنك أيضاً استيراد البيانات من ملفات Excel أو CSV.' },
];

export default function SystemGuide() {
  const [openSection, setOpenSection] = useState<string | null>('overview');

  return (
    <DashboardLayout pageTitle="دليل النظام">
      <PageHeader title="دليل النظام" description="تعرف على كيفية استخدام منصة رمز الإبداع" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* القائمة الجانبية */}
        <div className="lg:col-span-1">
          <div className="space-y-1">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setOpenSection(s.id)}
                className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-2 ${openSection === s.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-primary/20'}`}>
                <s.icon size={14} className={openSection === s.id ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-xs font-medium ${openSection === s.id ? 'text-primary' : 'text-foreground'}`}>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* المحتوى */}
        <div className="lg:col-span-3">
          {SECTIONS.filter(s => s.id === openSection).map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon size={18} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
