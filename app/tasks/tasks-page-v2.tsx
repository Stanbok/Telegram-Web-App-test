'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import {
  getNetworks,
  getTasks,
  getGames,
  getSurveys,
  startTask,
  checkTask,
  playGame,
  getUser,
} from '@/lib/api-client-v2';
import { ContentType, Network, Task, Game, Survey, UserData } from '@/lib/types';
import { BottomNav } from '@/components/bottom-nav';
import { NetworkSection } from '@/components/network-section';
import { Card } from '@/components/ui/card';
import { CheckSquare, Gamepad2, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_TABS: { type: ContentType; label: string; icon: any }[] = [
  { type: 'tasks', label: 'المهام', icon: CheckSquare },
  { type: 'games', label: 'الألعاب', icon: Gamepad2 },
  { type: 'surveys', label: 'الاستطلاعات', icon: ClipboardList },
];

interface NetworkContent {
  network: Network;
  content: (Task | Game | Survey)[];
}

export default function TasksPage() {
  const { initData, isReady } = useTelegram();
  const [activeTab, setActiveTab] = useState<ContentType>('tasks');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [networkContents, setNetworkContents] = useState<NetworkContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [checkingTaskId, setCheckingTaskId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (isReady && initData) {
      loadInitialData();
    }
  }, [isReady, initData, activeTab]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreContent();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, page, activeTab]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setPage(1);
      setNetworkContents([]);
      setHasMore(true);

      if (!initData) return;

      // Load user data
      const user = await getUser(initData);
      setUserData(user);

      // Load networks and their content
      await loadContentForPage(1);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreContent() {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    await loadContentForPage(nextPage);
    setPage(nextPage);
  }

  async function loadContentForPage(pageNum: number) {
    if (!initData) return;

    try {
      setLoadingMore(true);

      // Load networks for current content type
      const networksResponse = await getNetworks(activeTab, pageNum, 5, initData);

      if (!networksResponse.networks || networksResponse.networks.length === 0) {
        setHasMore(false);
        return;
      }

      // Load content for each network
      const networkContentPromises = networksResponse.networks.map(async (network) => {
        let content: (Task | Game | Survey)[] = [];

        if (activeTab === 'tasks') {
          const tasksResponse = await getTasks(initData, {
            networkId: network.id,
            page: 1,
            pageSize: 20,
          });
          content = tasksResponse.tasks || [];
        } else if (activeTab === 'games') {
          const gamesResponse = await getGames(initData, {
            networkId: network.id,
            page: 1,
            pageSize: 20,
          });
          content = gamesResponse.games || [];
        } else if (activeTab === 'surveys') {
          const surveysResponse = await getSurveys(initData, {
            networkId: network.id,
            page: 1,
            pageSize: 20,
          });
          content = surveysResponse.surveys || [];
        }

        return { network, content };
      });

      const newNetworkContents = await Promise.all(networkContentPromises);

      setNetworkContents((prev) => [...prev, ...newNetworkContents]);
      setHasMore(networksResponse.hasMore);
    } catch (error) {
      console.error('Failed to load more content:', error);
      toast.error('فشل تحميل المزيد من المحتوى');
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleStartTask(taskId: string) {
    if (!initData) return;

    try {
      await startTask(taskId, initData);
      toast.success('تم بدء المهمة! يرجى إكمالها ثم الضغط على التحقق.');

      // Update task status in state
      setNetworkContents((prev) =>
        prev.map((nc) => ({
          ...nc,
          content: nc.content.map((item) =>
            item.id === taskId ? { ...item, status: 'in_progress' } : item
          ),
        }))
      );
    } catch (error) {
      console.error('Failed to start task:', error);
      toast.error('فشل بدء المهمة');
    }
  }

  async function handleCheckTask(taskId: string) {
    if (!initData) return;

    try {
      setCheckingTaskId(taskId);
      const result = await checkTask(taskId, initData);

      if (result.success && result.completed) {
        toast.success(`🎉 مهمة مكتملة! +${result.points} نقطة`);

        // Update task status and user data
        setNetworkContents((prev) =>
          prev.map((nc) => ({
            ...nc,
            content: nc.content.map((item) =>
              item.id === taskId ? { ...item, status: 'completed' } : item
            ),
          }))
        );

        if (result.user) {
          setUserData(result.user);
        }
      } else {
        toast.error(result.message || 'لم يتم إكمال المهمة بعد');
      }
    } catch (error) {
      console.error('Failed to check task:', error);
      toast.error('فشل التحقق من المهمة');
    } finally {
      setCheckingTaskId(null);
    }
  }

  async function handlePlayGame(gameId: string) {
    if (!initData) return;

    try {
      const result = await playGame(gameId, initData);
      if (result.success && result.gameUrl) {
        window.open(result.gameUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to play game:', error);
      toast.error('فشل تشغيل اللعبة');
    }
  }

  async function handleStartSurvey(surveyId: string) {
    // Navigate to survey page (to be implemented)
    toast.info('صفحة الاستطلاع قيد التطوير');
  }

  if (loading && networkContents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 z-40 shadow-lg">
        <h1 className="text-2xl font-bold">🎯 مركز المحتوى</h1>
        <p className="text-sm opacity-90">اكسب النقاط من خلال المهام والألعاب والاستطلاعات</p>
        {userData && (
          <div className="flex gap-4 mt-2 text-xs opacity-90">
            <span>💰 {userData.points.toFixed(0)} نقطة</span>
            <span>🏆 المستوى {userData.level}</span>
          </div>
        )}
      </div>

      {/* Horizontal Tabs */}
      <div className="sticky top-[88px] bg-white border-b border-gray-200 px-4 py-3 z-30 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CONTENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;

            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {networkContents.length === 0 && !loading ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              {activeTab === 'tasks' && <CheckSquare size={64} className="mx-auto" />}
              {activeTab === 'games' && <Gamepad2 size={64} className="mx-auto" />}
              {activeTab === 'surveys' && <ClipboardList size={64} className="mx-auto" />}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              لا يوجد محتوى متاح حالياً
            </h3>
            <p className="text-sm text-gray-500">
              تحقق مرة أخرى لاحقاً للحصول على {activeTab === 'tasks' ? 'مهام' : activeTab === 'games' ? 'ألعاب' : 'استطلاعات'} جديدة
            </p>
          </Card>
        ) : (
          <>
            {networkContents.map((nc, index) => (
              <NetworkSection
                key={`${nc.network.id}-${index}`}
                network={nc.network}
                content={nc.content}
                contentType={activeTab}
                onStartTask={handleStartTask}
                onCheckTask={handleCheckTask}
                onPlayGame={handlePlayGame}
                onStartSurvey={handleStartSurvey}
                checkingTaskId={checkingTaskId}
              />
            ))}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="mr-3 text-sm text-muted-foreground">جاري تحميل المزيد...</span>
              </div>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="h-4" />

            {/* End of Content */}
            {!hasMore && networkContents.length > 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                🎉 لقد وصلت إلى نهاية القائمة
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
