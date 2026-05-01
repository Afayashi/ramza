-- ══════════════════════════════════════════════════════════════════
-- رمز الإبداع لإدارة الأملاك - Supabase Database Schema
-- نسخ هذا الملف كاملاً وتشغيله في:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ══════════════════════════════════════════════════════════════════

-- ─── تفعيل UUID ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════════════════════════════
-- 1. جدول الملاك (owners)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS owners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  "اسم_المالك"        TEXT NOT NULL,
  "رقم_الهوية"        TEXT,
  "الجنسية"          TEXT DEFAULT 'سعودي',
  "نوع_المالك"        TEXT DEFAULT 'فرد',
  "نسبة_الملكية"      NUMERIC DEFAULT 100,
  "رقم_الجوال"        TEXT,
  "رقم_الهاتف"        TEXT,
  "البريد_الإلكتروني" TEXT,
  "العنوان"          TEXT,
  "ملاحظات"          TEXT
);

-- ════════════════════════════════════════════════════════════════
-- 2. جدول العقارات (properties)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "اسم_العقار"          TEXT NOT NULL,
  "نوع_العقار"          TEXT DEFAULT 'سكني',
  "حالة_العقار"         TEXT DEFAULT 'نشط',
  "المدينة"            TEXT,
  "المنطقة"            TEXT,
  "الحي"              TEXT,
  "الشارع"             TEXT,
  "العنوان"            TEXT,
  "العنوان_الوطني"     TEXT,
  "الرمز_البريدي"       TEXT,
  "الإحداثيات"         TEXT,
  "رابط_الخريطة"       TEXT,

  "المساحة"            NUMERIC,
  "المساحة_التأجيرية"   NUMERIC,
  "سنة_البناء"          INTEGER,
  "عدد_الطوابق"        INTEGER,
  "عدد_الوحدات"        INTEGER,
  "عدد_المصاعد"        INTEGER,
  "عدد_المواقف"        INTEGER,
  "مستوى_التشطيب"      TEXT,
  "حالة_المرافق"        TEXT,

  "رقم_الصك"           TEXT,
  "رقم_وثيقة_الملكية"  TEXT,
  "نوع_الوثيقة"        TEXT,
  "جهة_الإصدار"        TEXT,
  "تاريخ_إصدار_الوثيقة" DATE,
  "تاريخ_انتهاء_الوثيقة" DATE,

  "الوصف"             TEXT,
  "المميزات"          TEXT,
  "تاريخ_بدء_الإدارة"  DATE,
  "رقم_العداد"         TEXT,

  "معرف_المالك"        UUID REFERENCES owners(id) ON DELETE SET NULL,

  -- جمعية الملاك
  "اسم_جمعية_الملاك"   TEXT,
  "حالة_جمعية_الملاك"  TEXT,
  "رئيس_الجمعية"       TEXT,
  "جوال_رئيس_الجمعية"  TEXT,
  "مدير_العقار"        TEXT,
  "جوال_مدير_العقار"   TEXT,
  "مبلغ_اشتراك_الجمعية" NUMERIC,

  "عقار_مميز"          BOOLEAN DEFAULT FALSE
);

-- ════════════════════════════════════════════════════════════════
-- 3. جدول الوحدات (units)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS units (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "اسم_الوحدة"         TEXT NOT NULL,
  "رقم_الوحدة"         TEXT,
  "نوع_الوحدة"         TEXT DEFAULT 'شقة',
  "حالة_الوحدة"        TEXT DEFAULT 'شاغرة',
  "الطابق"            INTEGER,
  "المساحة"            NUMERIC,
  "عدد_الغرف"         INTEGER,
  "عدد_الحمامات"       INTEGER,
  "الإيجار_المطلوب"    NUMERIC,
  "الوصف"             TEXT,

  "معرف_العقار"        UUID REFERENCES properties(id) ON DELETE CASCADE
);

-- ════════════════════════════════════════════════════════════════
-- 4. جدول المستأجرين (tenants)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tenants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "اسم_المستأجر"        TEXT NOT NULL,
  "رقم_الهوية"          TEXT,
  "الجنسية"            TEXT,
  "رقم_الجوال"          TEXT,
  "البريد_الإلكتروني"   TEXT,
  "العنوان"            TEXT,
  "مهنة_المستأجر"       TEXT,
  "جهة_العمل"          TEXT,
  "تقييم_المستأجر"      NUMERIC DEFAULT 5,
  "ملاحظات"            TEXT,
  "نشط"               BOOLEAN DEFAULT TRUE
);

-- ════════════════════════════════════════════════════════════════
-- 5. جدول العقود (leases)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS leases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "رقم_العقد"           TEXT,
  "حالة_العقد"          TEXT DEFAULT 'نشط',
  "تاريخ_بداية_العقد"   DATE,
  "تاريخ_نهاية_العقد"   DATE,
  "قيمة_الإيجار"        NUMERIC,
  "دورية_السداد"        TEXT DEFAULT 'سنوي',
  "عدد_الشيكات"         INTEGER,
  "مبلغ_التأمين"        NUMERIC DEFAULT 0,
  "رسوم_التوثيق"        NUMERIC DEFAULT 0,
  "رسوم_السعي"          NUMERIC DEFAULT 0,
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL,
  "معرف_الوحدة"         UUID REFERENCES units(id) ON DELETE SET NULL,
  "معرف_المستأجر"       UUID REFERENCES tenants(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 6. جدول الدفعات (payments)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "رقم_الدفعة"          TEXT,
  "مبلغ_الدفعة"         NUMERIC NOT NULL,
  "تاريخ_الدفع"         DATE,
  "تاريخ_الاستحقاق"     DATE,
  "حالة_الدفع"          TEXT DEFAULT 'معلق',
  "طريقة_الدفع"         TEXT DEFAULT 'تحويل بنكي',
  "رقم_المرجع"          TEXT,
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL,
  "معرف_الوحدة"         UUID REFERENCES units(id) ON DELETE SET NULL,
  "معرف_المستأجر"       UUID REFERENCES tenants(id) ON DELETE SET NULL,
  "معرف_العقد"          UUID REFERENCES leases(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 7. جدول طلبات الصيانة (maintenance_requests)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "تاريخ_الطلب"         DATE DEFAULT CURRENT_DATE,
  "نوع_الصيانة"         TEXT,
  "وصف_الطلب"          TEXT,
  "الأولوية"           TEXT DEFAULT 'عادي',
  "الحالة"             TEXT DEFAULT 'جديد',
  "الفني"              TEXT,
  "التكلفة"            NUMERIC DEFAULT 0,
  "مدة_التنفيذ"         TEXT,
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL,
  "معرف_الوحدة"         UUID REFERENCES units(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 8. جدول المصروفات (expenses)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "نوع_المصروف"         TEXT NOT NULL,
  "المبلغ"             NUMERIC NOT NULL,
  "التاريخ"            DATE DEFAULT CURRENT_DATE,
  "الوصف"             TEXT,
  "المورد"             TEXT,
  "حالة_الدفع"          TEXT DEFAULT 'مدفوع',
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 9. جدول الشكاوى (complaints)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS complaints (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "موضوع_الشكوى"        TEXT NOT NULL,
  "تفاصيل_الشكوى"       TEXT,
  "الأولوية"           TEXT DEFAULT 'عادي',
  "الحالة"             TEXT DEFAULT 'جديدة',
  "تاريخ_الشكوى"        DATE DEFAULT CURRENT_DATE,
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL,
  "معرف_المستأجر"       UUID REFERENCES tenants(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 10. جدول الفواتير (invoices)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "رقم_الفاتورة"        TEXT,
  "المبلغ"             NUMERIC NOT NULL,
  "تاريخ_الإصدار"       DATE DEFAULT CURRENT_DATE,
  "تاريخ_الاستحقاق"     DATE,
  "الحالة"             TEXT DEFAULT 'معلقة',
  "الوصف"             TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL,
  "معرف_المستأجر"       UUID REFERENCES tenants(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 11. جدول المستندات (documents)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "اسم_المستند"         TEXT NOT NULL,
  "نوع_المستند"         TEXT,
  "الحالة"             TEXT DEFAULT 'نشط',
  "تاريخ_الإصدار"       DATE,
  "تاريخ_الانتهاء"      DATE,
  "رابط_الملف"          TEXT,
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 12. جدول الإشعارات (notifications)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  "العنوان"            TEXT NOT NULL,
  "الرسالة"           TEXT,
  "النوع"             TEXT DEFAULT 'معلومات',
  "مقروءة"            BOOLEAN DEFAULT FALSE,
  "التاريخ"           TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- 13. جدول عقود الوساطة (brokerage_contracts)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS brokerage_contracts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "رقم_العقد"           TEXT,
  "اسم_الوسيط"          TEXT,
  "رسوم_الوساطة"        NUMERIC,
  "تاريخ_البداية"       DATE,
  "تاريخ_النهاية"       DATE,
  "الحالة"             TEXT DEFAULT 'نشط',
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- 14. جدول تراخيص الإعلانات (ad_licenses)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ad_licenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  "رقم_الترخيص"         TEXT,
  "نوع_الإعلان"         TEXT,
  "تاريخ_الإصدار"       DATE,
  "تاريخ_الانتهاء"      DATE,
  "الحالة"             TEXT DEFAULT 'نشط',
  "الرسوم"             NUMERIC,
  "ملاحظات"            TEXT,

  "معرف_العقار"         UUID REFERENCES properties(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════
-- دالة تحديث updated_at تلقائياً
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الـ trigger على جميع الجداول
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'owners','properties','units','tenants','leases','payments',
    'maintenance_requests','expenses','complaints','invoices',
    'documents','brokerage_contracts','ad_licenses'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t
    );
  END LOOP;
END;
$$;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) - السماح بالقراءة والكتابة العامة
-- (يمكنك تشديدها لاحقاً حسب متطلبات المصادقة)
-- ════════════════════════════════════════════════════════════════
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'owners','properties','units','tenants','leases','payments',
    'maintenance_requests','expenses','complaints','invoices',
    'documents','notifications','brokerage_contracts','ad_licenses'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'DROP POLICY IF EXISTS "public_all" ON %I;
       CREATE POLICY "public_all" ON %I FOR ALL USING (true) WITH CHECK (true);',
      t, t
    );
  END LOOP;
END;
$$;
