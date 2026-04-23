/*
 * واتساب - رمز الإبداع
 */
import { useState } from 'react';
import { Send, MessageSquare, Users, Clock, CheckCircle, Search, Phone } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TEMPLATES = [
  { id: 1, name: 'تذكير بالدفع', message: 'السلام عليكم {name}، نود تذكيركم بموعد سداد الإيجار المستحق بتاريخ {date}. شكراً لتعاونكم.' },
  { id: 2, name: 'تجديد العقد', message: 'السلام عليكم {name}، عقد الإيجار الخاص بكم سينتهي بتاريخ {date}. يرجى التواصل معنا لتجديد العقد.' },
  { id: 3, name: 'إشعار صيانة', message: 'السلام عليكم {name}، نود إبلاغكم بأنه سيتم إجراء أعمال صيانة في {property} بتاريخ {date}.' },
  { id: 4, name: 'ترحيب مستأجر جديد', message: 'مرحباً {name}، نرحب بكم في {property}. نتمنى لكم إقامة مريحة. للتواصل: {phone}' },
];

export default function WhatsApp() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filteredTemplates = TEMPLATES.filter(t => !search || t.name.includes(search) || t.message.includes(search));

  return (
    <DashboardLayout pageTitle="واتساب">
      <PageHeader title="واتساب" description="إرسال رسائل واتساب للمستأجرين والملاك">
        <Button size="sm" onClick={() => toast.info('إرسال رسالة جماعية (ميزة قادمة)')}><Send size={14} className="ml-1" /> إرسال جماعي</Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'رسائل مرسلة', value: '156', icon: Send, color: '#059669' },
          { label: 'جهات الاتصال', value: '48', icon: Users, color: '#C8A951' },
          { label: 'قوالب الرسائل', value: TEMPLATES.length, icon: MessageSquare, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في القوالب..." className="w-full bg-sidebar border border-border rounded-lg pr-9 pl-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div className="space-y-3">
        {filteredTemplates.map(t => (
          <div key={t.id} onClick={() => setSelectedTemplate(selectedTemplate === t.id ? null : t.id)}
            className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${selectedTemplate === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-primary" />
                <p className="text-xs font-bold text-foreground">{t.name}</p>
              </div>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={e => { e.stopPropagation(); toast.success(`تم إرسال "${t.name}" (تجريبي)`); }}>
                <Send size={10} className="ml-1" /> إرسال
              </Button>
            </div>
            {selectedTemplate === t.id && (
              <div className="bg-sidebar rounded-lg p-3 mt-2 text-xs text-muted-foreground leading-relaxed" dir="rtl">
                {t.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
