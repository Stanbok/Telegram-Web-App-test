'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { getTasks, checkTask } from '@/lib/api-client';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Task {
  id: string;
  description: string;
  points: number;
  channel: string;
  completed: boolean;
}

const TASK_CATEGORIES = {
  ads: { label: 'إعلانات 📺', icon: '📺' },
  referral: { label: 'إحالات 🔗', icon: '🔗' },
  follow: { label: 'متابعة 👥', icon: '👥' },
  shorten: { label: 'اختصار 📝', icon: '📝' },
  other: { label: 'أخرى 🌟', icon: '🌟' },
};

export default function TasksPage() {
  const { initData, isReady } = useTelegram();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof typeof TASK_CATEGORIES>('ads');
  const [checking, setChecking] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isReady && initData) {
      loadTasks();
    }
  }, [isReady, initData]);

  async function loadTasks() {
    try {
      if (!initData) return;
      const result = await getTasks(initData);
      setTasks(result.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      showNotification('فشل تحميل المهام', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckTask(taskId: string) {
    if (!initData) return;
    setChecking(taskId);
    try {
      const result = await checkTask(taskId, initData);
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, completed: true } : t
          )
        );
        showNotification(`🎉 مهمة مكتملة! +${result.points} نقطة`, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('فشل التحقق من المهمة', 'error');
    } finally {
      setChecking(null);
    }
  }

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }

  function getCategoryTasks(category: keyof typeof TASK_CATEGORIES) {
    // Simple categorization based on task id
    return tasks.filter((task) => {
      const id = task.id.toLowerCase();
      if (category === 'ads') return id.includes('ads') || id === 'task1';
      if (category === 'referral') return id.includes('ref');
      if (category === 'follow') return id === 'task2' || id === 'task3';
      if (category === 'shorten') return id.includes('short');
      return true;
    });
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
        <h1 className="text-2xl font-bold">🎯 المهام المتاحة</h1>
        <p className="text-sm opacity-90">أكمل المهام واربح نقاط</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 bg-background border-b border-border p-4 z-30">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(TASK_CATEGORIES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof typeof TASK_CATEGORIES)}
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

      {/* Tasks List */}
      <div className="p-4 space-y-3">
        {getCategoryTasks(activeTab).length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p className="text-lg mb-2">لا توجد مهام في هذه الفئة</p>
            <p className="text-sm">تحقق من فئات أخرى</p>
          </Card>
        ) : (
          getCategoryTasks(activeTab).map((task) => (
            <Card
              key={task.id}
              className={cn(
                'p-4 border-l-4',
                task.completed
                  ? 'border-l-green-500 bg-muted/50 opacity-75'
                  : 'border-l-primary'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{task.description}</p>
                  <p className="text-xs text-muted-foreground">
                    المكافأة: {task.points} نقطة
                  </p>
                </div>
                {task.completed && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✓ مكتملة
                  </span>
                )}
              </div>

              {!task.completed && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(`https://t.me/${task.channel}`, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    انضمام
                  </Button>
                  <Button
                    onClick={() => handleCheckTask(task.id)}
                    disabled={checking === task.id}
                    size="sm"
                    className="flex-1 text-xs bg-gradient-to-r from-primary to-accent"
                  >
                    {checking === task.id ? '⏳' : '✓'} تحقق
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
