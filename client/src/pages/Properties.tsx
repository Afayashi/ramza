/*
 * صفحة العقارات والوحدات - رمز الإبداع
 * عرض وإدارة جميع العقارات مع بحث وفلترة ونماذج CRUD
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { Building2, Plus, Search, Eye, Pencil, Trash2, Star, MapPin, Home } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { PropertyForm } from '@/components/forms';
import { base44 } from '@/lib/base44Client';
import { toast } from 'sonner';

export default function Properties() {
  const { data, loading, reload } = useMultiEntityData([
    { name: 'Property' },
    { name: 'Unit', sort: '-created_date', limit: 2000 },
  ]);
  const properties = data.Property || [];
  const units = data.Unit || [];
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const getUnitsForProperty = (propertyId: string) => {
    return units.filter(u => u['معرف_العقار'] === propertyId || u.property_id === propertyId);
  };

  const filtered = properties.filter(p => {
    const name = p['اسم_العقار'] || p.name || '';
    const address = p['العنوان'] || p['العنوان_الوطني'] || p.address || '';
    const city = p['المدينة'] || p.city || '';
    return name.includes(searchTerm) || address.includes(searchTerm) || city.includes(searchTerm);
  });

  const handleAdd = () => { setEditItem(null); setShowForm(true); };
  const handleEdit = (item: any) => { setEditItem(item); setShowForm(true); };

  const handleSubmit = async (formData: any) => {
    try {
      if (editItem) {
        await base44.entities.Property.update(editItem.id, formData);
        toast.success('تم تحديث العقار بنجاح');
      } else {
        await base44.entities.Property.create(formData);
        toast.success('تم إضافة العقار بنجاح');
      }
      reload();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return;
    try {
      await base44.entities.Property.delete(id);
      toast.success('تم حذف العقار');
      reload();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <DashboardLayout pageTitle="العقارات">
      <PageHeader
        title="العقارات والوحدات"
        description={`${properties.length} عقار — ${units.length} وحدة`}
      >
        <Button size="sm" className="gap-2" onClick={handleAdd}>
          <Plus size={16} />
          إضافة عقار
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingState message="جاري تحميل العقارات..." />
      ) : properties.length === 0 ? (
        <EmptyState
          title="لا توجد عقارات"
          description="ابدأ بإضافة أول عقار لك"
          actionLabel="إضافة عقار"
          onAction={handleAdd}
        />
      ) : (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث بالاسم أو العنوان أو المدينة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pr-9 pl-4 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setView('grid')} className={cn('px-3 py-1.5 rounded-md text-xs', view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>شبكة</button>
              <button onClick={() => setView('table')} className={cn('px-3 py-1.5 rounded-md text-xs', view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>جدول</button>
            </div>
          </div>

          {/* Grid View */}
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(property => {
                const propUnits = getUnitsForProperty(property.id);
                const rented = propUnits.filter(u => u['حالة_الوحدة'] === 'مؤجرة' || u.status === 'occupied').length;
                const name = property['اسم_العقار'] || property.name || 'عقار بدون اسم';
                const city = property['المدينة'] || property.city || '';
                const address = property['العنوان'] || property.address || '';
                const type = property['نوع_العقار'] || property.type || '';

                return (
                  <div key={property.id} className="bg-card border border-border rounded-lg overflow-hidden card-hover">
                    <div className="h-36 bg-muted relative">
                      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663078821712/Zm2JEbmeVFTJRp6HMZVTym/properties-hero-8c8nC7tKoTfw9ctZc9QRB9.webp" alt={name} className="w-full h-full object-cover opacity-40" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {property['عقار_مميز'] && (<span className="bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={10} /> مميز</span>)}
                        {type && (<span className="bg-muted/90 text-foreground text-[10px] px-2 py-0.5 rounded-full">{type}</span>)}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-card/90 text-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Home size={10} /> {propUnits.length} وحدة</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-sm font-semibold text-foreground mb-1 truncate">{name}</h3>
                      {(city || address) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin size={11} />
                          <span className="truncate">{city} {address && `- ${address}`}</span>
                        </p>
                      )}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">الإشغال</span>
                          <span className="text-foreground font-medium">{rented}/{propUnits.length}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: propUnits.length ? `${(rented / propUnits.length) * 100}%` : '0%' }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/property-detail?id=${property.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8"><Eye size={13} /> عرض</Button>
                        </Link>
                        <button onClick={() => handleEdit(property)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(property.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'اسم_العقار', label: 'اسم العقار', render: (v, r) => v || r.name || 'بدون اسم' },
                { key: 'نوع_العقار', label: 'النوع', render: (v, r) => v || r.type || '—' },
                { key: 'المدينة', label: 'المدينة', render: (v, r) => v || r.city || '—' },
                { key: 'id', label: 'الوحدات', render: (v) => `${getUnitsForProperty(v).length} وحدة` },
              ]}
              data={filtered}
              searchable={false}
              actions={(row) => (
                <div className="flex items-center gap-1 justify-center">
                  <Link href={`/property-detail?id=${row.id}`}><button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Eye size={14} /></button></Link>
                  <button onClick={() => handleEdit(row)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* نموذج العقار */}
      <PropertyForm
        property={editItem}
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}
