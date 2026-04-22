/*
 * شريط التنقل السفلي للجوال - رمز الإبداع
 * يظهر فقط على الشاشات الصغيرة
 */
import { Link, useLocation } from 'wouter';
import { Home, Building2, Users, DollarSign, Wrench, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_TABS = [
  { label: 'الرئيسية', path: '/', icon: Home },
  { label: 'العقارات', path: '/properties', icon: Building2 },
  { label: 'المستأجرون', path: '/tenants', icon: Users },
  { label: 'المالية', path: '/payments', icon: DollarSign },
  { label: 'الصيانة', path: '/maintenance', icon: Wrench },
];

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[56px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <div className="w-4 h-0.5 bg-primary rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
