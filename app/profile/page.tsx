'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { getUser } from '@/lib/api-client';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UserData {
  user_id: number;
  first_name: string;
  username?: string;
  points: number;
  level: number;
  streak: number;
  referrals: number;
  join_date: string;
}

const BOT_USERNAME = 'CashAlarb_bot';

export default function ProfilePage() {
  const { user, initData, isReady } = useTelegram();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  function copyReferralLink() {
    if (!user) return;
    const refLink = `https://t.me/${BOT_USERNAME}?start=${user.id}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareReferralLink() {
    if (!user) return;
    const refLink = `https://t.me/${BOT_USERNAME}?start=${user.id}`;
    const shareText = '🎉 تعالى اربح معايا نقاط حقيقية!\n💰 بوت الربح - مهام يومية وإحالات مربحة!';

    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`
      );
    } else {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`,
        '_blank'
      );
    }
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

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground p-4 z-40">
        <h1 className="text-2xl font-bold">👤 الملف الشخصي</h1>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-4">
        {/* Avatar and Name */}
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-3">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold">{userData?.first_name}</h2>
          {userData?.username && (
            <p className="text-sm text-muted-foreground">@{userData.username}</p>
          )}
          <div className="mt-3">
            <span className="inline-block bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
              المستوى {userData?.level} 🏆
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary mb-1">{userData?.points.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">النقاط الكلية</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-secondary mb-1">{userData?.referrals}</p>
            <p className="text-xs text-muted-foreground">الإحالات</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-accent mb-1">{userData?.streak}</p>
            <p className="text-xs text-muted-foreground">الستريك 🔥</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500 mb-1">
              {userData?.join_date
                ? new Date(userData.join_date).toLocaleDateString('ar-EG')
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground">تاريخ الانضمام</p>
          </Card>
        </div>

        {/* Referral Section */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/50 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span>🔗</span>
            <span>رابط الإحالة</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            شارك رابطك مع الأصدقاء واربح {50} نقطة لكل إحالة جديدة
          </p>
          <div className="bg-card rounded-lg p-3 flex items-center gap-2 text-xs break-all font-mono">
            <span className="flex-1">
              {user ? `https://t.me/${BOT_USERNAME}?start=${user.id}` : 'جاري التحميل...'}
            </span>
            <Button
              onClick={copyReferralLink}
              variant="ghost"
              size="sm"
              className="shrink-0"
            >
              {copied ? '✓' : '📋'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={shareReferralLink}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              size="sm"
            >
              📤 شارك الآن
            </Button>
            <Button
              onClick={copyReferralLink}
              variant="outline"
              size="sm"
            >
              {copied ? '✓ تم النسخ' : '📋 انسخ'}
            </Button>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4 space-y-2">
          <h3 className="font-semibold mb-3">⚙️ الإعدادات</h3>
          <Button variant="outline" className="w-full justify-start text-right bg-transparent">
            🔔 إشعارات
          </Button>
          <Button variant="outline" className="w-full justify-start text-right bg-transparent">
            🌙 الوضع الليلي
          </Button>
          <Button variant="outline" className="w-full justify-start text-right bg-transparent">
            🌐 اللغة
          </Button>
          <Button variant="outline" className="w-full justify-start text-right bg-transparent">
            ℹ️ حول التطبيق
          </Button>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
