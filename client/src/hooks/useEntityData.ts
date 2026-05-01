/*
 * Hook لجلب البيانات من Base44 API الحقيقي
 * مع fallback تلقائي للبيانات التجريبية عند عدم وجود مصادقة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { base44, getAccessToken } from '@/lib/base44Client';
import {
  isSupabaseConfigured,
  supabaseFetchAll,
  supabaseCreate,
  supabaseUpdate,
  supabaseDelete,
  supabaseFilter,
} from '@/lib/supabaseClient';
import {
  DEMO_PROPERTIES, DEMO_UNITS, DEMO_TENANTS, DEMO_LEASES,
  DEMO_PAYMENTS, DEMO_MAINTENANCE, DEMO_EXPENSES, DEMO_OWNERS,
  DEMO_COMPLAINTS
} from '@/lib/demoData';

// ── مصادر البيانات الحقيقية من localStorage (استيراد إيجار) ──────────────────
// اسم الـ Entity → مفتاح localStorage
const REAL_LS_MAP: Record<string, string> = {
  Property:  'real_properties',
  Unit:      'real_units',
  Lease:     'real_contracts',
  Tenant:    'real_users',
  Payment:   'real_financial',
  Contract:  'real_contracts',
};

function getRealData(entityName: string): any[] | null {
  const key = REAL_LS_MAP[entityName];
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    // اكتشاف صيغة إيجار القديمة (أعمدة __EMPTY) وإعادة معالجتها
    const firstRow = parsed[0] as Record<string, any>;
    if (firstRow && ('__EMPTY' in firstRow || Object.keys(firstRow).some(k => k.startsWith('__EMPTY')))) {
      // البيانات بصيغة إيجار القديمة — ابحث عن صف الأعمدة الحقيقية
      const headerRowIdx = parsed.findIndex((row: Record<string, any>) => {
        const vals = Object.values(row);
        return vals.filter((v: any) => typeof v === 'string' && v.trim().length > 1 && !/^\d{4}/.test(v)).length >= 3;
      });
      if (headerRowIdx === -1) return null;

      const headerRow = parsed[headerRowIdx] as Record<string, any>;
      const colKeys = Object.keys(headerRow);
      // Map: colKey → real column name (e.g. __EMPTY → "اسم_العقار")
      const colMap: Record<string, string> = {};
      colKeys.forEach(k => {
        const v = headerRow[k];
        if (typeof v === 'string' && v.trim()) colMap[k] = v.trim().replace(/\s+/g, '_');
      });

      const dataRows = parsed.slice(headerRowIdx + 1);
      return dataRows
        .map((row: Record<string, any>, i: number) => {
          const obj: Record<string, any> = { id: `imported_${i + 1}` };
          colKeys.forEach(k => { if (colMap[k]) obj[colMap[k]] = row[k] ?? ''; });
          return obj;
        })
        .filter(r => Object.values(r).some(v => v !== '' && v !== null && v !== undefined));
    }

    return parsed;
  } catch {
    return null;
  }
}

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

    // 1. Supabase
    if (isSupabaseConfigured()) {
      try {
        const result = await supabaseFetchAll(entityName);
        if (mountedRef.current) {
          setData(result);
          setIsDemo(false);
          setLoading(false);
          return;
        }
      } catch (e: any) {
        console.warn(`[Supabase/${entityName}] فشل:`, e?.message || e);
      }
    }

    // 2. Base44
    const hasToken = !!getAccessToken();
    if (hasToken) {
      try {
        const entity = (base44 as any).entities?.[entityName];
        if (entity) {
          const result = await entity.list(sort, limit);
          if (mountedRef.current && result && Array.isArray(result)) {
            setData(result);
            setIsDemo(false);
            setLoading(false);
            return;
          }
        }
      } catch (e: any) {
        console.warn(`[Base44/${entityName}] فشل:`, e?.message || e);
        if (mountedRef.current) setError(e?.message || 'فشل الاتصال');
      }
    }

    // 3. Real localStorage (imported from Ejar)
    const realData = getRealData(entityName);
    if (realData && mountedRef.current) {
      setData(realData);
      setIsDemo(false);
      setLoading(false);
      return;
    }

    // 4. Demo fallback
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

  const createRecord = useCallback(async (record: any) => {
    if (isSupabaseConfigured()) {
      try {
        const result = await supabaseCreate(entityName, record);
        await loadData();
        return result;
      } catch (e: any) {
        console.warn(`[Supabase/${entityName}] فشل الإنشاء:`, e.message);
      }
    }
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) {
        const result = await entity.create(record);
        await loadData();
        return result;
      }
    } catch (e: any) {
      console.error(`[${entityName}] فشل إنشاء السجل:`, e);
      throw e;
    }
  }, [entityName, loadData]);

  const updateRecord = useCallback(async (id: string, updates: any) => {
    if (isSupabaseConfigured()) {
      try {
        const result = await supabaseUpdate(entityName, id, updates);
        await loadData();
        return result;
      } catch (e: any) {
        console.warn(`[Supabase/${entityName}] فشل التحديث:`, e.message);
      }
    }
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

  const deleteRecord = useCallback(async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        await supabaseDelete(entityName, id);
        await loadData();
        return;
      } catch (e: any) {
        console.warn(`[Supabase/${entityName}] فشل الحذف:`, e.message);
      }
    }
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

  const filterData = useCallback(async (query: any) => {
    if (isSupabaseConfigured()) {
      try { return await supabaseFilter(entityName, query); }
      catch (e: any) { console.warn(`[Supabase/${entityName}] فشل التصفية:`, e.message); }
    }
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) return await entity.filter(query, sort, limit);
    } catch (e: any) {
      console.error(`[${entityName}] فشل تصفية البيانات:`, e);
      throw e;
    }
    return [];
  }, [entityName, sort, limit]);

  return { data, loading, isDemo, error, reload: loadData, setData, createRecord, updateRecord, deleteRecord, filterData };
}

export function useMultiEntityData(entities: { name: string; sort?: string; limit?: number }[]) {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);

  const entitiesKey = entities.map(e => e.name).join('|');

  const loadAll = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    const result: Record<string, any[]> = {};
    const errs: Record<string, string> = {};
    let usedDemo = false;
    const hasToken = !!getAccessToken();

    const promises = entities.map(async ({ name, sort = '-created_date', limit = 1000 }) => {
      if (isSupabaseConfigured()) {
        try {
          result[name] = await supabaseFetchAll(name);
          return;
        } catch (e: any) {
          console.warn(`[Supabase/${name}] فشل:`, e?.message || e);
          errs[name] = e?.message || 'فشل Supabase';
        }
      }
      if (hasToken) {
        try {
          const entity = (base44 as any).entities?.[name];
          if (entity) {
            const res = await entity.list(sort, limit);
            if (res && Array.isArray(res)) { result[name] = res; return; }
          }
        } catch (e: any) {
          console.warn(`[Base44/${name}] فشل:`, e?.message || e);
          errs[name] = e?.message || 'فشل الاتصال';
        }
      }
      // Real localStorage (imported from Ejar)
      const realData = getRealData(name);
      if (realData) {
        result[name] = realData;
        return;
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitiesKey]);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    return () => { mountedRef.current = false; };
  }, [loadAll]);

  return { data, loading, isDemo, errors, reload: loadAll };
}
