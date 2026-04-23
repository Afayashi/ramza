/*
 * مستندات العقارات - رمز الإبداع
 */
import { useState } from 'react';
import { FileText, Download, Eye, Upload, Search, Building2, File, Image } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PropertyDocuments() {
  const { data, loading } = useEntityData('Document');
  const [search, setSearch] = useState('');

  const docs = data.filter(d => !search || (d['عنوان_الوثيقة'] || d.title || '').includes(search) || (d['نوع_الوثيقة'] || d.type || '').includes(search));

  const getIcon = (type: string) => {
    if (type.includes('صورة') || type.includes('image')) return Image;
    return File;
  };

  if (loading) return <DashboardLayout pageTitle="مستندات العقارات"><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout pageTitle="مستندات العقارات">
      <PageHeader title="مستندات العقارات" description={`${docs.length} مستند`}>
        <Button size="sm" onClick={() => toast.info('رفع مستند (ميزة قادمة)')}><Upload size={14} className="ml-1" /> رفع مستند</Button>
      </PageHeader>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المستندات..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {docs.length === 0 ? <EmptyState title="لا توجد مستندات" description="ارفع مستنداً جديداً" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map((d: any) => {
            const Icon = getIcon(d['نوع_الوثيقة'] || d.type || '');
            return (
              <div key={d.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{d['عنوان_الوثيقة'] || d.title || 'بدون عنوان'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{d['نوع_الوثيقة'] || d.type || ''}</p>
                    <p className="text-[10px] text-muted-foreground">{d['تاريخ_الرفع'] || d.upload_date || ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-sidebar" onClick={() => toast.info('عرض المستند (ميزة قادمة)')}><Eye size={12} className="text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-sidebar" onClick={() => toast.info('تحميل المستند (ميزة قادمة)')}><Download size={12} className="text-muted-foreground" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
