/*
 * Supabase Client - رمز الإبداع لإدارة الأملاك
 * الاتصال بقاعدة بيانات Supabase السحابية
 *
 * كيفية الإعداد:
 * 1. اذهب إلى: https://supabase.com/dashboard
 * 2. افتح مشروعك → Project Settings → API
 * 3. انسخ Project URL و anon/public key
 * 4. أدخلهما في صفحة الإعدادات داخل التطبيق
 *    أو أضفهما في ملف .env كـ VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'ramz_supabase_url';
const STORAGE_KEY_KEY = 'ramz_supabase_anon_key';

// ─── قراءة بيانات الاتصال ────────────────────────────────────────
function getSupabaseConfig(): { url: string; anonKey: string } | null {
  // 1. من متغيرات البيئة (للنشر الإنتاجي)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey && envUrl.startsWith('https://')) {
    return { url: envUrl, anonKey: envKey };
  }

  // 2. من localStorage (للضبط عبر واجهة التطبيق)
  try {
    const url = localStorage.getItem(STORAGE_KEY_URL);
    const key = localStorage.getItem(STORAGE_KEY_KEY);
    if (url && key && url.startsWith('https://')) {
      return { url, anonKey: key };
    }
  } catch (_) {}

  return null;
}

// ─── حفظ بيانات الاتصال ─────────────────────────────────────────
export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
}

// ─── حذف بيانات الاتصال ──────────────────────────────────────────
export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

// ─── فحص وجود إعداد Supabase ────────────────────────────────────
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

// ─── إنشاء العميل ────────────────────────────────────────────────
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  // إعادة إنشاء العميل إذا تغيرت الإعدادات
  if (!_client) {
    try {
      _client = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: {
          schema: 'public',
        },
      });
    } catch (e) {
      console.error('[Supabase] فشل إنشاء العميل:', e);
      return null;
    }
  }
  return _client;
}

// ─── إعادة تهيئة العميل (بعد تغيير الإعدادات) ──────────────────
export function resetSupabaseClient(): void {
  _client = null;
}

// ─── خريطة أسماء الكيانات إلى أسماء الجداول ─────────────────────
export const ENTITY_TABLE_MAP: Record<string, string> = {
  Property: 'properties',
  Unit: 'units',
  Tenant: 'tenants',
  Lease: 'leases',
  Payment: 'payments',
  Maintenance: 'maintenance_requests',
  Expense: 'expenses',
  Owner: 'owners',
  Complaint: 'complaints',
  Invoice: 'invoices',
  Document: 'documents',
  Notification: 'notifications',
  BrokerageContract: 'brokerage_contracts',
  AdLicense: 'ad_licenses',
};

// ─── CRUD عمليات عامة ────────────────────────────────────────────
export async function supabaseFetchAll(entityName: string): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase غير مهيأ');

  const table = ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase() + 's';
  const { data, error } = await client
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function supabaseCreate(entityName: string, record: any): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase غير مهيأ');

  const table = ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase() + 's';
  const { data, error } = await client.from(table).insert([record]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function supabaseUpdate(entityName: string, id: string, updates: any): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase غير مهيأ');

  const table = ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase() + 's';
  const { data, error } = await client.from(table).update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function supabaseDelete(entityName: string, id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase غير مهيأ');

  const table = ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase() + 's';
  const { error } = await client.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function supabaseFilter(entityName: string, filters: Record<string, any>): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase غير مهيأ');

  const table = ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase() + 's';
  let query = client.from(table).select('*');
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

// ─── اختبار الاتصال ───────────────────────────────────────────────
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'لم يتم إدخال بيانات الاتصال' };

  try {
    const { error } = await client.from('properties').select('id').limit(1);
    if (error) {
      // جدول غير موجود يعني الاتصال ناجح لكن الجدول لم يُنشأ بعد
      if (error.code === '42P01') return { success: true, message: 'الاتصال ناجح ✓ - الجداول تحتاج إنشاء' };
      return { success: false, message: `خطأ: ${error.message}` };
    }
    return { success: true, message: 'الاتصال بـ Supabase ناجح ✓' };
  } catch (e: any) {
    return { success: false, message: `فشل الاتصال: ${e.message}` };
  }
}
