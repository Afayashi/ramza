-- رمز الإبداع — D1 Database Schema

CREATE TABLE IF NOT EXISTS owners (
  id TEXT PRIMARY KEY,
  "الاسم_الكامل" TEXT,
  "رقم_الهوية" TEXT UNIQUE,
  "نوع_الهوية" TEXT,
  "الجنسية" TEXT,
  "رقم_الجوال" TEXT,
  "عدد_العقارات" TEXT,
  "عدد_الوحدات" TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  "اسم_العقار" TEXT,
  "اسم_المالك" TEXT,
  "نوع_العقار" TEXT,
  "المدينة" TEXT,
  "عدد_الوحدات" TEXT,
  "وحدات_مؤجرة" TEXT,
  "وحدات_شاغرة" TEXT,
  owner_id TEXT REFERENCES owners(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  "اسم_الوحدة" TEXT,
  "رقم_الوحدة" TEXT,
  "نوع_الوحدة" TEXT,
  "المساحة" TEXT,
  "الإيجار_الشهري" REAL,
  "الإيجار_السنوي" REAL,
  "حالة_الوحدة" TEXT,
  "اسم_العقار" TEXT,
  "المستأجر_الحالي" TEXT,
  owner_id TEXT REFERENCES owners(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  "اسم_المستأجر" TEXT,
  "رقم_الهوية" TEXT UNIQUE,
  "الجنسية" TEXT,
  "الجوال" TEXT,
  "عدد_العقود" TEXT,
  "عقود_نشطة" TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  "رقم_العقد" TEXT,
  "اسم_المستأجر" TEXT,
  "اسم_المالك" TEXT,
  "اسم_العقار" TEXT,
  "رقم_الوحدة" TEXT,
  "نوع_العقد" TEXT,
  "تاريخ_البداية" TEXT,
  "تاريخ_النهاية" TEXT,
  "القيمة_السنوية" REAL,
  "حالة_العقد" TEXT,
  owner_id TEXT REFERENCES owners(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ownership_docs (
  id TEXT PRIMARY KEY,
  "اسم_المالك" TEXT,
  "اسم_العقار" TEXT,
  "نوع_الوثيقة" TEXT,
  "رقم_الوثيقة" TEXT,
  "تاريخ_الإصدار" TEXT,
  "جهة_الإصدار" TEXT,
  "التوثيق" TEXT,
  owner_id TEXT REFERENCES owners(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'owner',
  name TEXT,
  owner_id TEXT REFERENCES owners(id),
  created_at TEXT DEFAULT (datetime('now'))
);
