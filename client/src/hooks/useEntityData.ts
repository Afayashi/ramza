/*
 * Hook لجلب البيانات من Base44 مع fallback للبيانات التجريبية
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/lib/base44Client';
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
};

export function useEntityData(entityName: string, sort = '-created_date', limit = 1000) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const entity = (base44 as any).entities?.[entityName];
      if (entity) {
        const result = await entity.list(sort, limit);
        if (result && result.length > 0) {
          setData(result);
          setIsDemo(false);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn(`[${entityName}] API failed, using demo data`);
    }
    // Fallback to demo data
    setData(DEMO_MAP[entityName] || []);
    setIsDemo(true);
    setLoading(false);
  }, [entityName, sort, limit]);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, isDemo, reload: loadData, setData };
}

export function useMultiEntityData(entities: { name: string; sort?: string; limit?: number }[]) {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const result: Record<string, any[]> = {};
    let usedDemo = false;

    await Promise.all(entities.map(async ({ name, sort = '-created_date', limit = 1000 }) => {
      try {
        const entity = (base44 as any).entities?.[name];
        if (entity) {
          const res = await entity.list(sort, limit);
          if (res && res.length > 0) {
            result[name] = res;
            return;
          }
        }
      } catch (e) {
        console.warn(`[${name}] API failed, using demo data`);
      }
      result[name] = DEMO_MAP[name] || [];
      usedDemo = true;
    }));

    setData(result);
    setIsDemo(usedDemo);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return { data, loading, isDemo, reload: loadAll };
}
