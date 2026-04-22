/*
 * صفحة حالة الوحدات - رمز الإبداع
 * عرض بصري لحالة جميع الوحدات
 */
import { useState, useMemo } from 'react';
import { Home, Building2, CheckCircle, XCircle, Wrench, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function UnitStatus() {
  const { data, loading } = useMultiEntityData([
    { name: 'Unit', sort: '-created_date', limit: 2000 },
    { name: 'Property' },
  ]);
  const units = data.Unit || [];
  const properties = data.Property || [];
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');

  const filtered = useMemo(() => {
    return units.filter(u => {
      const status = u['حالة_الوحدة'] || u.status || '';
      const propId = u['معرف_العقار'] || u.property_id || '';
      if (filterStatus !== 'all') {
        if (filterStatus === 'rented' && status !== 'مؤجرة' && status !== 'occupied') return false;
        if (filterStatus === 'vacant' && status !== 'شاغرة' && status !== 'vacant') return false;
        if (filterStatus === 'maintenance' && status !== 'صيانة' && status !== 'maintenance') return false;
      }
      if (filterProperty !== 'all' && propId !== filterProperty) return false;
      return true;
    });
  }, [units, filterStatus, filterProperty]);

  const rented = units.filter(u => (u['حالة_الوحدة'] || u.status) === 'مؤجرة' || (u['حالة_الوحدة'] || u.status) === 'occupied').length;
  const vacant = units.filter(u => (u['حالة_الوحدة'] || u.status) === 'شاغرة' || (u['حالة_الوحدة'] || u.status) === 'vacant').length;
  const maint = units.filter(u => (u['حالة_الوحدة'] || u.status) === 'صيانة' || (u['حالة_الوحدة'] || u.status) === 'maintenance').length;

  const statusColor = (status: string) => {
    if (status === 'مؤجرة' || status === 'occupied') return 'bg-green-500/10 border-green-500/30 text-green-400';
    if (status === 'شاغرة' || status === 'vacant') return 'bg-red-500/10 border-red-500/30 text-red-400';
    if (status === 'صيانة' || status === 'maintenance') return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-muted border-border text-muted-foreground';
  };

  const statusLabel = (status: string) => {
    if (status === 'مؤجرة' || status === 'occupied') return 'مؤجرة';
    if (status === 'شاغرة' || status === 'vacant') return 'شاغرة';
    if (status === 'صيانة' || status === 'maintenance') return 'صيانة';
    return status || 'غير محدد';
  };

  return (
    <DashboardLayout pageTitle="حالة الوحدات">
      <PageHeader title="حالة الوحدات" description={`${units.length} وحدة`} />

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي الوحدات" value={units.length} icon={Home} />
            <StatCard title="مؤجرة" value={rented} icon={CheckCircle} />
            <StatCard title="شاغرة" value={vacant} icon={XCircle} />
            <StatCard title="صيانة" value={maint} icon={Wrench} />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'rented', label: 'مؤجرة' },
              { key: 'vacant', label: 'شاغرة' },
              { key: 'maintenance', label: 'صيانة' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={cn('px-3 py-1.5 rounded-md text-xs transition-colors', filterStatus === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
              >
                {f.label}
              </button>
            ))}
            <select
              value={filterProperty}
              onChange={e => setFilterProperty(e.target.value)}
              className="px-3 py-1.5 rounded-md text-xs bg-input border border-border text-foreground"
            >
              <option value="all">جميع العقارات</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p['اسم_العقار'] || p.name || 'عقار'}</option>
              ))}
            </select>
          </div>

          {/* Units Grid */}
          {filtered.length === 0 ? (
            <EmptyState title="لا توجد وحدات" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filtered.map(unit => {
                const status = unit['حالة_الوحدة'] || unit.status || '';
                const name = unit['اسم_الوحدة'] || unit['رقم_الوحدة'] || unit.name || unit.unit_number || '';
                return (
                  <div
                    key={unit.id}
                    className={cn('border rounded-lg p-3 text-center transition-all hover:scale-105', statusColor(status))}
                  >
                    <Home size={18} className="mx-auto mb-1" />
                    <p className="text-xs font-medium truncate">{name || 'وحدة'}</p>
                    <p className="text-[10px] mt-0.5">{statusLabel(status)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
