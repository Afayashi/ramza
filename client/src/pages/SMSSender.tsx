/*
 * صفحة إرسال الرسائل النصية - رمز الإبداع
 * إرسال SMS يدوي وجماعي للمستأجرين والملاك
 */
import { useState, useMemo } from 'react';
import {
  Send, Users, MessageSquare, Phone, CheckSquare, Square,
  Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { sendSMS, loadSMSSettings, SMS_TEMPLATES } from '@/lib/smsService';
import { toast } from 'sonner';

type RecipientType = 'tenants' | 'owners' | 'custom';

export default function SMSSender() {
  const { data, loading } = useMultiEntityData([
    { name: 'Tenant' }, { name: 'Owner' }, { name: 'Payment' }, { name: 'Lease' }
  ]);

  const settings = loadSMSSettings();
  const isConfigured = !!settings.bearer;

  const [recipientType, setRecipientType] = useState<RecipientType>('tenants');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customPhones, setCustomPhones] = useState('');
  const [message, setMessage] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const tenants = data.Tenant || [];
  const owners = data.Owner || [];

  const recipients = recipientType === 'tenants' ? tenants : recipientType === 'owners' ? owners : [];

  const selectedPhones = useMemo(() => {
    if (recipientType === 'custom') {
      return customPhones.split(/[\n,،]/).map(p => p.trim()).filter(Boolean);
    }
    return recipients
      .filter(r => selectedIds.has(String(r.id)))
      .map(r => r['رقم_الجوال'] || r['رقم_الهاتف'] || r.phone || '')
      .filter(Boolean);
  }, [recipientType, customPhones, recipients, selectedIds]);

  const toggleAll = () => {
    if (selectedIds.size === recipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(recipients.map(r => String(r.id))));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const applyTemplate = (key: string) => {
    const msgs: Record<string, string> = {
      rentDue: 'عزيزي المستأجر، نذكركم بأن دفعة الإيجار مستحقة. يرجى السداد في أقرب وقت. رمز الإبداع لإدارة الأملاك.',
      rentOverdue: 'عزيزي المستأجر، يرجى العلم بأن دفعة الإيجار متأخرة. نرجو التواصل فوراً لتسوية المستحقات. رمز الإبداع.',
      leaseExpiring: 'عزيزي المستأجر، عقد إيجاركم على وشك الانتهاء. يرجى التواصل لتجديد العقد أو إخلاء الوحدة. رمز الإبداع.',
      maintenanceUpdate: 'عزيزي المستأجر، تم استلام طلب الصيانة وسيتم متابعته في أقرب وقت. شكراً لصبركم. رمز الإبداع.',
      welcome: 'أهلاً وسهلاً بكم في مسكنكم الجديد. يسعدنا خدمتكم. لأي استفسار تواصلوا معنا. رمز الإبداع لإدارة الأملاك.',
      general: 'من إدارة رمز الإبداع للأملاك: نتمنى لكم إقامة طيبة ونرحب بأي استفسار على هذا الرقم.',
    };
    setMessage(msgs[key] || '');
    setTemplateKey(key);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    if (!isConfigured) { toast.error('قم بإعداد Bearer Token في إعدادات SMS أولاً'); return; }
    if (selectedPhones.length === 0) { toast.error('اختر مستلمين أو أدخل أرقام هواتف'); return; }
    if (!message.trim()) { toast.error('اكتب نص الرسالة'); return; }

    setSending(true);
    setResults(null);

    const result = await sendSMS({ recipients: selectedPhones, body: message.trim() });

    setSending(false);
    if (result.success) {
      setResults({ success: selectedPhones.length, failed: 0 });
      toast.success(`✅ تم إرسال ${selectedPhones.length} رسالة بنجاح`);
    } else {
      setResults({ success: 0, failed: selectedPhones.length });
      toast.error(`فشل الإرسال: ${result.error}`);
    }
  };

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <DashboardLayout pageTitle="إرسال رسائل SMS">
      <PageHeader title="إرسال رسائل SMS" description="إرسال رسائل نصية للمستأجرين والملاك عبر تقنيات" />

      {!isConfigured && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">خدمة SMS غير مُهيأة</p>
            <p className="text-xs text-amber-600 mt-0.5">
              يرجى إعداد Bearer Token من{' '}
              <a href="/integrations/sms" className="underline font-bold">إعدادات SMS</a> قبل الإرسال.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* اختيار المستلمين */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Users size={14} className="text-[#C8A951]" /> المستلمون
          </h3>

          {/* نوع المستلم */}
          <div className="flex gap-2">
            {(['tenants', 'owners', 'custom'] as RecipientType[]).map(type => {
              const labels = { tenants: 'المستأجرون', owners: 'الملاك', custom: 'أرقام مخصصة' };
              return (
                <button
                  key={type}
                  onClick={() => { setRecipientType(type); setSelectedIds(new Set()); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    recipientType === type
                      ? 'bg-[#C8A951] text-black border-[#C8A951]'
                      : 'border-border text-muted-foreground hover:border-[#C8A951]/40'
                  }`}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {/* قائمة المستلمين */}
          {recipientType !== 'custom' ? (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {/* تحديد الكل */}
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted transition border border-border"
              >
                {selectedIds.size === recipients.length && recipients.length > 0
                  ? <CheckSquare size={13} className="text-[#C8A951]" />
                  : <Square size={13} />}
                تحديد الكل ({recipients.length})
              </button>

              {loading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">جاري التحميل...</div>
              ) : recipients.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">لا يوجد {recipientType === 'tenants' ? 'مستأجرون' : 'ملاك'}</div>
              ) : recipients.map(r => {
                const id = String(r.id);
                const name = r['اسم_المستأجر'] || r['اسم_المالك'] || r.name || 'بدون اسم';
                const phone = r['رقم_الجوال'] || r['رقم_الهاتف'] || r.phone || '—';
                const isSelected = selectedIds.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition border ${
                      isSelected ? 'border-[#C8A951]/40 bg-[#C8A951]/5' : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    {isSelected
                      ? <CheckSquare size={13} className="text-[#C8A951] shrink-0" />
                      : <Square size={13} className="text-muted-foreground shrink-0" />}
                    <span className="font-medium text-foreground truncate flex-1 text-right">{name}</span>
                    <span className="text-muted-foreground font-mono shrink-0" dir="ltr">{phone}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">أرقام الهواتف (كل رقم في سطر)</label>
              <textarea
                value={customPhones}
                onChange={e => setCustomPhones(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-xs bg-background focus:outline-none focus:border-[#C8A951] resize-none"
                rows={6}
                dir="ltr"
                placeholder={"+966500000000\n+966511111111\n05xxxxxxxx"}
              />
            </div>
          )}

          {/* عداد المحدودين */}
          <div className="text-xs text-muted-foreground text-center">
            {selectedPhones.length} رقم محدد للإرسال
          </div>
        </div>

        {/* كتابة الرسالة */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MessageSquare size={14} className="text-[#C8A951]" /> نص الرسالة
          </h3>

          {/* قوالب */}
          <div>
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#C8A951] hover:underline"
            >
              {showTemplates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              اختر من القوالب الجاهزة
            </button>
            {showTemplates && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {[
                  { key: 'rentDue', label: 'تذكير إيجار' },
                  { key: 'rentOverdue', label: 'إيجار متأخر' },
                  { key: 'leaseExpiring', label: 'انتهاء عقد' },
                  { key: 'maintenanceUpdate', label: 'تحديث صيانة' },
                  { key: 'welcome', label: 'ترحيب بمستأجر' },
                  { key: 'general', label: 'رسالة عامة' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => applyTemplate(t.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-right ${
                      templateKey === t.key
                        ? 'border-[#C8A951] bg-[#C8A951]/10 text-[#C8A951]'
                        : 'border-border text-muted-foreground hover:border-[#C8A951]/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* نص الرسالة */}
          <div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:border-[#C8A951] resize-none"
              rows={7}
              dir="rtl"
              placeholder="اكتب نص الرسالة هنا..."
              maxLength={1000}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{charCount} حرف</span>
              <span>{smsCount} رسالة SMS لكل مستلم</span>
            </div>
          </div>

          {/* نتيجة الإرسال */}
          {results && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
              results.failed === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {results.failed === 0
                ? <><CheckCircle2 size={14} /> تم الإرسال بنجاح لـ {results.success} مستلم</>
                : <><AlertCircle size={14} /> فشل الإرسال — تحقق من الإعدادات</>
              }
            </div>
          )}

          {/* زر الإرسال */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || selectedPhones.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-[#1a1a1a] hover:bg-[#333] transition disabled:opacity-50"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending
              ? 'جاري الإرسال...'
              : `إرسال لـ ${selectedPhones.length} مستلم`
            }
          </button>

          <p className="text-[10px] text-muted-foreground text-center">
            سيتم الإرسال عبر{' '}
            <span className="font-bold">{settings.sender || 'RAMZ'}</span>
            {' '}من خدمة تقنيات
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
