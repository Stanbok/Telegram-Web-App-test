const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dracodev.pythonanywhere.com/api';

export async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
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

export async function getUser(initData: string) {
  return apiCall('/user', 'GET', null, initData);
}

// ============== CHECKIN ENDPOINTS ==============

export async function dailyCheckin(initData: string) {
  return apiCall('/checkin', 'POST', {}, initData);
}

// ============== TASKS ENDPOINTS ==============

export async function getTasks(initData: string) {
  return apiCall('/tasks', 'GET', null, initData);
}

export async function checkTask(taskId: string, initData: string) {
  return apiCall('/task/check', 'POST', { task_id: taskId }, initData);
}

// ============== SPIN ENDPOINTS ==============

export async function dailySpin(initData: string) {
  return apiCall('/spin', 'POST', {}, initData);
}

// ============== LEADERBOARD ENDPOINTS ==============

export async function getLeaderboard(initData: string, limit: number = 100) {
  return apiCall(`/leaderboard?limit=${limit}`, 'GET', null, initData);
}

// ============== SHOP ENDPOINTS ==============

export async function getShopRewards(initData: string) {
  return apiCall('/shop/rewards', 'GET', null, initData);
}

export async function redeemReward(rewardId: string, initData: string) {
  return apiCall('/shop/redeem', 'POST', { reward_id: rewardId }, initData);
}

// ============== REFERRAL ENDPOINTS ==============

export async function getReferrals(initData: string) {
  return apiCall('/referrals', 'GET', null, initData);
}

// ============== HISTORY ENDPOINTS ==============

export async function getPointsHistory(initData: string, limit: number = 50, offset: number = 0) {
  return apiCall(`/history?limit=${limit}&offset=${offset}`, 'GET', null, initData);
}
