/*
 * التخطيط الرئيسي - رمز الإبداع
 * شريط جانبي على اليمين + محتوى رئيسي + شريط علوي
 * متجاوب مع الجوال والتابلت
 */
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Right side */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
