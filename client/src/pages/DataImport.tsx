/*
 * استيراد البيانات - رمز الإبداع
 */
import { useState } from 'react';
import { Database, Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ENTITIES = [
  { id: 'Property', label: 'العقارات', fields: 'اسم العقار، النوع، العنوان، المدينة، عدد الوحدات' },
  { id: 'Unit', label: 'الوحدات', fields: 'رقم الوحدة، العقار، النوع، المساحة، الإيجار الشهري' },
  { id: 'Tenant', label: 'المستأجرون', fields: 'الاسم، رقم الهوية، الهاتف، البريد، الجنسية' },
  { id: 'Lease', label: 'العقود', fields: 'رقم العقد، المستأجر، الوحدة، تاريخ البداية، تاريخ النهاية، الإيجار' },
  { id: 'Payment', label: 'الدفعات', fields: 'المستأجر، المبلغ، تاريخ الدفع، الحالة، طريقة الدفع' },
  { id: 'Expense', label: 'المصروفات', fields: 'الوصف، المبلغ، التاريخ، الفئة، العقار' },
  { id: 'Owner', label: 'الملاك', fields: 'الاسم، رقم الهوية، الهاتف، البريد، رقم الحساب' },
];

export default function DataImport() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');

  const handleFileUpload = () => {
    if (!selectedEntity) { toast.error('اختر نوع البيانات أولاً'); return; }
    setImportStatus('uploading');
    setTimeout(() => { setImportStatus('processing'); }, 1000);
    setTimeout(() => { setImportStatus('done'); toast.success('تم استيراد البيانات بنجاح (تجريبي)'); }, 2500);
  };

  const handleDownloadTemplate = () => {
    toast.info('سيتم تحميل قالب Excel (ميزة قادمة)');
  };

  return (
    <DashboardLayout pageTitle="استيراد البيانات">
      <PageHeader title="استيراد البيانات" description="استيراد البيانات من ملفات Excel أو CSV" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* اختيار نوع البيانات */}
        <div className="lg:col-span-1">
          <h3 className="font-bold text-xs text-foreground mb-3">اختر نوع البيانات</h3>
          <div className="space-y-1.5">
            {ENTITIES.map(e => (
              <button key={e.id} onClick={() => { setSelectedEntity(e.id); setImportStatus('idle'); }}
                className={`w-full text-right p-3 rounded-xl border transition-all ${selectedEntity === e.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-primary/20'}`}>
                <p className="font-bold text-xs text-foreground">{e.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.fields}</p>
              </button>
            ))}
          </div>
        </div>

        {/* منطقة الرفع */}
        <div className="lg:col-span-2">
          {!selectedEntity ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
              <Database size={40} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">اختر نوع البيانات لبدء الاستيراد</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-sm text-foreground mb-4">استيراد {ENTITIES.find(e => e.id === selectedEntity)?.label}</h3>

                {/* تحميل القالب */}
                <div className="bg-sidebar rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">تحميل قالب Excel</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">حمل القالب واملأه بالبيانات ثم ارفعه</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
                      <Download size={14} className="ml-1" /> تحميل القالب
                    </Button>
                  </div>
                </div>

                {/* منطقة الرفع */}
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${importStatus === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' : importStatus === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-border hover:border-primary/30'}`}>
                  {importStatus === 'idle' && (
                    <>
                      <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-foreground mb-1">اسحب الملف هنا أو</p>
                      <Button size="sm" onClick={handleFileUpload}>اختر ملف</Button>
                      <p className="text-[10px] text-muted-foreground mt-2">يدعم: Excel (.xlsx, .xls) و CSV</p>
                    </>
                  )}
                  {importStatus === 'uploading' && (
                    <>
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-foreground">جاري رفع الملف...</p>
                    </>
                  )}
                  {importStatus === 'processing' && (
                    <>
                      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-foreground">جاري معالجة البيانات...</p>
                    </>
                  )}
                  {importStatus === 'done' && (
                    <>
                      <CheckCircle size={32} className="mx-auto text-emerald-400 mb-3" />
                      <p className="text-sm text-emerald-400 font-bold">تم الاستيراد بنجاح</p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => setImportStatus('idle')}>استيراد ملف آخر</Button>
                    </>
                  )}
                  {importStatus === 'error' && (
                    <>
                      <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
                      <p className="text-sm text-red-400 font-bold">فشل الاستيراد</p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => setImportStatus('idle')}>إعادة المحاولة</Button>
                    </>
                  )}
                </div>

                {/* الحقول المتوقعة */}
                <div className="mt-4 bg-sidebar rounded-xl p-4">
                  <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2"><FileText size={12} /> الحقول المتوقعة</h4>
                  <p className="text-[11px] text-muted-foreground">{ENTITIES.find(e => e.id === selectedEntity)?.fields}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
