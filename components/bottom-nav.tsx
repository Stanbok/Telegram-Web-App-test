'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/lib/telegram-provider';

const ADMIN_ID = 8005837232;

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useTelegram();
  
  // علامات التبويب الأساسية
  const baseNavItems = [
    { href: '/profile', label: 'الملف الشخصي', icon: '👤' },
    { href: '/tasks', label: 'المهام', icon: '🎯' },
    { href: '/', label: 'الرئيسية', icon: '🏠' },
    { href: '/rank', label: 'الترتيب', icon: '🏆' },
    { href: '/shop', label: 'المتجر', icon: '🛒' },
  ];

  // Add admin tab for admin user
  const navItems = user?.id === ADMIN_ID
    ? [
        ...baseNavItems.slice(0, 2),
        { href: '/admin', label: 'الأدمن', icon: '⚙️' },
        ...baseNavItems.slice(2)
      ]
    : baseNavItems;

  const itemWidth = user?.id === ADMIN_ID ? 'w-1/6' : 'w-1/5';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-2 text-center transition-colors',
                itemWidth,
                isActive
                  ? 'text-primary border-t-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
