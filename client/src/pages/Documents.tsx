/*
 * صفحة مكتبة الوثائق - رمز الإبداع
 */
import { useState } from 'react';
import { FileText, Plus, Download, Eye, Folder, File, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Documents() {
  const { data: documents, loading } = useEntityData('Document');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = documents.filter(d => {
    const name = d['اسم_المستند'] || d.name || d.title || '';
    return name.includes(searchTerm);
  });

  const getFileIcon = (type: string) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('excel') || type?.includes('sheet')) return '📊';
    return '📁';
  };

  return (
    <DashboardLayout pageTitle="الوثائق">
      <PageHeader title="مكتبة الوثائق" description={`${documents.length} مستند`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> رفع مستند</Button>
      </PageHeader>

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في الوثائق..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 pr-9 pl-4 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="لا توجد وثائق" description="ابدأ برفع أول مستند" actionLabel="رفع مستند" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(doc => (
                <div key={doc.id} className="bg-card border border-border rounded-lg p-4 card-hover">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getFileIcon(doc.type || doc['نوع_المستند'] || '')}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {doc['اسم_المستند'] || doc.name || doc.title || 'مستند بدون اسم'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc['نوع_المستند'] || doc.type || 'غير محدد'}
                      </p>
                      {doc.created_date && (
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(doc.created_date).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Download size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
