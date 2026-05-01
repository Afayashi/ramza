/*
 * صفحة التقارير الشاملة — رمز الإبداع
 * تشمل: العقارات، الوحدات، العقود، المالية، مستخدمي المكتب
 * مع فلترة متقدمة وجدولة دورية
 */
import { useState, useMemo, useRef } from "react";
import {
  Building2, Home, FileText, DollarSign, Users, Download,
  Calendar, Filter, Clock, RefreshCw, ChevronDown,
  TrendingUp, TrendingDown, CheckCircle, AlertCircle,
  Printer, Mail, BarChart2, PieChart, Table, Loader2,
  Bell, Plus, Trash2, Eye,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useMultiEntityData } from "@/hooks/useEntityData";
import { toast } from "sonner";

// ── Helpers ────────────────────────────────────────────────────────────────────
const GOLD = "#C8A951";
const GREEN = "#0ea472";
const fmt = (v: number) => (v || 0).toLocaleString("ar-SA") + " ر.س";
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const now = new Date();
const thisMonth = now.toISOString().slice(0, 7);
const thisYear = now.getFullYear().toString();

// ── Types ──────────────────────────────────────────────────────────────────────
type ReportType = "properties" | "units" | "contracts" | "financial" | "users";
type Period = "all" | "month" | "year" | "custom";
type Schedule = { id: string; report: ReportType; freq: string; email: string; active: boolean };

// ── Report tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "properties" as ReportType, label: "العقارات",    icon: Building2, color: GOLD },
  { id: "units"       as ReportType, label: "الوحدات",     icon: Home,      color: "#3b82f6" },
  { id: "contracts"  as ReportType, label: "العقود",      icon: FileText,  color: GREEN },
  { id: "financial"  as ReportType, label: "المالية",     icon: DollarSign,color: "#8b5cf6" },
  { id: "users"      as ReportType, label: "مستخدمو المكتب", icon: Users, color: "#f59e0b" },
];

// ── Small components ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + "20" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-bold truncate">{label}</p>
        <p className="text-lg font-black text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ title, onExport, onPrint }: { title: string; onExport: () => void; onPrint: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-black text-sm text-foreground">{title}</h3>
      <div className="flex gap-1.5">
        <button onClick={onPrint}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-sidebar transition">
          <Printer size={11} /> طباعة
        </button>
        <button onClick={onExport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border text-white transition"
          style={{ background: GOLD, borderColor: GOLD }}>
          <Download size={11} /> تصدير CSV
        </button>
      </div>
    </div>
  );
}

function DataTable({ headers, rows, emptyMsg = "لا توجد بيانات" }: { headers: string[]; rows: (string | number)[][]; emptyMsg?: string }) {
  if (rows.length === 0) return (
    <div className="py-10 text-center text-muted-foreground text-xs">{emptyMsg}</div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-sidebar">
            {headers.map(h => (
              <th key={h} className="px-3 py-2.5 text-right font-bold text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border hover:bg-sidebar/50 transition">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-foreground whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CSV export ─────────────────────────────────────────────────────────────────
function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const BOM = "\uFEFF";
  const csv = BOM + [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
  toast.success("تم تصدير التقرير بنجاح");
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ReportsCenter() {
  const [activeTab, setActiveTab] = useState<ReportType>("properties");
  const [period, setPeriod] = useState<Period>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [city, setCity] = useState("all");
  const [propType, setPropType] = useState("all");
  const [status, setStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    try { return JSON.parse(localStorage.getItem("report_schedules") || "[]"); } catch { return []; }
  });
  const [newSched, setNewSched] = useState({ report: "financial" as ReportType, freq: "monthly", email: "" });

  const { data, loading } = useMultiEntityData([
    { name: "Property", limit: 2000 },
    { name: "Unit",     limit: 5000 },
    { name: "Lease",    limit: 2000 },
    { name: "Payment",  limit: 5000 },
    { name: "Tenant",   limit: 1000 },
  ]);

  const properties = data.Property || [];
  const units      = data.Unit     || [];
  const leases     = data.Lease    || [];
  const payments   = data.Payment  || [];
  const tenants    = data.Tenant   || [];

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const inPeriod = (dateStr: string) => {
    if (!dateStr) return period === "all";
    if (period === "month") return dateStr.startsWith(thisMonth);
    if (period === "year")  return dateStr.startsWith(thisYear);
    if (period === "custom" && dateFrom && dateTo) return dateStr >= dateFrom && dateStr <= dateTo;
    return true;
  };

  // ── Properties report ──────────────────────────────────────────────────────
  const filteredProps = useMemo(() => properties.filter(p => {
    if (city !== "all" && (p["المدينة"] || p.city || "") !== city) return false;
    if (propType !== "all" && (p["نوع_العقار"] || p.type || "") !== propType) return false;
    return true;
  }), [properties, city, propType]);

  const propRows: (string | number)[][] = filteredProps.map(p => [
    p["اسم_العقار"] || p.name || "—",
    p["نوع_العقار"] || p.type || "—",
    p["المدينة"] || p.city || "—",
    p["المنطقة"] || p.district || "—",
    p["رقم_وثيقة_الملكية"] || p.deed_number || "—",
    p["إجمالي_الوحدات"] || "—",
  ]);

  const cities = useMemo(() => [...new Set(properties.map(p => p["المدينة"] || p.city || "").filter(Boolean))], [properties]);
  const propTypes = useMemo(() => [...new Set(properties.map(p => p["نوع_العقار"] || p.type || "").filter(Boolean))], [properties]);

  // ── Units report ───────────────────────────────────────────────────────────
  const filteredUnits = useMemo(() => units.filter(u => {
    if (status !== "all") {
      const s = u["حالة_الوحدة"] || u["الحالة"] || u.status || "";
      if (status === "occupied" && !["مؤجرة", "مشغولة", "occupied"].includes(s)) return false;
      if (status === "available" && !["متاحة", "available"].includes(s)) return false;
    }
    return true;
  }), [units, status]);

  const unitRows: (string | number)[][] = filteredUnits.map(u => [
    u["رقم_الوحدة"] || u.unit_number || "—",
    u["اسم_العقار"] || u.property_name || "—",
    u["نوع_الوحدة"] || u.type || "—",
    u["مساحة_الوحدة"] || u["المساحة"] || u.area || "—",
    u["حالة_الوحدة"] || u["الحالة"] || u.status || "—",
    u["رقم_وثيقة_الملكية"] || u.deed_number || "—",
  ]);

  const occupiedCount  = units.filter(u => ["مؤجرة", "مشغولة", "occupied"].includes(u["حالة_الوحدة"] || u["الحالة"] || u.status || "")).length;
  const availableCount = units.length - occupiedCount;

  // ── Contracts report ───────────────────────────────────────────────────────
  const filteredLeases = useMemo(() => leases.filter(l => {
    const start = l["تاريخ_بدء_الإيجار"] || l["تاريخ_البداية"] || l.start_date || "";
    if (!inPeriod(start)) return false;
    if (status !== "all") {
      const s = l["حالة_العقد"] || l.status || "";
      if (status === "active"  && !["نشط", "active"].includes(s)) return false;
      if (status === "expired" && !["منتهي", "expired"].includes(s)) return false;
    }
    return true;
  }), [leases, period, status, dateFrom, dateTo]);

  const leaseRows: (string | number)[][] = filteredLeases.map(l => [
    l["رقم_العقد"] || l.contract_number || "—",
    l["اسم_المستأجر"] || l.tenant_name || "—",
    l["اسم_العقار"] || l.property_name || "—",
    l["رقم_الوحدة"] || l.unit_number || "—",
    l["تاريخ_بدء_الإيجار"] || l.start_date || "—",
    l["تاريخ_انتهاء_الإيجار"] || l.end_date || "—",
    fmt(Number(l["إجمالي_قيمة_العقد"] || l["قيمة_الإيجار"] || l.total_value || 0)),
    l["حالة_العقد"] || l.status || "—",
  ]);

  const activeLeases  = leases.filter(l => ["نشط", "active"].includes(l["حالة_العقد"] || l.status || "")).length;
  const expiredLeases = leases.filter(l => ["منتهي", "expired"].includes(l["حالة_العقد"] || l.status || "")).length;

  // ── Financial report ───────────────────────────────────────────────────────
  const filteredPayments = useMemo(() => payments.filter(p => {
    const date = p["تاريخ_الاستحقاق"] || p["تاريخ_الدفع"] || p.due_date || "";
    return inPeriod(date);
  }), [payments, period, dateFrom, dateTo]);

  const paid    = filteredPayments.filter(p => ["مدفوع", "paid", "مكتمل"].includes(p["حالة_القسط"] || p["حالة_الدفع"] || p.status || ""));
  const pending = filteredPayments.filter(p => ["متأخر", "overdue", "pending", "معلق"].includes(p["حالة_القسط"] || p["حالة_الدفع"] || p.status || ""));
  const totalRevenue  = paid.reduce((s, p) => s + Number(p["المبلغ_الكلي"] || p["قيمة_القسط"] || p.amount || 0), 0);
  const totalPending  = pending.reduce((s, p) => s + Number(p["المبلغ_المتبقي"] || p["قيمة_القسط"] || p.amount || 0), 0);

  const finRows: (string | number)[][] = filteredPayments.map(p => [
    p["رقم_الفاتورة"] || p["رقم_العقد"] || "—",
    p["اسم_العقار"] || p.property_name || "—",
    p["تاريخ_الاستحقاق"] || p.due_date || "—",
    fmt(Number(p["المبلغ_الكلي"] || p["قيمة_القسط"] || p.amount || 0)),
    fmt(Number(p["المبلغ_المدفوع"] || p.paid_amount || 0)),
    fmt(Number(p["المبلغ_المتبقي"] || p.remaining || 0)),
    p["حالة_القسط"] || p["حالة_الدفع"] || p.status || "—",
  ]);

  // ── Users/Office report ────────────────────────────────────────────────────
  const userRows: (string | number)[][] = tenants.map((u, i) => [
    i + 1,
    u["اسم_المستأجر"] || u["الاسم"] || u.name || "—",
    u["رقم_هوية_المستأجر"] || u.national_id || "—",
    u["رقم_الجوال"] || u.phone || "—",
    u["البريد_الإلكتروني"] || u.email || "—",
    leases.filter(l => (l["رقم_هوية_المستأجر"] || l.tenant_id) === (u["رقم_هوية_المستأجر"] || u.national_id)).length || "—",
  ]);

  // ── Schedule handlers ──────────────────────────────────────────────────────
  const saveSchedule = () => {
    if (!newSched.email) { toast.error("أدخل البريد الإلكتروني"); return; }
    const s: Schedule = { ...newSched, id: Date.now().toString(), active: true };
    const updated = [...schedules, s];
    setSchedules(updated);
    localStorage.setItem("report_schedules", JSON.stringify(updated));
    toast.success("تم جدولة التقرير بنجاح");
    setNewSched({ report: "financial", freq: "monthly", email: "" });
  };

  const removeSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem("report_schedules", JSON.stringify(updated));
    toast.success("تم حذف الجدولة");
  };

  // ── Current tab content ────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeTab === "properties") return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="إجمالي العقارات"  value={filteredProps.length}  icon={Building2}   color={GOLD} />
          <KpiCard label="فلل"               value={filteredProps.filter(p => (p["نوع_العقار"] || "").includes("فيلا")).length} icon={Home} color="#f59e0b" />
          <KpiCard label="شقق"               value={filteredProps.filter(p => (p["نوع_العقار"] || "").includes("شقة")).length} icon={Home} color="#3b82f6" />
          <KpiCard label="مدن مختلفة"        value={new Set(filteredProps.map(p => p["المدينة"] || p.city || "")).size} icon={Building2} color="#8b5cf6" />
        </div>
        <SectionTitle title="قائمة العقارات"
          onExport={() => exportCSV(["اسم العقار","النوع","المدينة","المنطقة","رقم الصك","الوحدات"], propRows, "properties_report.csv")}
          onPrint={() => window.print()} />
        <DataTable headers={["اسم العقار","النوع","المدينة","المنطقة","رقم الصك","الوحدات"]} rows={propRows} emptyMsg="لا توجد عقارات مطابقة للفلتر" />
      </>
    );

    if (activeTab === "units") return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="إجمالي الوحدات"  value={units.length}      icon={Home}      color="#3b82f6" />
          <KpiCard label="مؤجرة"            value={occupiedCount}     icon={CheckCircle} color={GREEN} sub={`${pct(occupiedCount, units.length)}%`} />
          <KpiCard label="متاحة"            value={availableCount}    icon={AlertCircle} color="#f59e0b" />
          <KpiCard label="نسبة الإشغال"     value={`${pct(occupiedCount, units.length)}%`} icon={BarChart2} color={GOLD} />
        </div>
        <SectionTitle title="قائمة الوحدات"
          onExport={() => exportCSV(["رقم الوحدة","العقار","النوع","المساحة","الحالة","رقم الصك"], unitRows, "units_report.csv")}
          onPrint={() => window.print()} />
        <DataTable headers={["رقم الوحدة","العقار","النوع","المساحة م²","الحالة","رقم الصك"]} rows={unitRows} emptyMsg="لا توجد وحدات مطابقة للفلتر" />
      </>
    );

    if (activeTab === "contracts") return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="إجمالي العقود"   value={leases.length}    icon={FileText}    color={GREEN} />
          <KpiCard label="عقود نشطة"        value={activeLeases}     icon={CheckCircle} color={GREEN}   sub={`${pct(activeLeases, leases.length)}%`} />
          <KpiCard label="عقود منتهية"      value={expiredLeases}    icon={AlertCircle} color="#f59e0b" />
          <KpiCard label="إجمالي قيمة العقود" value={fmt(filteredLeases.reduce((s,l) => s + Number(l["إجمالي_قيمة_العقد"] || l.total_value || 0), 0))} icon={DollarSign} color="#8b5cf6" />
        </div>
        <SectionTitle title="قائمة العقود"
          onExport={() => exportCSV(["رقم العقد","المستأجر","العقار","الوحدة","تاريخ البدء","تاريخ الانتهاء","القيمة","الحالة"], leaseRows, "contracts_report.csv")}
          onPrint={() => window.print()} />
        <DataTable headers={["رقم العقد","المستأجر","العقار","الوحدة","تاريخ البدء","تاريخ الانتهاء","القيمة","الحالة"]} rows={leaseRows} emptyMsg="لا توجد عقود مطابقة للفلتر" />
      </>
    );

    if (activeTab === "financial") return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="إجمالي المحصّل"   value={fmt(totalRevenue)}  icon={TrendingUp}   color={GREEN} />
          <KpiCard label="المتأخرات"         value={fmt(totalPending)}  icon={TrendingDown} color="#ef4444" />
          <KpiCard label="أقساط مدفوعة"     value={paid.length}        icon={CheckCircle}  color={GREEN} />
          <KpiCard label="نسبة التحصيل"     value={`${pct(paid.length, filteredPayments.length)}%`} icon={BarChart2} color={GOLD} />
        </div>
        <SectionTitle title="التقرير المالي"
          onExport={() => exportCSV(["رقم الفاتورة","العقار","تاريخ الاستحقاق","الإجمالي","المدفوع","المتبقي","الحالة"], finRows, "financial_report.csv")}
          onPrint={() => window.print()} />
        <DataTable headers={["رقم الفاتورة","العقار","تاريخ الاستحقاق","الإجمالي","المدفوع","المتبقي","الحالة"]} rows={finRows} emptyMsg="لا توجد سجلات مالية" />
      </>
    );

    if (activeTab === "users") return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="إجمالي المستخدمين" value={tenants.length}  icon={Users}       color="#f59e0b" />
          <KpiCard label="لهم عقود نشطة"     value={tenants.filter(u => leases.some(l => ["نشط","active"].includes(l["حالة_العقد"] || l.status || "") && (l["رقم_هوية_المستأجر"] || l.tenant_id) === (u["رقم_هوية_المستأجر"] || u.national_id))).length} icon={CheckCircle} color={GREEN} />
          <KpiCard label="بدون عقود"          value={tenants.filter(u => !leases.some(l => (l["رقم_هوية_المستأجر"] || l.tenant_id) === (u["رقم_هوية_المستأجر"] || u.national_id))).length} icon={AlertCircle} color="#ef4444" />
          <KpiCard label="في هذا الشهر"       value={leases.filter(l => (l["تاريخ_بدء_الإيجار"] || "").startsWith(thisMonth)).length + " عقد جديد"} icon={Calendar} color="#8b5cf6" />
        </div>
        <SectionTitle title="قائمة مستخدمي المكتب"
          onExport={() => exportCSV(["#","الاسم","الهوية","الجوال","البريد","عدد العقود"], userRows, "users_report.csv")}
          onPrint={() => window.print()} />
        <DataTable headers={["#","الاسم","رقم الهوية","الجوال","البريد الإلكتروني","عدد العقود"]} rows={userRows} emptyMsg="لا توجد بيانات مستخدمين" />
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout pageTitle="مركز التقارير">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-base font-black text-foreground">مركز التقارير</h1>
          <p className="text-xs text-muted-foreground mt-0.5">إصدار تقارير مفصّلة وجدولتها بشكل دوري</p>
        </div>
        <button onClick={() => setShowSchedule(p => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition"
          style={{ borderColor: GOLD, color: GOLD }}>
          <Bell size={13} /> جدولة التقارير
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-sidebar rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex-1 justify-center ${activeTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={12} style={{ color: activeTab === t.id ? t.color : undefined }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">الفلاتر</span>
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            className="text-[10px] text-primary hover:underline flex items-center gap-1">
            {showFilters ? "إخفاء" : "عرض الكل"} <ChevronDown size={11} className={showFilters ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
        </div>

        {/* Period quick buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: "all" as Period, label: "الكل" },
            { id: "month" as Period, label: "هذا الشهر" },
            { id: "year" as Period, label: "هذه السنة" },
            { id: "custom" as Period, label: "مخصص" },
          ].map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${period === p.id ? "text-white" : "bg-sidebar text-muted-foreground hover:bg-sidebar/80"}`}
              style={period === p.id ? { background: GOLD } : {}}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {period === "custom" && (
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-1">من</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-1">إلى</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition" />
            </div>
          </div>
        )}

        {/* Extended filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
            {/* City */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">المدينة</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition">
                <option value="all">الكل</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Property type */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">نوع العقار</label>
              <select value={propType} onChange={e => setPropType(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition">
                <option value="all">الكل</option>
                {propTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">الحالة</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition">
                <option value="all">الكل</option>
                <option value="active">نشط / مؤجّر</option>
                <option value="available">متاح</option>
                <option value="expired">منتهي</option>
                <option value="occupied">مشغول</option>
              </select>
            </div>
            {/* Reset */}
            <div className="flex items-end">
              <button onClick={() => { setCity("all"); setPropType("all"); setStatus("all"); setPeriod("all"); setDateFrom(""); setDateTo(""); }}
                className="w-full px-2 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar transition">
                إعادة ضبط
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule panel */}
      {showSchedule && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <h3 className="font-black text-sm text-foreground flex items-center gap-2">
            <Bell size={14} style={{ color: GOLD }} /> جدولة التقارير الدورية
          </h3>
          {/* Add new schedule */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select value={newSched.report} onChange={e => setNewSched(p => ({ ...p, report: e.target.value as ReportType }))}
              className="px-3 py-2 rounded-xl border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition">
              {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select value={newSched.freq} onChange={e => setNewSched(p => ({ ...p, freq: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-border bg-sidebar text-xs text-foreground focus:outline-none focus:border-primary transition">
              <option value="daily">يومياً</option>
              <option value="weekly">أسبوعياً</option>
              <option value="monthly">شهرياً</option>
            </select>
            <input type="email" placeholder="البريد الإلكتروني" value={newSched.email}
              onChange={e => setNewSched(p => ({ ...p, email: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-border bg-sidebar text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              dir="ltr" />
            <button onClick={saveSchedule}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition"
              style={{ background: GREEN }}>
              <Plus size={13} /> إضافة جدولة
            </button>
          </div>
          {/* Existing schedules */}
          {schedules.length > 0 && (
            <div className="space-y-1.5">
              {schedules.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2 bg-sidebar rounded-xl border border-border">
                  <Clock size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-xs font-bold text-foreground">{TABS.find(t => t.id === s.report)?.label}</span>
                  <span className="text-[10px] text-muted-foreground">{s.freq === "daily" ? "يومياً" : s.freq === "weekly" ? "أسبوعياً" : "شهرياً"}</span>
                  <span className="text-[10px] text-primary flex-1" dir="ltr">{s.email}</span>
                  <button onClick={() => removeSchedule(s.id)}
                    className="text-red-400 hover:text-red-300 transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {schedules.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-2">لا توجد جدولات بعد</p>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {renderContent()}
        </div>
      )}
    </DashboardLayout>
  );
}
