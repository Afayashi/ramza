/*
 * الشريط العلوي - رمز الإبداع
 * يحتوي على زر القائمة، البحث، الإشعارات، والمستخدم
 * مع دعم تسجيل الدخول/الخروج عبر Base44
 */
import { Menu, Search, Bell, User, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function TopBar({ onMenuToggle, pageTitle }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoadingAuth, logout, navigateToLogin } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
      {/* Menu Toggle (mobile) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      {pageTitle && (
        <h2 className="font-heading text-base font-semibold text-foreground hidden sm:block">
          {pageTitle}
        </h2>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className={cn(
          'relative flex items-center transition-all duration-300',
          searchOpen ? 'w-full' : 'w-auto'
        )}>
          {searchOpen ? (
            <div className="w-full relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث في النظام..."
                className="w-full h-9 pr-9 pl-4 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground"
            >
              <Search size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 left-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User / Auth */}
        {isLoadingAuth ? (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <span className="text-xs text-foreground hidden sm:block max-w-[120px] truncate">
                {user.name || user.email || 'المستخدم'}
              </span>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium text-foreground truncate">
                      {user.name || 'المستخدم'}
                    </p>
                    {user.email && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-accent transition-colors"
                  >
                    <LogOut size={14} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={navigateToLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">تسجيل الدخول</span>
          </button>
        )}
      </div>
    </header>
  );
}
