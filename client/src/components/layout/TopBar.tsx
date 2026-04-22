/*
 * الشريط العلوي - رمز الإبداع
 * يحتوي على زر القائمة، البحث، الإشعارات، والمستخدم
 */
import { Menu, Search, Bell, User, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function TopBar({ onMenuToggle, pageTitle }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

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
        <button className="relative p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 left-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>
      </div>
    </header>
  );
}
