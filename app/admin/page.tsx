'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getAdminStats, 
  getAllTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getAllNetworks,
  createNetwork,
  updateNetwork,
  deleteNetwork
} from '@/lib/api-client';

const ADMIN_ID = 8005837232;

interface AdminStats {
  totalUsers: number;
  totalReferrals: number;
  totalTasks: number;
  completedTasks: {
    follow: number;
    comment: number;
    watch: number;
    join: number;
    other: number;
  };
  activeUsers24h: number;
  activeUsers7d: number;
  totalPoints: number;
  avgPointsPerUser: number;
}

interface Task {
  id: string;
  network_id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  target_url: string;
  active: number;
  verification_data?: any;
}

interface Network {
  id: string;
  name: string;
  type: string;
  logo: string;
  description: string;
  priority: number;
  active: number;
}

export default function AdminPage() {
  const { user, initData, isReady } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNetworkForm, setShowNetworkForm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // نموذج المهمة
  const [taskForm, setTaskForm] = useState({
    network_id: '',
    type: 'follow',
    title: '',
    description: '',
    points: 0,
    target_url: '',
    active: 1,
    verification_data: {}
  });

  // نموذج الشبكة
  const [networkForm, setNetworkForm] = useState({
    id: '',
    name: '',
    type: 'social',
    logo: '',
    description: '',
    priority: 0,
    active: 1
  });

  useEffect(() => {
    if (isReady && initData && user) {
      // التحقق من أن المستخدم هو الأدمن
      if (user.id !== ADMIN_ID) {
        setLoading(false);
        return;
      }
      loadAdminData();
    }
  }, [isReady, initData, user]);

  async function loadAdminData() {
    try {
      if (!initData) {
        console.log('[v0] initData not available for loading admin data');
        setLoading(false);
        return;
      }
      
      console.log('[v0] Starting to load admin data...');
      
      const [statsData, tasksData, networksData] = await Promise.all([
        getAdminStats(initData).catch(err => {
          console.error('[v0] Failed to load stats:', err);
          return null;
        }),
        getAllTasks(initData).catch(err => {
          console.error('[v0] Failed to load tasks:', err);
          return [];
        }),
        getAllNetworks(initData).catch(err => {
          console.error('[v0] Failed to load networks:', err);
          return [];
        })
      ]);
      
      console.log('[v0] Admin data loaded:', { statsData, tasksData: tasksData?.length || 0, networksData: networksData?.length || 0 });
      
      if (statsData) setStats(statsData);
      if (tasksData) setTasks(tasksData);
      if (networksData) setNetworks(networksData);
      
      if (!statsData || !tasksData || !networksData) {
        showNotification('تم تحميل بعض البيانات بنجاح لكن توجد أخطاء في جزء منها', 'error');
      }
    } catch (error) {
      console.error('[v0] Failed to load admin data:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل تحميل بيانات الأدمن';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask() {
    if (!initData) {
      console.log('[v0] initData not available');
      showNotification('بيانات المستخدم غير متاحة', 'error');
      return;
    }
    
    // Validate required fields
    if (!taskForm.network_id || !taskForm.title || !taskForm.description || taskForm.points === 0 || !taskForm.target_url) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    
    try {
      console.log('[v0] Creating task with data:', taskForm);
      await createTask(initData, taskForm);
      showNotification('تم إنشاء المهمة بنجاح', 'success');
      setShowTaskForm(false);
      resetTaskForm();
      loadAdminData();
    } catch (error) {
      console.error('[v0] Failed to create task:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل إنشاء المهمة';
      showNotification(errorMessage, 'error');
    }
  }

  async function handleUpdateTask() {
    if (!initData || !selectedTask) {
      console.log('[v0] Missing initData or selectedTask');
      return;
    }
    
    // Validate required fields
    if (!taskForm.network_id || !taskForm.title || !taskForm.description || taskForm.points === 0 || !taskForm.target_url) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    
    try {
      console.log('[v0] Updating task with id:', selectedTask.id);
      await updateTask(initData, selectedTask.id, taskForm);
      showNotification('تم تحديث المهمة بنجاح', 'success');
      setSelectedTask(null);
      setShowTaskForm(false);
      resetTaskForm();
      loadAdminData();
    } catch (error) {
      console.error('[v0] Failed to update task:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل تحديث المهمة';
      showNotification(errorMessage, 'error');
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!initData) return;
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    
    try {
      await deleteTask(initData, taskId);
      showNotification('تم حذف المهمة بنجاح', 'success');
      loadAdminData();
    } catch (error) {
      showNotification('فشل حذف المهمة', 'error');
    }
  }

  async function handleCreateNetwork() {
    if (!initData) {
      console.log('[v0] initData not available');
      showNotification('بيانات المستخدم غير متاحة', 'error');
      return;
    }
    
    // Validate required fields
    if (!networkForm.id || !networkForm.name || !networkForm.description) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    
    try {
      console.log('[v0] Creating network with data:', networkForm);
      await createNetwork(initData, networkForm);
      showNotification('تم إنشاء الشبكة بنجاح', 'success');
      setShowNetworkForm(false);
      resetNetworkForm();
      loadAdminData();
    } catch (error) {
      console.error('[v0] Failed to create network:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل إنشاء الشبكة';
      showNotification(errorMessage, 'error');
    }
  }

  async function handleUpdateNetwork() {
    if (!initData || !selectedNetwork) return;
    try {
      await updateNetwork(initData, selectedNetwork.id, networkForm);
      showNotification('تم تحديث الشبكة بنجاح', 'success');
      setSelectedNetwork(null);
      setShowNetworkForm(false);
      resetNetworkForm();
      loadAdminData();
    } catch (error) {
      showNotification('فشل تحديث الشبكة', 'error');
    }
  }

  async function handleDeleteNetwork(networkId: string) {
    if (!initData) return;
    if (!confirm('هل أنت متأكد من حذف هذه الشبكة؟ سيتم حذف جميع المهام المرتبطة بها.')) return;
    
    try {
      await deleteNetwork(initData, networkId);
      showNotification('تم حذف الشبكة بنجاح', 'success');
      loadAdminData();
    } catch (error) {
      showNotification('فشل حذف الشبكة', 'error');
    }
  }

  function resetTaskForm() {
    setTaskForm({
      network_id: '',
      type: 'follow',
      title: '',
      description: '',
      points: 0,
      target_url: '',
      active: 1,
      verification_data: {}
    });
  }

  function resetNetworkForm() {
    setNetworkForm({
      id: '',
      name: '',
      type: 'social',
      logo: '',
      description: '',
      priority: 0,
      active: 1
    });
  }

  function editTask(task: Task) {
    setSelectedTask(task);
    setTaskForm({
      network_id: task.network_id,
      type: task.type,
      title: task.title,
      description: task.description,
      points: task.points,
      target_url: task.target_url,
      active: task.active,
      verification_data: task.verification_data || {}
    });
    setShowTaskForm(true);
  }

  function editNetwork(network: Network) {
    setSelectedNetwork(network);
    setNetworkForm({
      id: network.id,
      name: network.name,
      type: network.type,
      logo: network.logo,
      description: network.description,
      priority: network.priority,
      active: network.active
    });
    setShowNetworkForm(true);
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

  // التحقق من صلاحيات الأدمن
  if (!user || user.id !== ADMIN_ID) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="text-center p-6">
          <p className="text-destructive text-5xl mb-4">⛔</p>
          <p className="font-semibold text-xl mb-2">غير مصرح</p>
          <p className="text-sm text-muted-foreground">
            ليس لديك صلاحيات للوصول إلى هذه الصفحة
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Notification */}
      {notification && (
        <div
          className={cn(
            'fixed top-4 right-4 left-4 p-4 rounded-lg text-white z-50 shadow-lg',
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          )}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-purple-600 to-purple-800 text-white p-4 z-40 shadow-md">
        <h1 className="text-2xl font-bold">🔧 لوحة تحكم الأدمن</h1>
        <p className="text-sm opacity-90">إدارة البوت والمستخدمين</p>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="stats">📊 الإحصائيات</TabsTrigger>
            <TabsTrigger value="tasks">🎯 المهام</TabsTrigger>
            <TabsTrigger value="networks">🌐 الشبكات</TabsTrigger>
          </TabsList>

          {/* الإحصائيات */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">إجمالي المستخدمين</div>
                <div className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">إجمالي الإحالات</div>
                <div className="text-3xl font-bold text-green-600">{stats?.totalReferrals || 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">نشطين (24 ساعة)</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.activeUsers24h || 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">نشطين (7 أيام)</div>
                <div className="text-3xl font-bold text-purple-600">{stats?.activeUsers7d || 0}</div>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">📈 إحصائيات النقاط</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي النقاط</span>
                  <span className="font-semibold">{stats?.totalPoints?.toFixed(0) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">متوسط النقاط لكل مستخدم</span>
                  <span className="font-semibold">{stats?.avgPointsPerUser?.toFixed(2) || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">✅ المهام المكتملة حسب النوع</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">👥 متابعة</span>
                  <Badge variant="secondary">{stats?.completedTasks?.follow || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">💬 تعليق</span>
                  <Badge variant="secondary">{stats?.completedTasks?.comment || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">📺 مشاهدة</span>
                  <Badge variant="secondary">{stats?.completedTasks?.watch || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">🔗 انضمام</span>
                  <Badge variant="secondary">{stats?.completedTasks?.join || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">🎯 أخرى</span>
                  <Badge variant="secondary">{stats?.completedTasks?.other || 0}</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* إدارة المهام */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">إدارة المهام ({tasks.length})</h2>
              <Button 
                onClick={() => {
                  resetTaskForm();
                  setSelectedTask(null);
                  setShowTaskForm(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                ➕ إضافة مهمة
              </Button>
            </div>

            {showTaskForm && (
              <Card className="p-4 space-y-4 border-2 border-primary">
                <h3 className="font-semibold">
                  {selectedTask ? '✏️ تعديل المهمة' : '➕ مهمة جديدة'}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>الشبكة</Label>
                    <Select 
                      value={taskForm.network_id}
                      onValueChange={(value) => setTaskForm({...taskForm, network_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشبكة" />
                      </SelectTrigger>
                      <SelectContent>
                        {networks.map(network => (
                          <SelectItem key={network.id} value={network.id}>
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>نوع المهمة</Label>
                    <Select 
                      value={taskForm.type}
                      onValueChange={(value) => setTaskForm({...taskForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow">👥 متابعة</SelectItem>
                        <SelectItem value="comment">💬 تعليق</SelectItem>
                        <SelectItem value="watch">📺 مشاهدة</SelectItem>
                        <SelectItem value="join">🔗 انضمام</SelectItem>
                        <SelectItem value="other">🎯 أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>العنوان</Label>
                    <Input 
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="عنوان المهمة"
                    />
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Textarea 
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="وصف المهمة"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>النقاط</Label>
                    <Input 
                      type="number"
                      value={taskForm.points}
                      onChange={(e) => setTaskForm({...taskForm, points: parseFloat(e.target.value)})}
                      placeholder="عدد النقاط"
                    />
                  </div>

                  <div>
                    <Label>الرابط المستهدف</Label>
                    <Input 
                      value={taskForm.target_url}
                      onChange={(e) => setTaskForm({...taskForm, target_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label>الحالة</Label>
                    <Select 
                      value={taskForm.active.toString()}
                      onValueChange={(value) => setTaskForm({...taskForm, active: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">✅ نشطة</SelectItem>
                        <SelectItem value="0">⏸️ متوقفة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* حقول إضافية حسب نوع المهمة */}
                  {taskForm.type === 'watch' && (
                    <div>
                      <Label>مدة المشاهدة المطلوبة (ثانية)</Label>
                      <Input 
                        type="number"
                        value={taskForm.verification_data?.required_watch_time || ''}
                        onChange={(e) => setTaskForm({
                          ...taskForm, 
                          verification_data: {
                            ...taskForm.verification_data,
                            required_watch_time: parseInt(e.target.value)
                          }
                        })}
                        placeholder="60"
                      />
                    </div>
                  )}

                  {taskForm.type === 'comment' && (
                    <div>
                      <Label>كود التحقق (اختياري)</Label>
                      <Input 
                        value={taskForm.verification_data?.verification_code || ''}
                        onChange={(e) => setTaskForm({
                          ...taskForm, 
                          verification_data: {
                            ...taskForm.verification_data,
                            verification_code: e.target.value
                          }
                        })}
                        placeholder="كود التحقق"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={selectedTask ? handleUpdateTask : handleCreateTask}
                    className="flex-1"
                  >
                    {selectedTask ? '💾 حفظ التعديلات' : '➕ إنشاء'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowTaskForm(false);
                      setSelectedTask(null);
                      resetTaskForm();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ❌ إلغاء
                  </Button>
                </div>
              </Card>
            )}

            {/* قائمة المهام */}
            <div className="space-y-3">
              {tasks.map(task => (
                <Card key={task.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{task.title}</h4>
                        {task.active ? (
                          <Badge className="bg-green-600">نشطة</Badge>
                        ) : (
                          <Badge variant="secondary">متوقفة</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-muted-foreground">النوع: <strong>{getTaskTypeLabel(task.type)}</strong></span>
                        <span className="text-muted-foreground">النقاط: <strong className="text-primary">{task.points}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editTask(task)}
                      className="flex-1"
                    >
                      ✏️ تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex-1"
                    >
                      🗑️ حذف
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* إدارة الشبكات */}
          <TabsContent value="networks" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">إدارة الشبكات ({networks.length})</h2>
              <Button 
                onClick={() => {
                  resetNetworkForm();
                  setSelectedNetwork(null);
                  setShowNetworkForm(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                ➕ إضافة شبكة
              </Button>
            </div>

            {showNetworkForm && (
              <Card className="p-4 space-y-4 border-2 border-primary">
                <h3 className="font-semibold">
                  {selectedNetwork ? '✏️ تعديل الشبكة' : '➕ شبكة جديدة'}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>معرف الشبكة (ID)</Label>
                    <Input 
                      value={networkForm.id}
                      onChange={(e) => setNetworkForm({...networkForm, id: e.target.value})}
                      placeholder="youtube, telegram, etc."
                      disabled={!!selectedNetwork}
                    />
                  </div>

                  <div>
                    <Label>اسم الشبكة</Label>
                    <Input 
                      value={networkForm.name}
                      onChange={(e) => setNetworkForm({...networkForm, name: e.target.value})}
                      placeholder="YouTube, Telegram, etc."
                    />
                  </div>

                  <div>
                    <Label>نوع المحتوى</Label>
                    <Select 
                      value={networkForm.type}
                      onValueChange={(value) => setNetworkForm({...networkForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">📱 شبكة اجتماعية</SelectItem>
                        <SelectItem value="game">🎮 لعبة</SelectItem>
                        <SelectItem value="survey">📋 استبيان</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>شعار (URL أو Emoji)</Label>
                    <Input 
                      value={networkForm.logo}
                      onChange={(e) => setNetworkForm({...networkForm, logo: e.target.value})}
                      placeholder="https://... أو 📱"
                    />
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Textarea 
                      value={networkForm.description}
                      onChange={(e) => setNetworkForm({...networkForm, description: e.target.value})}
                      placeholder="وصف الشبكة"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>الأولوية (ترتيب العرض)</Label>
                    <Input 
                      type="number"
                      value={networkForm.priority}
                      onChange={(e) => setNetworkForm({...networkForm, priority: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>الحالة</Label>
                    <Select 
                      value={networkForm.active.toString()}
                      onValueChange={(value) => setNetworkForm({...networkForm, active: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">✅ نشطة</SelectItem>
                        <SelectItem value="0">⏸️ متوقفة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={selectedNetwork ? handleUpdateNetwork : handleCreateNetwork}
                    className="flex-1"
                  >
                    {selectedNetwork ? '💾 حفظ التعديلات' : '➕ إنشاء'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowNetworkForm(false);
                      setSelectedNetwork(null);
                      resetNetworkForm();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ❌ إلغاء
                  </Button>
                </div>
              </Card>
            )}

            {/* قائمة الشبكات */}
            <div className="space-y-3">
              {networks.map(network => (
                <Card key={network.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-3xl">{network.logo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{network.name}</h4>
                          {network.active ? (
                            <Badge className="bg-green-600">نشطة</Badge>
                          ) : (
                            <Badge variant="secondary">متوقفة</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{network.description}</p>
                        <div className="flex gap-4 text-xs">
                          <span className="text-muted-foreground">النوع: <strong>{getNetworkTypeLabel(network.type)}</strong></span>
                          <span className="text-muted-foreground">الأولوية: <strong>{network.priority}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editNetwork(network)}
                      className="flex-1"
                    >
                      ✏️ تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteNetwork(network.id)}
                      className="flex-1"
                    >
                      🗑️ حذف
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// Helper functions
function getTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    follow: '👥 متابعة',
    comment: '💬 تعليق',
    watch: '📺 مشاهدة',
    join: '🔗 انضمام',
    other: '🎯 أخرى'
  };
  return labels[type] || type;
}

function getNetworkTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    social: '📱 شبكة اجتماعية',
    game: '🎮 لعبة',
    survey: '📋 استبيان'
  };
  return labels[type] || type;
}
