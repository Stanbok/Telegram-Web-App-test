'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { getLeaderboard } from '@/lib/api-client';
import { BottomNav } from '@/components/bottom-nav';
import { Card } from '@/components/ui/card';

interface LeaderboardEntry {
  name: string;
  points: number;
  level: number;
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export default function RankPage() {
  const { initData, isReady } = useTelegram();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && initData) {
      loadLeaderboard();
    }
  }, [isReady, initData]);

  async function loadLeaderboard() {
    try {
      if (!initData) return;
      const result = await getLeaderboard(initData);
      setLeaderboard(result.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold">🏆 الترتيب العالمي</h1>
        <p className="text-sm opacity-90">أفضل اللاعبين هذا الأسبوع</p>
      </div>

      {/* Leaderboard */}
      <div className="p-4 space-y-2">
        {leaderboard.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>لا توجد بيانات حالياً</p>
          </Card>
        ) : (
          leaderboard.map((entry, index) => (
            <Card
              key={index}
              className="p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              {/* Rank Medal/Number */}
              <div className="text-2xl font-bold min-w-[50px]">
                {index < 3 ? MEDAL_EMOJIS[index] : `#${index + 1}`}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{entry.name}</h3>
                <p className="text-xs text-muted-foreground">
                  مستوى {entry.level}
                </p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="font-bold text-primary">{entry.points.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">نقطة</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="p-4 m-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <p className="text-sm text-center text-muted-foreground">
          <span className="font-semibold">💡 نصيحة:</span> كلما ارتفعت نقاطك، ارتقيت في الترتيب!
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
