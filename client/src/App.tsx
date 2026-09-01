/*
 * رمز الإبداع - منصة إدارة الأملاك
 * App.tsx - التوجيه الرئيسي مع المصادقة عبر Base44
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router } from "wouter";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import TechnicianPortal from "./pages/TechnicianPortal";
import { isAuthenticated as checkLocalAuth, getSession } from "./lib/auth";

// الصفحات الأساسية
import Dashboard from "./pages/Dashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SmartSuggestions from "./pages/SmartSuggestions";

// العقارات
import Properties from "./pages/Properties";
import PropertyFormPage from "./pages/PropertyFormPage";
import PropertyDetail from "./pages/PropertyDetail";
import UnitStatus from "./pages/UnitStatus";
import PropertyComparison from "./pages/PropertyComparison";
import PropertyDocuments from "./pages/PropertyDocuments";
import MapView from "./pages/MapView";
import Owners from "./pages/Owners";
import OwnerPortal from "./pages/OwnerPortal";
import BrokerageContracts from "./pages/BrokerageContracts";
import AdLicenses from "./pages/AdLicenses";

// المستأجرون
import Tenants from "./pages/Tenants";
import Contracts from "./pages/Contracts";
import LeaseBuilder from "./pages/LeaseBuilder";
import ESignature from "./pages/ESignature";
import LeaseAlerts from "./pages/LeaseAlerts";
import TenantPortal from "./pages/TenantPortal";
import TenantAnalytics from "./pages/TenantAnalytics";
import TenantRating from "./pages/TenantRating";

// المالية
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import AutoInvoicing from "./pages/AutoInvoicing";
import Expenses from "./pages/Expenses";
import OverdueTracker from "./pages/OverdueTracker";
import FinancialStatements from "./pages/FinancialStatements";
import PaymentTimeline from "./pages/PaymentTimeline";
import Accounting from "./pages/Accounting";
import PaymentGateway from "./pages/PaymentGateway";

// الصيانة
import Maintenance from "./pages/Maintenance";
import MaintenanceManager from "./pages/MaintenanceManager";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Appointments from "./pages/Appointments";
import Tickets from "./pages/Tickets";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianManager from "./pages/TechnicianManager";
import Inventory from "./pages/Inventory";

// التقارير
import ReportsCenter from "./pages/ReportsCenter";
import FinancialReports from "./pages/FinancialReports";
import FinancialSummary from "./pages/FinancialSummary";
import FinancialForecasting from "./pages/FinancialForecasting";
import ROI from "./pages/ROI";
import PropertyPerformance from "./pages/PropertyPerformance";
import PropertySingleReport from "./pages/PropertySingleReport";
import PropertyOfficialReport from "./pages/PropertyOfficialReport";
import MarketResearch from "./pages/MarketResearch";
import PrintCenter from "./pages/PrintCenter";
import OccupancyReport from "./pages/OccupancyReport";

// العمليات
import Complaints from "./pages/Complaints";
import Documents from "./pages/Documents";
import Communication from "./pages/Communication";
import WhatsApp from "./pages/WhatsApp";
import AlertsDashboard from "./pages/AlertsDashboard";
import Archive from "./pages/Archive";
import NotificationsCenter from "./pages/NotificationsCenter";
import CRM from "./pages/CRM";

// الإعدادات
import Settings from "./pages/Settings";
import DataImport from "./pages/DataImport";
import SystemGuide from "./pages/SystemGuide";
import DatabaseSetup from "./pages/DatabaseSetup";
import Backup from "./pages/Backup";
import ActivityLog from "./pages/ActivityLog";
import UserManagement from "./pages/UserManagement";
import CompanySettings from "./pages/CompanySettings";
import RentManagement from "./pages/RentManagement";
import Ejar from "./pages/Ejar";
import EjarSync from "./pages/EjarSync";
import EjarContractAnalyzer from "./pages/EjarContractAnalyzer";
import Integrations from "./pages/Integrations";

// Integration Settings Pages
import IntegrationEjarSettings from "./pages/IntegrationEjarSettings";
import IntegrationWhatsAppSettings from "./pages/IntegrationWhatsAppSettings";
import IntegrationEmailSettings from "./pages/IntegrationEmailSettings";
import IntegrationStripeSettings from "./pages/IntegrationStripeSettings";
import IntegrationSMSSettings from "./pages/IntegrationSMSSettings";
import SMSSender from "./pages/SMSSender";
import IntegrationGoogleSettings from "./pages/IntegrationGoogleSettings";
import IntegrationSlackSettings from "./pages/IntegrationSlackSettings";
import IntegrationSettings from "./pages/IntegrationSettings";

function AppRouter() {
  return (
    <Router base="/ramza">
    <Switch>
      {/* الرئيسية */}
      <Route path="/" component={Dashboard} />
      <Route path="/manager-dashboard" component={ManagerDashboard} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/smart-insights" component={SmartSuggestions} />
      <Route path="/dashboard" component={Dashboard} />

      {/* العقارات */}
      <Route path="/properties" component={Properties} />
      <Route path="/property-form" component={PropertyFormPage} />
      <Route path="/property-detail" component={PropertyDetail} />
      <Route path="/unit-status" component={UnitStatus} />
      <Route path="/property-comparison" component={PropertyComparison} />
      <Route path="/property-documents" component={PropertyDocuments} />
      <Route path="/map-view" component={MapView} />
      <Route path="/owners" component={Owners} />
      <Route path="/owner-portal" component={OwnerPortal} />
      <Route path="/brokerage-contracts" component={BrokerageContracts} />
      <Route path="/ad-licenses" component={AdLicenses} />
      <Route path="/buildings" component={Properties} />
      <Route path="/units" component={UnitStatus} />
      <Route path="/ownership-docs" component={PropertyDocuments} />

      {/* المستأجرون */}
      <Route path="/tenants" component={Tenants} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/lease-builder" component={LeaseBuilder} />
      <Route path="/e-signature" component={ESignature} />
      <Route path="/lease-alerts" component={LeaseAlerts} />
      <Route path="/tenant-portal" component={TenantPortal} />
      <Route path="/tenant-analytics" component={TenantAnalytics} />
      <Route path="/tenant-rating" component={TenantRating} />
      <Route path="/contracts/archived" component={Archive} />
      <Route path="/tenants/behavior" component={TenantAnalytics} />

      {/* المالية */}
      <Route path="/payments" component={Payments} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/auto-invoicing" component={AutoInvoicing} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/overdue-tracker" component={OverdueTracker} />
      <Route path="/financial-statements" component={FinancialStatements} />
      <Route path="/payment-timeline" component={PaymentTimeline} />
      <Route path="/accounting" component={Accounting} />
      <Route path="/payment-gateway" component={PaymentGateway} />
      <Route path="/finance" component={FinancialSummary} />
      <Route path="/finance/revenues" component={Payments} />
      <Route path="/finance/expenses" component={Expenses} />
      <Route path="/finance/owners" component={FinancialStatements} />
      <Route path="/finance/ejar-transfers" component={Ejar} />
      <Route path="/finance/contract-financials" component={FinancialReports} />

      {/* الصيانة */}
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/maintenance-manager" component={MaintenanceManager} />
      <Route path="/preventive-maintenance" component={PreventiveMaintenance} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/technician-dashboard" component={TechnicianDashboard} />
      <Route path="/technician-manager" component={TechnicianManager} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/maintenance/technicians" component={TechnicianManager} />

      {/* التقارير */}
      <Route path="/reports-center" component={ReportsCenter} />
      <Route path="/financial-reports" component={FinancialReports} />
      <Route path="/financial-summary" component={FinancialSummary} />
      <Route path="/financial-forecasting" component={FinancialForecasting} />
      <Route path="/roi-reports" component={ROI} />
      <Route path="/property-performance" component={PropertyPerformance} />
      <Route path="/property-single-report" component={PropertySingleReport} />
      <Route path="/property-official-report" component={PropertyOfficialReport} />
      <Route path="/market-research" component={MarketResearch} />
      <Route path="/print-center" component={PrintCenter} />
      <Route path="/occupancy-report" component={OccupancyReport} />
      <Route path="/reports/payments" component={ReportsCenter} />
      <Route path="/reports/contracts" component={ReportsCenter} />
      <Route path="/reports/vacancy" component={OccupancyReport} />
      <Route path="/reports/owner-profitability" component={ROI} />
      <Route path="/reports/office-profitability" component={FinancialReports} />

      {/* العمليات */}
      <Route path="/complaints" component={Complaints} />
      <Route path="/documents" component={Documents} />
      <Route path="/communication" component={Communication} />
      <Route path="/whatsapp" component={WhatsApp} />
      <Route path="/alerts" component={AlertsDashboard} />
      <Route path="/archive" component={Archive} />
      <Route path="/notifications" component={NotificationsCenter} />
      <Route path="/crm" component={CRM} />
      <Route path="/crm/requests" component={CRM} />
      <Route path="/crm/offers" component={CRM} />
      <Route path="/crm/offers/map" component={MapView} />
      <Route path="/whatsapp/office-link" component={IntegrationWhatsAppSettings} />
      <Route path="/whatsapp-history" component={WhatsApp} />
      <Route path="/whatsapp-settings" component={IntegrationWhatsAppSettings} />
      <Route path="/whatsapp/agent-analytics" component={WhatsApp} />
      <Route path="/whatsapp/requests" component={Communication} />
      <Route path="/payment-receipts" component={Payments} />
      <Route path="/follow-ups" component={NotificationsCenter} />
      <Route path="/calendar" component={Appointments} />
      <Route path="/ai-assistant" component={SmartSuggestions} />
      <Route path="/risk-radar" component={OverdueTracker} />
      <Route path="/office-health" component={AnalyticsDashboard} />
      <Route path="/zatca" component={AutoInvoicing} />
      <Route path="/zatca/owners" component={Accounting} />
      <Route path="/tasks" component={Appointments} />
      <Route path="/tasks/team" component={TechnicianManager} />

      {/* الإعدادات */}
      <Route path="/settings" component={Settings} />
      <Route path="/data-import" component={DataImport} />
      <Route path="/system-guide" component={SystemGuide} />
      <Route path="/database-setup" component={DatabaseSetup} />
      <Route path="/backup" component={Backup} />
      <Route path="/activity-log" component={ActivityLog} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/company-settings" component={CompanySettings} />
      <Route path="/rent-management" component={RentManagement} />
      <Route path="/ejar" component={Ejar} />
      <Route path="/ejar-sync" component={EjarSync} />
      <Route path="/ejar-contract-analyzer" component={EjarContractAnalyzer} />
      <Route path="/integration-settings" component={IntegrationSettings} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/integrations/ejar" component={IntegrationEjarSettings} />
      <Route path="/integrations/whatsapp" component={IntegrationWhatsAppSettings} />
      <Route path="/integrations/email" component={IntegrationEmailSettings} />
      <Route path="/integrations/stripe" component={IntegrationStripeSettings} />
      <Route path="/integrations/sms" component={IntegrationSMSSettings} />
      <Route path="/sms-sender" component={SMSSender} />
      <Route path="/integrations/google" component={IntegrationGoogleSettings} />
      <Route path="/integrations/slack" component={IntegrationSlackSettings} />
      <Route path="/settings/subscription" component={Settings} />
      <Route path="/settings/sms" component={IntegrationSMSSettings} />
      <Route path="/legal" component={Documents} />
      <Route path="/settings/import-data" component={DataImport} />
      <Route path="/settings/branding" component={CompanySettings} />
      <Route path="/settings/notice" component={NotificationsCenter} />
      <Route path="/settings/documents" component={Documents} />
      <Route path="/settings/cities" component={Settings} />
      <Route path="/settings/nationalities" component={Settings} />
      <Route path="/settings/property-types" component={Settings} />
      <Route path="/settings/spec-types" component={Settings} />
      <Route path="/settings/id-types" component={Settings} />
      <Route path="/settings/purposes" component={Settings} />
      <Route path="/settings/rent-types" component={Settings} />
      <Route path="/settings/deal-types" component={Settings} />
      <Route path="/settings/crm-lists" component={Settings} />
      <Route path="/settings/maintenance-categories" component={Settings} />
      <Route path="/settings/expense-categories" component={Settings} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Router>
  );
}

function App() {
  const [authed, setAuthed] = useState(checkLocalAuth);
  const [, forceUpdate] = useState(0);

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />;
  }

  const session = getSession();

  const onLogout = () => { setAuthed(false); forceUpdate(n => n + 1); };

  if (session?.role === 'owner') return <OwnerDashboard onLogout={onLogout} />;
  if (session?.role === 'employee') return <EmployeeDashboard onLogout={onLogout} />;
  if (session?.role === 'tenant') return <TenantDashboard onLogout={onLogout} />;
  if (session?.role === 'technician') return <TechnicianPortal onLogout={onLogout} />;

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
