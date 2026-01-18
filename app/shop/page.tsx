'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { getUser } from '@/lib/api-client';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UserData {
  user_id: number;
  points: number;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  category: 'money' | 'games' | 'discounts' | 'premium';
  badge?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Money
  {
    id: 'paypal-1',
    name: '1$ PayPal',
    description: 'تحويل مباشر',
    icon: '💵',
    cost: 500,
    category: 'money',
  },
  {
    id: 'vodafone-5',
    name: '5$ Vodafone Cash',
    description: 'رصيد فوري',
    icon: '📱',
    cost: 2000,
    category: 'money',
    badge: 'محدود',
  },

  // Games
  {
    id: 'pubg-60',
    name: 'PUBG 60 UC',
    description: 'شراء معلومات',
    icon: '🎮',
    cost: 300,
    category: 'games',
  },
  {
    id: 'fortnite-500',
    name: 'Fortnite 500 V-Bucks',
    description: 'رموز اللعبة',
    icon: '⚔️',
    cost: 1500,
    category: 'games',
  },

  // Discounts
  {
    id: 'discount-20',
    name: 'خصم 20% للمتجر',
    description: 'صالح 30 يوم',
    icon: '🎁',
    cost: 800,
    category: 'discounts',
  },
  {
    id: 'free-shipping',
    name: 'شحن مجاني',
    description: 'طلب واحد',
    icon: '🚚',
    cost: 400,
    category: 'discounts',
  },

  // Premium
  {
    id: 'vip-7days',
    name: 'VIP لمدة 7 أيام',
    description: 'نقاط مضاعفة ونقاط حصرية',
    icon: '⭐',
    cost: 1000,
    category: 'premium',
  },
  {
    id: 'vip-30days',
    name: 'VIP لمدة 30 يوم',
    description: 'نقاط x3 ومهام حصرية',
    icon: '👑',
    cost: 3500,
    category: 'premium',
  },
];

const CATEGORY_TABS = {
  money: { label: 'مال 💵', icon: '💵' },
  games: { label: 'ألعاب 🎮', icon: '🎮' },
  discounts: { label: 'خصومات 🎁', icon: '🎁' },
  premium: { label: 'بريميوم 💎', icon: '💎' },
};

export default function ShopPage() {
  const { initData, isReady } = useTelegram();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof typeof CATEGORY_TABS>('money');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isReady && initData) {
      loadUserData();
    }
  }, [isReady, initData]);

  async function loadUserData() {
    try {
      if (!initData) return;
      const data = await getUser(initData);
      setUserData(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePurchase(item: ShopItem) {
    if (!userData) return;

    if (userData.points < item.cost) {
      showNotification('نقاط غير كافية!', 'error');
      return;
    }

    showNotification(`تم الشراء! -${item.cost} نقطة`, 'success');
  }

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const filteredItems = SHOP_ITEMS.filter((item) => item.category === activeTab);

  return (
    <div className="pb-24">
      {/* Notification */}
      {notification && (
        <div
          className={cn(
            'fixed top-4 right-4 left-4 p-4 rounded-lg text-white z-50',
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          )}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground p-4 z-40">
        <h1 className="text-2xl font-bold">🛒 متجر المكافآت</h1>
        <div className="mt-3 flex items-center gap-2 text-lg font-bold">
          <span>رصيدك:</span>
          <span className="text-accent">{userData?.points.toFixed(0)} 💰</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-20 bg-background border-b border-border p-4 z-30">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(CATEGORY_TABS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof typeof CATEGORY_TABS)}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeTab === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {value.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Items */}
      <div className="p-4 space-y-3">
        {filteredItems.map((item) => {
          const canAfford = userData ? userData.points >= item.cost : false;
          const isLocked = !canAfford;

          return (
            <Card
              key={item.id}
              className={cn(
                'p-4 flex gap-4 transition-all',
                isLocked ? 'opacity-60' : 'hover:shadow-lg'
              )}
            >
              {/* Icon */}
              <div className="text-4xl flex-shrink-0">{item.icon}</div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  {item.badge && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>

                {/* Progress Bar */}
                {!canAfford && (
                  <div className="mb-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((userData?.points || 0) / item.cost) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}

                {/* Cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <span>{item.cost}</span>
                    <span>💰</span>
                  </div>
                  {!canAfford && (
                    <span className="text-xs text-muted-foreground">
                      متبقي: {item.cost - (userData?.points || 0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Button */}
              <div className="flex flex-col items-center justify-center gap-2">
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={isLocked}
                  size="sm"
                  className={cn(
                    'whitespace-nowrap',
                    canAfford
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'opacity-50'
                  )}
                >
                  {isLocked ? '🔒' : '✓'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-4 m-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-center text-blue-700">
          <span className="font-semibold">💡 ملاحظة:</span> بعد الشراء، سيتم معالجة الطلب خلال 24 ساعة
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
