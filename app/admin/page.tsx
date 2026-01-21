'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/lib/telegram-provider';
import { TASK_TEMPLATES } from '@/lib/task-templates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const ADMIN_ID = 8005837232;

interface TaskData {
  id?: string;
  type: string;
  title: string;
  description: string;
  points: number;
  targetUrl: string;
  active: boolean;
}

interface Task extends TaskData {
  id: string;
  networkId: string;
}

export default function AdminPage() {
  const { user, initData } = useTelegram();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskData>({
    type: 'ad_view',
    title: '',
    description: '',
    points: 0,
    targetUrl: '',
    active: true,
  });

  // Check authorization on mount
  useEffect(() => {
    if (user?.id === ADMIN_ID) {
      setIsAuthorized(true);
      loadTasks();
    } else {
      setError('لا توجد صلاحيات كافية للوصول إلى صفحة الأدمن');
      setLoading(false);
    }
  }, [user]);

  // Load tasks from database
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to load tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load tasks';
      console.error('[Admin] Load error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Save task (create or update)
  const handleSaveTask = async () => {
    try {
      // Validate required fields
      if (!formData.type || !formData.title || !formData.points || !formData.targetUrl) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (formData.points <= 0) {
        setError('النقاط يجب أن تكون أكبر من 0');
        return;
      }

      const payload = {
        ...formData,
        targetUrl: formData.targetUrl,
      };

      if (editingId) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update task');
        setError('');
        loadTasks();
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create task');
        setError('');
        loadTasks();
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error saving task';
      console.error('[Admin] Save error:', errorMsg);
      setError(errorMsg);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      loadTasks();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting task';
      console.error('[Admin] Delete error:', errorMsg);
      setError(errorMsg);
    }
  };

  // Edit task
  const handleEditTask = (task: Task) => {
    setFormData({
      type: task.type,
      title: task.title,
      description: task.description,
      points: task.points,
      targetUrl: task.targetUrl,
      active: task.active,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'ad_view',
      title: '',
      description: '',
      points: 0,
      targetUrl: '',
      active: true,
    });
    setEditingId(null);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">الوصول مرفوض</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
          <p className="text-gray-600 mt-1">إدارة جميع أنواع المهام</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">المهام ({tasks.length})</TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مهمة جديدة
            </TabsTrigger>
          </TabsList>

          {/* Tasks List Tab */}
          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">لا توجد مهام بعد</p>
              </Card>
            ) : (
              tasks.map((task) => {
                const template = TASK_TEMPLATES[task.type as any];
                return (
                  <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <Badge
                            style={{
                              backgroundColor: template?.colorScheme.primary,
                              color: 'white',
                            }}
                          >
                            {template?.name || task.type}
                          </Badge>
                          {task.active ? (
                            <Badge variant="outline" className="border-green-500 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              نشط
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              معطل
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-primary font-semibold">{task.points} نقطة</span>
                          <span className="text-gray-500">{task.targetUrl}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Create/Edit Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">نوع المهمة *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_TEMPLATES).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">العنوان *</Label>
                  <Input
                    id="title"
                    placeholder="أدخل عنوان المهمة"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف المهمة"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points">النقاط *</Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="0"
                      value={formData.points || ''}
                      onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="active">الحالة</Label>
                    <Select value={formData.active ? 'true' : 'false'} onValueChange={(v) => setFormData({ ...formData, active: v === 'true' })}>
                      <SelectTrigger id="active" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">نشط</SelectItem>
                        <SelectItem value="false">معطل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetUrl">رابط المهمة *</Label>
                  <Input
                    id="targetUrl"
                    placeholder="https://example.com"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveTask} className="flex-1">
                    {editingId ? 'حفظ التغييرات' : 'إنشاء المهمة'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
