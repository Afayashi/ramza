/*
 * صفحة عامة - رمز الإبداع
 * تُستخدم للصفحات التي لم يتم بناؤها بالكامل بعد
 * تعرض رسالة "قيد التطوير" مع إمكانية التخصيص
 */
import { Construction } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

interface GenericPageProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export default function GenericPage({ title, description, icon: Icon = Construction }: GenericPageProps) {
  return (
    <DashboardLayout pageTitle={title}>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon size={32} className="text-primary" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          هذه الصفحة قيد التطوير وسيتم إضافة المحتوى قريباً.
          يمكنك العودة للوحة التحكم الرئيسية.
        </p>
      </div>
    </DashboardLayout>
  );
}
