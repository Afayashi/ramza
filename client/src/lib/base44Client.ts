/*
 * Base44 SDK Client - رمز الإبداع
 * يتصل بقاعدة بيانات Base44 لجلب وإدارة بيانات العقارات
 */
import { createClient } from '@base44/sdk';

const getParam = (key: string, defaultValue?: string): string | null => {
  if (typeof window === 'undefined') return defaultValue || null;
  const storageKey = `base44_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(key);
  if (searchParam) {
    localStorage.setItem(storageKey, searchParam);
    urlParams.delete(key);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
    return searchParam;
  }
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;
  if (defaultValue) {
    localStorage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  return null;
};

export const appParams = {
  appId: getParam('app_id', '69cfacf0673abd699cf0f009') || '69cfacf0673abd699cf0f009',
  token: getParam('access_token'),
  appBaseUrl: getParam('app_base_url', ''),
  functionsVersion: getParam('functions_version', ''),
};

export const base44 = createClient({
  appId: appParams.appId,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl: appParams.appBaseUrl,
} as any);
