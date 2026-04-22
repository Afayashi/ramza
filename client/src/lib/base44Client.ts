/*
 * Base44 SDK Client - رمز الإبداع
 * يتصل بقاعدة بيانات Base44 لجلب وإدارة بيانات العقارات
 * يدعم المصادقة التلقائية عبر URL params و localStorage
 */
import { createClient } from '@base44/sdk';

// ─── معلمات التطبيق ─────────────────────────────────────────────
const isNode = typeof window === 'undefined';
const storage = isNode ? null : window.localStorage;

const toSnakeCase = (str: string) =>
  str.replace(/([A-Z])/g, '_$1').toLowerCase();

/**
 * يقرأ قيمة معلمة من URL أو localStorage أو القيمة الافتراضية
 */
const getAppParamValue = (
  paramName: string,
  opts: { defaultValue?: string; removeFromUrl?: boolean } = {}
): string | null => {
  const { defaultValue, removeFromUrl = false } = opts;
  if (isNode) return defaultValue || null;

  const storageKey = `base44_${toSnakeCase(paramName)}`;

  // 1. تحقق من URL params
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get(paramName);

    if (searchParam) {
      // حفظ في localStorage
      storage?.setItem(storageKey, searchParam);

      // إزالة من URL إذا مطلوب
      if (removeFromUrl) {
        urlParams.delete(paramName);
        const newUrl = `${window.location.pathname}${
          urlParams.toString() ? `?${urlParams.toString()}` : ''
        }${window.location.hash}`;
        window.history.replaceState({}, document.title, newUrl);
      }

      return searchParam;
    }
  } catch (e) {
    console.error('خطأ في قراءة URL params:', e);
  }

  // 2. تحقق من localStorage
  try {
    const storedValue = storage?.getItem(storageKey);
    if (storedValue) return storedValue;
  } catch (e) {
    console.error('خطأ في قراءة localStorage:', e);
  }

  // 3. القيمة الافتراضية
  if (defaultValue) {
    try {
      storage?.setItem(storageKey, defaultValue);
    } catch (_) {}
    return defaultValue;
  }

  return null;
};

// ─── تنظيف التوكن إذا طُلب ─────────────────────────────────────
if (!isNode) {
  const clearToken = getAppParamValue('clear_access_token');
  if (clearToken === 'true') {
    storage?.removeItem('base44_access_token');
    storage?.removeItem('token');
  }
}

// ─── معلمات التطبيق ─────────────────────────────────────────────
export const appParams = {
  appId: getAppParamValue('app_id', { defaultValue: '69cfacf0673abd699cf0f009' }) || '69cfacf0673abd699cf0f009',
  token: getAppParamValue('access_token', { removeFromUrl: true }),
  fromUrl: !isNode ? (getAppParamValue('from_url', { defaultValue: window.location.href }) || window.location.href) : '',
  functionsVersion: getAppParamValue('functions_version', { defaultValue: '' }) || '',
  appBaseUrl: getAppParamValue('app_base_url', { defaultValue: '' }) || '',
};

// ─── إنشاء العميل ───────────────────────────────────────────────
export const base44 = createClient({
  appId: appParams.appId,
  token: appParams.token || undefined,
  functionsVersion: appParams.functionsVersion || undefined,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl: appParams.appBaseUrl,
  headers: {
    'api_key': '9a9de3291a4446ecb2a5790330b8792a',
  },
} as any);

// ─── دوال مساعدة للمصادقة ────────────────────────────────────────
export const saveAccessToken = (token: string): boolean => {
  if (!storage || !token) return false;
  try {
    storage.setItem('base44_access_token', token);
    storage.setItem('token', token);
    return true;
  } catch (e) {
    console.error('خطأ في حفظ التوكن:', e);
    return false;
  }
};

export const removeAccessToken = (): boolean => {
  if (!storage) return false;
  try {
    storage.removeItem('base44_access_token');
    storage.removeItem('token');
    return true;
  } catch (e) {
    console.error('خطأ في حذف التوكن:', e);
    return false;
  }
};

export const getAccessToken = (): string | null => {
  if (!storage) return null;
  return storage.getItem('base44_access_token') || storage.getItem('token') || null;
};

export const getLoginUrl = (nextUrl?: string): string => {
  const redirectUrl = encodeURIComponent(nextUrl || (typeof window !== 'undefined' ? window.location.href : ''));
  return `https://base44.app/login?from_url=${redirectUrl}&app_id=${appParams.appId}`;
};

/**
 * التحقق من وجود توكن مصادقة صالح
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
