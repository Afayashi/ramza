/*
 * القائمة الجانبية - رمز الإبداع
 * تصميم داكن مع لمسات ذهبية، على الجانب الأيمن
 * متجاوبة مع الجوال
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, X, Phone, LogOut, LogIn, Wifi, WifiOff } from 'lucide-react';
import { NAV_GROUPS } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const LOGO_URL = '/brand/ramz-logo.svg';
const GOLD = '#C8A951';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['الرئيسية']);
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();

  // تحقق من وجود بيانات حقيقية مستوردة من إيجار
  const [hasRealData, setHasRealData] = useState(false);
  useEffect(() => {
    const keys = ['real_properties', 'real_units', 'real_contracts', 'real_users', 'real_financial'];
    const found = keys.some(k => { try { const v = localStorage.getItem(k); return !!v && JSON.parse(v).length > 0; } catch { return false; } });
    setHasRealData(found);
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  // Auto-expand group containing active item
  const activeGroup = NAV_GROUPS.find(g => g.items.some(i => isActive(i.path)));
  if (activeGroup && !expandedGroups.includes(activeGroup.label)) {
    setExpandedGroups(prev => [...prev, activeGroup.label]);
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full z-50 w-[280px] flex flex-col',
          'bg-sidebar border-l border-sidebar-border',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="رمز الإبداع"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="font-heading text-sm font-bold text-sidebar-foreground">
                  رمز الإبداع
                </h1>
                <p className="text-[10px] text-muted-foreground">إدارة الأملاك</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.includes(group.label);
            const hasActiveItem = group.items.some(i => isActive(i.path));

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium',
                    'transition-colors duration-200',
                    hasActiveItem
                      ? 'text-primary bg-sidebar-accent'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon size={17} style={hasActiveItem ? { color: GOLD } : {}} />
                  <span className="flex-1 text-right">{group.label}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'transition-transform duration-200',
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-0.5 mr-4 border-r border-sidebar-border pr-2 space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={onClose}
                        className={cn(
                          'block px-3 py-1.5 rounded-md text-xs transition-all duration-200',
                          isActive(item.path)
                            ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary -mr-[10px] pr-[18px]'
                            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-sidebar-accent/50">
            {isAuthenticated ? (
              <>
                <Wifi size={12} className="text-green-400" />
                <span className="text-[10px] text-green-400">متصل بقاعدة البيانات</span>
              </>
            ) : hasRealData ? (
              <>
                <Wifi size={12} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400">بيانات إيجار الحقيقية</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-amber-400" />
                <span className="text-[10px] text-amber-400">بيانات تجريبية</span>
              </>
            )}
          </div>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />
              <span>تسجيل الخروج</span>
              {user?.name && <span className="mr-auto text-[10px] text-muted-foreground truncate max-w-[100px]">{user.name}</span>}
            </button>
          ) : (
            <button
              onClick={navigateToLogin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <LogIn size={14} />
              <span>تسجيل الدخول لعرض البيانات الحقيقية</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone size={12} />
            <span>920013517</span>
          </div>
          <div className="text-[10px] text-muted-foreground/60 text-center">
            شركة رمز الإبداع لإدارة الأملاك
          </div>
        </div>
      </aside>
    </>
  );
}
