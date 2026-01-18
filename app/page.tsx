'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { getUser, dailyCheckin } from '@/lib/api-client';
import { BottomNav } from '@/components/bottom-nav';
import { DailySpin } from '@/components/daily-spin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UserData {
  user_id: number;
  first_name: string;
  points: number;
  level: number;
  streak: number;
  referrals: number;
}

export default function Home() {
  const { user, initData, isReady } = useTelegram();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSpinModal, setShowSpinModal] = useState(false);

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
      console.error('Failed to load user:', error);
      showNotification('فشل تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckin() {
    if (!initData) return;
    setChecking(true);
    try {
      const result = await dailyCheckin(initData);
      if (result.success) {
        setUserData(result.user);
        showNotification(`تسجيل ناجح! +${result.bonus} نقطة`, 'success');
      } else if (result.already_checked) {
        showNotification('سبق التسجيل اليوم!', 'error');
      }
    } catch (error) {
      showNotification('فشل التسجيل', 'error');
    } finally {
      setChecking(false);
    }
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="text-center p-6">
          <p className="text-destructive mb-2">❌</p>
          <p className="font-semibold">لم يتم التعرف على المستخدم</p>
          <p className="text-sm text-muted-foreground mt-2">
            يرجى فتح التطبيق من خلال بوت تليجرام
          </p>
        </Card>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">أهلاً، {userData?.first_name}</h1>
        <p className="text-sm opacity-90">أربح نقاط حقيقية</p>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{userData?.points.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">النقاط الكلية</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              {userData?.level}
            </div>
            <div className="text-xs text-muted-foreground">المستوى</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary mb-1">
              {userData?.streak}
            </div>
            <div className="text-xs text-muted-foreground">الستريك 🔥</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {userData?.referrals}
            </div>
            <div className="text-xs text-muted-foreground">الإحالات</div>
          </Card>
        </div>

        {/* Daily Spin Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/50">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">🎰 السحب اليومي</h2>
            <p className="text-sm text-muted-foreground">اربح جوائز عشوائية كل يوم</p>
            <Button
              onClick={() => setShowSpinModal(true)}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg"
              size="lg"
            >
              🎡 العجلة الدوارة
            </Button>
          </div>
        </Card>

        {/* Daily Check-in */}
        <Button
          onClick={handleCheckin}
          disabled={checking}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg"
          size="lg"
        >
          {checking ? '⏳ جاري...' : '🎁 تسجيل دخول يومي'}
        </Button>

        {/* Quick Actions */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">إجراءات سريعة</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-xs bg-transparent">
              📋 مهام جديدة
            </Button>
            <Button variant="outline" className="text-xs bg-transparent">
              🏆 ترتيبك
            </Button>
            <Button variant="outline" className="text-xs bg-transparent">
              🎁 مكافآت
            </Button>
            <Button variant="outline" className="text-xs bg-transparent">
              👥 شارك الرابط
            </Button>
          </div>
        </Card>
      </div>

      {/* Daily Spin Modal */}
      <DailySpin open={showSpinModal} onOpenChange={setShowSpinModal} />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// Helper for cn utility
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
