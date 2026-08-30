/*
 * خدمة Taqnyat SMS - رمز الإبداع
 * توثيق API: https://docs.taqnyat.sa
 */

const TAQNYAT_API = 'https://api.taqnyat.sa/v1';
const LS_KEY = 'sms_settings';

export interface SMSSettings {
  bearer: string;
  sender: string;
  provider: string;
  isConnected: boolean;
}

const ENV_BEARER = import.meta.env.VITE_TAQNYAT_BEARER || '';
const ENV_SENDER = import.meta.env.VITE_TAQNYAT_SENDER || 'RAMZ';

export function loadSMSSettings(): SMSSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return {
      bearer: stored.bearer || ENV_BEARER,
      sender: stored.sender || ENV_SENDER,
      provider: stored.provider || 'taqnyat',
      isConnected: stored.isConnected || !!ENV_BEARER,
    };
  } catch {
    return { bearer: ENV_BEARER, sender: ENV_SENDER, provider: 'taqnyat', isConnected: !!ENV_BEARER };
  }
}

export function saveSMSSettings(settings: Partial<SMSSettings>) {
  const current = loadSMSSettings();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {}
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

export interface SendSMSOptions {
  recipients: string[];
  body: string;
  sender?: string;
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('05')) p = '+966' + p.slice(1);
  if (p.startsWith('5') && p.length === 9) p = '+966' + p;
  if (!p.startsWith('+')) p = '+966' + p;
  return p;
}

export async function sendSMS(options: SendSMSOptions): Promise<SMSResult> {
  const settings = loadSMSSettings();
  if (!settings.bearer) {
    return { success: false, error: 'لم يتم تكوين Bearer Token. اذهب إلى الإعدادات → SMS' };
  }

  const phones = options.recipients.map(normalizePhone);
  const sender = options.sender || settings.sender || 'RAMZ';

  try {
    const response = await fetch(`${TAQNYAT_API}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.bearer}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        recipients: phones,
        body: options.body,
        sender,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return { success: true, messageId: data?.messageId || data?.id, statusCode: response.status };
    }

    return {
      success: false,
      error: data?.message || data?.error || `خطأ ${response.status}`,
      statusCode: response.status,
    };
  } catch (err: any) {
    // CORS in browser - API may need backend proxy; record attempt
    console.warn('[SMS] Network error (may be CORS):', err?.message);
    return { success: false, error: err?.message || 'خطأ في الشبكة' };
  }
}

export async function testSMSConnection(bearer: string, sender: string, testPhone: string): Promise<SMSResult> {
  const phones = [normalizePhone(testPhone)];
  try {
    const response = await fetch(`${TAQNYAT_API}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        recipients: phones,
        body: 'رسالة اختبار من رمز الإبداع لإدارة الأملاك. Test message from Ramz Al-Ibdaa.',
        sender,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return { success: true, messageId: data?.messageId || data?.id };
    return { success: false, error: data?.message || `خطأ ${response.status}`, statusCode: response.status };
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطأ في الشبكة' };
  }
}

// قوالب الرسائل الجاهزة
export const SMS_TEMPLATES = {
  rentDue: (tenantName: string, amount: number, dueDate: string, propertyName: string) =>
    `عزيزي ${tenantName}، نذكركم بأن دفعة الإيجار البالغة ${amount.toLocaleString('ar-SA')} ر.س مستحقة بتاريخ ${dueDate} لعقار ${propertyName}. رمز الإبداع لإدارة الأملاك.`,

  rentOverdue: (tenantName: string, amount: number, daysLate: number) =>
    `عزيزي ${tenantName}، يرجى العلم بأن دفعة الإيجار البالغة ${amount.toLocaleString('ar-SA')} ر.س متأخرة منذ ${daysLate} يوم. نرجو التواصل فوراً. رمز الإبداع.`,

  leaseExpiring: (tenantName: string, daysLeft: number, propertyName: string) =>
    `عزيزي ${tenantName}، عقد إيجاركم في ${propertyName} ينتهي خلال ${daysLeft} يوم. يرجى التواصل لتجديد العقد. رمز الإبداع لإدارة الأملاك.`,

  maintenanceUpdate: (tenantName: string, requestId: string, status: string) =>
    `عزيزي ${tenantName}، تم تحديث حالة طلب الصيانة رقم ${requestId} إلى: ${status}. رمز الإبداع لإدارة الأملاك.`,

  welcome: (tenantName: string, propertyName: string, unitNum: string) =>
    `أهلاً وسهلاً ${tenantName}، يسعدنا استقبالكم في ${propertyName} - الوحدة ${unitNum}. نتمنى لكم إقامة طيبة. رمز الإبداع لإدارة الأملاك.`,

  custom: (message: string) => message,
};
