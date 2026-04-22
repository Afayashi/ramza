/*
 * رمز الإبداع - منصة إدارة الأملاك
 * App.tsx - التوجيه الرئيسي
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import FinancialReports from "./pages/FinancialReports";
import Settings from "./pages/Settings";
import Expenses from "./pages/Expenses";
import Invoices from "./pages/Invoices";
import Owners from "./pages/Owners";
import LeaseAlerts from "./pages/LeaseAlerts";
import OverdueTracker from "./pages/OverdueTracker";
import Complaints from "./pages/Complaints";
import Documents from "./pages/Documents";
import UnitStatus from "./pages/UnitStatus";
import GenericPage from "./pages/GenericPage";

// Icons for generic pages
import {
  BarChart2, Building2, Users, DollarSign, Wrench, FileText,
  MessageSquare, Map, Shield, Briefcase, ClipboardList, Zap,
  TrendingUp, Database, Bell, UserCheck, Receipt, HelpCircle,
  Printer, Globe, Calendar, Star, Send, Archive
} from 'lucide-react';

function Router() {
  return (
    <Switch>
      {/* الرئيسية */}
      <Route path="/" component={Dashboard} />
      <Route path="/manager-dashboard">{() => <GenericPage title="لوحة المدير" icon={Shield} />}</Route>
      <Route path="/analytics">{() => <GenericPage title="التحليلات" icon={BarChart2} />}</Route>
      <Route path="/smart-insights">{() => <GenericPage title="المقترحات الذكية" icon={Zap} />}</Route>

      {/* العقارات */}
      <Route path="/properties" component={Properties} />
      <Route path="/property-form">{() => <GenericPage title="إضافة عقار جديد" icon={Building2} />}</Route>
      <Route path="/property-detail">{() => <GenericPage title="تفاصيل العقار" icon={Building2} />}</Route>
      <Route path="/unit-status" component={UnitStatus} />
      <Route path="/property-comparison">{() => <GenericPage title="مقارنة العقارات" icon={Building2} />}</Route>
      <Route path="/property-documents">{() => <GenericPage title="مستندات العقارات" icon={FileText} />}</Route>
      <Route path="/map-view">{() => <GenericPage title="الخريطة التفاعلية" icon={Map} />}</Route>
      <Route path="/owners" component={Owners} />
      <Route path="/owner-portal">{() => <GenericPage title="بوابة المالك" icon={UserCheck} />}</Route>
      <Route path="/brokerage-contracts">{() => <GenericPage title="عقود الوساطة" icon={Briefcase} />}</Route>
      <Route path="/ad-licenses">{() => <GenericPage title="تراخيص الإعلانات" icon={Globe} />}</Route>

      {/* المستأجرون */}
      <Route path="/tenants" component={Tenants} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/lease-builder">{() => <GenericPage title="إنشاء عقد جديد" icon={FileText} />}</Route>
      <Route path="/e-signature">{() => <GenericPage title="التوقيع الإلكتروني" icon={ClipboardList} />}</Route>
      <Route path="/lease-alerts" component={LeaseAlerts} />
      <Route path="/tenant-portal">{() => <GenericPage title="بوابة المستأجر" icon={Users} />}</Route>
      <Route path="/tenant-analytics">{() => <GenericPage title="تحليلات المستأجرين" icon={BarChart2} />}</Route>
      <Route path="/tenant-rating">{() => <GenericPage title="تقييم المستأجرين" icon={Star} />}</Route>

      {/* المالية */}
      <Route path="/payments" component={Payments} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/auto-invoicing">{() => <GenericPage title="الفواتير التلقائية" icon={Receipt} />}</Route>
      <Route path="/expenses" component={Expenses} />
      <Route path="/overdue-tracker" component={OverdueTracker} />
      <Route path="/financial-statements">{() => <GenericPage title="كشوف الحسابات" icon={DollarSign} />}</Route>
      <Route path="/payment-timeline">{() => <GenericPage title="الجدول الزمني للدفعات" icon={Calendar} />}</Route>
      <Route path="/accounting">{() => <GenericPage title="المحاسبة" icon={DollarSign} />}</Route>
      <Route path="/payment-gateway">{() => <GenericPage title="بوابة الدفع" icon={DollarSign} />}</Route>

      {/* الصيانة */}
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/maintenance-manager">{() => <GenericPage title="إدارة الصيانة" icon={Wrench} />}</Route>
      <Route path="/preventive-maintenance">{() => <GenericPage title="الصيانة الوقائية" icon={Wrench} />}</Route>
      <Route path="/appointments">{() => <GenericPage title="المواعيد" icon={Calendar} />}</Route>
      <Route path="/tickets">{() => <GenericPage title="تذاكر الدعم" icon={MessageSquare} />}</Route>
      <Route path="/technician-dashboard">{() => <GenericPage title="لوحة الفنيين" icon={Wrench} />}</Route>
      <Route path="/technician-manager">{() => <GenericPage title="إدارة الفنيين" icon={Users} />}</Route>
      <Route path="/inventory">{() => <GenericPage title="إدارة المخزون" icon={Database} />}</Route>

      {/* التقارير */}
      <Route path="/financial-reports" component={FinancialReports} />
      <Route path="/financial-summary">{() => <GenericPage title="الملخص المالي" icon={TrendingUp} />}</Route>
      <Route path="/financial-forecasting">{() => <GenericPage title="التنبؤ المالي" icon={TrendingUp} />}</Route>
      <Route path="/roi-reports">{() => <GenericPage title="تقارير العائد" icon={BarChart2} />}</Route>
      <Route path="/property-performance">{() => <GenericPage title="أداء العقارات" icon={Building2} />}</Route>
      <Route path="/property-single-report">{() => <GenericPage title="تقرير عقار منفرد" icon={FileText} />}</Route>
      <Route path="/market-research">{() => <GenericPage title="الدراسة السوقية" icon={Globe} />}</Route>
      <Route path="/print-center">{() => <GenericPage title="مركز الطباعة" icon={Printer} />}</Route>

      {/* العمليات */}
      <Route path="/complaints" component={Complaints} />
      <Route path="/documents" component={Documents} />
      <Route path="/communication">{() => <GenericPage title="منصة التواصل" icon={MessageSquare} />}</Route>
      <Route path="/whatsapp">{() => <GenericPage title="واتساب" icon={Send} />}</Route>
      <Route path="/alerts">{() => <GenericPage title="لوحة التنبيهات" icon={Bell} />}</Route>
      <Route path="/archive">{() => <GenericPage title="الأرشيف" icon={Archive} />}</Route>

      {/* الإعدادات */}
      <Route path="/settings" component={Settings} />
      <Route path="/data-import">{() => <GenericPage title="استيراد البيانات" icon={Database} />}</Route>
      <Route path="/system-guide">{() => <GenericPage title="دليل النظام" icon={HelpCircle} />}</Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
