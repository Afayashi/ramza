/*
 * EjarContractAnalyzer — استرداد وتحليل عقود إيجار
 * رمز الإبداع لإدارة الأملاك
 * يدعم: ملفات PDF لعقود إيجار + Excel/CSV لقوائم عقود
 */
import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, AlertTriangle, CheckCircle, Loader2,
  Search, Download, Copy, ChevronDown, ChevronUp,
  User, Building2, Calendar, DollarSign, Phone,
  MapPin, Hash, Clock, RefreshCw, X,
  FileSearch, ClipboardList, Shield, Briefcase,
  CreditCard, Users, Home, BarChart3, FileCheck,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const GOLD = '#C8A951';
const DARK = '#1a1a1a';
const GREEN = '#0ea472';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** بيانات عقد إيجار مستخرجة من PDF */
interface EjarPdfContract {
  // 1 - بيانات العقد
  contractNumber?: string;
  contractType?: string;
  contractDate?: string;
  contractLocation?: string;
  startDate?: string;
  endDate?: string;

  // 2 - بيانات المؤجر
  ownerName?: string;
  ownerNationality?: string;
  ownerIdType?: string;
  ownerId?: string;
  ownerPhone?: string;
  ownerEmail?: string;

  // 4 - بيانات المستأجر
  tenantName?: string;
  tenantNationality?: string;
  tenantIdType?: string;
  tenantId?: string;
  tenantPhone?: string;
  tenantEmail?: string;

  // 6 - بيانات الوساطة
  brokerCompany?: string;
  brokerCR?: string;
  brokerName?: string;
  brokerPhone?: string;
  brokerEmail?: string;

  // 7 - مستندات الملكية
  titleDeedNumber?: string;
  titleDeedIssuer?: string;
  titleDeedDate?: string;
  titleDeedLocation?: string;
  titleDeedType?: string;

  // 8 - بيانات العقار
  nationalAddress?: string;
  propertyType?: string;
  propertyUsage?: string;
  floorsCount?: string;
  unitsCount?: string;
  parkingCount?: string;
  elevatorsCount?: string;

  // 9 - الوحدة الإيجارية
  unitType?: string;
  unitNumber?: string;
  unitFloor?: string;
  unitArea?: string;
  unitFurnished?: string;
  unitRooms?: Record<string, string>;
  electricityMeter?: string;
  gasMeter?: string;
  waterMeter?: string;

  // 11 - المالية
  annualRent?: string;
  totalContractValue?: string;
  regularPayment?: string;
  lastPayment?: string;
  paymentsCount?: string;
  paymentCycle?: string;
  securityDeposit?: string;
  electricityAmount?: string;
  waterAmount?: string;
  gasAmount?: string;
  parkingAmount?: string;

  // 12 - جدول السداد
  paymentSchedule?: Array<{
    num: string;
    dueDateAD: string;
    endDeadlineAD: string;
    amount: string;
  }>;

  // raw text
  rawText?: string;
  city?: string;
  district?: string;
  status?: string;
}

/** بيانات عقد Excel بسيطة */
interface ContractData {
  contractNumber?: string;
  contractDate?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  status?: string;
  propertyName?: string;
  propertyType?: string;
  unitNumber?: string;
  city?: string;
  district?: string;
  address?: string;
  tenantName?: string;
  tenantId?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  ownerName?: string;
  ownerId?: string;
  ownerPhone?: string;
  annualRent?: string;
  monthlyRent?: string;
  deposit?: string;
  vatAmount?: string;
  totalRent?: string;
  paymentMethod?: string;
  paymentFrequency?: string;
  waterIncluded?: boolean;
  electricityIncluded?: boolean;
  maintenanceIncluded?: boolean;
  rawFields?: Record<string, string>;
}

// ─── PDF Parser ─────────────────────────────────────────────────────────────────

/** استخراج النص من PDF باستخدام pdfjs-dist */
async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  // استخدام worker بدون CDN — تعيين workerSrc إلى رابط محلي
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

/** مساعد: اقتنص قيمة بين علامة ونهاية (أول 200 حرف) */
function capture(text: string, ...markers: string[]): string {
  for (const marker of markers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) {
      const after = text.slice(idx + marker.length, idx + marker.length + 200).trim();
      // أخذ حتى أول نقطة أو سطر جديد أو علامة تقسيم
      const end = after.search(/\n|:|\s{3,}/);
      return (end > 0 ? after.slice(0, end) : after.slice(0, 60)).trim();
    }
  }
  return '';
}

// تصحيح أشهر تشوهات OCR العربية في عقود PDF
function normalizeArabicOcr(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/ا\s*لاسم/g, 'الاسم')
    .replace(/االسم/g, 'الاسم')
    .replace(/ا\s*ل?جنسية/g, 'الجنسية')
    .replace(/الجنسية/g, 'الجنسية')
    .replace(/الهوية/g, 'الهوية')
    .replace(/ا\s*ل?جوال/g, 'الجوال')
    .replace(/ا\s*ل?الكتروني|ا\s*ل?إلكتروني/g, 'الإلكتروني')
    .replace(/ا\s*ل?ايجار|ا\s*ل?إيجار/g, 'الإيجار')
    .replace(/ا\s*ل?ضمان/g, 'الضمان')
    .replace(/ا\s*ل?دورية/g, 'الدورية')
    .replace(/\s+/g, ' ')
    .trim();
}

// تنظيف القيم المستخرجة من PDF (تقليل الكلمات الإنجليزية الضوضائية)
function cleanExtractedValue(value?: string): string {
  if (!value) return '';
  return normalizeArabicOcr(value)
    .replace(/\s+/g, ' ')
    .replace(/(?:Last Rent Payment|Regular Rent Payment|Total Contract value|Annual Rent|Amount|Cont|Num)/gi, '')
    .replace(/[|]/g, ' ')
    .trim();
}

function extractNumberValue(value?: string): string {
  if (!value) return '';
  const cleaned = cleanExtractedValue(value).replace(/,/g, '');
  const m = cleaned.match(/\d+(?:\.\d+)?/);
  return m ? m[0] : '';
}

function normalizeYesNo(value?: string): string {
  const v = (value || '').toLowerCase().trim();
  if (!v) return '';
  if (['yes', 'true', '1', 'نعم', 'مؤثثة'].includes(v)) return 'نعم';
  if (['no', 'false', '0', 'لا', 'غير مؤثثة'].includes(v)) return 'لا';
  return cleanExtractedValue(value);
}

function formatSar(value?: string): string {
  if (!value) return '';
  const n = Number(String(value).replace(/,/g, ''));
  if (Number.isNaN(n)) return cleanExtractedValue(value);
  return `${n.toLocaleString('ar-SA')} ر.س`;
}

/** استخراج بيانات عقد إيجار من نص PDF */
function parseEjarPdfText(text: string): EjarPdfContract {
  const source = normalizeArabicOcr(text);
  const c: EjarPdfContract = { rawText: source };

  // ═══ 1: بيانات العقد ═══
  c.contractNumber = capture(source, 'رقم سجل العقد:', 'Contract No.', 'No Contract');
  c.contractType = cleanExtractedValue(capture(source, 'نوع العقد:', 'Type Contract', 'Contract Type'));
  c.contractDate = cleanExtractedValue(capture(source, 'تاريخ إبرام العقد:', 'Contract Sealing Date', 'Sealing Date'));
  c.contractLocation = cleanExtractedValue(capture(source, 'مكان إبرام العقد:', 'Sealing Contract Location', 'Location'));
  c.startDate = cleanExtractedValue(capture(source, 'تاريخ بداية مدة الإيجار:', 'Tenancy Start Date'));
  c.endDate = cleanExtractedValue(capture(source, 'تاريخ نهاية مدة الإيجار:', 'Tenancy End Date'));

  // ═══ 2: بيانات المؤجر ═══
  // نبحث عن قسم المؤجر ونستخرج منه
  const lessorIdx = source.indexOf('بيانات المؤجر') !== -1
    ? source.indexOf('بيانات المؤجر')
    : source.indexOf('Lessor Data');
  const tenantIdx = source.indexOf('بيانات المستأجر') !== -1
    ? source.indexOf('بيانات المستأجر')
    : source.indexOf('Tenant Data');

  if (lessorIdx !== -1) {
    const lessorSection = source.slice(lessorIdx, tenantIdx !== -1 ? tenantIdx : lessorIdx + 500);
    c.ownerName = cleanExtractedValue(capture(lessorSection, 'االسم:', 'الاسم:', 'Name'));
    c.ownerNationality = cleanExtractedValue(capture(lessorSection, 'الجنسَّية:', 'الجنسية:', 'Nationality'));
    c.ownerIdType = cleanExtractedValue(capture(lessorSection, 'نوع الهوَّية:', 'نوع الهوية:', 'ID Type'));
    c.ownerId = cleanExtractedValue(capture(lessorSection, 'رقم الهوَّية:', 'رقم الهوية:', 'ID No.'));
    c.ownerPhone = cleanExtractedValue(capture(lessorSection, 'رقم الجَّوال:', 'رقم الجوال:', 'Mobile No.'));
    c.ownerEmail = cleanExtractedValue(capture(lessorSection, 'البريد اإللكتروني:', 'البريد الإلكتروني:', 'Email'));
  }

  // ═══ 4: بيانات المستأجر ═══
  const brokerIdx = source.indexOf('بيانات منشأة الوساطة') !== -1
    ? source.indexOf('بيانات منشأة الوساطة')
    : source.indexOf('Brokerage Entity');

  if (tenantIdx !== -1) {
    const tenantSection = source.slice(tenantIdx, brokerIdx !== -1 ? brokerIdx : tenantIdx + 500);
    c.tenantName = cleanExtractedValue(capture(tenantSection, 'االسم:', 'الاسم:', 'Name'));
    c.tenantNationality = cleanExtractedValue(capture(tenantSection, 'الجنسَّية:', 'الجنسية:', 'Nationality'));
    c.tenantIdType = cleanExtractedValue(capture(tenantSection, 'نوع الهوَّية:', 'نوع الهوية:', 'ID Type'));
    c.tenantId = cleanExtractedValue(capture(tenantSection, 'رقم الهوَّية:', 'رقم الهوية:', 'ID No.'));
    c.tenantPhone = cleanExtractedValue(capture(tenantSection, 'رقم الجَّوال:', 'رقم الجوال:', 'Mobile No.'));
    c.tenantEmail = cleanExtractedValue(capture(tenantSection, 'البريد اإللكتروني:', 'البريد الإلكتروني:', 'Email'));
  }

  // ═══ 6: الوساطة ═══
  const ownerDocIdx = source.indexOf('بيانات مستندات الملكية') !== -1
    ? source.indexOf('بيانات مستندات الملكية')
    : source.indexOf('Ownership document Data');

  if (brokerIdx !== -1) {
    const brokerSection = source.slice(brokerIdx, ownerDocIdx !== -1 ? ownerDocIdx : brokerIdx + 600);
    c.brokerCompany = cleanExtractedValue(capture(brokerSection, 'اسم منشأة الوساطة العقارية:', 'Brokerage Entity Name'));
    c.brokerCR = cleanExtractedValue(capture(brokerSection, 'رقم الِّسجل الِّتجاري:', 'رقم السجل التجاري:', 'CR No.'));
    c.brokerName = cleanExtractedValue(capture(brokerSection, 'اسم الموظف:', 'Broker Name'));
    c.brokerPhone = cleanExtractedValue(capture(brokerSection, 'رقم الجَّوال:', 'رقم الجوال:', 'Mobile No.'));
    c.brokerEmail = cleanExtractedValue(capture(brokerSection, 'البريد اإللكتروني:', 'البريد الإلكتروني:', 'Email'));
  }

  // ═══ 7: مستندات الملكية ═══
  const propDataIdx = source.indexOf('بيانات العقار') !== -1
    ? source.indexOf('بيانات العقار')
    : source.indexOf('Property Data');

  if (ownerDocIdx !== -1) {
    const docSection = source.slice(ownerDocIdx, propDataIdx !== -1 ? propDataIdx : ownerDocIdx + 400);
    c.titleDeedNumber = cleanExtractedValue(capture(docSection, 'Title Deed No:', 'رقم المستند:', 'رقم الصك'));
    c.titleDeedIssuer = cleanExtractedValue(capture(docSection, 'Issuer:', 'جهة اإلصدار:', 'جهة الإصدار:'));
    c.titleDeedDate = cleanExtractedValue(capture(docSection, 'Issue Date:', 'تاريخ اإلصدار:', 'تاريخ الإصدار:'));
    c.titleDeedLocation = cleanExtractedValue(capture(docSection, 'Place of Issue:', 'مكان اإلصدار:', 'مكان الإصدار:'));
    c.titleDeedType = cleanExtractedValue(capture(docSection, 'Title deed type:', 'نوع الصك:'));
  }

  // ═══ 8: بيانات العقار ═══
  const unitsIdx = source.indexOf('بيانات الوحدات الإيجارية') !== -1
    ? source.indexOf('بيانات الوحدات الإيجارية')
    : source.indexOf('Rental Units Data');

  if (propDataIdx !== -1) {
    const propSection = source.slice(propDataIdx, unitsIdx !== -1 ? unitsIdx : propDataIdx + 500);
    c.nationalAddress = cleanExtractedValue(capture(propSection, 'العنوان الوطني:', 'National Address'));
    c.propertyType = cleanExtractedValue(capture(propSection, 'نوع بناء العقار:', 'Property Type'));
    c.propertyUsage = cleanExtractedValue(capture(propSection, 'الغرض من استخدام العقار:', 'Property Usage'));
    c.floorsCount = cleanExtractedValue(capture(propSection, 'عدد الطوابق:', 'Number of Floors'));
    c.unitsCount = cleanExtractedValue(capture(propSection, 'عدد الوحدات:', 'Number of Units'));
    c.parkingCount = cleanExtractedValue(capture(propSection, 'عدد المواقف:', 'Number of Parking'));
    c.elevatorsCount = cleanExtractedValue(capture(propSection, 'عدد المصاعد:', 'Number of Elevators'));

    // استخراج المدينة والحي من العنوان الوطني
    if (c.nationalAddress) {
      const parts = c.nationalAddress.split(/[,،]/);
      if (parts.length >= 4) {
        c.district = parts[1]?.trim();
        c.city = parts[parts.length - 1]?.trim() || parts[3]?.trim();
      }
    }
    // محاولة من السياق
    if (!c.city) c.city = capture(source, 'الرياض') ? 'الرياض' : capture(source, 'جدة') ? 'جدة' : capture(source, 'مكة') ? 'مكة' : '';
  }

  // ═══ 9: الوحدة الإيجارية ═══
  const tenantAuthIdx = source.indexOf('صلاحيات المستأجر') !== -1
    ? source.indexOf('صلاحيات المستأجر')
    : source.indexOf('Tenant Authority');

  if (unitsIdx !== -1) {
    const unitSection = source.slice(unitsIdx, tenantAuthIdx !== -1 ? tenantAuthIdx : unitsIdx + 600);
    c.unitType = cleanExtractedValue(capture(unitSection, 'نوع الوحدة:', 'Unit Type'));
    c.unitNumber = cleanExtractedValue(capture(unitSection, 'رقم الوحدة:', 'Unit No.'));
    c.unitFloor = cleanExtractedValue(capture(unitSection, 'رقم الطابق:', 'Floor No.'));
    c.unitArea = cleanExtractedValue(capture(unitSection, 'مساحة الوحدة:', 'Unit Area'));
    c.unitFurnished = normalizeYesNo(capture(unitSection, 'مؤَّثثة:', 'Furnished'));
    c.electricityMeter = cleanExtractedValue(capture(unitSection, 'رقم عَّداد الكهرباء', 'Electricity meter number'));
    c.gasMeter = cleanExtractedValue(capture(unitSection, 'رقم عَّداد الغاز', 'Gas meter number'));
    c.waterMeter = cleanExtractedValue(capture(unitSection, 'رقم عَّداد المياه', 'Water meter number'));

    // استخراج أنواع الغرف
    const rooms: Record<string, string> = {};
    const roomMatches = unitSection.matchAll(/نوع الغرفة\s+([^\n]+)\s+العدد\s+(\d+)/g);
    for (const m of roomMatches) {
      rooms[m[1].trim()] = m[2].trim();
    }
    if (Object.keys(rooms).length > 0) c.unitRooms = rooms;
  }

  // ═══ 11: المالية ═══
  const scheduleIdx = source.indexOf('جدول سداد الدفعات') !== -1
    ? source.indexOf('جدول سداد الدفعات')
    : source.indexOf('Rent Payments Schedule');

  const finDataIdx = source.indexOf('البيانات المالية') !== -1
    ? source.indexOf('البيانات المالية')
    : source.indexOf('Financial Data');

  if (finDataIdx !== -1) {
    const finSection = source.slice(finDataIdx, scheduleIdx !== -1 ? scheduleIdx : finDataIdx + 600);
    c.annualRent = extractNumberValue(capture(finSection, 'قيمة اإليجار', 'Annual Rent', 'قيمة الإيجار'));
    c.securityDeposit = extractNumberValue(capture(finSection, 'مبلغ الَّضمان', 'Security Deposit'));
    c.electricityAmount = extractNumberValue(capture(finSection, 'أجرة الكهرباء', 'Electricity Annual'));
    c.waterAmount = extractNumberValue(capture(finSection, 'أجرة المياه', 'Water Annual'));
    c.gasAmount = extractNumberValue(capture(finSection, 'أجرة الغاز', 'Gas Annual'));
    c.parkingAmount = extractNumberValue(capture(finSection, 'أجرة المواقف', 'Parking Annual'));
    c.regularPayment = extractNumberValue(capture(finSection, 'دفعة اإليجار الَّدورية:', 'دفعة الإيجار الدورية:', 'Regular Rent Payment'));
    c.lastPayment = extractNumberValue(capture(finSection, 'دفعة اإليجار األخيرة:', 'دفعة الإيجار الأخيرة:', 'Last Rent Payment'));
    c.paymentsCount = extractNumberValue(capture(finSection, 'عدد دفعات اإليجار:', 'عدد دفعات الإيجار:', 'Number of Rent Payments'));
    c.paymentCycle = cleanExtractedValue(capture(finSection, 'دورة سداد الايجار', 'Rent payment cycle'));
    c.totalContractValue = extractNumberValue(capture(finSection, 'اجمالي قيمة العقد:', 'إجمالي قيمة العقد:', 'Total Contract value'));
  }

  // ═══ 12: جدول السداد ═══
  if (scheduleIdx !== -1) {
    const schedSection = text.slice(scheduleIdx, scheduleIdx + 800);
    const rows: Array<{ num: string; dueDateAD: string; endDeadlineAD: string; amount: string }> = [];
    // نمط: رقم تسلسلي + تواريخ + مبلغ
    const payPattern = /(\d)\s+([\d]{4}-[\d]{2}-[\d]{2})\s+([\d]{4}-[\d]{2}-[\d]{2})\s+(?:يوم\s+)?[\d\-]+\s+[\d\-]+\s+([\d,]+\.?\d*)/g;
    let m;
    while ((m = payPattern.exec(schedSection)) !== null) {
      rows.push({ num: m[1], dueDateAD: m[2], endDeadlineAD: m[3], amount: m[4] });
    }
    if (rows.length > 0) c.paymentSchedule = rows;
    // استخراج إجمالي قيمة العقد إن لم يُستخرج
    if (!c.totalContractValue) {
      c.totalContractValue = extractNumberValue(capture(schedSection, 'اجمالي قيمة العقد:', 'Total Contract value'));
    }
    // الإيجار السنوي
    if (!c.annualRent) {
      c.annualRent = extractNumberValue(capture(schedSection, 'قيمة اإليجار', 'Annual Rent'));
    }
  }

  // تنظيف: إزالة القيم الفارغة جداً
  for (const key of Object.keys(c) as (keyof EjarPdfContract)[]) {
    if (typeof c[key] === 'string' && (c[key] as string).length > 100) {
      (c as any)[key] = (c[key] as string).slice(0, 80) + '...';
    }
  }

  return c;
}

/** تحديد حالة العقد بناءً على التواريخ */
function deriveStatus(c: EjarPdfContract): string {
  if (c.endDate) {
    try {
      const end = new Date(c.endDate);
      const now = new Date();
      if (end < now) return 'منتهي';
      const daysLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysLeft <= 30) return 'ينتهي قريباً';
      return 'ساري';
    } catch { /* ignore */ }
  }
  return 'ساري';
}

// ─── Excel Helpers ─────────────────────────────────────────────────────────────

function extractFromRows(rows: Record<string, string>[]): ContractData[] {
  return rows.map((row) => {
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
        if (val && String(val).trim()) return String(val).trim();
      }
      return undefined;
    };

    return {
      contractNumber: get('رقم_عقد_الإيجار', 'رقم_العقد', 'contract_number', 'Contract_Number', 'رقم العقد', 'ContractNo'),
      contractDate: get('تاريخ_العقد', 'contract_date', 'ContractDate', 'تاريخ العقد'),
      startDate: get('تاريخ_بداية_العقد', 'start_date', 'StartDate', 'تاريخ البداية', 'بداية العقد'),
      endDate: get('تاريخ_نهاية_العقد', 'end_date', 'EndDate', 'تاريخ النهاية', 'نهاية العقد'),
      duration: get('مدة_العقد', 'duration', 'Duration', 'مدة العقد'),
      status: get('حالة_العقد', 'status', 'Status', 'الحالة'),

      propertyName: get('اسم_العقار', 'property_name', 'PropertyName', 'اسم العقار'),
      propertyType: get('نوع_العقار', 'property_type', 'PropertyType', 'نوع العقار'),
      unitNumber: get('رقم_الوحدة', 'unit_number', 'UnitNumber', 'رقم الوحدة', 'رقم_الوحدة_الإيجار'),
      city: get('المدينة', 'city', 'City'),
      district: get('الحي', 'district', 'District', 'الحي/المنطقة'),
      address: get('العنوان', 'address', 'Address'),

      tenantName: get('اسم_المستأجر', 'tenant_name', 'TenantName', 'اسم المستأجر', 'المستأجر'),
      tenantId: get('رقم_هوية_المستأجر', 'tenant_id', 'TenantID', 'رقم الهوية', 'رقم_الهوية'),
      tenantPhone: get('جوال_المستأجر', 'tenant_phone', 'TenantPhone', 'هاتف المستأجر'),
      tenantEmail: get('بريد_المستأجر', 'tenant_email', 'TenantEmail'),

      ownerName: get('اسم_المالك', 'owner_name', 'OwnerName', 'اسم المالك', 'المالك'),
      ownerId: get('رقم_هوية_المالك', 'owner_id', 'OwnerID'),
      ownerPhone: get('جوال_المالك', 'owner_phone', 'OwnerPhone'),

      annualRent: get('الإيجار_السنوي', 'annual_rent', 'AnnualRent', 'الإيجار السنوي', 'قيمة_الإيجار'),
      monthlyRent: get('الإيجار_الشهري', 'monthly_rent', 'MonthlyRent', 'الإيجار الشهري'),
      deposit: get('مبلغ_التأمين', 'deposit', 'Deposit', 'التأمين'),
      vatAmount: get('قيمة_الضريبة', 'vat', 'VAT', 'ضريبة القيمة المضافة'),
      totalRent: get('الإيجار_الكلي', 'total_rent', 'TotalRent', 'الإجمالي'),
      paymentMethod: get('طريقة_الدفع', 'payment_method', 'PaymentMethod', 'طريقة الدفع'),
      paymentFrequency: get('دورية_الدفع', 'payment_frequency', 'PaymentFrequency', 'دورية الدفع'),

      rawFields: row,
    };
  });
}

function parseExcelFile(file: File): Promise<ContractData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        resolve(extractFromRows(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── PDF Contract View ─────────────────────────────────────────────────────────

function PdfField({ label, value, full = false }: { label: string; value?: string; full?: boolean }) {
  if (!value) return null;
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 break-words leading-snug">{value}</p>
    </div>
  );
}

function PdfSection({ num, title, icon: Icon, color, children, cols = 2 }: {
  num: string; title: string; icon: any; color: string; children: React.ReactNode; cols?: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black ${color}`}>
            {num}
          </div>
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${color} opacity-80`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm text-gray-900">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className={`grid gap-x-6 gap-y-4 p-5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PdfContractView({ contract }: { contract: EjarPdfContract }) {
  const [copied, setCopied] = useState(false);
  const status = deriveStatus(contract);
  const statusColor = status === 'ساري' ? 'bg-emerald-100 text-emerald-700' :
    status === 'منتهي' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700';

  const copyAll = () => {
    const lines: string[] = [];
    if (contract.contractNumber) lines.push(`رقم العقد: ${contract.contractNumber}`);
    if (contract.contractType) lines.push(`نوع العقد: ${contract.contractType}`);
    if (contract.startDate) lines.push(`تاريخ البداية: ${contract.startDate}`);
    if (contract.endDate) lines.push(`تاريخ النهاية: ${contract.endDate}`);
    if (contract.ownerName) lines.push(`المؤجر: ${contract.ownerName}`);
    if (contract.ownerId) lines.push(`هوية المؤجر: ${contract.ownerId}`);
    if (contract.ownerPhone) lines.push(`جوال المؤجر: ${contract.ownerPhone}`);
    if (contract.tenantName) lines.push(`المستأجر: ${contract.tenantName}`);
    if (contract.tenantId) lines.push(`هوية المستأجر: ${contract.tenantId}`);
    if (contract.tenantPhone) lines.push(`جوال المستأجر: ${contract.tenantPhone}`);
    if (contract.nationalAddress) lines.push(`العنوان الوطني: ${contract.nationalAddress}`);
    if (contract.propertyType) lines.push(`نوع العقار: ${contract.propertyType}`);
    if (contract.unitNumber) lines.push(`رقم الوحدة: ${contract.unitNumber}`);
    if (contract.unitType) lines.push(`نوع الوحدة: ${contract.unitType}`);
    if (contract.unitArea) lines.push(`المساحة: ${contract.unitArea}`);
    if (contract.annualRent) lines.push(`الإيجار السنوي: ${contract.annualRent} ر.س`);
    if (contract.totalContractValue) lines.push(`إجمالي قيمة العقد: ${contract.totalContractValue} ر.س`);
    if (contract.titleDeedNumber) lines.push(`رقم صك الملكية: ${contract.titleDeedNumber}`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    toast.success('تم نسخ بيانات العقد كاملة');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100" style={{ background: `${GOLD}08` }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
            <FileCheck className="w-6 h-6" style={{ color: GOLD }} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-base">
              عقد إيجار {contract.contractNumber ? `رقم ${contract.contractNumber}` : ''}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              المستأجر: {contract.tenantName || '—'} &nbsp;|&nbsp; المؤجر: {contract.ownerName || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>{status}</span>
          <button onClick={copyAll} title="نسخ البيانات"
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400">
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-gray-100 border-b border-gray-100">
        {[
          { label: 'الإيجار السنوي (ر.س)', val: contract.annualRent || '—', accent: true },
          { label: 'تاريخ البداية', val: contract.startDate || '—' },
          { label: 'تاريخ النهاية', val: contract.endDate || '—' },
          { label: 'رقم الوحدة', val: contract.unitNumber || contract.unitType || '—' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-sm font-black mt-0.5 ${s.accent ? 'text-amber-700' : 'text-gray-800'}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="p-5 space-y-3">

        <PdfSection num="1" title="بيانات العقد" icon={ClipboardList} color="bg-blue-600" cols={3}>
          <PdfField label="رقم سجل العقد" value={contract.contractNumber} />
          <PdfField label="نوع العقد" value={contract.contractType} />
          <PdfField label="مكان الإبرام" value={contract.contractLocation} />
          <PdfField label="تاريخ الإبرام" value={contract.contractDate} />
          <PdfField label="تاريخ البداية" value={contract.startDate} />
          <PdfField label="تاريخ النهاية" value={contract.endDate} />
        </PdfSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PdfSection num="2" title="بيانات المؤجر" icon={User} color="bg-amber-600" cols={1}>
            <PdfField label="الاسم" value={contract.ownerName} />
            <PdfField label="الجنسية" value={contract.ownerNationality} />
            <PdfField label="نوع الهوية" value={contract.ownerIdType} />
            <PdfField label="رقم الهوية" value={contract.ownerId} />
            <PdfField label="الجوال" value={contract.ownerPhone} />
            <PdfField label="البريد الإلكتروني" value={contract.ownerEmail} />
          </PdfSection>

          <PdfSection num="4" title="بيانات المستأجر" icon={Users} color="bg-purple-600" cols={1}>
            <PdfField label="الاسم" value={contract.tenantName} />
            <PdfField label="الجنسية" value={contract.tenantNationality} />
            <PdfField label="نوع الهوية" value={contract.tenantIdType} />
            <PdfField label="رقم الهوية" value={contract.tenantId} />
            <PdfField label="الجوال" value={contract.tenantPhone} />
            <PdfField label="البريد الإلكتروني" value={contract.tenantEmail} />
          </PdfSection>
        </div>

        {(contract.brokerCompany || contract.brokerName) && (
          <PdfSection num="6" title="بيانات منشأة الوساطة العقارية" icon={Briefcase} color="bg-slate-600" cols={3}>
            <PdfField label="اسم المنشأة" value={contract.brokerCompany} />
            <PdfField label="رقم السجل التجاري" value={contract.brokerCR} />
            <PdfField label="اسم الموظف / الوسيط" value={contract.brokerName} />
            <PdfField label="الجوال" value={contract.brokerPhone} />
            <PdfField label="البريد الإلكتروني" value={contract.brokerEmail} />
          </PdfSection>
        )}

        {(contract.titleDeedNumber || contract.titleDeedType) && (
          <PdfSection num="7" title="بيانات مستندات الملكية" icon={Shield} color="bg-emerald-700" cols={3}>
            <PdfField label="رقم الصك / الوثيقة" value={contract.titleDeedNumber} />
            <PdfField label="جهة الإصدار" value={contract.titleDeedIssuer} />
            <PdfField label="تاريخ الإصدار" value={contract.titleDeedDate} />
            <PdfField label="مكان الإصدار" value={contract.titleDeedLocation} />
            <PdfField label="نوع الصك" value={contract.titleDeedType} />
          </PdfSection>
        )}

        <PdfSection num="8" title="بيانات العقار" icon={Building2} color="bg-green-700" cols={2}>
          <PdfField label="العنوان الوطني" value={contract.nationalAddress} full />
          <PdfField label="نوع البناء" value={contract.propertyType} />
          <PdfField label="الغرض من الاستخدام" value={contract.propertyUsage} />
          <PdfField label="عدد الطوابق" value={contract.floorsCount} />
          <PdfField label="عدد الوحدات" value={contract.unitsCount} />
          <PdfField label="عدد المواقف" value={contract.parkingCount} />
          <PdfField label="عدد المصاعد" value={contract.elevatorsCount} />
          {contract.city && <PdfField label="المدينة" value={contract.city} />}
          {contract.district && <PdfField label="الحي" value={contract.district} />}
        </PdfSection>

        <PdfSection num="9" title="بيانات الوحدة الإيجارية" icon={Home} color="bg-teal-600" cols={3}>
          <PdfField label="نوع الوحدة" value={contract.unitType} />
          <PdfField label="رقم الوحدة" value={contract.unitNumber} />
          <PdfField label="رقم الطابق" value={contract.unitFloor} />
          <PdfField label="المساحة (م²)" value={contract.unitArea} />
          <PdfField label="مؤثثة" value={contract.unitFurnished} />
          {contract.unitRooms && Object.entries(contract.unitRooms).map(([type, count]) => (
            <PdfField key={type} label={`عدد ${type}`} value={count} />
          ))}
          <PdfField label="رقم عداد الكهرباء" value={contract.electricityMeter} />
          {contract.gasMeter && <PdfField label="رقم عداد الغاز" value={contract.gasMeter} />}
          {contract.waterMeter && <PdfField label="رقم عداد المياه" value={contract.waterMeter} />}
        </PdfSection>

        <PdfSection num="11" title="البيانات المالية" icon={DollarSign} color="bg-amber-700" cols={3}>
          <PdfField label="قيمة الإيجار السنوي" value={formatSar(contract.annualRent)} />
          <PdfField label="إجمالي قيمة العقد" value={formatSar(contract.totalContractValue)} />
          <PdfField label="مبلغ الضمان" value={formatSar(contract.securityDeposit)} />
          <PdfField label="الدفعة الدورية" value={formatSar(contract.regularPayment)} />
          <PdfField label="الدفعة الأخيرة" value={formatSar(contract.lastPayment)} />
          <PdfField label="عدد الدفعات" value={contract.paymentsCount} />
          <PdfField label="دورة سداد الإيجار" value={contract.paymentCycle} />
          {contract.electricityAmount && contract.electricityAmount !== '0' && <PdfField label="أجرة الكهرباء" value={formatSar(contract.electricityAmount)} />}
          {contract.waterAmount && contract.waterAmount !== '0' && <PdfField label="أجرة المياه" value={formatSar(contract.waterAmount)} />}
          {contract.gasAmount && contract.gasAmount !== '0' && <PdfField label="أجرة الغاز" value={formatSar(contract.gasAmount)} />}
          {contract.parkingAmount && contract.parkingAmount !== '0' && <PdfField label="أجرة المواقف" value={formatSar(contract.parkingAmount)} />}
        </PdfSection>

        {contract.paymentSchedule && contract.paymentSchedule.length > 0 && (
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black bg-indigo-600">12</div>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-600 opacity-80">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-sm text-gray-900">جدول سداد الدفعات</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900">
                    {['رقم', 'تاريخ الاستحقاق', 'نهاية مهلة السداد', 'القيمة (ر.س)'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-right font-bold text-amber-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.paymentSchedule.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-bold text-gray-600">{row.num}</td>
                      <td className="px-4 py-2 text-gray-700">{row.dueDateAD}</td>
                      <td className="px-4 py-2 text-gray-500">{row.endDeadlineAD}</td>
                      <td className="px-4 py-2 font-bold text-amber-700">{Number(row.amount.replace(/,/g, '')).toLocaleString('ar-SA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Field Badge ───────────────────────────────────────────────────────────────
function Field({ label, value, icon: Icon, color = 'text-gray-800' }: {
  label: string; value?: string; icon?: any; color?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className={`text-sm font-bold ${color} break-words`}>{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: {
  title: string; icon: any; color: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Contract Card ─────────────────────────────────────────────────────────────
function ContractCard({ c, index }: { c: ContractData; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const statusColor = (s?: string) => {
    if (!s) return 'bg-gray-100 text-gray-500';
    const lower = s.toLowerCase();
    if (lower.includes('ساري') || lower.includes('نشط') || lower.includes('active')) return 'bg-emerald-50 text-emerald-700';
    if (lower.includes('منته') || lower.includes('expired')) return 'bg-red-50 text-red-600';
    if (lower.includes('قريب') || lower.includes('warn')) return 'bg-amber-50 text-amber-700';
    return 'bg-blue-50 text-blue-700';
  };

  const copy = () => {
    const text = Object.entries(c.rawFields || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ بيانات العقد');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
            <FileText className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">
              {c.contractNumber ? `عقد #${c.contractNumber}` : `عقد رقم ${index + 1}`}
            </p>
            <p className="text-xs text-gray-400">{c.tenantName || 'مستأجر غير محدد'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {c.status && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(c.status)}`}>
              {c.status}
            </span>
          )}
          <button onClick={copy} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 border-b border-gray-100">
        {[
          { label: 'الإيجار السنوي', val: c.annualRent ? `${Number(c.annualRent).toLocaleString('ar')} ر.س` : '—' },
          { label: 'المدة', val: c.duration || (c.startDate && c.endDate ? `${c.startDate} ← ${c.endDate}` : '—') },
          { label: 'الوحدة', val: c.unitNumber || c.propertyName || '—' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-sm font-black text-gray-800 mt-0.5 truncate">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="p-4 space-y-3">
          <Section title="معلومات العقد" icon={ClipboardList} color="bg-blue-500">
            <Field label="رقم العقد" value={c.contractNumber} icon={Hash} />
            <Field label="تاريخ العقد" value={c.contractDate} icon={Calendar} />
            <Field label="تاريخ البداية" value={c.startDate} icon={Calendar} />
            <Field label="تاريخ النهاية" value={c.endDate} icon={Calendar} />
            <Field label="المدة" value={c.duration} icon={Clock} />
            <Field label="الحالة" value={c.status} />
          </Section>

          <Section title="معلومات العقار" icon={Building2} color="bg-emerald-500">
            <Field label="اسم العقار" value={c.propertyName} icon={Building2} />
            <Field label="نوع العقار" value={c.propertyType} />
            <Field label="رقم الوحدة" value={c.unitNumber} icon={Hash} />
            <Field label="المدينة" value={c.city} icon={MapPin} />
            <Field label="الحي" value={c.district} icon={MapPin} />
            <Field label="العنوان" value={c.address} icon={MapPin} color="text-blue-700" />
          </Section>

          <Section title="المستأجر" icon={User} color="bg-purple-500">
            <Field label="الاسم" value={c.tenantName} icon={User} />
            <Field label="رقم الهوية" value={c.tenantId} icon={Hash} />
            <Field label="الجوال" value={c.tenantPhone} icon={Phone} />
            <Field label="البريد الإلكتروني" value={c.tenantEmail} />
          </Section>

          <Section title="المالك" icon={User} color="bg-amber-500">
            <Field label="الاسم" value={c.ownerName} icon={User} />
            <Field label="رقم الهوية" value={c.ownerId} icon={Hash} />
            <Field label="الجوال" value={c.ownerPhone} icon={Phone} />
          </Section>

          <Section title="التفاصيل المالية" icon={DollarSign} color="bg-green-600">
            <Field label="الإيجار السنوي" value={c.annualRent ? `${Number(c.annualRent).toLocaleString('ar')} ر.س` : undefined} icon={DollarSign} color="text-emerald-700" />
            <Field label="الإيجار الشهري" value={c.monthlyRent ? `${Number(c.monthlyRent).toLocaleString('ar')} ر.س` : undefined} icon={DollarSign} />
            <Field label="مبلغ التأمين" value={c.deposit ? `${Number(c.deposit).toLocaleString('ar')} ر.س` : undefined} />
            <Field label="ضريبة القيمة المضافة" value={c.vatAmount ? `${Number(c.vatAmount).toLocaleString('ar')} ر.س` : undefined} />
            <Field label="الإجمالي" value={c.totalRent ? `${Number(c.totalRent).toLocaleString('ar')} ر.س` : undefined} color="text-emerald-700" />
            <Field label="طريقة الدفع" value={c.paymentMethod} />
            <Field label="دورية الدفع" value={c.paymentFrequency} />
          </Section>
        </div>
      )}
    </div>
  );
}

// ─── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <input
        ref={ref}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
          <Upload className="w-8 h-8" style={{ color: GOLD }} />
        </div>
        <div>
          <p className="font-black text-gray-800">ارفع ملف العقود من إيجار</p>
          <p className="text-sm text-gray-500 mt-1">اسحب الملف وأفلته هنا أو انقر للاختيار</p>
          <p className="text-xs text-gray-400 mt-2">الملفات المدعومة: PDF أو Excel (.xlsx, .xls) أو CSV</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {['عقد_إيجار.pdf', 'عقود_إيجار.xlsx', 'تصدير_إيجار.csv'].map(name => (
            <span key={name} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-500">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analysis Summary ──────────────────────────────────────────────────────────
function AnalysisSummary({ contracts }: { contracts: ContractData[] }) {
  const total = contracts.length;
  const active = contracts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s.includes('ساري') || s.includes('نشط') || s.includes('active') || s === '';
  }).length;
  const expired = contracts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s.includes('منته') || s.includes('expired');
  }).length;

  const totalRent = contracts.reduce((sum, c) => {
    const v = parseFloat(c.annualRent?.replace(/,/g, '') || '0');
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const uniqueTenants = new Set(contracts.map(c => c.tenantId || c.tenantName).filter(Boolean)).size;
  const uniqueProperties = new Set(contracts.map(c => c.unitNumber || c.propertyName).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {[
        { label: 'إجمالي العقود', val: total, color: GOLD, bg: `${GOLD}15` },
        { label: 'عقود سارية', val: active, color: '#059669', bg: '#ECFDF5' },
        { label: 'عقود منتهية', val: expired, color: '#DC2626', bg: '#FEF2F2' },
        { label: 'مستأجرون', val: uniqueTenants, color: '#7C3AED', bg: '#EDE9FE' },
        { label: 'الإيجار السنوي', val: totalRent > 0 ? `${Math.round(totalRent / 1000).toLocaleString('ar-SA')} ألف ر.س` : '—', color: '#0891B2', bg: '#E0F7FA' },
      ].map(s => (
        <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
          <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Save to localStorage ──────────────────────────────────────────────────────
function saveContracts(contracts: ContractData[]) {
  try {
    const existing: Record<string, any>[] = JSON.parse(localStorage.getItem('real_contracts') || '[]');
    const existingNums = new Set(existing.map((c: any) => c.contractNumber || c['رقم_عقد_الإيجار'] || c['رقم_العقد']));
    const newContracts = contracts
      .filter(c => c.contractNumber && !existingNums.has(c.contractNumber))
      .map(c => ({ ...c.rawFields, ...c }));
    const merged = [...existing, ...newContracts];
    localStorage.setItem('real_contracts', JSON.stringify(merged));
    return { added: newContracts.length, duplicates: contracts.length - newContracts.length };
  } catch {
    return { added: 0, duplicates: 0 };
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function EjarContractAnalyzer() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [pdfContract, setPdfContract] = useState<EjarPdfContract | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saveResult, setSaveResult] = useState<{ added: number; duplicates: number } | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    setSaveResult(null);
    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

      if (isPdf) {
        const text = await extractPdfText(file);
        const parsed = parseEjarPdfText(text);
        parsed.status = deriveStatus(parsed);
        setPdfContract(parsed);

        // تحويل العقد إلى الصيغة العامة للحفظ/التكامل مع النظام
        const normalized: ContractData = {
          contractNumber: parsed.contractNumber,
          contractDate: parsed.contractDate,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          status: parsed.status,
          propertyName: parsed.nationalAddress,
          propertyType: parsed.propertyType,
          unitNumber: parsed.unitNumber,
          city: parsed.city,
          district: parsed.district,
          tenantName: parsed.tenantName,
          tenantId: parsed.tenantId,
          tenantPhone: parsed.tenantPhone,
          tenantEmail: parsed.tenantEmail,
          ownerName: parsed.ownerName,
          ownerId: parsed.ownerId,
          ownerPhone: parsed.ownerPhone,
          annualRent: parsed.annualRent,
          totalRent: parsed.totalContractValue,
          paymentFrequency: parsed.paymentCycle,
          rawFields: {
            رقم_عقد_الإيجار: parsed.contractNumber || '',
            اسم_المؤجر: parsed.ownerName || '',
            اسم_المستأجر: parsed.tenantName || '',
            نوع_العقار: parsed.propertyType || '',
            رقم_الوحدة: parsed.unitNumber || '',
            قيمة_الإيجار: parsed.annualRent || '',
            تاريخ_بداية_العقد: parsed.startDate || '',
            تاريخ_نهاية_العقد: parsed.endDate || '',
            الحالة: parsed.status || '',
          },
        };

        setContracts([normalized]);
        toast.success('تم تحليل عقد PDF بنجاح');
      } else {
        const data = await parseExcelFile(file);
        setPdfContract(null);
        setContracts(data);
        toast.success(`تم تحليل ${data.length} عقد من الملف`);
      }
    } catch (err) {
      toast.error('تعذر قراءة الملف. تأكد أن الصيغة PDF أو Excel أو CSV');
      setPdfContract(null);
      setContracts([]);
    }
    setLoading(false);
  };

  const handleSave = () => {
    if (!contracts.length) return;
    const result = saveContracts(contracts);
    setSaveResult(result);
    if (result.added > 0) {
      toast.success(`تم حفظ ${result.added} عقد جديد`);
    } else {
      toast.info('جميع العقود موجودة مسبقاً — لا توجد إضافات');
    }
  };

  const handleClear = () => {
    setContracts([]);
    setPdfContract(null);
    setFileName('');
    setSaveResult(null);
    setSearch('');
    setFilterStatus('all');
  };

  // Filtering
  const filtered = contracts.filter(c => {
    const matchSearch = !search || [
      c.contractNumber, c.tenantName, c.propertyName, c.unitNumber, c.city, c.tenantId
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && (c.status?.toLowerCase().includes('ساري') || c.status?.toLowerCase().includes('نشط') || !c.status)) ||
      (filterStatus === 'expired' && c.status?.toLowerCase().includes('منته'));

    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'active', 'expired'];
  const statusLabels: Record<string, string> = { all: 'الكل', active: 'سارية', expired: 'منتهية' };

  return (
    <DashboardLayout pageTitle="تحليل عقود إيجار">
      <div className="p-5 space-y-5 max-w-5xl mx-auto" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileSearch className="w-6 h-6" style={{ color: GOLD }} />
              استرداد وتحليل عقود إيجار
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              ارفع ملف عقد بصيغة PDF أو ملف جداول بصيغة Excel لتحليل البيانات تلقائيا
            </p>
          </div>
          {contracts.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition"
                style={{ background: GREEN }}>
                <Download className="w-4 h-4" />
                حفظ في النظام
              </button>
              <button onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 transition">
                <X className="w-4 h-4" />
                مسح
              </button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-black mb-1">كيف تستخرج ملف العقود من إيجار؟</p>
            <ol className="list-decimal list-inside space-y-0.5 text-xs text-amber-700">
              <li>سجّل دخولك إلى <strong>منصة إيجار</strong></li>
              <li>اذهب إلى قسم <strong>العقود</strong></li>
              <li>انقر على زر <strong>تصدير</strong> ثم اختر <strong>Excel</strong> أو نسخة <strong>PDF</strong></li>
              <li>ارفع الملف هنا — سيتم التحليل تلقائياً</li>
            </ol>
          </div>
        </div>

        {/* Upload Zone */}
        {!contracts.length && !loading && (
          <DropZone onFile={handleFile} />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: GOLD }} />
            </div>
            <p className="font-bold text-gray-600">جاري تحليل الملف...</p>
            <p className="text-sm text-gray-400">{fileName}</p>
          </div>
        )}

        {/* Results */}
        {contracts.length > 0 && (
          <>
            {/* File info bar */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-400">{contracts.length} عقد تم استخراجه</p>
                </div>
              </div>
              <button onClick={() => document.querySelector('input[type=file]')?.click()}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition">
                <RefreshCw className="w-3.5 h-3.5" /> تغيير الملف
              </button>
            </div>

            {/* Save result banner */}
            {saveResult && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-emerald-700">{saveResult.added.toLocaleString('ar')}</p>
                    <p className="text-[11px] text-emerald-600">عقد جديد تم حفظه</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-amber-700">{saveResult.duplicates.toLocaleString('ar')}</p>
                    <p className="text-[11px] text-amber-600">عقد مكرر تم تجاهله</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <AnalysisSummary contracts={contracts} />

            {/* عرض PDF التفصيلي */}
            {pdfContract && <PdfContractView contract={pdfContract} />}

            {/* Search & Filter */}
            {!pdfContract && <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-48 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث باسم المستأجر أو رقم العقد أو العقار..."
                  className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
                />
              </div>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                {statuses.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2.5 text-xs font-bold transition ${
                      filterStatus === s ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={filterStatus === s ? { background: DARK } : {}}>
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>}

            {/* Contract list */}
            {!pdfContract && <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">لا توجد نتائج</p>
                </div>
              ) : (
                filtered.map((c, i) => <ContractCard key={i} c={c} index={i} />)
              )}
              {filtered.length < contracts.length && (
                <p className="text-center text-xs text-gray-400">
                  عرض {filtered.length} من {contracts.length} عقد
                </p>
              )}
            </div>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
