/**
 * useLinkedData — ربط بيانات إيجار (عقارات → وحدات → عقود → مدفوعات)
 *
 * مفاتيح الربط:
 *  الوحدات ← العقارات : رقم_وثيقة_الملكية
 *  العقود  ← العقارات : رقم_وثيقة_الملكية
 *  المالية ← العقود   : رقم_العقد
 */
import { useMemo } from 'react';

// ── قراءة بيانات حقيقية من localStorage ──────────────────────────────────────
function loadLS(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.length) return [];

    // كشف صيغة إيجار القديمة (أعمدة __EMPTY) وإعادة تطبيعها
    const first = data[0] as Record<string, any>;
    if (first && Object.keys(first).some(k => k === '__EMPTY' || k.startsWith('__EMPTY'))) {
      const headerIdx = data.findIndex((row: Record<string, any>) => {
        const vals = Object.values(row);
        return vals.filter((v: any) => typeof v === 'string' && v.trim().length > 1 && !/^\d{4}/.test(v)).length >= 3;
      });
      if (headerIdx === -1) return [];
      const headerRow = data[headerIdx] as Record<string, any>;
      const colKeys = Object.keys(headerRow);
      const colMap: Record<string, string> = {};
      colKeys.forEach(k => {
        const v = headerRow[k];
        if (typeof v === 'string' && v.trim()) colMap[k] = v.trim().replace(/\s+/g, '_');
      });
      return data.slice(headerIdx + 1).map((row: Record<string, any>, i: number) => {
        const obj: Record<string, any> = { id: `imported_${i + 1}` };
        colKeys.forEach(k => { if (colMap[k]) obj[colMap[k]] = row[k] ?? ''; });
        return obj;
      }).filter(r => Object.values(r).some(v => v !== '' && v !== null));
    }
    return data;
  } catch {
    return [];
  }
}

// ── normalize deed number (رقم الوثيقة) لضمان التطابق ─────────────────────────
function normDeed(v: any): string {
  return String(v ?? '').trim().replace(/\s+/g, '');
}

// ── normalize contract number (رقم العقد) ─────────────────────────────────────
function normContract(v: any): string {
  return String(v ?? '').trim();
}

// ══════════════════════════════════════════════════════════════════════════════
// hook: جلب وحدات عقار محدد
// ══════════════════════════════════════════════════════════════════════════════
export function usePropertyUnits(property: any) {
  return useMemo(() => {
    if (!property) return [];
    const units = loadLS('real_units');
    const deed = normDeed(property['رقم_وثيقة_الملكية']);
    const name = String(property['اسم_العقار'] ?? '').trim();
    return units.filter(u => {
      if (deed && normDeed(u['رقم_وثيقة_الملكية']) === deed) return true;
      if (name && String(u['اسم_العقار'] ?? '').trim() === name) return true;
      return false;
    });
  }, [property]);
}

// ══════════════════════════════════════════════════════════════════════════════
// hook: جلب عقود عقار محدد
// ══════════════════════════════════════════════════════════════════════════════
export function usePropertyContracts(property: any) {
  return useMemo(() => {
    if (!property) return [];
    const contracts = loadLS('real_contracts');
    const deed = normDeed(property['رقم_وثيقة_الملكية']);
    const name = String(property['اسم_العقار'] ?? '').trim();
    return contracts.filter(c => {
      if (deed && normDeed(c['رقم_وثيقة_الملكية']) === deed) return true;
      if (name && String(c['اسم_العقار'] ?? '').trim() === name) return true;
      return false;
    });
  }, [property]);
}

// ══════════════════════════════════════════════════════════════════════════════
// hook: جلب مدفوعات عقد محدد
// ══════════════════════════════════════════════════════════════════════════════
export function useContractPayments(contract: any) {
  return useMemo(() => {
    if (!contract) return [];
    const financial = loadLS('real_financial');
    const contractNo = normContract(contract['رقم_العقد']);
    if (!contractNo) return [];
    return financial.filter(f => normContract(f['رقم_العقد']) === contractNo);
  }, [contract]);
}

// ══════════════════════════════════════════════════════════════════════════════
// hook: جلب كل المدفوعات المرتبطة بعقار (عبر عقوده)
// ══════════════════════════════════════════════════════════════════════════════
export function usePropertyPayments(property: any) {
  const contracts = usePropertyContracts(property);
  return useMemo(() => {
    if (!contracts.length) return [];
    const financial = loadLS('real_financial');
    const contractNos = new Set(contracts.map(c => normContract(c['رقم_العقد'])).filter(Boolean));
    return financial.filter(f => contractNos.has(normContract(f['رقم_العقد'])));
  }, [contracts]);
}

// ══════════════════════════════════════════════════════════════════════════════
// hook شامل: كل بيانات عقار (للصفحة التفصيلية)
// ══════════════════════════════════════════════════════════════════════════════
export function usePropertyFullData(property: any) {
  const units     = usePropertyUnits(property);
  const contracts = usePropertyContracts(property);
  const payments  = usePropertyPayments(property);

  const stats = useMemo(() => {
    const totalUnits   = units.length;
    const rentedUnits  = units.filter(u => u['حالة_الوحدة'] === 'مؤجرة').length;
    const vacantUnits  = units.filter(u => u['حالة_الوحدة'] === 'متاحة' || u['حالة_الوحدة'] === 'شاغرة').length;
    const activeContracts = contracts.filter(c => c['حالة_العقد'] === 'نشط').length;
    const totalRevenue = contracts.reduce((s, c) => s + Number(c['إجمالي_قيمة_العقد'] ?? 0), 0);
    const totalPaid    = payments.reduce((s, f) => s + Number(f['المبلغ_المدفوع'] ?? 0), 0);
    const totalPending = payments.reduce((s, f) => s + Number(f['المبلغ_المتبقي'] ?? 0), 0);
    const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;
    return { totalUnits, rentedUnits, vacantUnits, activeContracts, totalRevenue, totalPaid, totalPending, occupancyRate };
  }, [units, contracts, payments]);

  return { units, contracts, payments, stats };
}

// ══════════════════════════════════════════════════════════════════════════════
// utility: ربط الوحدات بعقودها
// ══════════════════════════════════════════════════════════════════════════════
export function linkUnitsToContracts(units: any[], contracts: any[]): any[] {
  return units.map(unit => {
    const deed = normDeed(unit['رقم_وثيقة_الملكية']);
    const unitNo = String(unit['رقم_الوحدة'] ?? '').trim();
    const contract = contracts.find(c =>
      normDeed(c['رقم_وثيقة_الملكية']) === deed &&
      String(c['رقم_الوحدة'] ?? '').trim() === unitNo
    );
    return { ...unit, _contract: contract ?? null };
  });
}
