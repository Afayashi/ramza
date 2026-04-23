/*
 * الخريطة التفاعلية - رمز الإبداع
 */
import { useMemo } from 'react';
import { MapPin, Building2, Home, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function MapView() {
  const { data, loading } = useMultiEntityData([{ name: 'Property' }, { name: 'Unit' }]);

  const properties = useMemo(() => {
    return (data.Property || []).map(p => {
      const units = (data.Unit || []).filter(u => u.property_id === p.id || u['معرف_العقار'] === p.id);
      const occupied = units.filter(u => ['مشغولة', 'occupied', 'مؤجرة'].includes(u['الحالة'] || u.status || '')).length;
      return {
        name: p['اسم_العقار'] || p.name || 'بدون اسم',
        type: p['نوع_العقار'] || p.type || '',
        address: p['العنوان'] || p.address || p['الحي'] || p.neighborhood || '',
        city: p['المدينة'] || p.city || '',
        totalUnits: units.length, occupied,
        lat: p['خط_العرض'] || p.latitude || 0,
        lng: p['خط_الطول'] || p.longitude || 0,
      };
    });
  }, [data]);

  if (loading) return <DashboardLayout pageTitle="الخريطة التفاعلية"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="الخريطة التفاعلية">
      <PageHeader title="الخريطة التفاعلية" description={`${properties.length} عقار على الخريطة`} />

      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="h-full flex items-center justify-center bg-sidebar/50 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C8A951 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="text-center z-10">
            <MapPin size={48} className="mx-auto text-primary mb-3" />
            <p className="text-sm font-bold text-foreground mb-2">خريطة العقارات</p>
            <p className="text-xs text-muted-foreground mb-4">عرض مواقع العقارات على الخريطة التفاعلية</p>
          </div>

          {/* قائمة العقارات */}
          <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {properties.map((p, i) => (
                <div key={i} className="shrink-0 bg-sidebar border border-border rounded-xl p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={12} className="text-primary" />
                    <p className="text-xs font-bold text-foreground">{p.name}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.address} {p.city && `- ${p.city}`}</p>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    <span className="text-muted-foreground"><Home size={9} className="inline" /> {p.totalUnits} وحدة</span>
                    <span className="text-emerald-400"><Users size={9} className="inline" /> {p.occupied} مشغولة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
