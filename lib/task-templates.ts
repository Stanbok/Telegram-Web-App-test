import { TaskType, TaskTemplate } from './types';
import {
  Video,
  Youtube,
  MessageCircle,
  Play,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  MousePointerClick,
  Users,
} from 'lucide-react';

export const TASK_TEMPLATES: Record<TaskType, TaskTemplate> = {
  ad_view: {
    type: 'ad_view',
    name: 'مشاهدة إعلان',
    icon: 'Video',
    colorScheme: {
      primary: '#EF4444', // red-500
      secondary: '#FEE2E2', // red-100
      accent: '#DC2626', // red-600
    },
    defaultDuration: 30,
    verificationMethod: 'timer_based',
  },
  youtube_subscribe: {
    type: 'youtube_subscribe',
    name: 'اشتراك يوتيوب',
    icon: 'Youtube',
    colorScheme: {
      primary: '#FF0000', // YouTube red
      secondary: '#FFEBEE',
      accent: '#CC0000',
    },
    verificationMethod: 'comment_validation',
  },
  youtube_comment: {
    type: 'youtube_comment',
    name: 'تعليق يوتيوب',
    icon: 'MessageCircle',
    colorScheme: {
      primary: '#3B82F6', // blue-500
      secondary: '#DBEAFE', // blue-100
      accent: '#2563EB', // blue-600
    },
    verificationMethod: 'comment_validation',
  },
  youtube_watch: {
    type: 'youtube_watch',
    name: 'مشاهدة فيديو',
    icon: 'Play',
    colorScheme: {
      primary: '#8B5CF6', // purple-500
      secondary: '#EDE9FE', // purple-100
      accent: '#7C3AED', // purple-600
    },
    defaultDuration: 120,
    verificationMethod: 'client_tracking',
  },
  telegram_join: {
    type: 'telegram_join',
    name: 'انضمام تليجرام',
    icon: 'Send',
    colorScheme: {
      primary: '#0088CC', // Telegram blue
      secondary: '#E0F2FE',
      accent: '#0077B5',
    },
    verificationMethod: 'telegram_api',
  },
  facebook_follow: {
    type: 'facebook_follow',
    name: 'متابعة فيسبوك',
    icon: 'Facebook',
    colorScheme: {
      primary: '#1877F2', // Facebook blue
      secondary: '#E7F3FF',
      accent: '#166FE5',
    },
    verificationMethod: 'timer_based',
  },
  instagram_follow: {
    type: 'instagram_follow',
    name: 'متابعة انستجرام',
    icon: 'Instagram',
    colorScheme: {
      primary: '#E4405F', // Instagram pink
      secondary: '#FCE7EC',
      accent: '#C13584',
    },
    verificationMethod: 'timer_based',
  },
  twitter_follow: {
    type: 'twitter_follow',
    name: 'متابعة تويتر',
    icon: 'Twitter',
    colorScheme: {
      primary: '#1DA1F2', // Twitter blue
      secondary: '#E8F5FD',
      accent: '#0D8BD9',
    },
    verificationMethod: 'timer_based',
  },
  website_visit: {
    type: 'website_visit',
    name: 'زيارة موقع',
    icon: 'Globe',
    colorScheme: {
      primary: '#10B981', // green-500
      secondary: '#D1FAE5', // green-100
      accent: '#059669', // green-600
    },
    defaultDuration: 15,
    verificationMethod: 'timer_based',
  },
  link_click: {
    type: 'link_click',
    name: 'نقر رابط',
    icon: 'MousePointerClick',
    colorScheme: {
      primary: '#F59E0B', // amber-500
      secondary: '#FEF3C7', // amber-100
      accent: '#D97706', // amber-600
    },
    verificationMethod: 'automatic',
  },
  referral: {
    type: 'referral',
    name: 'إحالة صديق',
    icon: 'Users',
    colorScheme: {
      primary: '#EC4899', // pink-500
      secondary: '#FCE7F3', // pink-100
      accent: '#DB2777', // pink-600
    },
    verificationMethod: 'automatic',
  },
};

export function getTaskTemplate(taskType: TaskType): TaskTemplate {
  return TASK_TEMPLATES[taskType];
}

export function getTaskIcon(taskType: TaskType) {
  const iconName = TASK_TEMPLATES[taskType].icon;
  const icons: Record<string, any> = {
    Video,
    Youtube,
    MessageCircle,
    Play,
    Send,
    Facebook,
    Instagram,
    Twitter,
    Globe,
    MousePointerClick,
    Users,
  };
  return icons[iconName] || Globe;
}
