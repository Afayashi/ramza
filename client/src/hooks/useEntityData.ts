/*
 * Hook لجلب البيانات من Base44 API الحقيقي
 * مع fallback تلقائي للبيانات التجريبية عند عدم وجود مصادقة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/lib/base44Client';
import { getAccessToken } from '@/lib/base44Client';
import {
  DEMO_PROPERTIES, DEMO_UNITS, DEMO_TENANTS, DEMO_LEASES,
  DEMO_PAYMENTS, DEMO_MAINTENANCE, DEMO_EXPENSES, DEMO_OWNERS,
  DEMO_COMPLAINTS
} from '@/lib/demoData';

const DEMO_MAP: Record<string, any[]> = {
  Property: DEMO_PROPERTIES,
  Unit: DEMO_UNITS,
  Tenant: DEMO_TENANTS,
  Lease: DEMO_LEASES,
  Payment: DEMO_PAYMENTS,
  Maintenance: DEMO_MAINTENANCE,
  Expense: DEMO_EXPENSES,
  Owner: DEMO_OWNERS,
  Complaint: DEMO_COMPLAINTS,
  Invoice: [],
  Document: [],
  Notification: [],
  BrokerageContract: [],
  AdLicense: [],
};

/**
 * Hook لجلب بيانات كيان واحد من Base44
 * يحاول الاتصال بالـ API أولاً، وإذا فشل يستخدم البيانات التجريبية
 */
export function useEntityData(entityName: string, sort = '-created_date', limit = 1000) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);

    const hasToken = !!getAccessToken();

    if (hasToken) {
      try {
        const entity = (base44 as any).entities?.[entityName];
        if (entity) {
          const result = await entity.list(sort, limit);
          if (mountedRef.current) {
            if (result && Array.isArray(result)) {
              setData(result);
              setIsDemo(false);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e: any) {
        console.warn(`[${entityName}] فشل جلب البيانات من API:`, e?.message || e);
        if (mountedRef.current) {
          setError(e?.message || 'فشل الاتصال بقاعدة البيانات');
        }
      }
    }

    // Fallback إلى البيانات التجريبية
    if (mountedRef.current) {
      setData(DEMO_MAP[entityName] || []);
      setIsDemo(true);
      setLoading(false);
    }
  }, [entityName, sort, limit]);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => { mountedRef.current = false; };
  }, [loadData]);

  // دالة إنشاء سجل جديد
  const createRecord = useCallback(async (record: any) => {
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) {
        const result = await entity.create(record);
        await loadData(); // إعادة تحميل البيانات
        return result;
      }
    } catch (e: any) {
      console.error(`[${entityName}] فشل إنشاء السجل:`, e);
      throw e;
    }
  }, [entityName, loadData]);

  // دالة تحديث سجل
  const updateRecord = useCallback(async (id: string, updates: any) => {
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) {
        const result = await entity.update(id, updates);
        await loadData();
        return result;
      }
    } catch (e: any) {
      console.error(`[${entityName}] فشل تحديث السجل:`, e);
      throw e;
    }
  }, [entityName, loadData]);

  // دالة حذف سجل
  const deleteRecord = useCallback(async (id: string) => {
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) {
        await entity.delete(id);
        await loadData();
      }
    } catch (e: any) {
      console.error(`[${entityName}] فشل حذف السجل:`, e);
      throw e;
    }
  }, [entityName, loadData]);

  // دالة تصفية البيانات
  const filterData = useCallback(async (query: any) => {
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) {
        const result = await entity.filter(query, sort, limit);
        return result;
      }
    } catch (e: any) {
      console.error(`[${entityName}] فشل تصفية البيانات:`, e);
      throw e;
    }
    return [];
  }, [entityName, sort, limit]);

  return {
    data,
    loading,
    isDemo,
    error,
    reload: loadData,
    setData,
    createRecord,
    updateRecord,
    deleteRecord,
    filterData,
  };
}

/**
 * Hook لجلب بيانات عدة كيانات في وقت واحد
 * يستخدم Promise.allSettled لضمان عدم فشل الكل إذا فشل كيان واحد
 */
export function useMultiEntityData(entities: { name: string; sort?: string; limit?: number }[]) {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);

  // استخدام مفتاح ثابت لمنع إعادة التحميل غير الضرورية
  const entitiesKey = entities.map(e => `${e.name}:${e.sort || '-created_date'}:${e.limit || 1000}`).join('|');

  const loadAll = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    const result: Record<string, any[]> = {};
    const errs: Record<string, string> = {};
    let usedDemo = false;

    const hasToken = !!getAccessToken();

    const promises = entities.map(async ({ name, sort = '-created_date', limit = 1000 }) => {
      if (hasToken) {
        try {
          const entity = (base44 as any).entities?.[name];
          if (entity) {
            const res = await entity.list(sort, limit);
            if (res && Array.isArray(res)) {
              result[name] = res;
              return;
            }
          }
        } catch (e: any) {
          console.warn(`[${name}] فشل جلب البيانات:`, e?.message || e);
          errs[name] = e?.message || 'فشل الاتصال';
        }
      }
      // Fallback
      result[name] = DEMO_MAP[name] || [];
      usedDemo = true;
    });

    await Promise.allSettled(promises);

    if (mountedRef.current) {
      setData(result);
      setIsDemo(usedDemo);
      setErrors(errs);
      setLoading(false);
    }
  }, [entitiesKey]);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    return () => { mountedRef.current = false; };
  }, [loadAll]);

  return { data, loading, isDemo, errors, reload: loadAll };
}
