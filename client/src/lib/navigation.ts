/*
 * هيكل التنقل لمنصة رمز الإبداع
 * القائمة الجانبية على اليمين - منظمة حسب الأقسام
 */
import {
  Home, Building2, Users, DollarSign, Wrench, BarChart2,
  Settings, FileText, Bell, MessageSquare, Shield,
  Briefcase, ClipboardList, Map, UserCheck, Receipt,
  TrendingUp, Database, Zap, HelpCircle, Archive,
  Calendar, Star, Send, Globe, Printer, User
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon?: any;
}

export interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'الرئيسية',
    icon: Home,
    items: [
      { label: 'لوحة التحكم', path: '/' },
      { label: 'لوحة المدير', path: '/manager-dashboard' },
      { label: 'التحليلات', path: '/analytics' },
      { label: 'المقترحات الذكية', path: '/smart-insights' },
    ],
  },
  {
    label: 'العقارات',
    icon: Building2,
    items: [
      { label: 'العقارات والوحدات', path: '/properties' },
      { label: 'إضافة عقار جديد', path: '/property-form' },
      { label: 'حالة الوحدات', path: '/unit-status' },
      { label: 'مقارنة العقارات', path: '/property-comparison' },
      { label: 'مستندات العقارات', path: '/property-documents' },
      { label: 'الخريطة التفاعلية', path: '/map-view' },
      { label: 'إدارة الملاك', path: '/owners' },
      { label: 'بوابة المالك', path: '/owner-portal' },
      { label: 'عقود الوساطة', path: '/brokerage-contracts' },
      { label: 'تراخيص الإعلانات', path: '/ad-licenses' },
    ],
  },
  {
    label: 'المستأجرون',
    icon: Users,
    items: [
      { label: 'المستأجرون', path: '/tenants' },
      { label: 'العقود', path: '/contracts' },
      { label: 'إنشاء عقد جديد', path: '/lease-builder' },
      { label: 'التوقيع الإلكتروني', path: '/e-signature' },
      { label: 'تنبيهات العقود', path: '/lease-alerts' },
      { label: 'بوابة المستأجر', path: '/tenant-portal' },
      { label: 'تحليلات المستأجرين', path: '/tenant-analytics' },
      { label: 'تقييم المستأجرين', path: '/tenant-rating' },
      { label: 'إدارة الإيجارات', path: '/rent-management' },
      { label: 'منصة إيجار', path: '/ejar' },
    ],
  },
  {
    label: 'المالية',
    icon: DollarSign,
    items: [
      { label: 'الدفعات', path: '/payments' },
      { label: 'الفواتير', path: '/invoices' },
      { label: 'الفواتير التلقائية', path: '/auto-invoicing' },
      { label: 'المصروفات', path: '/expenses' },
      { label: 'المتأخرات', path: '/overdue-tracker' },
      { label: 'كشوف الحسابات', path: '/financial-statements' },
      { label: 'الجدول الزمني للدفعات', path: '/payment-timeline' },
      { label: 'المحاسبة', path: '/accounting' },
      { label: 'بوابة الدفع', path: '/payment-gateway' },
    ],
  },
  {
    label: 'الصيانة',
    icon: Wrench,
    items: [
      { label: 'طلبات الصيانة', path: '/maintenance' },
      { label: 'إدارة الصيانة', path: '/maintenance-manager' },
      { label: 'الصيانة الوقائية', path: '/preventive-maintenance' },
      { label: 'المواعيد', path: '/appointments' },
      { label: 'تذاكر الدعم', path: '/tickets' },
      { label: 'لوحة الفنيين', path: '/technician-dashboard' },
      { label: 'إدارة الفنيين', path: '/technician-manager' },
      { label: 'إدارة المخزون', path: '/inventory' },
    ],
  },
  {
    label: 'التقارير',
    icon: BarChart2,
    items: [
      { label: 'مركز التقارير', path: '/reports-center' },
      { label: 'التقارير المالية', path: '/financial-reports' },
      { label: 'الملخص المالي', path: '/financial-summary' },
      { label: 'التنبؤ المالي', path: '/financial-forecasting' },
      { label: 'تقارير العائد', path: '/roi-reports' },
      { label: 'أداء العقارات', path: '/property-performance' },
      { label: 'تقرير عقار منفرد', path: '/property-single-report' },
      { label: 'نموذج تقرير العقار الرسمي', path: '/property-official-report' },
      { label: 'تقارير الإشغال', path: '/occupancy-report' },
      { label: 'الدراسة السوقية', path: '/market-research' },
      { label: 'مركز الطباعة', path: '/print-center' },
    ],
  },
  {
    label: 'العمليات',
    icon: Zap,
    items: [
      { label: 'نظام الشكاوى', path: '/complaints' },
      { label: 'مكتبة الوثائق', path: '/documents' },
      { label: 'منصة التواصل', path: '/communication' },
      { label: 'واتساب', path: '/whatsapp' },
      { label: 'لوحة التنبيهات', path: '/alerts' },
      { label: 'مركز الإشعارات', path: '/notifications' },
      { label: 'الأرشيف', path: '/archive' },
      { label: 'إدارة العملاء (CRM)', path: '/crm' },
    ],
  },
  {
    label: 'الإعدادات',
    icon: Settings,
    items: [
      { label: 'الإعدادات العامة', path: '/settings' },
      { label: 'إعدادات الشركة', path: '/company-settings' },
      { label: 'التكاملات', path: '/integrations' },
      { label: 'قاعدة البيانات Supabase', path: '/database-setup' },
      { label: 'إدارة المستخدمين', path: '/user-management' },
      { label: 'استيراد البيانات', path: '/data-import' },
      { label: 'النسخ الاحتياطي', path: '/backup' },
      { label: 'سجل النشاطات', path: '/activity-log' },
      { label: 'دليل النظام', path: '/system-guide' },
    ],
  },
];
