/*
 * صفحة العقود - رمز الإبداع
 * عرض وإدارة عقود الإيجار مع نماذج CRUD
 */
import { useState, useMemo } from 'react';
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle, Clock, Eye, Pencil, Trash2, Upload, ExternalLink, Database } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';
import { LeaseForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';
import { Link } from 'wouter';

const GOLD = '#C8A951';

// بيانات إيجار المستوردة
function useEjarContracts() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem('real_contracts');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, []);
}

// بانر بيانات إيجار
function EjarDataBanner({ ejarContracts }: { ejarContracts: any[] }) {
  if (!ejarContracts.length) return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100">
          <Database className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-amber-800 text-sm">لا توجد بيانات عقود من إيجار</p>
          <p className="text-xs text-amber-600">استورد ملف Excel من منصة إيجار لعرض عقوداتك الفعلية</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/ejar-contract-analyzer">
          <a className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#1a1a1a' }}>
            <Upload className="w-3.5 h-3.5" /> تحليل عقد إيجار
          </a>
        </Link>
        <Link href="/data-import">
          <a className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-amber-300 text-amber-700 hover:bg-amber-100 transition">
            <ExternalLink className="w-3.5 h-3.5" /> استيراد البيانات
          </a>
        </Link>
      </div>
    </div>
  );

  const active = ejarContracts.filter(c => {
    const s = (c['حالة_العقد'] || c.status || '').toLowerCase();
    return s.includes('ساري') || s.includes('نشط') || s.includes('active') || !s;
  }).length;
  const expired = ejarContracts.filter(c => {
    const s = (c['حالة_العقد'] || c.status || '').toLowerCase();
    return s.includes('منته') || s.includes('expired');
  }).length;
  const totalRent = ejarContracts.reduce((sum, c) => {
    const v = parseFloat(String(c['الإيجار_السنوي'] || c.annualRent || c['قيمة_الإيجار'] || 0).replace(/,/g, ''));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100" style={{ background: `${GOLD}10` }}>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: GOLD }} />
          <span className="font-black text-sm text-gray-800">بيانات إيجار المستوردة</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${GOLD}20`, color: '#92710a' }}>
            {ejarContracts.length} عقد
          </span>
        </div>
        <div className="flex gap-2">
          <Link href="/ejar-contract-analyzer">
            <a className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition" style={{ background: '#1a1a1a' }}>
              <Upload className="w-3 h-3" /> تحليل ملف جديد
            </a>
          </Link>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-gray-100">
        {[
          { label: 'سارية', val: active, color: 'text-emerald-600' },
          { label: 'منتهية', val: expired, color: 'text-red-500' },
          { label: 'غير محددة', val: ejarContracts.length - active - expired, color: 'text-gray-500' },
          { label: 'إجمالي الإيجار السنوي', val: totalRent > 0 ? `${(totalRent / 1000).toFixed(0)}k ر.س` : '—', color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="px-5 py-3 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Sample rows */}
      {ejarContracts.length > 0 && (
        <div className="border-t border-gray-100 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                {['رقم العقد', 'المستأجر', 'العقار/الوحدة', 'الإيجار السنوي', 'البداية', 'النهاية', 'الحالة'].map(h => (
                  <th key={h} className="px-3 py-2 text-right font-bold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ejarContracts.slice(0, 5).map((c: any, i: number) => {
                const status = c['حالة_العقد'] || c.status || '';
                const isActive = status.toLowerCase().includes('ساري') || status.toLowerCase().includes('نشط');
                const isExpired = status.toLowerCase().includes('منته') || status.toLowerCase().includes('expired');
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-3 py-2 font-bold text-gray-700">{c['رقم_عقد_الإيجار'] || c['رقم_العقد'] || c.contractNumber || `#${i+1}`}</td>
                    <td className="px-3 py-2 text-gray-600">{c['اسم_المستأجر'] || c.tenantName || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{c['رقم_الوحدة'] || c['اسم_العقار'] || c.unitNumber || c.propertyName || '—'}</td>
                    <td className="px-3 py-2 font-bold" style={{ color: GOLD }}>{c['الإيجار_السنوي'] || c.annualRent ? `${Number(c['الإيجار_السنوي'] || c.annualRent).toLocaleString('ar')} ر.س` : '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{c['تاريخ_بداية_العقد'] || c.startDate || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{c['تاريخ_نهاية_العقد'] || c.endDate || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-700' :
                        isExpired ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{status || 'غير محدد'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {ejarContracts.length > 5 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
              <Link href="/ejar-contract-analyzer">
                <a className="text-xs font-bold text-gray-500 hover:text-gray-700">
                  عرض جميع {ejarContracts.length} عقد في محلل إيجار →
                </a>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Contracts() {
  const { data: leases, loading, reload } = useEntityData('Lease');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const ejarContracts = useEjarContracts();

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Lease.update(editItem.id, formData);
        toast.success('تم تحديث العقد بنجاح');
      } else {
        await base44.entities.Lease.create(formData);
        toast.success('تم إنشاء العقد بنجاح');
      }
      reload();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) return;
    try {
      await base44.entities.Lease.delete(id);
      toast.success('تم حذف العقد');
      reload();
    } catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any; label: string }> = {
      'نشط': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'نشط' },
      'active': { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'نشط' },
      'منتهي': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'منتهي' },
      'expired': { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle, label: 'منتهي' },
      'معلق': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'معلق' },
      'pending': { color: 'bg-amber-500/10 text-amber-400', icon: Clock, label: 'معلق' },
    };
    const s = map[status] || { color: 'bg-muted text-muted-foreground', icon: FileText, label: status || 'غير محدد' };
    const Icon = s.icon;
    return (<span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium', s.color)}><Icon size={10} /> {s.label}</span>);
  };

  const active = leases.filter(l => ['نشط', 'active'].includes(l['حالة_العقد'] || l.status || '')).length;
  const expired = leases.filter(l => ['منتهي', 'expired'].includes(l['حالة_العقد'] || l.status || '')).length;

  return (
    <DashboardLayout pageTitle="العقود">
      <PageHeader title="إدارة العقود" description={`${leases.length} عقد`}>
        <Button size="sm" className="gap-2" onClick={handleAdd}><Plus size={16} /> إنشاء عقد جديد</Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل العقود..." />
      ) : (
        <div className="space-y-4">
          <EjarDataBanner ejarContracts={ejarContracts} />
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="العقود النشطة" value={active} icon={CheckCircle} />
            <StatCard title="العقود المنتهية" value={expired} icon={AlertTriangle} />
            <StatCard title="إجمالي العقود" value={leases.length} icon={FileText} />
          </div>

          {leases.length === 0 ? (
            <EmptyState title="لا توجد عقود" description="ابدأ بإنشاء أول عقد إيجار" actionLabel="إنشاء عقد" onAction={handleAdd} />
          ) : (
            <DataTable
              columns={[
                { key: 'رقم_العقد', label: 'رقم العقد', render: (v, r) => v || r.contract_number || `#${r.id?.slice(-6)}` },
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'تاريخ_بداية_العقد', label: 'البداية', render: (v, r) => { const d = v || r.start_date || ''; return d ? new Date(d).toLocaleDateString('ar-SA') : '—'; }},
                { key: 'تاريخ_نهاية_العقد', label: 'النهاية', render: (v, r) => { const d = v || r['تاريخ_انتهاء_الإيجار'] || r.end_date || ''; return d ? new Date(d).toLocaleDateString('ar-SA') : '—'; }},
                { key: 'حالة_العقد', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
                { key: 'قيمة_الإيجار', label: 'قيمة الإيجار', render: (v, r) => { const a = v || r.rent_amount || 0; return a ? `${Number(a).toLocaleString('ar-SA')} ر.س` : '—'; }},
              ]}
              data={leases}
              searchKeys={['رقم_العقد', 'اسم_المستأجر', 'اسم_العقار', 'tenant_name', 'property_name']}
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(row)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              )}
            />
          )}
        </div>
      )}

      <LeaseForm lease={editItem} isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
