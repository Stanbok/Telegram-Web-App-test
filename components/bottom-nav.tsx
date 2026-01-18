'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/profile', label: 'الملف الشخصي', icon: '👤' },
  { href: '/tasks', label: 'المهام', icon: '🎯' },
  { href: '/', label: 'الرئيسية', icon: '🏠' },
  { href: '/rank', label: 'الترتيب', icon: '🏆' },
  { href: '/shop', label: 'المتجر', icon: '🛒' },
];

export function BottomNav() {
  const pathname = usePathname();

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
                'flex flex-col items-center justify-center w-1/5 py-3 px-2 text-center transition-colors',
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
