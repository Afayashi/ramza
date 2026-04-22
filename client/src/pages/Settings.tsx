/*
 * صفحة الإعدادات - رمز الإبداع
 */
import { useState } from 'react';
import { Settings as SettingsIcon, Building2, Bell, Shield, Database, Globe, Palette } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'general', label: 'عام', icon: Building2 },
  { key: 'notifications', label: 'الإشعارات', icon: Bell },
  { key: 'security', label: 'الأمان', icon: Shield },
  { key: 'data', label: 'البيانات', icon: Database },
  { key: 'appearance', label: 'المظهر', icon: Palette },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <DashboardLayout pageTitle="الإعدادات">
      <PageHeader title="الإعدادات" description="إدارة إعدادات النظام" />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">الإعدادات العامة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">اسم الشركة</label>
                  <input
                    type="text"
                    defaultValue="شركة رمز الإبداع لإدارة الأملاك"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    defaultValue="info@ramzabdae.com"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رقم الهاتف</label>
                  <input
                    type="tel"
                    defaultValue="920013517"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">العنوان</label>
                  <input
                    type="text"
                    defaultValue="المملكة العربية السعودية"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button size="sm">حفظ التغييرات</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">إعدادات الإشعارات</h3>
              <div className="space-y-3">
                {[
                  'إشعارات الدفعات المتأخرة',
                  'إشعارات انتهاء العقود',
                  'إشعارات طلبات الصيانة',
                  'إشعارات المستأجرين الجدد',
                  'التقارير الأسبوعية',
                ].map(item => (
                  <label key={item} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm text-foreground">{item}</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">الأمان والخصوصية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">كلمة المرور الحالية</label>
                  <input type="password" className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">كلمة المرور الجديدة</label>
                  <input type="password" className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <Button size="sm">تحديث كلمة المرور</Button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">إدارة البيانات</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="text-sm font-medium text-foreground mb-1">تصدير البيانات</h4>
                  <p className="text-xs text-muted-foreground mb-3">تصدير جميع بيانات النظام بصيغة Excel أو CSV</p>
                  <Button variant="outline" size="sm">تصدير البيانات</Button>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="text-sm font-medium text-foreground mb-1">استيراد البيانات</h4>
                  <p className="text-xs text-muted-foreground mb-3">استيراد بيانات من ملف Excel أو CSV</p>
                  <Button variant="outline" size="sm">استيراد البيانات</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">المظهر</h3>
              <p className="text-sm text-muted-foreground">
                المنصة تستخدم حالياً الوضع الداكن مع لمسات ذهبية تتوافق مع هوية شركة رمز الإبداع.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
