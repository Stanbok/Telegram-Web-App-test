import {
  ContentType,
  Network,
  Task,
  Game,
  Survey,
  TaskAttempt,
  UserData,
  PaginatedResponse,
  ApiResponse,
  NetworksResponse,
  TasksResponse,
  GamesResponse,
  SurveysResponse,
  TaskCheckResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dracodev.pythonanywhere.com/api';

export async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  initData?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

// ============== USER ENDPOINTS ==============

export async function getUser(initData: string): Promise<UserData> {
  return apiCall('/user', 'GET', null, initData);
}

// ============== NETWORK ENDPOINTS ==============

export async function getNetworks(
  type: ContentType,
  page: number = 1,
  pageSize: number = 10,
  initData: string
): Promise<NetworksResponse> {
  return apiCall(
    `/networks?type=${type}&page=${page}&pageSize=${pageSize}`,
    'GET',
    null,
    initData
  );
}

export async function getNetworkById(
  networkId: string,
  initData: string
): Promise<Network> {
  return apiCall(`/networks/${networkId}`, 'GET', null, initData);
}

// ============== TASK ENDPOINTS ==============

export async function getTasks(
  initData: string,
  filters?: {
    networkId?: string;
    taskType?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<TasksResponse> {
  const params = new URLSearchParams();
  if (filters?.networkId) params.append('networkId', filters.networkId);
  if (filters?.taskType) params.append('taskType', filters.taskType);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
  
  return apiCall(endpoint, 'GET', null, initData);
}

export async function getTaskById(
  taskId: string,
  initData: string
): Promise<Task> {
  return apiCall(`/tasks/${taskId}`, 'GET', null, initData);
}

export async function startTask(
  taskId: string,
  initData: string
): Promise<TaskAttempt> {
  return apiCall('/task/start', 'POST', { task_id: taskId }, initData);
}

export async function checkTask(
  taskId: string,
  initData: string,
  verificationData?: Record<string, any>
): Promise<TaskCheckResponse> {
  return apiCall(
    '/task/check',
    'POST',
    { task_id: taskId, verification_data: verificationData },
    initData
  );
}

export async function getUserTaskAttempts(
  initData: string,
  status?: string
): Promise<TaskAttempt[]> {
  const endpoint = status ? `/user/attempts?status=${status}` : '/user/attempts';
  return apiCall(endpoint, 'GET', null, initData);
}

// ============== GAME ENDPOINTS ==============

export async function getGames(
  initData: string,
  filters?: {
    networkId?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<GamesResponse> {
  const params = new URLSearchParams();
  if (filters?.networkId) params.append('networkId', filters.networkId);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/games?${queryString}` : '/games';
  
  return apiCall(endpoint, 'GET', null, initData);
}

export async function playGame(
  gameId: string,
  initData: string
): Promise<{ success: boolean; gameUrl: string }> {
  return apiCall('/game/play', 'POST', { game_id: gameId }, initData);
}

export async function completeGame(
  gameId: string,
  score: number,
  duration: number,
  initData: string
): Promise<{ success: boolean; points: number; user: UserData }> {
  return apiCall(
    '/game/complete',
    'POST',
    { game_id: gameId, score, duration },
    initData
  );
}

// ============== SURVEY ENDPOINTS ==============

export async function getSurveys(
  initData: string,
  filters?: {
    networkId?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<SurveysResponse> {
  const params = new URLSearchParams();
  if (filters?.networkId) params.append('networkId', filters.networkId);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/surveys?${queryString}` : '/surveys';
  
  return apiCall(endpoint, 'GET', null, initData);
}

export async function submitSurvey(
  surveyId: string,
  answers: Record<string, any>,
  initData: string
): Promise<{ success: boolean; points: number; user: UserData }> {
  return apiCall(
    '/survey/submit',
    'POST',
    { survey_id: surveyId, answers },
    initData
  );
}

// ============== VERIFICATION ENDPOINTS ==============

export async function verifyYouTubeComment(
  taskId: string,
  videoId: string,
  verificationCode: string,
  initData: string
): Promise<TaskCheckResponse> {
  return apiCall(
    '/verify/youtube-comment',
    'POST',
    { task_id: taskId, video_id: videoId, verification_code: verificationCode },
    initData
  );
}

export async function verifyTelegramMembership(
  taskId: string,
  channelId: string,
  initData: string
): Promise<TaskCheckResponse> {
  return apiCall(
    '/verify/telegram',
    'POST',
    { task_id: taskId, channel_id: channelId },
    initData
  );
}

export async function verifyVideoWatch(
  taskId: string,
  watchTime: number,
  percentage: number,
  initData: string
): Promise<TaskCheckResponse> {
  return apiCall(
    '/verify/video-watch',
    'POST',
    { task_id: taskId, watch_time: watchTime, percentage },
    initData
  );
}

// ============== LEGACY ENDPOINTS (for backward compatibility) ==============

export async function dailyCheckin(initData: string) {
  return apiCall('/checkin', 'POST', {}, initData);
}

export async function dailySpin(initData: string) {
  return apiCall('/spin', 'POST', {}, initData);
}

export async function getLeaderboard(initData: string, limit: number = 100) {
  return apiCall(`/leaderboard?limit=${limit}`, 'GET', null, initData);
}

export async function getShopRewards(initData: string) {
  return apiCall('/shop/rewards', 'GET', null, initData);
}

export async function redeemReward(rewardId: string, initData: string) {
  return apiCall('/shop/redeem', 'POST', { reward_id: rewardId }, initData);
}

export async function getReferrals(initData: string) {
  return apiCall('/referrals', 'GET', null, initData);
}

export async function getPointsHistory(
  initData: string,
  limit: number = 50,
  offset: number = 0
) {
  return apiCall(`/history?limit=${limit}&offset=${offset}`, 'GET', null, initData);
}

// ============== ADMIN ENDPOINTS ==============

// الحصول على إحصائيات الأدمن
export async function getAdminStats(initData: string) {
  return apiCall('/admin/stats', 'GET', null, initData);
}

// الحصول على جميع المهام (للأدمن)
export async function getAllTasks(initData: string) {
  try {
    const response = await apiCall('/admin/tasks', 'GET', null, initData);
    // Handle both array format and new object format
    if (Array.isArray(response)) {
      return response;
    }
    return response.tasks || [];
  } catch (error) {
    console.error('[API] Failed to get all tasks:', error);
    throw error;
  }
}

// إنشاء مهمة جديدة
export async function createTask(initData: string, taskData: any) {
  return apiCall('/admin/tasks', 'POST', taskData, initData);
}

// تحديث مهمة
export async function updateTask(initData: string, taskId: string, taskData: any) {
  return apiCall(`/admin/tasks/${taskId}`, 'PUT', taskData, initData);
}

// حذف مهمة
export async function deleteTask(initData: string, taskId: string) {
  return apiCall(`/admin/tasks/${taskId}`, 'DELETE', null, initData);
}

// الحصول على جميع الشبكات (للأدمن)
export async function getAllNetworks(initData: string) {
  try {
    const response = await apiCall('/admin/networks', 'GET', null, initData);
    // Handle both array format and new object format
    if (Array.isArray(response)) {
      return response;
    }
    return response.networks || [];
  } catch (error) {
    console.error('[API] Failed to get all networks:', error);
    throw error;
  }
}

// إنشاء شبكة جديدة
export async function createNetwork(initData: string, networkData: any) {
  return apiCall('/admin/networks', 'POST', networkData, initData);
}

// تحديث شبكة
export async function updateNetwork(initData: string, networkId: string, networkData: any) {
  return apiCall(`/admin/networks/${networkId}`, 'PUT', networkData, initData);
}

// حذف شبكة
export async function deleteNetwork(initData: string, networkId: string) {
  return apiCall(`/admin/networks/${networkId}`, 'DELETE', null, initData);
}

// الحصول على جميع المستخدمين (للأدمن)
export async function getAllUsers(initData: string, page: number = 1, pageSize: number = 50) {
  return apiCall(`/admin/users?page=${page}&pageSize=${pageSize}`, 'GET', null, initData);
}

// تحديث نقاط مستخدم
export async function updateUserPoints(initData: string, userId: number, points: number) {
  return apiCall('/admin/user/points', 'PUT', { user_id: userId, points }, initData);
}

// حظر/إلغاء حظر مستخدم
export async function toggleUserBan(initData: string, userId: number) {
  return apiCall('/admin/user/ban', 'POST', { user_id: userId }, initData);
}
