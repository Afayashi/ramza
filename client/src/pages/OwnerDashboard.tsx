/*
 * لوحة تحكم المالك الشخصية
 */
import { useMemo } from 'react';
import { Building2, FileText, Users, TrendingUp, LogOut, Phone, CreditCard, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth';
import { DEMO_OWNERS, DEMO_PROPERTIES, DEMO_UNITS, DEMO_CONTRACTS, DEMO_DOCS } from '@/lib/demoData';

const GOLD = '#C8A951';
const DARK = '#1a1209';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: any }> = {
    'نشط': { bg: '#05966920', text: '#059669', icon: CheckCircle },
    'منتهي': { bg: '#DC262620', text: '#DC2626', icon: AlertCircle },
    'قريب_الانتهاء': { bg: '#D9770620', text: '#D97706', icon: Clock },
  };
  const s = map[status] || { bg: '#6b728020', text: '#6b7280', icon: Clock };
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: s.bg, color: s.text }}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function OwnerDashboard({ onLogout }: { onLogout: () => void }) {
  const session = getSession();
  const ownerId = session?.ownerId;

  const owner = useMemo(() => DEMO_OWNERS.find(o => o.id === ownerId), [ownerId]);

  const { properties, units, contracts, docs, totalAnnual, activeContracts } = useMemo(() => {
    if (!owner) return { properties: [], units: [], contracts: [], docs: [], totalAnnual: 0, activeContracts: 0 };
    const ownerName = owner['الاسم_الكامل'] || '';
    const props = DEMO_PROPERTIES.filter(p => (p['اسم_المالك'] || '') === ownerName);
    const propNames = new Set(props.map(p => p['اسم_العقار'] || p['الاسم'] || ''));
    const unitsList = DEMO_UNITS.filter(u => propNames.has(u['اسم_العقار'] || ''));
    const contractsList = DEMO_CONTRACTS.filter(c => (c['اسم_المالك'] || '') === ownerName);
    const docsList = DEMO_DOCS.filter(d => (d['اسم_المالك'] || '') === ownerName);
    const active = contractsList.filter(c => c['حالة_العقد'] === 'نشط');
    const total = contractsList.reduce((s, c) => s + Number(c['القيمة_السنوية'] || 0), 0);
    return { properties: props, units: unitsList, contracts: contractsList, docs: docsList, totalAnnual: total, activeContracts: active.length };
  }, [owner]);

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  if (!owner) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <p className="text-gray-500">لم يتم العثور على بيانات المالك</p>
      </div>
    );
  }

  const stats = [
    { label: 'العقارات', value: properties.length, icon: Building2, color: GOLD },
    { label: 'الوحدات', value: units.length, icon: Users, color: '#3B82F6' },
    { label: 'العقود النشطة', value: activeContracts, icon: FileText, color: '#059669' },
    { label: 'الإيراد السنوي', value: totalAnnual.toLocaleString('ar-SA') + ' ر.س', icon: TrendingUp, color: '#7C3AED' },
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: '#f5f5f5' }}>
      {/* شريط علوي */}
      <div className="shadow-sm sticky top-0 z-10" style={{ background: DARK }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
              style={{ background: GOLD, color: DARK }}>
              {(owner['الاسم_الكامل'] || '').charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black" style={{ color: GOLD }}>{owner['الاسم_الكامل']}</p>
              <p className="text-[10px]" style={{ color: `${GOLD}60` }}>بوابة المالك</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src="/ramza/brand/ramz-logo.svg" alt="رمز الإبداع" className="w-8 h-8"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              style={{ background: '#ffffff15', color: `${GOLD}90` }}>
              <LogOut className="w-3.5 h-3.5" />
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* بطاقة المالك */}
        <div className="rounded-2xl p-5" style={{ background: DARK, border: `1px solid ${GOLD}20` }}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
              style={{ background: `${GOLD}20`, color: GOLD }}>
              {(owner['الاسم_الكامل'] || '').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black text-white">{owner['الاسم_الكامل']}</h1>
              <p className="text-xs mt-0.5" style={{ color: `${GOLD}70` }}>{owner['الجنسية']} · {owner['نوع_الهوية']}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: `${GOLD}80` }}>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                {owner['رقم_الهوية']}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {owner['رقم_الجوال']}
              </span>
            </div>
          </div>
        </div>

        {/* الإحصاءات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-base font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* العقارات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <Building2 className="w-4 h-4" style={{ color: GOLD }} />
              <h2 className="font-black text-sm text-gray-800">عقاراتي</h2>
              <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${GOLD}15`, color: GOLD }}>{properties.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {properties.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">لا توجد عقارات مرتبطة</p>
              ) : properties.map((p, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p['اسم_العقار'] || p['الاسم']}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p['نوع_العقار']} · {p['المدينة']}</p>
                  </div>
                  <div className="text-left text-xs text-gray-500">
                    <p>{p['عدد_الوحدات']} وحدة</p>
                    <p className="text-green-600">{p['وحدات_مؤجرة']} مؤجرة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* العقود */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <FileText className="w-4 h-4 text-green-600" />
              <h2 className="font-black text-sm text-gray-800">عقودي</h2>
              <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-bold bg-green-50 text-green-700">{contracts.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {contracts.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">لا توجد عقود</p>
              ) : contracts.map((c, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[55%]">{c['اسم_المستأجر']}</p>
                    <StatusBadge status={c['حالة_العقد']} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span>{c['اسم_العقار']} - وحدة {c['رقم_الوحدة']}</span>
                    <span className="text-green-600 font-bold">{Number(c['القيمة_السنوية']).toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {c['تاريخ_البداية']} — {c['تاريخ_النهاية']}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الوحدات */}
        {units.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="font-black text-sm text-gray-800">وحداتي</h2>
              <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">{units.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {['الوحدة', 'العقار', 'النوع', 'المساحة', 'الإيجار السنوي', 'الحالة', 'المستأجر'].map(h => (
                      <th key={h} className="px-3 py-2 text-right text-[10px] text-gray-500 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {units.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2 font-bold text-gray-800">{u['اسم_الوحدة']}</td>
                      <td className="px-3 py-2 text-gray-600">{u['اسم_العقار']}</td>
                      <td className="px-3 py-2 text-gray-600">{u['نوع_الوحدة']}</td>
                      <td className="px-3 py-2 text-gray-600">{u['المساحة']} م²</td>
                      <td className="px-3 py-2 text-gray-600">{Number(u['الإيجار_السنوي'] || 0).toLocaleString('ar-SA')} ر.س</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u['حالة_الوحدة'] === 'مؤجرة' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u['حالة_الوحدة']}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{u['المستأجر_الحالي'] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* وثائق الملكية */}
        {docs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <FileText className="w-4 h-4" style={{ color: GOLD }} />
              <h2 className="font-black text-sm text-gray-800">وثائق الملكية</h2>
              <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${GOLD}15`, color: GOLD }}>{docs.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {docs.map((d, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800">{d['نوع_الوثيقة']}</p>
                    <p className="text-[10px] text-gray-400">{d['جهة_الإصدار']} · {d['تاريخ_الإصدار']}</p>
                  </div>
                  <div className="text-left text-[10px] text-gray-500">
                    <p>رقم: {d['رقم_الوثيقة']}</p>
                    {d['التوثيق'] && <p className="text-green-600">{d['التوثيق']}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-gray-400 pb-4">
          © {new Date().getFullYear()} رمز الإبداع لإدارة الأملاك
        </p>
      </div>
    </div>
  );
}
