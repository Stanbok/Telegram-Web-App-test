// ============== CORE TYPES ==============

export type ContentType = 'tasks' | 'games' | 'surveys';

export type TaskType = 
  | 'ad_view'
  | 'youtube_subscribe'
  | 'youtube_comment'
  | 'youtube_watch'
  | 'telegram_join'
  | 'facebook_follow'
  | 'instagram_follow'
  | 'twitter_follow'
  | 'website_visit'
  | 'link_click'
  | 'referral';

export type VerificationMethod =
  | 'comment_validation'
  | 'client_tracking'
  | 'telegram_api'
  | 'timer_based'
  | 'postback'
  | 'manual'
  | 'automatic';

export type TaskStatus = 
  | 'available'
  | 'in_progress'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'expired';

// ============== NETWORK TYPES ==============

export interface Network {
  id: string;
  name: string;
  type: ContentType;
  logo: string;
  description: string;
  apiEndpoint?: string;
  apiKey?: string;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============== TASK TYPES ==============

export interface TaskTemplate {
  type: TaskType;
  name: string;
  icon: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  defaultDuration?: number;
  verificationMethod: VerificationMethod;
}

export interface Task {
  id: string;
  networkId: string;
  network?: Network;
  type: TaskType;
  title: string;
  description: string;
  instructions: string;
  points: number;
  targetUrl: string;
  verificationData?: {
    code?: string;
    channelId?: string;
    videoId?: string;
    requiredWatchPercentage?: number;
    minimumDuration?: number;
    [key: string]: any;
  };
  availability: {
    total: number;
    remaining: number;
  };
  requirements?: {
    minLevel?: number;
    previousTasks?: string[];
  };
  expiresAt?: Date;
  createdAt: Date;
  status?: TaskStatus;
}

export interface TaskAttempt {
  id: string;
  userId: number;
  taskId: string;
  status: TaskStatus;
  verificationCode?: string;
  startedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

// ============== GAME TYPES ==============

export interface Game {
  id: string;
  networkId: string;
  network?: Network;
  title: string;
  description: string;
  thumbnail: string;
  gameUrl: string;
  points: number;
  duration: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playCount: number;
  active: boolean;
  createdAt: Date;
}

// ============== SURVEY TYPES ==============

export interface Survey {
  id: string;
  networkId: string;
  network?: Network;
  title: string;
  description: string;
  points: number;
  estimatedTime: number;
  questions: SurveyQuestion[];
  maxResponses: number;
  currentResponses: number;
  active: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'yes_no';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: number;
  answers: SurveyAnswer[];
  completedAt: Date;
  pointsAwarded: number;
}

export interface SurveyAnswer {
  questionId: string;
  answer: string | string[] | number;
}

// ============== USER TYPES ==============

export interface UserData {
  userId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  points: number;
  level: number;
  streak: number;
  referrals: number;
  completedTasks: number;
  createdAt: Date;
}

// ============== API RESPONSE TYPES ==============

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NetworksResponse {
  networks: Network[];
  hasMore: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  hasMore: boolean;
}

export interface GamesResponse {
  games: Game[];
  hasMore: boolean;
}

export interface SurveysResponse {
  surveys: Survey[];
  hasMore: boolean;
}

export interface TaskCheckResponse {
  success: boolean;
  completed: boolean;
  points?: number;
  user?: UserData;
  message: string;
}

// ============== VERIFICATION TYPES ==============

export interface VerificationRequest {
  taskId: string;
  userId: number;
  attemptId: string;
  verificationData: Record<string, any>;
}

export interface VerificationResult {
  verified: boolean;
  points: number;
  message: string;
  metadata?: Record<string, any>;
}
