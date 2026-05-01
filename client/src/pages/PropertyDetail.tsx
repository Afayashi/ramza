/*
 * تفاصيل العقار - رمز الإبداع
 * ربط كامل: عقار → وحدات → عقود → مدفوعات
 */
import { useMemo, useState } from 'react';
import {
  Building2, Home, Users, DollarSign, Wrench, FileText,
  MapPin, Calendar, ArrowRight, ClipboardList, TrendingUp,
  CheckCircle, Clock, XCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { usePropertyFullData, linkUnitsToContracts } from '@/hooks/useLinkedData';
import { Link, useSearch } from 'wouter';

const GOLD = '#C8A951';

// ── بطاقة إحصائية ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

// ── بطاقة عقد مع مدفوعاته ───────────────────────────────────────────────────
function ContractCard({ contract, payments }: { contract: any; payments: any[] }) {
  const [open, setOpen] = useState(false);
  const contractNo = contract['رقم_العقد'] || '';
  const myPayments = payments.filter(f => String(f['رقم_العقد'] ?? '') === String(contractNo));
  const totalPaid = myPayments.reduce((s, f) => s + Number(f['المبلغ_المدفوع'] ?? 0), 0);
  const totalPending = myPayments.reduce((s, f) => s + Number(f['المبلغ_المتبقي'] ?? 0), 0);
  const statusColor: Record<string, string> = { 'نشط': 'text-emerald-400 bg-emerald-400/10', 'منتهي': 'text-red-400 bg-red-400/10', 'ملغي': 'text-gray-400 bg-gray-400/10' };
  const sc = statusColor[contract['حالة_العقد']] || 'text-blue-400 bg-blue-400/10';

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-3 flex items-center justify-between text-right hover:bg-accent/30 transition">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText size={14} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{contract['اسم_المستأجر'] || 'بدون اسم'}</p>
            <p className="text-[10px] text-muted-foreground">
              وحدة {contract['رقم_الوحدة'] || '—'} &nbsp;|&nbsp;
              {new Date(contract['تاريخ_بدء_الإيجار'] || '').toLocaleDateString('ar-SA', { dateStyle: 'short' })} ← {new Date(contract['تاريخ_انتهاء_الإيجار'] || '').toLocaleDateString('ar-SA', { dateStyle: 'short' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc}`}>{contract['حالة_العقد'] || '—'}</span>
          <p className="text-xs font-bold" style={{ color: GOLD }}>{Number(contract['إجمالي_قيمة_العقد'] ?? 0).toLocaleString('ar-SA')} ر.س</p>
          {open ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border bg-sidebar/30 p-3 space-y-2">
          {/* ملخص مالي */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-muted-foreground">مدفوع</p>
              <p className="text-xs font-bold text-emerald-400">{totalPaid.toLocaleString('ar-SA')} ر.س</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-muted-foreground">متبقي</p>
              <p className="text-xs font-bold text-amber-400">{totalPending.toLocaleString('ar-SA')} ر.س</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-muted-foreground">الأقساط</p>
              <p className="text-xs font-bold" style={{ color: GOLD }}>{myPayments.length}</p>
            </div>
          </div>

          {/* قائمة الأقساط */}
          {myPayments.slice(0, 6).map((f: any, i: number) => {
            const paid = Number(f['المبلغ_المدفوع'] ?? 0);
            const total = Number(f['قيمة_القسط'] ?? 0);
            const status = f['حالة_القسط'] || f['حالة_الفاتورة'] || '';
            const isPaid = paid >= total && total > 0;
            return (
              <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-border last:border-0">
                <div className="flex items-center gap-1.5">
                  {isPaid
                    ? <CheckCircle size={11} className="text-emerald-400" />
                    : <Clock size={11} className="text-amber-400" />}
                  <span className="text-muted-foreground">قسط {i + 1}</span>
                  <span className="text-foreground/60">| {f['تاريخ_الاستحقاق'] || ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isPaid ? 'text-emerald-400' : 'text-amber-400'}>{status}</span>
                  <span className="font-medium">{Number(f['قيمة_القسط'] ?? 0).toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>
            );
          })}
          {myPayments.length > 6 && (
            <p className="text-[10px] text-muted-foreground text-center">+ {myPayments.length - 6} أقساط أخرى</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── صفحة تفاصيل العقار ───────────────────────────────────────────────────────
export default function PropertyDetail() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const propertyId = params.get('id');
  const { data, loading } = useMultiEntityData([{ name: 'Property' }]);
  const [tab, setTab] = useState<'units' | 'contracts' | 'payments'>('units');

  const property = useMemo(() => {
    const props = data.Property || [];
    return propertyId ? props.find(p => String(p.id) === propertyId) : props[0];
  }, [data, propertyId]);

  const { units, contracts, payments, stats } = usePropertyFullData(property);
  const linkedUnits = useMemo(() => linkUnitsToContracts(units, contracts), [units, contracts]);

  if (loading) return <DashboardLayout pageTitle="تفاصيل العقار"><LoadingState /></DashboardLayout>;
  if (!property) return (
    <DashboardLayout pageTitle="تفاصيل العقار">
      <EmptyState title="لم يتم العثور على العقار" description="اختر عقاراً من صفحة العقارات" />
    </DashboardLayout>
  );

  const name = property['اسم_العقار'] || property.name || 'بدون اسم';
  const type = property['نوع_العقار'] || property.type || '';
  const city = property['المدينة'] || property.city || '';
  const region = property['المنطقة'] || '';
  const deed  = property['رقم_وثيقة_الملكية'] || '';

  const tabs = [
    { id: 'units' as const,     label: `الوحدات (${units.length})`,     icon: Home },
    { id: 'contracts' as const, label: `العقود (${contracts.length})`,   icon: FileText },
    { id: 'payments' as const,  label: `الأقساط (${payments.length})`,   icon: DollarSign },
  ];

  return (
    <DashboardLayout pageTitle="تفاصيل العقار">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/properties" className="text-muted-foreground hover:text-foreground transition text-[11px] flex items-center gap-1">
              <ArrowRight size={12} /> العقارات
            </Link>
            <span className="text-muted-foreground text-[11px]">/</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
            {type && <span className="flex items-center gap-1"><Building2 size={11} />{type}</span>}
            {city && <span className="flex items-center gap-1"><MapPin size={11} />{region} - {city}</span>}
            {deed && <span className="text-[10px] font-mono text-muted-foreground">صك: {deed}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/property-form">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition">
              <ClipboardList size={14} /> نموذج متكامل
            </button>
          </Link>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="الوحدات" value={stats.totalUnits} icon={Home} color={GOLD} />
        <StatCard label="نسبة الإشغال" value={`${stats.occupancyRate}%`} icon={Users} color="#059669" />
        <StatCard label="إجمالي الإيجارات" value={`${(stats.totalRevenue / 1000).toFixed(0)}K ر.س`} icon={DollarSign} color="#3b82f6" />
        <StatCard label="عقود نشطة" value={stats.activeContracts} icon={FileText} color="#8b5cf6" />
      </div>

      {/* شريط تقدم المدفوعات */}
      {(stats.totalPaid + stats.totalPending) > 0 && (
        <div className="bg-card border border-border rounded-xl p-3 mb-5">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="text-muted-foreground font-medium">تحصيل المدفوعات</span>
            <span className="font-bold" style={{ color: GOLD }}>
              {stats.totalPaid.toLocaleString('ar-SA')} / {(stats.totalPaid + stats.totalPending).toLocaleString('ar-SA')} ر.س
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${((stats.totalPaid / (stats.totalPaid + stats.totalPending)) * 100).toFixed(1)}%`,
              background: 'linear-gradient(90deg, #C8A951, #059669)'
            }} />
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span className="text-emerald-400">مدفوع: {stats.totalPaid.toLocaleString('ar-SA')} ر.س</span>
            <span className="text-amber-400">متبقي: {stats.totalPending.toLocaleString('ar-SA')} ر.س</span>
          </div>
        </div>
      )}

      {/* التبويبات */}
      <div className="flex gap-1 mb-4 bg-sidebar rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-colors ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* محتوى التبويبات */}
      <div className="space-y-2">

        {/* الوحدات */}
        {tab === 'units' && (
          linkedUnits.length === 0
            ? <EmptyState title="لا توجد وحدات مرتبطة" description="تأكد من تطابق رقم وثيقة الملكية في ملف الوحدات" />
            : linkedUnits.map((u: any, i: number) => {
                const isRented = u['حالة_الوحدة'] === 'مؤجرة';
                const contract = u._contract;
                return (
                  <div key={u.id || i} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isRented ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                        <Home size={14} className={isRented ? 'text-emerald-400' : 'text-amber-400'} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          وحدة {u['رقم_الوحدة'] || i + 1}
                          {u['نوع_الوحدة'] ? <span className="mr-1 text-muted-foreground text-[10px]">({u['نوع_الوحدة']})</span> : null}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {u['مساحة_الوحدة'] ? `${u['مساحة_الوحدة']} م²` : '—'}
                          {contract ? ` | مستأجر: ${contract['اسم_المستأجر'] || '—'}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract && (
                        <p className="text-[10px] font-bold text-primary hidden sm:block">
                          {Number(contract['إجمالي_قيمة_العقد'] ?? 0).toLocaleString('ar-SA')} ر.س
                        </p>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isRented ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {u['حالة_الوحدة'] || 'غير محدد'}
                      </span>
                    </div>
                  </div>
                );
              })
        )}

        {/* العقود مع الأقساط */}
        {tab === 'contracts' && (
          contracts.length === 0
            ? <EmptyState title="لا توجد عقود مرتبطة" description="تأكد من تطابق رقم وثيقة الملكية في ملف العقود" />
            : contracts.map((c: any, i: number) => (
                <ContractCard key={c.id || i} contract={c} payments={payments} />
              ))
        )}

        {/* المدفوعات */}
        {tab === 'payments' && (
          payments.length === 0
            ? <EmptyState title="لا توجد مدفوعات مرتبطة" description="المدفوعات مرتبطة عبر أرقام العقود" />
            : payments.map((f: any, i: number) => {
                const paid = Number(f['المبلغ_المدفوع'] ?? 0);
                const total = Number(f['قيمة_القسط'] ?? 0) || Number(f['المبلغ_الكلي'] ?? 0);
                const isPaid = paid >= total && total > 0;
                const status = f['حالة_القسط'] || f['حالة_الفاتورة'] || '';
                return (
                  <div key={f.id || i} className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPaid ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                          {isPaid ? <CheckCircle size={13} className="text-emerald-400" /> : <Clock size={13} className="text-amber-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {f['اسم_العقار'] || f['اسم_المستأجر\\ممثل'] || 'فاتورة'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            عقد: {f['رقم_العقد'] || '—'} | استحقاق: {f['تاريخ_الاستحقاق'] || f['تاريخ_الاستحقاق_للفاتورة'] || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left flex flex-col items-end gap-1">
                        <p className="text-xs font-bold" style={{ color: GOLD }}>
                          {Number(f['قيمة_القسط'] ?? f['المبلغ_الكلي'] ?? 0).toLocaleString('ar-SA')} ر.س
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {status || (isPaid ? 'مدفوع' : 'معلق')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
        )}

      </div>
    </DashboardLayout>
  );
}
